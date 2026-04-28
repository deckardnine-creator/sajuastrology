import { NextRequest, NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";

export async function POST(request: NextRequest) {
  try {
    const { shareSlug, readingName, userEmail } = await request.json();

    if (!shareSlug) {
      return NextResponse.json({ error: "Missing shareSlug" }, { status: 400 });
    }

    // ADMIN BYPASS - skip payment for content creation
    const ADMIN_EMAILS = ["rimfacai@gmail.com"];
    if (userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase())) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
      if (supabaseUrl && supabaseKey) {
        await fetch(`${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}`, {
          method: "PATCH",
          headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify({ is_paid: true }),
        });
      }
      return NextResponse.json({ url: `https://sajuastrology.com/reading/${shareSlug}?payment=success` });
    }

    if (!process.env.PAYPAL_CLIENT_ID) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
    }

    // custom_id encodes payment type + share_slug for verification
    const customId = JSON.stringify({
      payment_type: "reading",
      share_slug: shareSlug,
    });

    const { approvalUrl } = await createPayPalOrder({
      amount: "9.99",
      description: readingName || "Full Destiny Reading ??SajuAstrology",
      returnUrl: `https://sajuastrology.com/reading/${shareSlug}?payment=success`,
      cancelUrl: `https://sajuastrology.com/reading/${shareSlug}?payment=cancelled`,
      customId,
    });

    return NextResponse.json({ url: approvalUrl });
  } catch (err: any) {
    console.error("PayPal checkout error:", err?.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}