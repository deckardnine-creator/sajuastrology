import { NextRequest, NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // ═══ ADMIN BYPASS — skip payment for content creation ═══
    const ADMIN_EMAILS = ["rimfacai@gmail.com"];
    if (userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase())) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
      if (supabaseUrl && supabaseKey) {
        const dbHeaders = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, "Content-Type": "application/json", Prefer: "return=minimal" };
        await fetch(`${supabaseUrl}/rest/v1/consultation_credits`, {
          method: "POST", headers: dbHeaders,
          body: JSON.stringify({ user_id: userId, total_credits: 5, used_credits: 0, paypal_order_id: "admin_bypass" }),
        });
      }
      return NextResponse.json({ url: `https://sajuastrology.com/consultation?payment=success&token=admin` });
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
