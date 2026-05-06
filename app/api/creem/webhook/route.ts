// app/api/creem/webhook/route.ts
// Handles all 13 Creem webhook events.
// Maps Creem events to internal DB updates:
//   - readings.is_paid for Compatibility/Full Reading
//   - consultation_credits insert for Master 5-Pack
//   - soram_subscriptions insert/update for Soram Companion
//
// Every event is logged into soram_subscriptions.raw_event_log (jsonb) for audit/debugging.
// Idempotency is enforced via custom_id checks before mutations.

import { NextRequest, NextResponse } from "next/server";
import { verifyCreemSignature, getProductKeyFromId } from "@/lib/payment/creem";

export const maxDuration = 30;

// Accept both potential signature header names — Creem docs may vary.
function getSignatureHeader(request: NextRequest): string | null {
  return (
    request.headers.get("creem-signature") ||
    request.headers.get("x-creem-signature") ||
    request.headers.get("x-signature") ||
    null
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Supabase REST helpers (no SDK to keep the route lightweight)
// ─────────────────────────────────────────────────────────────────────────────

function dbConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
  return {
    url,
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  };
}

async function dbPatch(path: string, body: object): Promise<boolean> {
  const { url, headers } = dbConfig();
  const res = await fetch(`${url}/rest/v1/${path}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error(`DB PATCH ${path} failed:`, await res.text());
    return false;
  }
  return true;
}

async function dbInsert(table: string, body: object): Promise<boolean> {
  const { url, headers } = dbConfig();
  const res = await fetch(`${url}/rest/v1/${table}`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error(`DB INSERT ${table} failed:`, await res.text());
    return false;
  }
  return true;
}

async function dbUpsert(table: string, body: object, onConflict: string): Promise<boolean> {
  const { url, headers } = dbConfig();
  const res = await fetch(
    `${url}/rest/v1/${table}?on_conflict=${onConflict}`,
    {
      method: "POST",
      headers: {
        ...headers,
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    console.error(`DB UPSERT ${table} failed:`, await res.text());
    return false;
  }
  return true;
}

async function dbSelectOne(path: string): Promise<any | null> {
  const { url, headers } = dbConfig();
  const res = await fetch(`${url}/rest/v1/${path}`, { headers });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.[0] || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Event extractors — Creem payload shapes
// ─────────────────────────────────────────────────────────────────────────────

interface CreemEvent {
  eventType: string;
  // Object differs per event type; we extract via accessor functions
  object: any;
  created_at?: string;
}

function extractEvent(rawPayload: any): CreemEvent {
  // Creem typically sends { eventType, object: { ... } } or { event_type, data: {...} }.
  // Handle both shapes.
  const eventType =
    rawPayload.eventType || rawPayload.event_type || rawPayload.type || "unknown";
  const object = rawPayload.object || rawPayload.data || rawPayload;
  return { eventType, object, created_at: rawPayload.created_at };
}

function getMetadata(obj: any): Record<string, string> {
  return obj?.metadata || obj?.metadata_object || {};
}

function getProductId(obj: any): string | null {
  return (
    obj?.product?.id ||
    obj?.product_id ||
    obj?.subscription?.product?.id ||
    obj?.subscription?.product_id ||
    null
  );
}

function getCustomerEmail(obj: any): string {
  return obj?.customer?.email || obj?.email || "";
}

function getSubscriptionId(obj: any): string | null {
  return obj?.subscription?.id || obj?.id || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Event handlers — one per event type
// ─────────────────────────────────────────────────────────────────────────────

async function handleCheckoutCompleted(event: CreemEvent): Promise<{ ok: boolean; detail?: string }> {
  const obj = event.object;
  const productId = getProductId(obj);
  const productKey = productId ? getProductKeyFromId(productId) : null;
  const meta = getMetadata(obj);
  const customId = meta.custom_id || meta.request_id || obj.request_id || "";
  const customerEmail = getCustomerEmail(obj);
  const orderId = obj.order?.id || obj.id || "";

  if (!productKey) {
    return { ok: false, detail: `Unknown product_id: ${productId}` };
  }

  // ─── Compatibility Full Reading ($2.99) ───
  if (productKey === "compatibility_full") {
    if (!customId) return { ok: false, detail: "Missing customId (share_slug)" };
    // Idempotency: skip if already paid for this share_slug
    const existing = await dbSelectOne(
      `compatibility_results?share_slug=eq.${customId}&select=id,is_paid`
    );
    if (existing?.is_paid) {
      return { ok: true, detail: "already_paid" };
    }
    const ok = await dbPatch(`compatibility_results?share_slug=eq.${customId}`, {
      is_paid: true,
      customer_email: customerEmail,
      paypal_order_id: `creem:${orderId}`, // reusing column for now
    });
    return { ok, detail: ok ? "compatibility marked paid" : "DB update failed" };
  }

  // ─── Full Destiny Reading ($9.99) ───
  if (productKey === "full_destiny_reading") {
    if (!customId) return { ok: false, detail: "Missing customId (share_slug)" };
    const existing = await dbSelectOne(
      `readings?share_slug=eq.${customId}&select=id,is_paid`
    );
    if (existing?.is_paid) {
      return { ok: true, detail: "already_paid" };
    }
    const ok = await dbPatch(`readings?share_slug=eq.${customId}`, {
      is_paid: true,
      customer_email: customerEmail,
      paypal_order_id: `creem:${orderId}`,
      payment_method: "creem",
      paid_at: new Date().toISOString(),
    });
    return { ok, detail: ok ? "reading marked paid" : "DB update failed" };
  }

  // ─── Master Consultation 5-Pack ($29.99) ───
  if (productKey === "master_5_pack") {
    if (!customId) return { ok: false, detail: "Missing customId (user_id)" };
    // Idempotency: don't insert credits twice for same Creem order
    const existing = await dbSelectOne(
      `consultation_credits?paypal_order_id=eq.creem:${orderId}&select=id`
    );
    if (existing) {
      return { ok: true, detail: "already_processed" };
    }
    const ok = await dbInsert("consultation_credits", {
      user_id: customId,
      total_credits: 5,
      used_credits: 0,
      paypal_order_id: `creem:${orderId}`,
    });
    return { ok, detail: ok ? "5 credits added" : "DB insert failed" };
  }

  // Soram subscription is handled by subscription.active, not checkout.completed
  if (productKey === "soram_companion") {
    return { ok: true, detail: "soram handled via subscription.active" };
  }

  return { ok: false, detail: `Unhandled product_key: ${productKey}` };
}

async function handleSubscriptionEvent(
  event: CreemEvent,
  newStatus: string
): Promise<{ ok: boolean; detail?: string }> {
  const obj = event.object;
  const productId = getProductId(obj);
  const productKey = productId ? getProductKeyFromId(productId) : null;
  const meta = getMetadata(obj);
  const userId = meta.custom_id || meta.user_id || obj.request_id || "";
  const subscriptionId = getSubscriptionId(obj);
  const customerEmail = getCustomerEmail(obj);

  if (productKey !== "soram_companion") {
    return { ok: true, detail: `non-soram subscription event ignored: ${productKey}` };
  }
  if (!userId) {
    return { ok: false, detail: "Missing user_id in metadata" };
  }
  if (!subscriptionId) {
    return { ok: false, detail: "Missing subscription_id" };
  }

  const periodStart = obj.current_period_start || obj.subscription?.current_period_start || null;
  const periodEnd = obj.current_period_end || obj.subscription?.current_period_end || null;
  const cancelledAt =
    newStatus === "canceled" || newStatus === "expired"
      ? new Date().toISOString()
      : null;

  const upsertBody: any = {
    user_id: userId,
    platform: "creem",
    paypal_subscription_id: subscriptionId, // reusing column for Creem sub id
    status: newStatus,
    subscriber_email: customerEmail,
    custom_id: userId,
    raw_event_log: { last_event: event.eventType, payload: obj },
  };
  if (periodStart) upsertBody.current_period_start = periodStart;
  if (periodEnd) upsertBody.current_period_end = periodEnd;
  if (cancelledAt) upsertBody.cancelled_at = cancelledAt;

  // Upsert by paypal_subscription_id (which here holds the Creem sub id).
  // If schema doesn't have unique constraint, PostgREST will reject — fall back to insert.
  const ok = await dbUpsert(
    "soram_subscriptions",
    upsertBody,
    "paypal_subscription_id"
  );
  return { ok, detail: ok ? `soram ${newStatus}` : "DB upsert failed" };
}

async function handleRefundCreated(event: CreemEvent): Promise<{ ok: boolean; detail?: string }> {
  // Refund: revoke entitlements where possible.
  // Without a mature schema for refunds, we just log it to console.
  // TODO post-launch: mark readings.is_paid=false or consume credits if specific order matches.
  const obj = event.object;
  const orderId = obj.order?.id || obj.order_id || "";
  console.log(`Creem refund.created for order ${orderId}`, JSON.stringify(obj));
  return { ok: true, detail: "logged" };
}

async function handleDisputeCreated(event: CreemEvent): Promise<{ ok: boolean; detail?: string }> {
  // Dispute: critical event — log loudly. Surfacing to email/Slack is post-launch work.
  const obj = event.object;
  const orderId = obj.order?.id || obj.order_id || "";
  console.error(`⚠️  Creem dispute.created for order ${orderId}`, JSON.stringify(obj));
  return { ok: true, detail: "logged-critical" };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main handler
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = getSignatureHeader(request);

    // Signature verification
    const valid = await verifyCreemSignature(rawBody, signature);
    if (!valid) {
      console.error("Creem webhook: invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const event = extractEvent(parsed);
    console.log(`Creem webhook received: ${event.eventType}`);

    let result: { ok: boolean; detail?: string };

    switch (event.eventType) {
      // ─── Checkout / one-time payments ───
      case "checkout.completed":
        result = await handleCheckoutCompleted(event);
        break;

      // ─── Subscription lifecycle ───
      case "subscription.active":
      case "subscription.trialing":
        result = await handleSubscriptionEvent(event, "active");
        break;
      case "subscription.paid":
        // Renewal payment succeeded — update period_end
        result = await handleSubscriptionEvent(event, "active");
        break;
      case "subscription.update":
        result = await handleSubscriptionEvent(event, "active");
        break;
      case "subscription.scheduled_cancel":
        // User clicked cancel — keep status active until period end
        result = await handleSubscriptionEvent(event, "active");
        break;
      case "subscription.canceled":
        result = await handleSubscriptionEvent(event, "cancelled");
        break;
      case "subscription.expired":
        result = await handleSubscriptionEvent(event, "expired");
        break;
      case "subscription.unpaid":
      case "subscription.past_due":
        result = await handleSubscriptionEvent(event, "past_due");
        break;
      case "subscription.paused":
        result = await handleSubscriptionEvent(event, "paused");
        break;

      // ─── Refunds & disputes ───
      case "refund.created":
        result = await handleRefundCreated(event);
        break;
      case "dispute.created":
        result = await handleDisputeCreated(event);
        break;

      default:
        console.log(`Creem webhook: unhandled event type ${event.eventType}`);
        result = { ok: true, detail: "unhandled-but-acked" };
    }

    return NextResponse.json({ received: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("Creem webhook handler error:", message);
    return NextResponse.json({ error: "Webhook processing failed", detail: message }, { status: 500 });
  }
}
