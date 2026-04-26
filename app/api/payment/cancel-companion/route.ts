// ════════════════════════════════════════════════════════════════════
// /api/payment/cancel-companion — user-initiated subscription cancellation.
// ════════════════════════════════════════════════════════════════════
// Flow:
//   1. User clicks "Cancel subscription" on /dashboard or
//      /pricing/soram-companion
//   2. We call this endpoint with their userId.
//   3. We look up their active soram_subscriptions row.
//   4. Call PayPal cancelSubscription() — PayPal stops future billing
//      but the user retains access until current_period_end (PayPal
//      handles this automatically).
//   5. We DON'T set status='cancelled' here — we let the
//      BILLING.SUBSCRIPTION.CANCELLED webhook do that, keeping the
//      state machine driven by webhook events for consistency. Until
//      then, the row stays 'active' and the user can still use Soram.
//
// Permission check: only the row's owning user can cancel. Auth is
// done via supabase.auth.getUser() with the bearer token from the
// client.
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cancelSubscription } from "@/lib/paypal";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    // ──────────────────────────────────────────────────────────────
    // Auth — must be signed in. We trust the bearer token, validate
    // it against Supabase, and only allow cancelling rows that
    // belong to the authenticated user.
    // ──────────────────────────────────────────────────────────────
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return NextResponse.json({ error: "Missing auth token" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;

    const sbAuth = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await sbAuth.auth.getUser();
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: "Invalid auth" }, { status: 401 });
    }
    const userId = userData.user.id;

    // ──────────────────────────────────────────────────────────────
    // Find the active subscription row.
    // ──────────────────────────────────────────────────────────────
    const sbAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { data: rows } = await sbAdmin
      .from("soram_subscriptions")
      .select("id, platform, paypal_subscription_id, status")
      .eq("user_id", userId)
      .in("status", ["active", "pending"])
      .order("created_at", { ascending: false })
      .limit(1);

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    const row = rows[0];

    // Admin row — just mark cancelled in DB (no PayPal call).
    if (row.platform === "paypal_admin" || row.paypal_subscription_id === "admin_unlimited") {
      await sbAdmin
        .from("soram_subscriptions")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("id", row.id);
      return NextResponse.json({ success: true, admin: true });
    }

    // IAP row — direct user to manage on Apple/Google. We can't cancel
    // an Apple/Google subscription server-side per platform policy.
    if (row.platform === "iap_ios" || row.platform === "iap_android") {
      const platformLabel = row.platform === "iap_ios" ? "Apple App Store" : "Google Play";
      const url =
        row.platform === "iap_ios"
          ? "https://apps.apple.com/account/subscriptions"
          : "https://play.google.com/store/account/subscriptions";
      return NextResponse.json({
        success: false,
        platform_managed: true,
        message: `Please cancel through ${platformLabel}.`,
        manage_url: url,
      });
    }

    // PayPal row — call PayPal to cancel.
    if (!row.paypal_subscription_id) {
      return NextResponse.json(
        { error: "Subscription has no PayPal ID, cannot cancel" },
        { status: 500 }
      );
    }

    const result = await cancelSubscription(
      row.paypal_subscription_id,
      "User requested cancellation from app"
    );

    // Optimistically reflect cancellation locally; webhook will overwrite
    // with PayPal's authoritative state shortly.
    if (result.success) {
      await sbAdmin
        .from("soram_subscriptions")
        .update({ cancelled_at: new Date().toISOString() })
        .eq("id", row.id);
    }

    return NextResponse.json({
      success: result.success,
      already_cancelled: result.alreadyCancelled || false,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("cancel-companion error:", message);
    return NextResponse.json({ error: "Server error: " + message }, { status: 500 });
  }
}
