import { NextRequest, NextResponse } from "next/server";

// Use Node.js runtime for crypto (Edge doesn't have full crypto.subtle.importKey for HMAC)
export const maxDuration = 30;

const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || "";

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

// HMAC-SHA256 signature verification
async function verifySignature(payload: string, signature: string): Promise<boolean> {
  if (!WEBHOOK_SECRET || !signature) return false;
  try {
    const crypto = await import("crypto");
    const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
    hmac.update(payload);
    const expected = hmac.digest("hex");
    return expected === signature;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-signature") || "";

    // Verify webhook authenticity
    const isValid = await verifySignature(rawBody, signature);
    if (!isValid) {
      console.error("LemonSqueezy webhook: invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const eventName = event.meta?.event_name;

    if (eventName !== "order_created") {
      // We only handle order_created for now
      return NextResponse.json({ received: true });
    }

    // Extract order data
    const order = event.data?.attributes;
    const customData = event.meta?.custom_data || {};
    const orderId = event.data?.id;
    const customerEmail = order?.user_email || "";
    const paymentType = customData.payment_type;

    console.log(`LemonSqueezy order_created: #${orderId}, type=${paymentType}, email=${customerEmail}`);

    if (paymentType === "reading") {
      // ═══ READING PAYMENT ($9.99) ═══
      const shareSlug = customData.share_slug;
      if (!shareSlug) {
        console.error("Webhook: missing share_slug for reading payment");
        return NextResponse.json({ error: "Missing share_slug" }, { status: 400 });
      }

      // Mark reading as paid
      const patchRes = await fetch(
        `${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}`,
        {
          method: "PATCH",
          headers: dbHeaders,
          body: JSON.stringify({
            is_paid: true,
            customer_email: customerEmail,
          }),
        }
      );

      if (!patchRes.ok) {
        console.error("Webhook: failed to mark reading as paid", await patchRes.text());
        return NextResponse.json({ error: "DB update failed" }, { status: 500 });
      }

      console.log(`Reading ${shareSlug} marked as paid`);
      return NextResponse.json({ success: true, type: "reading", shareSlug });

    } else if (paymentType === "consultation") {
      // ═══ CONSULTATION PAYMENT ($29.99) ═══
      const userId = customData.user_id;
      if (!userId) {
        console.error("Webhook: missing user_id for consultation payment");
        return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
      }

      // Check idempotency — don't add credits twice for same order
      const checkRes = await fetch(
        `${supabaseUrl}/rest/v1/consultation_credits?lemon_order_id=eq.${orderId}&select=id`,
        { headers: dbHeaders }
      );
      if (checkRes.ok) {
        const existing = await checkRes.json();
        if (existing && existing.length > 0) {
          console.log(`Order ${orderId} already processed`);
          return NextResponse.json({ success: true, already_processed: true });
        }
      }

      // Add 5 consultation credits
      const insertRes = await fetch(
        `${supabaseUrl}/rest/v1/consultation_credits`,
        {
          method: "POST",
          headers: { ...dbHeaders, Prefer: "return=minimal" },
          body: JSON.stringify({
            user_id: userId,
            total_credits: 5,
            used_credits: 0,
            lemon_order_id: String(orderId),
          }),
        }
      );

      if (!insertRes.ok) {
        console.error("Webhook: failed to add credits", await insertRes.text());
        return NextResponse.json({ error: "Failed to add credits" }, { status: 500 });
      }

      console.log(`5 consultation credits added for user ${userId}`);
      return NextResponse.json({ success: true, type: "consultation", credits: 5 });

    } else {
      console.log(`Webhook: unknown payment_type: ${paymentType}`);
      return NextResponse.json({ received: true, unknown_type: true });
    }
  } catch (err: any) {
    console.error("LemonSqueezy webhook error:", err?.message || err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
