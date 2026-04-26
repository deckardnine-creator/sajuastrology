// ════════════════════════════════════════════════════════════════════
// /api/payment/verify-compatibility — confirm $2.99 unlock after
// PayPal redirect.
// ════════════════════════════════════════════════════════════════════
// Mirrors /api/payment/verify (reading) but for compatibility rows.
// PayPal redirects back with ?token=ORDER_ID (and ?payment=success
// from our return_url). We capture the order — if successful, mark
// the compatibility row as paid. The webhook is the redundant path
// that catches cases where the user closes the browser before this
// runs.
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { sessionId, compatSlug } = await request.json();

    if (!compatSlug) {
      return NextResponse.json({ error: "Missing compatSlug" }, { status: 400 });
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

    // Already paid? short-circuit.
    const checkRes = await fetch(
      `${supabaseUrl}/rest/v1/compatibility_results?share_slug=eq.${encodeURIComponent(compatSlug)}&select=is_paid`,
      { headers: dbHeaders }
    );
    if (checkRes.ok) {
      const existing = await checkRes.json();
      if (existing?.[0]?.is_paid === true) {
        return NextResponse.json({ success: true });
      }
    }

    // Capture the order using the session token from PayPal redirect.
    if (sessionId) {
      const result = await capturePayPalOrder(sessionId);
      if (result.success) {
        const patchRes = await fetch(
          `${supabaseUrl}/rest/v1/compatibility_results?share_slug=eq.${encodeURIComponent(compatSlug)}`,
          {
            method: "PATCH",
            headers: dbHeaders,
            body: JSON.stringify({
              is_paid: true,
              customer_email: result.email || "",
              paypal_order_id: sessionId,
            }),
          }
        );
        if (!patchRes.ok) {
          console.error(
            "Failed to mark compat as paid:",
            await patchRes.text()
          );
        }
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    return NextResponse.json({ error: "Payment not confirmed yet" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("verify-compatibility error:", message);
    return NextResponse.json({ error: "Server error: " + message }, { status: 500 });
  }
}
