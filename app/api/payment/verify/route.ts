import { NextRequest, NextResponse } from "next/server";

// Serverless runtime required for setTimeout reliability
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { sessionId, shareSlug } = await request.json();

    if (!shareSlug) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
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

    // Check if already paid (webhook may have already processed)
    const checkRes = await fetch(
      `${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}&select=is_paid`,
      { headers: dbHeaders }
    );
    if (checkRes.ok) {
      const existing = await checkRes.json();
      if (existing?.[0]?.is_paid === true) {
        return NextResponse.json({ success: true });
      }
    }

    // LemonSqueezy: webhook may arrive before or after client verify
    // Poll up to 10s (5 × 2s) for webhook to mark is_paid=true
    if (sessionId === "lemon") {
      for (let i = 0; i < 5; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const retryRes = await fetch(
          `${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}&select=is_paid`,
          { headers: dbHeaders }
        );
        if (retryRes.ok) {
          const retryData = await retryRes.json();
          if (retryData?.[0]?.is_paid === true) {
            return NextResponse.json({ success: true });
          }
        }
      }
      // After 10s still not marked — return success anyway so client shows loading
      // Webhook will eventually fire and mark is_paid; generate-paid runs regardless
      return NextResponse.json({ success: true, pending: true });
    }

    // Legacy Stripe flow (if session_id is not "lemon")
    // Keep backward compatibility for any old pending Stripe payments
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
    if (stripeSecretKey && sessionId && sessionId !== "lemon") {
      const stripeRes = await fetch(
        `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
        { headers: { Authorization: `Bearer ${stripeSecretKey}` } }
      );
      if (stripeRes.ok) {
        const session = await stripeRes.json();
        if (session.payment_status === "paid") {
          const customerEmail = session.customer_details?.email || "";
          await fetch(`${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}`, {
            method: "PATCH",
            headers: dbHeaders,
            body: JSON.stringify({ is_paid: true, customer_email: customerEmail }),
          });
          return NextResponse.json({ success: true });
        }
      }
    }

    return NextResponse.json({ error: "Payment not confirmed yet" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown";
    return NextResponse.json({ error: "Server error: " + message }, { status: 500 });
  }
}
