// ════════════════════════════════════════════════════════════════════
// /api/payment/checkout-companion — start a Soram Companion subscription.
// ════════════════════════════════════════════════════════════════════
// v6.14 mirrors the existing /api/payment/checkout-consultation pattern
// but uses PayPal's recurring billing (Subscription) instead of one-time
// orders. Differences from consultation:
//   - Uses createSubscription() instead of createPayPalOrder()
//   - Plan ID env var: PAYPAL_COMPANION_PLAN_ID (set in Vercel env after
//     chandler creates the plan in PayPal Business — see deploy notes)
//   - Admin bypass inserts a row directly into soram_subscriptions with
//     status='active' and a far-future end date, so chandler can use
//     Companion features without paying.
//   - Auth: requires a user_id (we don't allow anonymous subscriptions
//     because there's no way to attribute the recurring charges).
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { createSubscription } from "@/lib/paypal";

export const runtime = "edge";

const ADMIN_EMAILS = ["rimfacai@gmail.com"];

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail, userName } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // ════════════════════════════════════════════════════════════════
    // ADMIN BYPASS — same pattern as checkout-consultation.
    // Inserts an "active" subscription row with a 100-year period end,
    // so chandler effectively gets Soram Companion forever without
    // PayPal involvement. Useful for content creation / testing.
    // ════════════════════════════════════════════════════════════════
    if (userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase())) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const supabaseKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        "";
      if (supabaseUrl && supabaseKey) {
        const dbHeaders = {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        };
        // Idempotency: check if admin already has an active sub
        const checkRes = await fetch(
          `${supabaseUrl}/rest/v1/soram_subscriptions?user_id=eq.${userId}&status=eq.active&select=id&limit=1`,
          { headers: dbHeaders }
        );
        const existing = checkRes.ok ? await checkRes.json() : [];
        if (!existing.length) {
          const farFuture = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString();
          await fetch(`${supabaseUrl}/rest/v1/soram_subscriptions`, {
            method: "POST",
            headers: dbHeaders,
            body: JSON.stringify({
              user_id: userId,
              platform: "paypal_admin",
              paypal_subscription_id: "admin_unlimited",
              status: "active",
              current_period_start: new Date().toISOString(),
              current_period_end: farFuture,
              subscriber_email: userEmail,
            }),
          });
        }
      }
      return NextResponse.json({
        url: `https://sajuastrology.com/pricing/soram-companion?payment=success&token=admin`,
      });
    }

    // ════════════════════════════════════════════════════════════════
    // Real subscription flow.
    // ════════════════════════════════════════════════════════════════
    const planId = process.env.PAYPAL_COMPANION_PLAN_ID || "";
    if (!planId) {
      console.error("PAYPAL_COMPANION_PLAN_ID env var not set");
      return NextResponse.json(
        { error: "Subscription not configured. Please contact support." },
        { status: 500 }
      );
    }

    if (!process.env.PAYPAL_CLIENT_ID) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
    }

    // custom_id encodes payment type + user_id for webhook routing.
    // Same pattern as one-time payments — webhook reads custom_id JSON
    // to know which user to credit.
    const customId = JSON.stringify({
      payment_type: "soram_companion",
      user_id: userId,
    });

    // Parse user's name into given_name + surname (best effort).
    let subscriberName: { given_name?: string; surname?: string } | undefined;
    if (userName && typeof userName === "string") {
      const parts = userName.trim().split(/\s+/);
      if (parts.length >= 2) {
        subscriberName = { given_name: parts[0], surname: parts.slice(1).join(" ") };
      } else if (parts.length === 1) {
        subscriberName = { given_name: parts[0] };
      }
    }

    const { subscriptionId, approvalUrl } = await createSubscription({
      planId,
      customId,
      returnUrl: `https://sajuastrology.com/pricing/soram-companion?payment=success`,
      cancelUrl: `https://sajuastrology.com/pricing/soram-companion?payment=cancelled`,
      subscriberEmail: userEmail,
      subscriberName,
    });

    // Pre-create a 'pending' row so we can correlate the webhook later
    // even if the user closes the browser between approval and webhook.
    // The webhook will UPDATE this row to 'active' when activation fires.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "";
    if (supabaseUrl && supabaseKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/soram_subscriptions`, {
          method: "POST",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            user_id: userId,
            platform: "paypal",
            paypal_subscription_id: subscriptionId,
            paypal_plan_id: planId,
            status: "pending",
            subscriber_email: userEmail,
            custom_id: customId,
          }),
        });
      } catch (e) {
        // Pre-create is best effort; webhook will create the row if
        // this insert failed (idempotent on paypal_subscription_id).
        console.warn("soram_subscriptions pre-create failed:", e);
      }
    }

    return NextResponse.json({
      url: approvalUrl,
      subscriptionId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("Companion checkout error:", message);
    return NextResponse.json({ error: "Server error: " + message }, { status: 500 });
  }
}
