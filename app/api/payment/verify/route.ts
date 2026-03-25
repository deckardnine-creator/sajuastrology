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
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    // 1. Verify payment with Stripe
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

    // 2. Mark as paid + save customer email
    const customerEmail = session.customer_details?.email || session.customer_email || "";

    await fetch(`${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ is_paid: true, customer_email: customerEmail }),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Verify error:", err?.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
