import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append(
      "success_url",
      `https://sajuastrology.com/consultation?payment=success&session_id={CHECKOUT_SESSION_ID}`
    );
    params.append(
      "cancel_url",
      `https://sajuastrology.com/consultation?payment=cancelled`
    );
    params.append("line_items[0][price_data][currency]", "usd");
    params.append("line_items[0][price_data][unit_amount]", "2999"); // $29.99
    params.append("line_items[0][price_data][product_data][name]", "Master Consultation — 5 Sessions");
    params.append(
      "line_items[0][price_data][product_data][description]",
      "5 personalized Saju consultation sessions with in-depth analysis reports"
    );
    params.append("line_items[0][quantity]", "1");
    params.append("metadata[user_id]", userId);
    params.append("metadata[product_type]", "master_consultation");
    params.append("payment_intent_data[metadata][user_id]", userId);
    params.append("payment_intent_data[metadata][product_type]", "master_consultation");

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!stripeRes.ok) {
      const errText = await stripeRes.text();
      console.error("Stripe error:", stripeRes.status, errText);
      return NextResponse.json({ error: "Payment setup failed" }, { status: 500 });
    }

    const session = await stripeRes.json();
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Consultation checkout error:", err?.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
