import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userId } = await request.json();

    if (!sessionId || !userId) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

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

    // Check if this session was already processed (idempotency)
    const checkRes = await fetch(
      `${supabaseUrl}/rest/v1/consultation_credits?stripe_session_id=eq.${sessionId}&select=id`,
      {
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      }
    );
    const existing = await checkRes.json();
    if (existing && existing.length > 0) {
      return NextResponse.json({ success: true, already_processed: true });
    }

    // 2. Add 5 credits to user
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/consultation_credits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        user_id: userId,
        total_credits: 5,
        used_credits: 0,
        stripe_session_id: sessionId,
      }),
    });

    if (!insertRes.ok) {
      const errText = await insertRes.text();
      console.error("Supabase insert error:", errText);
      return NextResponse.json({ error: "Failed to add credits" }, { status: 500 });
    }

    return NextResponse.json({ success: true, credits_added: 5 });
  } catch (err: any) {
    console.error("Verify consultation error:", err?.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
