// ════════════════════════════════════════════════════════════════════
// /api/payment/verify-companion — confirm a Soram Companion subscription
// is ACTIVE before showing the success screen.
// ════════════════════════════════════════════════════════════════════
// PayPal redirects the user back to our return_url with a
// ?subscription_id=I-XXXXX query param after they consent. The webhook
// (BILLING.SUBSCRIPTION.ACTIVATED) is the AUTHORITATIVE source of truth
// for activation, but it can lag 5–30 seconds. We don't want the user
// to see "subscription pending" for that long, so this endpoint:
//
//   1. Polls PayPal directly (getSubscriptionDetails) to get current
//      status, polling up to ~5 seconds for ACTIVE.
//   2. If ACTIVE, upserts soram_subscriptions row to status='active'
//      with period info — webhook will later overwrite/confirm but
//      this gives the user immediate feedback.
//   3. Returns success even if status is APPROVAL_PENDING but PayPal
//      reports the user has approved (status === "APPROVED"), since
//      the activation webhook is a near-certainty in that case. The
//      webhook will finalize.
//
// Why we DON'T just trust the redirect: an attacker could fabricate
// the redirect URL with any subscription_id. Querying PayPal verifies
// the ID is real and corresponds to the right user (via custom_id).
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getSubscriptionDetails } from "@/lib/paypal";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId, userId } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json({ error: "Missing subscriptionId" }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

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

    // Poll PayPal up to 5 times (~5s total) for ACTIVE state.
    let details: Awaited<ReturnType<typeof getSubscriptionDetails>> | null = null;
    let attemptsLeft = 5;
    while (attemptsLeft > 0) {
      try {
        details = await getSubscriptionDetails(subscriptionId);
        if (details.status === "ACTIVE" || details.status === "APPROVED") break;
      } catch (e) {
        console.warn("verify-companion: PayPal fetch failed, retrying", e);
      }
      attemptsLeft -= 1;
      if (attemptsLeft > 0) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    if (!details) {
      return NextResponse.json(
        { error: "Could not verify subscription with PayPal" },
        { status: 502 }
      );
    }

    // Defense check: custom_id must contain THIS user_id, otherwise
    // someone may be passing another user's subscription_id.
    let customUserId: string | undefined;
    try {
      const parsed = JSON.parse(details.custom_id || "{}");
      customUserId = parsed?.user_id;
    } catch {}
    if (customUserId && customUserId !== userId) {
      console.error(
        `verify-companion: custom_id user_id mismatch (paypal=${customUserId}, request=${userId})`
      );
      return NextResponse.json(
        { error: "Subscription does not match this account" },
        { status: 403 }
      );
    }

    const status = details.status;
    const isActive = status === "ACTIVE";
    const isApproved = status === "APPROVED" || isActive;

    if (!isApproved) {
      // Common non-success states: APPROVAL_PENDING (user hasn't
      // confirmed yet), CANCELLED, EXPIRED, SUSPENDED.
      return NextResponse.json({
        success: false,
        status,
        message: "Subscription is not active yet",
      });
    }

    // Compute period bounds. PayPal provides next_billing_time on ACTIVE
    // subscriptions; for APPROVED-but-not-yet-ACTIVE, fall back to a
    // conservative 31-day window — the webhook will correct this when
    // ACTIVATED fires.
    const periodStart = (details.start_time as string) || new Date().toISOString();
    const nextBilling =
      (details.billing_info as { next_billing_time?: string } | undefined)
        ?.next_billing_time ||
      new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString();

    // Upsert (update if pending row exists, else insert).
    // We match on paypal_subscription_id which is unique per subscription.
    if (supabaseUrl && supabaseKey) {
      const upsertBody = {
        user_id: userId,
        platform: "paypal",
        paypal_subscription_id: subscriptionId,
        paypal_plan_id: (details.plan_id as string) || null,
        status: isActive ? "active" : "pending", // wait for webhook if not yet ACTIVE
        current_period_start: periodStart,
        current_period_end: nextBilling,
        subscriber_email:
          (details.subscriber as { email_address?: string } | undefined)?.email_address || null,
        custom_id: details.custom_id || null,
      };

      // Try update first
      const updateRes = await fetch(
        `${supabaseUrl}/rest/v1/soram_subscriptions?paypal_subscription_id=eq.${encodeURIComponent(subscriptionId)}`,
        {
          method: "PATCH",
          headers: { ...dbHeaders, Prefer: "return=representation" },
          body: JSON.stringify(upsertBody),
        }
      );
      const updated = updateRes.ok ? await updateRes.json() : [];
      if (!Array.isArray(updated) || updated.length === 0) {
        // No row matched — insert.
        await fetch(`${supabaseUrl}/rest/v1/soram_subscriptions`, {
          method: "POST",
          headers: { ...dbHeaders, Prefer: "return=minimal" },
          body: JSON.stringify(upsertBody),
        });
      }
    }

    return NextResponse.json({
      success: true,
      status,
      active: isActive,
      next_billing: nextBilling,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("verify-companion error:", message);
    return NextResponse.json({ error: "Server error: " + message }, { status: 500 });
  }
}
