import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, shareSlug } = await request.json();

    if (!sessionId || !shareSlug) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
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

    // 1. Check if already paid (idempotency — handles page reload, double-click)
    const checkRes = await fetch(
      `${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}&select=is_paid`,
      { headers: dbHeaders }
    );
    if (checkRes.ok) {
      const existing = await checkRes.json();
      if (existing?.[0]?.is_paid === true) {
        return NextResponse.json({ success: true, alreadyPaid: true });
      }
    }

    // 2. Verify payment with Stripe
    const stripeRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
      { headers: { Authorization: `Bearer ${stripeSecretKey}` } }
    );

    if (!stripeRes.ok) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    const session = await stripeRes.json();

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    // 3. Verify Stripe metadata matches slug (prevent tampering)
    if (session.metadata?.share_slug && session.metadata.share_slug !== shareSlug) {
      return NextResponse.json({ error: "Session mismatch" }, { status: 400 });
    }

    // 4. Mark as paid + save customer email
    const customerEmail = session.customer_details?.email || session.customer_email || "";

    await fetch(`${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}`, {
      method: "PATCH",
      headers: dbHeaders,
      body: JSON.stringify({ is_paid: true, customer_email: customerEmail }),
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown";
    return NextResponse.json({ error: "Server error: " + message }, { status: 500 });
  }
}
