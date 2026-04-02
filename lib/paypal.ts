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
