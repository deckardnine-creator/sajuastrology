// ════════════════════════════════════════════════════════════════════
// /api/payment/checkout-compatibility — $2.99 one-time unlock for a
// compatibility result.
// ════════════════════════════════════════════════════════════════════
// Mirrors /api/payment/checkout (reading) but for compatibility rows.
// The compatibility result is identified by `compatSlug` (analogous
// to a reading's share_slug). custom_id encodes payment_type +
// compat_slug so the webhook can mark the row as paid.
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";

export const runtime = "edge";

const ADMIN_EMAILS = ["rimfacai@gmail.com"];

export async function POST(request: NextRequest) {
  try {
    const { compatSlug, partnerName, userEmail } = await request.json();

    if (!compatSlug) {
      return NextResponse.json({ error: "Missing compatSlug" }, { status: 400 });
    }

    // ADMIN BYPASS
    if (userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase())) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const supabaseKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        "";
      if (supabaseUrl && supabaseKey) {
        await fetch(
          `${supabaseUrl}/rest/v1/compatibility_results?share_slug=eq.${encodeURIComponent(compatSlug)}`,
          {
            method: "PATCH",
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
              Prefer: "return=minimal",
            },
            body: JSON.stringify({ is_paid: true }),
          }
        );
      }
      return NextResponse.json({
        url: `https://sajuastrology.com/compatibility/result/${compatSlug}?payment=success`,
      });
    }

    if (!process.env.PAYPAL_CLIENT_ID) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
    }

    const customId = JSON.stringify({
      payment_type: "compatibility",
      compat_slug: compatSlug,
    });

    const description = partnerName
      ? `Compatibility Full — ${partnerName} • SajuAstrology`
      : "Compatibility Full Reading — SajuAstrology";

    const { approvalUrl } = await createPayPalOrder({
      amount: "2.99",
      description,
      returnUrl: `https://sajuastrology.com/compatibility/result/${compatSlug}?payment=success`,
      cancelUrl: `https://sajuastrology.com/compatibility/result/${compatSlug}?payment=cancelled`,
      customId,
    });

    return NextResponse.json({ url: approvalUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("Compatibility checkout error:", message);
    return NextResponse.json({ error: "Server error: " + message }, { status: 500 });
  }
}
