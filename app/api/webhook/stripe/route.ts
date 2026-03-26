import { NextRequest, NextResponse } from "next/server";

// Must NOT be edge runtime — need to read raw body for signature verification
export const maxDuration = 30;

const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

const dbHeaders = {
  "Content-Type": "application/json",
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
  Prefer: "return=minimal",
};

async function verifyStripeSignature(
  body: string,
  signature: string
): Promise<boolean> {
  if (!webhookSecret) {
    // If no webhook secret configured, skip verification (dev mode)
    // In production, ALWAYS set STRIPE_WEBHOOK_SECRET
    console.warn("STRIPE_WEBHOOK_SECRET not set — skipping signature verification");
    return true;
  }

  // Simple HMAC verification using Web Crypto API
  const encoder = new TextEncoder();
  const parts = signature.split(",");
  const timestamp = parts.find((p) => p.startsWith("t="))?.split("=")[1];
  const sig = parts.find((p) => p.startsWith("v1="))?.split("=")[1];

  if (!timestamp || !sig) return false;

  // Check timestamp isn't too old (5 minute tolerance)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) return false;

  const payload = `${timestamp}.${body}`;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(webhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const computed = Array.from(new Uint8Array(signed))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computed === sig;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") || "";

    // Verify signature
    const isValid = await verifyStripeSignature(body, signature);
    if (!isValid) {
      console.error("Webhook: invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Only process completed checkout sessions
    if (event.type !== "checkout.session.completed") {
      return NextResponse.json({ received: true });
    }

    const session = event.data.object;
    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const metadata = session.metadata || {};
    const productType = metadata.product_type;
    const shareSlug = metadata.share_slug;
    const userId = metadata.user_id;
    const sessionId = session.id;

    // ═══ $9.99 Reading Payment ═══
    if (shareSlug && !productType) {
      // Check if already processed (idempotent)
      const checkRes = await fetch(
        `${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}&select=is_paid`,
        { headers: dbHeaders }
      );
      const existing = await checkRes.json();
      if (existing?.[0]?.is_paid === true) {
        return NextResponse.json({ received: true, already_processed: true });
      }

      // Mark reading as paid
      const customerEmail =
        session.customer_details?.email || session.customer_email || "";
      await fetch(
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

      console.log(`Webhook: Reading ${shareSlug} marked as paid`);
      return NextResponse.json({ received: true, type: "reading_paid" });
    }

    // ═══ $29.99 Consultation Payment ═══
    if (productType === "master_consultation" && userId) {
      // Check if already processed (idempotent)
      const checkRes = await fetch(
        `${supabaseUrl}/rest/v1/consultation_credits?stripe_session_id=eq.${sessionId}&select=id`,
        { headers: dbHeaders }
      );
      const existing = await checkRes.json();
      if (existing && existing.length > 0) {
        return NextResponse.json({ received: true, already_processed: true });
      }

      // Add 5 credits
      await fetch(`${supabaseUrl}/rest/v1/consultation_credits`, {
        method: "POST",
        headers: { ...dbHeaders, Prefer: "return=minimal" },
        body: JSON.stringify({
          user_id: userId,
          total_credits: 5,
          used_credits: 0,
          stripe_session_id: sessionId,
        }),
      });

      console.log(`Webhook: 5 consultation credits added for user ${userId}`);
      return NextResponse.json({ received: true, type: "consultation_credits" });
    }

    // Unknown payment type — log but accept
    console.warn("Webhook: unrecognized payment metadata", metadata);
    return NextResponse.json({ received: true, type: "unknown" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("Webhook error:", message);
    // Return 200 to prevent Stripe from retrying (we logged the error)
    return NextResponse.json({ error: message }, { status: 200 });
  }
}
