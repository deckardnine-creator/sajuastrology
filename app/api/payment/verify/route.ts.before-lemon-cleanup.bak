import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { sessionId, shareSlug } = await request.json();

    if (!shareSlug) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
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

    // Check if already paid
    const checkRes = await fetch(
      `${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}&select=is_paid`,
      { headers: dbHeaders }
    );
    if (checkRes.ok) {
      const existing = await checkRes.json();
      if (existing?.[0]?.is_paid === true) {
        return NextResponse.json({ success: true });
      }
    }

    // PayPal flow: capture the order using the token from redirect
    // PayPal redirects with ?token=ORDER_ID — frontend passes it as sessionId
    if (sessionId && sessionId !== "lemon") {
      const result = await capturePayPalOrder(sessionId);

      if (result.success) {
        // Mark reading as paid in DB
        const patchRes = await fetch(
          `${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}`,
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
          console.error("Failed to mark reading as paid:", await patchRes.text());
        }

        return NextResponse.json({ success: true });
      }

      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    // Legacy LemonSqueezy flow — poll for webhook
    if (sessionId === "lemon") {
      for (let i = 0; i < 5; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const retryRes = await fetch(
          `${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}&select=is_paid`,
          { headers: dbHeaders }
        );
        if (retryRes.ok) {
          const retryData = await retryRes.json();
          if (retryData?.[0]?.is_paid === true) {
            return NextResponse.json({ success: true });
          }
        }
      }
      return NextResponse.json({ success: true, pending: true });
    }

    return NextResponse.json({ error: "Payment not confirmed yet" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown";
    return NextResponse.json({ error: "Server error: " + message }, { status: 500 });
  }
}
