// lib/payment/creem.ts
// Creem Merchant of Record integration helpers.
// Used for global card payments (Visa/Master/JCB) — covers regions where PayPal can't.
//
// Product IDs are environment-fixed since they only change when products are recreated
// in the Creem dashboard. If you create new products, update CREEM_PRODUCT_IDS below.

export const CREEM_PRODUCT_IDS = {
  soram_companion: "prod_4C51QofEIonADhiCQKXOXl",       // $4.99/month subscription
  compatibility_full: "prod_26rKjoWqIy5nBgMK6EIWWz",   // $2.99 one-time
  full_destiny_reading: "prod_5InHZQmxYtrdJTNYjmF5zn", // $9.99 one-time
  master_5_pack: "prod_7cUju1s5wu9Zi7CkO5t4s7",        // $29.99 one-time
} as const;

export type CreemProductKey = keyof typeof CREEM_PRODUCT_IDS;

const CREEM_API_BASE = "https://api.creem.io/v1";

// ─────────────────────────────────────────────────────────────────────────────
// Checkout session creation
// ─────────────────────────────────────────────────────────────────────────────

interface CreateCheckoutParams {
  productKey: CreemProductKey;
  // Internal correlation ID — passed back in webhooks via metadata.
  // For one-time: shareSlug (reading slug) or compatibility result id.
  // For subscription: user_id.
  customId: string;
  // Where Creem redirects the user after success.
  successUrl: string;
  // User's email if known (logged-in users).
  customerEmail?: string;
  // Extra metadata stored with the checkout — appears in webhook.
  metadata?: Record<string, string>;
}

interface CreateCheckoutResponse {
  id: string;
  checkout_url: string;
}

export async function createCreemCheckout(
  params: CreateCheckoutParams
): Promise<CreateCheckoutResponse> {
  const apiKey = process.env.CREEM_API_KEY;
  if (!apiKey) {
    throw new Error("CREEM_API_KEY env var is missing");
  }

  const productId = CREEM_PRODUCT_IDS[params.productKey];
  if (!productId) {
    throw new Error(`Unknown Creem product key: ${params.productKey}`);
  }

  const body = {
    product_id: productId,
    request_id: params.customId,
    success_url: params.successUrl,
    customer: params.customerEmail ? { email: params.customerEmail } : undefined,
    metadata: {
      ...(params.metadata || {}),
      product_key: params.productKey,
      custom_id: params.customId,
    },
  };

  const res = await fetch(`${CREEM_API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Creem checkout creation failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return {
    id: data.id,
    checkout_url: data.checkout_url,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Webhook signature verification
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verify webhook signature using HMAC-SHA256.
 * Creem sends the signature in the `creem-signature` header.
 * Falls back to common alternative header names if needed.
 */
export async function verifyCreemSignature(
  rawBody: string,
  signature: string | null
): Promise<boolean> {
  const secret = process.env.CREEM_WEBHOOK_SECRET;
  if (!secret) {
    console.error("CREEM_WEBHOOK_SECRET env var is missing");
    return false;
  }
  if (!signature) {
    return false;
  }

  try {
    const crypto = await import("crypto");
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(rawBody);
    const expected = hmac.digest("hex");
    // Constant-time comparison to prevent timing attacks
    if (expected.length !== signature.length) return false;
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Product key inference (reverse lookup)
// ─────────────────────────────────────────────────────────────────────────────

export function getProductKeyFromId(productId: string): CreemProductKey | null {
  for (const [key, id] of Object.entries(CREEM_PRODUCT_IDS)) {
    if (id === productId) return key as CreemProductKey;
  }
  return null;
}
