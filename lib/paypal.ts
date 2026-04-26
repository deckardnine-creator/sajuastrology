// lib/paypal.ts — PayPal REST API helper functions
// Environment variables: PAYPAL_CLIENT_ID, PAYPAL_SECRET, PAYPAL_MODE (sandbox|live)

const getClientId = () => process.env.PAYPAL_CLIENT_ID || "";
const getSecret = () => process.env.PAYPAL_SECRET || "";

export function getPayPalBaseUrl(): string {
  return process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export async function getPayPalAccessToken(): Promise<string> {
  const base = getPayPalBaseUrl();
  const credentials = btoa(`${getClientId()}:${getSecret()}`);

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`PayPal auth failed: ${res.status}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function createPayPalOrder(params: {
  amount: string;
  currency?: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  customId: string;
}): Promise<{ orderId: string; approvalUrl: string }> {
  const base = getPayPalBaseUrl();
  const token = await getPayPalAccessToken();

  const res = await fetch(`${base}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: params.currency || "USD",
            value: params.amount,
          },
          description: params.description,
          custom_id: params.customId,
        },
      ],
      application_context: {
        brand_name: "SajuAstrology",
        landing_page: "LOGIN",
        user_action: "PAY_NOW",
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`PayPal create order failed: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const approvalUrl = data.links?.find((l: any) => l.rel === "approve")?.href;

  if (!approvalUrl) {
    throw new Error("PayPal: no approval URL in response");
  }

  return { orderId: data.id, approvalUrl };
}

export async function capturePayPalOrder(orderId: string): Promise<{
  success: boolean;
  email?: string;
  customId?: string;
  captureId?: string;
}> {
  const base = getPayPalBaseUrl();
  const token = await getPayPalAccessToken();

  // First try to capture
  const res = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // 422 = already captured — fetch order details instead
  if (res.status === 422) {
    const detailRes = await fetch(`${base}/v2/checkout/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (detailRes.ok) {
      const detail = await detailRes.json();
      if (detail.status === "COMPLETED") {
        const capture = detail.purchase_units?.[0]?.payments?.captures?.[0];
        return {
          success: true,
          email: detail.payer?.email_address,
          customId: capture?.custom_id || detail.purchase_units?.[0]?.custom_id,
          captureId: capture?.id,
        };
      }
    }
    return { success: false };
  }

  if (!res.ok) {
    console.error("PayPal capture failed:", res.status, await res.text());
    return { success: false };
  }

  const data = await res.json();
  if (data.status === "COMPLETED") {
    const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
    return {
      success: true,
      email: data.payer?.email_address,
      customId: capture?.custom_id || data.purchase_units?.[0]?.custom_id,
      captureId: capture?.id,
    };
  }

  return { success: false };
}

export async function getPayPalOrderDetails(orderId: string): Promise<any> {
  const base = getPayPalBaseUrl();
  const token = await getPayPalAccessToken();

  const res = await fetch(`${base}/v2/checkout/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;
  return res.json();
}


// ════════════════════════════════════════════════════════════════════
// v6.14 PATCH — APPEND TO lib/paypal.ts (existing file)
// ════════════════════════════════════════════════════════════════════
// This file contains ONLY new code to be appended to the bottom of
// the existing /lib/paypal.ts. The existing exports (getPayPalAccessToken,
// getPayPalBaseUrl, createPayPalOrder, capturePayPalOrder) are used as-is
// — we never modify them per chandler's "append only, never modify
// existing" principle.
//
// New exports added by this patch:
//   - createSubscription({planId, customId, returnUrl, cancelUrl})
//   - cancelSubscription(subscriptionId, reason?)
//   - getSubscriptionDetails(subscriptionId)
//
// All three follow the same fetch+token pattern as the existing helpers.
// ════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════
// createSubscription — start a recurring billing for the given plan.
// ════════════════════════════════════════════════════════════════════
// PayPal Subscription API flow:
//   1. POST /v1/billing/subscriptions with plan_id + return_url
//   2. Response includes a redirect href (rel: "approve") — user must
//      visit this to consent to recurring billing.
//   3. After user approves, PayPal redirects to return_url with
//      ?subscription_id=I-XXXXX&ba_token=BA-XXXXX&token=XXXXX
//   4. Subscription status starts as APPROVAL_PENDING, becomes ACTIVE
//      once PayPal processes the first payment (usually instant).
//   5. Webhook BILLING.SUBSCRIPTION.ACTIVATED fires when ACTIVE.
//
// custom_id is encoded as JSON so the webhook can route by user_id
// + subscription type (mirroring the one-time order pattern).
//
// IMPORTANT: PayPal does NOT charge the user during this approval flow.
// First charge happens when subscription becomes ACTIVE. So we must
// NOT mark the user's account as paid until the webhook arrives.
export async function createSubscription(opts: {
  planId: string;
  customId: string; // JSON string with payment_type + user_id
  returnUrl: string;
  cancelUrl: string;
  subscriberEmail?: string;
  subscriberName?: { given_name?: string; surname?: string };
}): Promise<{ subscriptionId: string; approvalUrl: string }> {
  const token = await getPayPalAccessToken();
  const base = getPayPalBaseUrl();

  const body: Record<string, unknown> = {
    plan_id: opts.planId,
    custom_id: opts.customId,
    application_context: {
      brand_name: "SajuAstrology",
      locale: "en-US",
      shipping_preference: "NO_SHIPPING",
      user_action: "SUBSCRIBE_NOW",
      payment_method: {
        payer_selected: "PAYPAL",
        payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
      },
      return_url: opts.returnUrl,
      cancel_url: opts.cancelUrl,
    },
  };

  if (opts.subscriberEmail || opts.subscriberName) {
    body.subscriber = {
      ...(opts.subscriberEmail ? { email_address: opts.subscriberEmail } : {}),
      ...(opts.subscriberName ? { name: opts.subscriberName } : {}),
    };
  }

  const res = await fetch(`${base}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      // PayPal-Request-Id makes the call idempotent — retries with the
      // same ID won't create duplicate subscriptions. Use a per-call
      // random ID since each call is a fresh user-initiated subscription.
      "PayPal-Request-Id": `sub-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`PayPal createSubscription failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const subscriptionId = data.id as string;

  // Find the approval link (rel="approve")
  type Link = { rel: string; href: string };
  const links = (data.links || []) as Link[];
  const approveLink = links.find((l) => l.rel === "approve");
  if (!approveLink) {
    throw new Error("PayPal createSubscription: no approval link in response");
  }

  return { subscriptionId, approvalUrl: approveLink.href };
}

// ════════════════════════════════════════════════════════════════════
// cancelSubscription — terminate an active subscription.
// ════════════════════════════════════════════════════════════════════
// Per PayPal docs, sending POST /v1/billing/subscriptions/{id}/cancel
// returns 204 No Content on success. After this, the user retains
// access until the end of the current billing cycle (PayPal handles
// this automatically — subsequent charges are skipped).
//
// We don't manually expire the row in soram_subscriptions here; the
// BILLING.SUBSCRIPTION.CANCELLED webhook handles that, keeping the
// state machine consistent regardless of whether cancellation came
// from us or from the user clicking "Cancel" inside PayPal directly.
export async function cancelSubscription(
  subscriptionId: string,
  reason: string = "User requested cancellation"
): Promise<{ success: boolean; alreadyCancelled?: boolean }> {
  const token = await getPayPalAccessToken();
  const base = getPayPalBaseUrl();

  const res = await fetch(
    `${base}/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    }
  );

  if (res.status === 204) {
    return { success: true };
  }
  if (res.status === 422) {
    // Already cancelled / expired — treat as success for idempotency.
    return { success: true, alreadyCancelled: true };
  }
  const errText = await res.text();
  throw new Error(`PayPal cancelSubscription failed (${res.status}): ${errText}`);
}

// ════════════════════════════════════════════════════════════════════
// getSubscriptionDetails — fetch current state of a subscription.
// ════════════════════════════════════════════════════════════════════
// Used by the verify endpoint to confirm a subscription is ACTIVE
// before granting entitlements (defense in depth: webhook is the
// primary signal but a synchronous check on the redirect callback
// gives the user faster feedback than waiting for the webhook to
// arrive — webhooks can lag 5–30 seconds in our experience).
//
// Returns the raw PayPal response. Caller picks the fields it needs.
// Common fields:
//   id, status (APPROVAL_PENDING | APPROVED | ACTIVE | SUSPENDED |
//               CANCELLED | EXPIRED), plan_id, start_time,
//   billing_info.next_billing_time, subscriber.email_address,
//   custom_id
export async function getSubscriptionDetails(subscriptionId: string): Promise<{
  id: string;
  status: string;
  plan_id?: string;
  start_time?: string;
  custom_id?: string;
  subscriber?: { email_address?: string };
  billing_info?: { next_billing_time?: string };
  // Allow extra fields without typing every one
  [key: string]: unknown;
}> {
  const token = await getPayPalAccessToken();
  const base = getPayPalBaseUrl();

  const res = await fetch(
    `${base}/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`PayPal getSubscriptionDetails failed (${res.status}): ${errText}`);
  }

  return res.json();
}
