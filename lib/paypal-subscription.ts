/**
 * PayPal Subscription Module
 * 
 * Soram Daily Pass ($4.99/월) 구독 관리.
 * 
 * 사전 준비 (PayPal Developer Dashboard):
 *   1. Product 생성 → PRODUCT_ID
 *   2. Plan 생성 ($4.99/월, 무한 반복) → PLAN_ID
 *   3. Webhook 등록 → WEBHOOK_ID
 *   4. 환경변수 설정:
 *      - PAYPAL_CLIENT_ID (기존)
 *      - PAYPAL_CLIENT_SECRET (기존)
 *      - PAYPAL_SUBSCRIPTION_PLAN_ID (NEW)
 *      - PAYPAL_WEBHOOK_ID (NEW)
 *      - PAYPAL_API_BASE = https://api-m.paypal.com (live) or sandbox.paypal.com
 */

// PAYPAL_API_BASE 우선, 없으면 PAYPAL_MODE 기반 자동 결정
// (기존 sajuastrology에 PAYPAL_MODE='live' 있음)
const PAYPAL_API_BASE = 
  process.env.PAYPAL_API_BASE || 
  (process.env.PAYPAL_MODE === "sandbox" 
    ? "https://api-m.sandbox.paypal.com" 
    : "https://api-m.paypal.com");

const PLAN_ID = process.env.PAYPAL_SUBSCRIPTION_PLAN_ID || "";
const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || "";

// ====================================================================
// 액세스 토큰 관리 (메모리 캐시)
// ====================================================================

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }
  
  const clientId = process.env.PAYPAL_CLIENT_ID;
  // PAYPAL_CLIENT_SECRET 또는 PAYPAL_SECRET 둘 중 하나 사용
  // (기존 sajuastrology에 PAYPAL_SECRET 있음)
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials missing");
  }
  
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  
  if (!res.ok) {
    throw new Error(`PayPal auth failed: ${res.status}`);
  }
  
  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
  };
  
  return cachedToken.token;
}

// ====================================================================
// 1. 구독 생성 (유저가 결제 버튼 클릭 시)
// ====================================================================

export interface CreateSubscriptionParams {
  userId: string;
  userEmail: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface CreateSubscriptionResult {
  subscriptionId: string;
  approveUrl: string;
}

export async function createSubscription(params: CreateSubscriptionParams): Promise<CreateSubscriptionResult> {
  const token = await getAccessToken();
  
  const res = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      plan_id: PLAN_ID,
      custom_id: params.userId, // 유저 ID 매핑
      subscriber: {
        email_address: params.userEmail,
      },
      application_context: {
        brand_name: "SajuAstrology",
        locale: "en-US",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        payment_method: {
          payer_selected: "PAYPAL",
          payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
        },
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
      },
    }),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`PayPal subscription create failed: ${res.status} ${errorText}`);
  }
  
  const data = await res.json();
  const approveLink = data.links?.find((l: any) => l.rel === "approve");
  
  return {
    subscriptionId: data.id,
    approveUrl: approveLink?.href || "",
  };
}

// ====================================================================
// 2. 구독 상태 조회
// ====================================================================

export interface SubscriptionDetails {
  id: string;
  status: string;
  custom_id?: string;
  start_time?: string;
  billing_info?: {
    next_billing_time?: string;
    last_payment?: {
      amount: { currency_code: string; value: string };
      time: string;
    };
  };
}

export async function getSubscription(subscriptionId: string): Promise<SubscriptionDetails> {
  const token = await getAccessToken();
  
  const res = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!res.ok) {
    throw new Error(`PayPal subscription get failed: ${res.status}`);
  }
  
  return await res.json();
}

// ====================================================================
// 3. 구독 해지
// ====================================================================

export async function cancelSubscription(subscriptionId: string, reason: string = "User requested"): Promise<void> {
  const token = await getAccessToken();
  
  const res = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason }),
  });
  
  // 204 No Content = 성공
  if (res.status !== 204) {
    const errorText = await res.text();
    throw new Error(`PayPal cancel failed: ${res.status} ${errorText}`);
  }
}

// ====================================================================
// 4. Webhook 검증
// ====================================================================

export interface WebhookHeaders {
  "paypal-auth-algo": string;
  "paypal-cert-url": string;
  "paypal-transmission-id": string;
  "paypal-transmission-sig": string;
  "paypal-transmission-time": string;
}

export async function verifyWebhook(headers: WebhookHeaders, body: any): Promise<boolean> {
  const token = await getAccessToken();
  
  const res = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: headers["paypal-auth-algo"],
      cert_url: headers["paypal-cert-url"],
      transmission_id: headers["paypal-transmission-id"],
      transmission_sig: headers["paypal-transmission-sig"],
      transmission_time: headers["paypal-transmission-time"],
      webhook_id: WEBHOOK_ID,
      webhook_event: body,
    }),
  });
  
  if (!res.ok) return false;
  
  const data = await res.json();
  return data.verification_status === "SUCCESS";
}

// ====================================================================
// 5. Webhook 이벤트 타입
// ====================================================================

export type PayPalWebhookEventType =
  | "BILLING.SUBSCRIPTION.ACTIVATED"
  | "BILLING.SUBSCRIPTION.CANCELLED"
  | "BILLING.SUBSCRIPTION.SUSPENDED"
  | "BILLING.SUBSCRIPTION.EXPIRED"
  | "BILLING.SUBSCRIPTION.PAYMENT.FAILED"
  | "PAYMENT.SALE.COMPLETED";

export interface PayPalWebhookEvent {
  id: string;
  event_type: PayPalWebhookEventType;
  resource: any;
  create_time: string;
}
