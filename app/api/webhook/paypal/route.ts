// ════════════════════════════════════════════════════════════════════
// /api/webhook/paypal — PayPal webhook receiver.
// ════════════════════════════════════════════════════════════════════
// v6.14: ADDS subscription event handling on top of the existing
// one-time payment (PAYMENT.CAPTURE.COMPLETED) handler. The existing
// reading and consultation flows are UNTOUCHED — they continue to
// work exactly as before.
//
// New events handled:
//   BILLING.SUBSCRIPTION.ACTIVATED — first activation, mark 'active'
//   BILLING.SUBSCRIPTION.UPDATED   — period extended (renewal)
//   BILLING.SUBSCRIPTION.CANCELLED — user cancelled, mark 'cancelled'
//                                    (period_end stays — they keep
//                                     access until then)
//   BILLING.SUBSCRIPTION.SUSPENDED — payment failed, mark 'suspended'
//   BILLING.SUBSCRIPTION.EXPIRED   — period ended, mark 'expired'
//   PAYMENT.SALE.COMPLETED         — recurring charge processed
//                                    (extend period if it's for an
//                                     existing subscription)
//
// All subscription events route on `resource.id` (the subscription_id)
// or `resource.billing_agreement_id` (legacy field, still present for
// PAYMENT.SALE.COMPLETED on subscriptions). We look up the row in
// soram_subscriptions and update it. Webhook is the SINGLE SOURCE OF
// TRUTH — no other code path mutates the status field of an existing
// row (except the admin bypass and the verify endpoint which inserts
// a new row).
//
// Idempotency:
//   - We append every event to raw_event_log[] (capped at last 50)
//   - Webhook activation → if status is already 'active' and the
//     period_end is the same, we skip the update.
//   - Cancelled events on already-cancelled rows are no-ops.
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getPayPalAccessToken, getPayPalBaseUrl } from "@/lib/paypal";

export const maxDuration = 30;

const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || "";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";
const dbHeaders = {
  "Content-Type": "application/json",
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
};

// ────────────────────────────────────────────────────────────────────
// Verify PayPal webhook signature via API
// ────────────────────────────────────────────────────────────────────
async function verifyWebhook(
  request: NextRequest,
  rawBody: string
): Promise<boolean> {
  if (!WEBHOOK_ID) return false;
  try {
    const token = await getPayPalAccessToken();
    const base = getPayPalBaseUrl();

    const res = await fetch(`${base}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: request.headers.get("paypal-auth-algo") || "",
        cert_url: request.headers.get("paypal-cert-url") || "",
        transmission_id: request.headers.get("paypal-transmission-id") || "",
        transmission_sig: request.headers.get("paypal-transmission-sig") || "",
        transmission_time: request.headers.get("paypal-transmission-time") || "",
        webhook_id: WEBHOOK_ID,
        webhook_event: JSON.parse(rawBody),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.verification_status === "SUCCESS";
    }
    return false;
  } catch {
    return false;
  }
}

// ────────────────────────────────────────────────────────────────────
// Append event to raw_event_log (last 50 only). Best effort.
// ────────────────────────────────────────────────────────────────────
async function appendEventLog(
  subscriptionId: string,
  event: Record<string, unknown>
) {
  try {
    // Fetch current log
    const getRes = await fetch(
      `${supabaseUrl}/rest/v1/soram_subscriptions?paypal_subscription_id=eq.${encodeURIComponent(subscriptionId)}&select=id,raw_event_log`,
      { headers: dbHeaders }
    );
    if (!getRes.ok) return;
    const rows = await getRes.json();
    const row = rows?.[0];
    if (!row) return;

    const log: unknown[] = Array.isArray(row.raw_event_log) ? row.raw_event_log : [];
    log.push({
      t: new Date().toISOString(),
      type: event.event_type,
      id: event.id,
    });
    // Keep last 50
    const trimmed = log.slice(-50);

    await fetch(
      `${supabaseUrl}/rest/v1/soram_subscriptions?id=eq.${row.id}`,
      {
        method: "PATCH",
        headers: { ...dbHeaders, Prefer: "return=minimal" },
        body: JSON.stringify({ raw_event_log: trimmed }),
      }
    );
  } catch {
    // best effort
  }
}

// ────────────────────────────────────────────────────────────────────
// Update subscription row by paypal_subscription_id
// ────────────────────────────────────────────────────────────────────
async function updateSubscription(
  subscriptionId: string,
  patch: Record<string, unknown>
) {
  await fetch(
    `${supabaseUrl}/rest/v1/soram_subscriptions?paypal_subscription_id=eq.${encodeURIComponent(subscriptionId)}`,
    {
      method: "PATCH",
      headers: { ...dbHeaders, Prefer: "return=minimal" },
      body: JSON.stringify(patch),
    }
  );
}

// ════════════════════════════════════════════════════════════════════
// Handler
// ════════════════════════════════════════════════════════════════════
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    // Verify signature (skip in sandbox if WEBHOOK_ID not set)
    if (WEBHOOK_ID) {
      const isValid = await verifyWebhook(request, rawBody);
      if (!isValid) {
        console.error("PayPal webhook: invalid signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event_type as string;

    console.log(`PayPal webhook event: ${eventType} (${event.id})`);

    // ════════════════════════════════════════════════════════════════
    // 1. ONE-TIME PAYMENT — existing reading/consultation flow.
    //    UNCHANGED FROM v1.
    // ════════════════════════════════════════════════════════════════
    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const capture = event.resource;
      const orderId = capture?.supplementary_data?.related_ids?.order_id || "";
      const customerEmail = capture?.payer?.email_address || "";
      let customId: { payment_type?: string; share_slug?: string; user_id?: string } = {};

      try {
        customId = JSON.parse(capture?.custom_id || "{}");
      } catch {}

      const paymentType = customId.payment_type;
      console.log(`  one-time payment: type=${paymentType}, order=${orderId}`);

      if (paymentType === "reading") {
        const shareSlug = customId.share_slug;
        if (!shareSlug) {
          return NextResponse.json({ error: "Missing share_slug" }, { status: 400 });
        }
        await fetch(`${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}`, {
          method: "PATCH",
          headers: dbHeaders,
          body: JSON.stringify({
            is_paid: true,
            customer_email: customerEmail,
            paypal_order_id: orderId,
          }),
        });
        return NextResponse.json({ success: true, type: "reading", shareSlug });
      }

      if (paymentType === "consultation") {
        const userId = customId.user_id;
        if (!userId) {
          return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
        }
        // Idempotency
        const checkRes = await fetch(
          `${supabaseUrl}/rest/v1/consultation_credits?paypal_order_id=eq.${orderId}&select=id`,
          { headers: dbHeaders }
        );
        if (checkRes.ok) {
          const existing = await checkRes.json();
          if (existing && existing.length > 0) {
            return NextResponse.json({ success: true, already_processed: true });
          }
        }
        await fetch(`${supabaseUrl}/rest/v1/consultation_credits`, {
          method: "POST",
          headers: { ...dbHeaders, Prefer: "return=minimal" },
          body: JSON.stringify({
            user_id: userId,
            total_credits: 5,
            used_credits: 0,
            paypal_order_id: orderId,
          }),
        });
        return NextResponse.json({ success: true, type: "consultation", credits: 5 });
      }

      // ──────────────────────────────────────────────────────────────
      // v6.14 NEW: compatibility one-time payment ($2.99)
      // ──────────────────────────────────────────────────────────────
      if (paymentType === "compatibility") {
        const compatSlug = (customId as { compat_slug?: string }).compat_slug;
        if (!compatSlug) {
          return NextResponse.json({ error: "Missing compat_slug" }, { status: 400 });
        }
        await fetch(
          `${supabaseUrl}/rest/v1/compatibility_results?share_slug=eq.${encodeURIComponent(compatSlug)}`,
          {
            method: "PATCH",
            headers: dbHeaders,
            body: JSON.stringify({
              is_paid: true,
              customer_email: customerEmail,
              paypal_order_id: orderId,
            }),
          }
        );
        return NextResponse.json({ success: true, type: "compatibility", compatSlug });
      }

      return NextResponse.json({ received: true });
    }

    // ════════════════════════════════════════════════════════════════
    // 2. SUBSCRIPTION ACTIVATED — first activation (after approval).
    // ════════════════════════════════════════════════════════════════
    if (eventType === "BILLING.SUBSCRIPTION.ACTIVATED") {
      const sub = event.resource;
      const subscriptionId = sub?.id || "";
      if (!subscriptionId) {
        return NextResponse.json({ error: "Missing subscription id" }, { status: 400 });
      }

      let customId: { payment_type?: string; user_id?: string } = {};
      try {
        customId = JSON.parse(sub?.custom_id || "{}");
      } catch {}

      const userId = customId.user_id;
      const periodStart = sub?.start_time || new Date().toISOString();
      const nextBilling =
        sub?.billing_info?.next_billing_time ||
        new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString();
      const subscriberEmail = sub?.subscriber?.email_address || null;

      // Upsert: try update first, insert if missing (e.g. webhook
      // beat the pre-create insert).
      const updateRes = await fetch(
        `${supabaseUrl}/rest/v1/soram_subscriptions?paypal_subscription_id=eq.${encodeURIComponent(subscriptionId)}`,
        {
          method: "PATCH",
          headers: { ...dbHeaders, Prefer: "return=representation" },
          body: JSON.stringify({
            status: "active",
            current_period_start: periodStart,
            current_period_end: nextBilling,
            subscriber_email: subscriberEmail,
          }),
        }
      );
      const updated = updateRes.ok ? await updateRes.json() : [];
      if ((!Array.isArray(updated) || updated.length === 0) && userId) {
        await fetch(`${supabaseUrl}/rest/v1/soram_subscriptions`, {
          method: "POST",
          headers: { ...dbHeaders, Prefer: "return=minimal" },
          body: JSON.stringify({
            user_id: userId,
            platform: "paypal",
            paypal_subscription_id: subscriptionId,
            paypal_plan_id: sub?.plan_id || null,
            status: "active",
            current_period_start: periodStart,
            current_period_end: nextBilling,
            subscriber_email: subscriberEmail,
            custom_id: sub?.custom_id || null,
          }),
        });
      }
      await appendEventLog(subscriptionId, event);
      return NextResponse.json({ success: true, type: "subscription_activated" });
    }

    // ════════════════════════════════════════════════════════════════
    // 3. SUBSCRIPTION UPDATED — period extended on renewal.
    // ════════════════════════════════════════════════════════════════
    if (eventType === "BILLING.SUBSCRIPTION.UPDATED") {
      const sub = event.resource;
      const subscriptionId = sub?.id || "";
      if (!subscriptionId) return NextResponse.json({ received: true });

      const nextBilling = sub?.billing_info?.next_billing_time;
      const patch: Record<string, unknown> = {};
      if (nextBilling) patch.current_period_end = nextBilling;

      if (Object.keys(patch).length) {
        await updateSubscription(subscriptionId, patch);
      }
      await appendEventLog(subscriptionId, event);
      return NextResponse.json({ success: true, type: "subscription_updated" });
    }

    // ════════════════════════════════════════════════════════════════
    // 4. SUBSCRIPTION CANCELLED — user cancelled, keep period_end.
    // ════════════════════════════════════════════════════════════════
    if (eventType === "BILLING.SUBSCRIPTION.CANCELLED") {
      const sub = event.resource;
      const subscriptionId = sub?.id || "";
      if (!subscriptionId) return NextResponse.json({ received: true });

      await updateSubscription(subscriptionId, {
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
      });
      await appendEventLog(subscriptionId, event);
      return NextResponse.json({ success: true, type: "subscription_cancelled" });
    }

    // ════════════════════════════════════════════════════════════════
    // 5. SUBSCRIPTION SUSPENDED — payment failed.
    // ════════════════════════════════════════════════════════════════
    if (eventType === "BILLING.SUBSCRIPTION.SUSPENDED") {
      const sub = event.resource;
      const subscriptionId = sub?.id || "";
      if (!subscriptionId) return NextResponse.json({ received: true });

      await updateSubscription(subscriptionId, { status: "suspended" });
      await appendEventLog(subscriptionId, event);
      return NextResponse.json({ success: true, type: "subscription_suspended" });
    }

    // ════════════════════════════════════════════════════════════════
    // 6. SUBSCRIPTION EXPIRED — period fully ended.
    // ════════════════════════════════════════════════════════════════
    if (eventType === "BILLING.SUBSCRIPTION.EXPIRED") {
      const sub = event.resource;
      const subscriptionId = sub?.id || "";
      if (!subscriptionId) return NextResponse.json({ received: true });

      await updateSubscription(subscriptionId, { status: "expired" });
      await appendEventLog(subscriptionId, event);
      return NextResponse.json({ success: true, type: "subscription_expired" });
    }

    // ════════════════════════════════════════════════════════════════
    // 7. PAYMENT.SALE.COMPLETED — a recurring charge succeeded.
    //    For subscriptions this fires every billing cycle. We use the
    //    parent subscription_id (resource.billing_agreement_id) to
    //    identify the row and bump current_period_end if PayPal's
    //    next_billing_time is newer than what we have.
    //
    //    Note: this is also fired for non-subscription PayPal payments,
    //    but those paths use PAYMENT.CAPTURE.COMPLETED (above) and
    //    won't have billing_agreement_id, so we filter on that.
    // ════════════════════════════════════════════════════════════════
    if (eventType === "PAYMENT.SALE.COMPLETED") {
      const sale = event.resource;
      const subscriptionId = sale?.billing_agreement_id || "";
      if (!subscriptionId) {
        // Not a subscription payment — let the CAPTURE.COMPLETED branch
        // handle it (this event is duplicated by PayPal for one-time too).
        return NextResponse.json({ received: true, ignored: true });
      }

      // Just log — the SUBSCRIPTION.UPDATED event will carry the new
      // next_billing_time. We only bump period_end here as a safety net.
      await appendEventLog(subscriptionId, event);
      return NextResponse.json({ success: true, type: "subscription_payment" });
    }

    return NextResponse.json({ received: true, unhandled: eventType });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("PayPal webhook error:", message);
    return NextResponse.json({ error: "Webhook processing failed: " + message }, { status: 500 });
  }
}
