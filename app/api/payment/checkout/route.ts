import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { shareSlug, readingName } = await request.json();

    if (!shareSlug) {
      return NextResponse.json({ error: "Missing shareSlug" }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    // Create Stripe Checkout Session via REST API (Edge compatible)
    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("success_url", `https://sajuastrology.com/reading/${shareSlug}?payment=success&session_id={CHECKOUT_SESSION_ID}`);
    params.append("cancel_url", `https://sajuastrology.com/reading/${shareSlug}?payment=cancelled`);
    params.append("line_items[0][price_data][currency]", "usd");
    params.append("line_items[0][price_data][unit_amount]", "999"); // $9.99 in cents
    params.append("line_items[0][price_data][product_data][name]", "Full Destiny Reading");
    params.append("line_items[0][price_data][product_data][description]", `Complete life blueprint for ${readingName || "you"} — 10-year forecast, career, love, health analysis`);
    params.append("line_items[0][quantity]", "1");
    params.append("metadata[share_slug]", shareSlug);
    params.append("payment_intent_data[metadata][share_slug]", shareSlug);

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
    console.error("Checkout error:", err?.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
