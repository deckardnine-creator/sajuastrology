import { NextRequest, NextResponse } from "next/server";
import { getPayPalAccessToken, getPayPalBaseUrl } from "@/lib/paypal";

export const maxDuration = 30;

const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || "";

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

// Verify PayPal webhook signature via API
async function verifyWebhook(
  request: NextRequest,
  rawBody: string
): Promise<boolean> {
  if (!WEBHOOK_ID) return false;
  try {
    const token = await getPayPalAccessToken();
    const base = getPayPalBaseUrl();

    const res = await fetch(`${base}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: request.headers.get("paypal-auth-algo") || "",
        cert_url: request.headers.get("paypal-cert-url") || "",
        transmission_id: request.headers.get("paypal-transmission-id") || "",
        transmission_sig: request.headers.get("paypal-transmission-sig") || "",
        transmission_time: request.headers.get("paypal-transmission-time") || "",
        webhook_id: WEBHOOK_ID,
        webhook_event: JSON.parse(rawBody),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.verification_status === "SUCCESS";
    }
    return false;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    // Verify signature (skip in sandbox if WEBHOOK_ID not set)
    if (WEBHOOK_ID) {
      const isValid = await verifyWebhook(request, rawBody);
      if (!isValid) {
        console.error("PayPal webhook: invalid signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event_type;

    // We only handle completed captures
    if (eventType !== "PAYMENT.CAPTURE.COMPLETED") {
      return NextResponse.json({ received: true });
    }

    const capture = event.resource;
    const orderId = capture?.supplementary_data?.related_ids?.order_id || "";
    const customerEmail = capture?.payer?.email_address || "";
    let customId: any = {};

    try {
      customId = JSON.parse(capture?.custom_id || "{}");
    } catch {
      customId = {};
    }

    const paymentType = customId.payment_type;

    console.log(`PayPal PAYMENT.CAPTURE.COMPLETED: order=${orderId}, type=${paymentType}`);

    if (paymentType === "reading") {
      // ═══ READING PAYMENT ($9.99) ═══
      const shareSlug = customId.share_slug;
      if (!shareSlug) {
        console.error("Webhook: missing share_slug");
        return NextResponse.json({ error: "Missing share_slug" }, { status: 400 });
      }

      await fetch(
        `${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}`,
        {
          method: "PATCH",
          headers: dbHeaders,
          body: JSON.stringify({
            is_paid: true,
            customer_email: customerEmail,
            paypal_order_id: orderId,
          }),
        }
      );

      console.log(`Reading ${shareSlug} marked as paid via webhook`);
      return NextResponse.json({ success: true, type: "reading", shareSlug });

    } else if (paymentType === "consultation") {
      // ═══ CONSULTATION PAYMENT ($29.99) ═══
      const userId = customId.user_id;
      if (!userId) {
        console.error("Webhook: missing user_id");
        return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
      }

      // Idempotency check
      const checkRes = await fetch(
        `${supabaseUrl}/rest/v1/consultation_credits?paypal_order_id=eq.${orderId}&select=id`,
        { headers: dbHeaders }
      );
      if (checkRes.ok) {
        const existing = await checkRes.json();
        if (existing && existing.length > 0) {
          return NextResponse.json({ success: true, already_processed: true });
        }
      }

      // Add 5 consultation credits
      await fetch(`${supabaseUrl}/rest/v1/consultation_credits`, {
        method: "POST",
        headers: { ...dbHeaders, Prefer: "return=minimal" },
        body: JSON.stringify({
          user_id: userId,
          total_credits: 5,
          used_credits: 0,
          paypal_order_id: orderId,
        }),
      });

      console.log(`5 consultation credits added for user ${userId} via webhook`);
      return NextResponse.json({ success: true, type: "consultation", credits: 5 });
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("PayPal webhook error:", err?.message || err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
