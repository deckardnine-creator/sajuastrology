import { NextRequest, NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (!process.env.PAYPAL_CLIENT_ID) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
    }

    // custom_id encodes payment type + user_id for webhook/verification
    const customId = JSON.stringify({
      payment_type: "consultation",
      user_id: userId,
    });

    const { approvalUrl } = await createPayPalOrder({
      amount: "29.99",
      description: "Master Consultation (5 Sessions) — SajuAstrology",
      returnUrl: `https://sajuastrology.com/consultation?payment=success`,
      cancelUrl: `https://sajuastrology.com/consultation?payment=cancelled`,
      customId,
    });

    return NextResponse.json({ url: approvalUrl });
  } catch (err: any) {
    console.error("PayPal consultation checkout error:", err?.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
