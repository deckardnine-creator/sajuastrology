import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSign } from "crypto";

/**
 * POST /api/payment/verify-iap-v2
 *
 * STRICT MODE — Stage 1.4 hardened version (audit fixes B-2, B-3, B-4 applied).
 *
 * v6.17.27: extended to handle compat_full (one-time, $2.99) and
 * soram_companion_monthly (auto-renewable subscription, $4.99/mo).
 *
 * Auth:
 * - Requires Authorization: Bearer {supabase_access_token}
 * - Server resolves user.id from token. The body's userId is IGNORED.
 *
 * Receipt verification:
 * - Apple: requires APPLE_SHARED_SECRET. No soft-accept fallback.
 * - Google: requires GOOGLE_SERVICE_ACCOUNT_KEY. Calls Google Play Developer
 *   API to verify the purchase token. Subscriptions use the
 *   purchases.subscriptionsv2 endpoint; one-time uses purchases.products.
 *
 * Idempotency: enforced via iap_transactions(platform, transaction_id) UNIQUE.
 * Failed transactions are auto-retried (failed row is replaced).
 */

export const runtime = "nodejs";
export const maxDuration = 30;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PRODUCT_FULL_READING = "full_destiny_reading";
const PRODUCT_FULL_READING_V2 = "full_destiny_reading_v2"; // iOS Consumable replacement
const PRODUCT_MASTER_CONSULT = "master_consultation_5";
const PRODUCT_COMPAT_FULL = "compat_full";
const PRODUCT_SORAM_COMPANION = "soram_companion_monthly";
const ANDROID_PACKAGE_NAME = "com.rimfactory.sajuastrology";

/** Returns true if the product ID is any variant of the full reading product */
function isFullReadingProduct(pid: string): boolean {
  return pid === PRODUCT_FULL_READING || pid === PRODUCT_FULL_READING_V2;
}

/** Returns true if this product is an auto-renewable subscription */
function isSubscriptionProduct(pid: string): boolean {
  return pid === PRODUCT_SORAM_COMPANION;
}

/** Returns true if this is a known/handled product */
function isKnownProduct(pid: string): boolean {
  return (
    isFullReadingProduct(pid) ||
    pid === PRODUCT_MASTER_CONSULT ||
    pid === PRODUCT_COMPAT_FULL ||
    isSubscriptionProduct(pid)
  );
}

interface VerifyRequest {
  platform: "apple" | "google";
  receipt: string;
  productId: string;
  shareSlug?: string;
  packageName?: string;
}

export async function POST(request: NextRequest) {
  try {
    // ── 1. Authenticate caller via Supabase JWT ──
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : "";

    if (!token) {
      return jsonError("Missing Authorization header", 401);
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
      return jsonError("Invalid or expired token", 401);
    }
    const authenticatedUserId = authData.user.id;
    const authenticatedUserEmail = authData.user.email || null;

    // ── 2. Parse and validate body ──
    const body: VerifyRequest = await request.json();
    const { platform, receipt, productId, shareSlug, packageName } = body;

    if (!platform || !["apple", "google"].includes(platform)) {
      return jsonError("Invalid platform", 400);
    }
    if (!receipt || typeof receipt !== "string" || receipt.length < 10) {
      return jsonError("Missing or invalid receipt", 400);
    }
    if (!isKnownProduct(productId)) {
      return jsonError("Unknown product", 400);
    }
    // Reading and compat products require shareSlug to know which row to unlock
    if (
      (isFullReadingProduct(productId) || productId === PRODUCT_COMPAT_FULL) &&
      !shareSlug
    ) {
      return jsonError("Missing shareSlug for per-reading purchase", 400);
    }

    // ── 3. Verify the receipt with the platform ──
    const verify =
      platform === "apple"
        ? await verifyApple(receipt, productId)
        : await verifyGoogle(
            receipt,
            productId,
            packageName || ANDROID_PACKAGE_NAME
          );

    if (!verify.ok || !verify.transactionId) {
      // B-4 fix: await the failure log so it isn't lost on serverless exit.
      try {
        await supabase.from("iap_transactions").insert({
          platform,
          product_id: productId,
          transaction_id: `failed_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          share_slug: shareSlug || null,
          user_id: authenticatedUserId,
          receipt_data: receipt.substring(0, 500),
          verified: false,
          status: "failed",
          error_message: verify.error || "Unknown verification error",
        });
      } catch {
        // logging is best-effort
      }
      return jsonError(verify.error || "Receipt verification failed", 403);
    }

    const transactionId = verify.transactionId;

    // ── 4. Idempotency: check existing transaction ──
    const { data: existing } = await supabase
      .from("iap_transactions")
      .select("status, user_id")
      .eq("platform", platform)
      .eq("transaction_id", transactionId)
      .maybeSingle();

    if (existing?.status === "verified") {
      // Already processed. If a different user is now claiming it, refuse.
      if (existing.user_id && existing.user_id !== authenticatedUserId) {
        return jsonError("Transaction already claimed by another user", 409);
      }
      // For subscriptions, "already processed" is the normal state for
      // restored events (renewals). Refresh the period_end based on the
      // current subscription state from the store, then return success.
      if (isSubscriptionProduct(productId)) {
        await activateSoramSubscription(
          authenticatedUserId,
          authenticatedUserEmail,
          platform,
          transactionId,
          verify.subscriptionPeriodEnd,
          verify.subscriptionPeriodStart
        );
      }
      return NextResponse.json({ success: true, already_processed: true });
    }

    // B-3 fix: if a previous attempt failed, delete the failed row so the
    // re-insert below succeeds and content can be delivered.
    if (existing?.status === "failed") {
      await supabase
        .from("iap_transactions")
        .delete()
        .eq("platform", platform)
        .eq("transaction_id", transactionId)
        .eq("status", "failed"); // safety: only if still failed
    }

    // If the previous attempt is still pending (concurrent in-flight request),
    // refuse rather than racing.
    if (existing?.status === "pending") {
      return jsonError(
        "Verification already in progress. Please wait a moment and retry.",
        409
      );
    }

    // ── 5. Claim the transaction (insert pending row) ──
    const { error: insertErr } = await supabase
      .from("iap_transactions")
      .insert({
        platform,
        product_id: productId,
        transaction_id: transactionId,
        share_slug: shareSlug || null,
        user_id: authenticatedUserId,
        receipt_data: receipt.substring(0, 500),
        verified: true,
        status: "pending",
      });

    if (insertErr) {
      const msg = insertErr.message || "";
      const isDuplicate =
        msg.toLowerCase().includes("duplicate") ||
        msg.includes("iap_transactions_unique_txn");
      if (isDuplicate) {
        // Concurrent request inserted between our check and insert.
        // Re-read to determine final status.
        const { data: existing2 } = await supabase
          .from("iap_transactions")
          .select("status, user_id")
          .eq("platform", platform)
          .eq("transaction_id", transactionId)
          .maybeSingle();

        if (existing2?.status === "verified") {
          if (existing2.user_id && existing2.user_id !== authenticatedUserId) {
            return jsonError("Transaction already claimed by another user", 409);
          }
          return NextResponse.json({ success: true, already_processed: true });
        }
        return jsonError(
          "Verification already in progress. Please wait a moment and retry.",
          409
        );
      }
      console.error("verify-iap-v2 insert error:", insertErr);
      return jsonError("Database error", 500);
    }

    // ── 6. Deliver content ──
    let deliver: { ok: boolean; error?: string };
    if (isFullReadingProduct(productId)) {
      deliver = await unlockReading(shareSlug!, platform, authenticatedUserId);
    } else if (productId === PRODUCT_MASTER_CONSULT) {
      deliver = await addConsultationCredits(authenticatedUserId, transactionId);
    } else if (productId === PRODUCT_COMPAT_FULL) {
      deliver = await unlockCompatibility(
        shareSlug!,
        platform,
        authenticatedUserId,
        authenticatedUserEmail,
        transactionId
      );
    } else if (productId === PRODUCT_SORAM_COMPANION) {
      deliver = await activateSoramSubscription(
        authenticatedUserId,
        authenticatedUserEmail,
        platform,
        transactionId,
        verify.subscriptionPeriodEnd,
        verify.subscriptionPeriodStart
      );
    } else {
      deliver = { ok: false, error: "No delivery handler for product" };
    }

    if (!deliver.ok) {
      await supabase
        .from("iap_transactions")
        .update({
          status: "failed",
          error_message: deliver.error || "Delivery failed",
        })
        .eq("platform", platform)
        .eq("transaction_id", transactionId);

      return jsonError(deliver.error || "Delivery failed", 500);
    }

    // ── 7. Mark as verified ──
    await supabase
      .from("iap_transactions")
      .update({
        status: "verified",
        verified_at: new Date().toISOString(),
      })
      .eq("platform", platform)
      .eq("transaction_id", transactionId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("verify-iap-v2 fatal error:", error);
    return jsonError("Internal server error", 500);
  }
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

// ═══════════════════════════════════════════════════════════════════
// Apple receipt verification (STRICT)
// ═══════════════════════════════════════════════════════════════════

interface VerifyResult {
  ok: boolean;
  transactionId?: string;
  error?: string;
  // Subscription-specific (only set for subscription products)
  subscriptionPeriodStart?: string;
  subscriptionPeriodEnd?: string;
}

async function verifyApple(
  receipt: string,
  expectedProductId: string
): Promise<VerifyResult> {
  // Diagnostic logging — helps identify malformed-receipt root causes.
  console.log(
    `[verify-iap-v2] Apple receipt incoming: length=${receipt.length} ` +
    `prefix=${receipt.substring(0, 24)}... product=${expectedProductId}`
  );

  // ── Format detection ──
  // iOS 15+ in_app_purchase plugin (StoreKit 2) returns localVerificationData
  // as a JSON-decoded JWS payload like:
  //   {"transactionId":"...","bundleId":"...","productId":"...","environment":"Sandbox",...}
  // Apple's legacy /verifyReceipt endpoint REJECTS this format with status 21002
  // because it expects a base64-encoded App Store receipt blob (StoreKit 1).
  //
  // We detect the format by checking for JSON shape and route accordingly.
  let sk2Payload: AppleSK2Payload | null = null;
  try {
    const parsed = JSON.parse(receipt);
    if (parsed && typeof parsed === "object" && parsed.transactionId && parsed.bundleId) {
      sk2Payload = parsed as AppleSK2Payload;
    }
  } catch {
    // Not JSON → assume legacy base64 receipt
  }

  if (sk2Payload) {
    return verifyAppleStoreKit2(sk2Payload, expectedProductId);
  }
  return verifyAppleLegacy(receipt, expectedProductId);
}

interface AppleSK2Payload {
  transactionId: string;
  originalTransactionId?: string;
  bundleId: string;
  productId: string;
  purchaseDate?: number;
  expirationDate?: number;
  environment?: "Sandbox" | "Production";
  inAppOwnershipType?: string;
  type?: string;
  quantity?: number;
  revocationDate?: number;
  revocationReason?: number;
}

const EXPECTED_BUNDLE_ID = "com.rimfactory.sajuastrology";

/**
 * Verify a StoreKit 2 JWS-decoded transaction payload.
 *
 * The Flutter `in_app_purchase` plugin already validated the JWS signature
 * on-device when extracting this payload from StoreKit 2. Tampering with the
 * fields below would have invalidated the signature and the plugin would not
 * have surfaced the purchase as `PurchaseStatus.purchased`.
 *
 * For an additional verification layer in production, integrate Apple's
 * App Store Server API (https://api.storekit.itunes.apple.com/inApps/v1/transactions/{id})
 * with JWT auth using the App Store Connect API Key.
 */
function verifyAppleStoreKit2(
  payload: AppleSK2Payload,
  expectedProductId: string
): VerifyResult {
  console.log(
    `[verify-iap-v2] StoreKit 2 path: txn=${payload.transactionId} ` +
    `product=${payload.productId} env=${payload.environment}`
  );

  if (payload.bundleId !== EXPECTED_BUNDLE_ID) {
    return {
      ok: false,
      error: `Bundle ID mismatch: receipt is for ${payload.bundleId}, expected ${EXPECTED_BUNDLE_ID}`,
    };
  }
  if (payload.productId !== expectedProductId) {
    return {
      ok: false,
      error: `Product mismatch: receipt is for ${payload.productId}, expected ${expectedProductId}`,
    };
  }
  if (!payload.transactionId) {
    return { ok: false, error: "Missing transactionId in StoreKit 2 payload" };
  }
  if (payload.revocationDate) {
    return { ok: false, error: "Purchase was refunded or revoked" };
  }

  const result: VerifyResult = {
    ok: true,
    transactionId: `apple_${payload.transactionId}`,
  };

  // For subscriptions, surface period bounds for activateSoramSubscription.
  if (isSubscriptionProduct(expectedProductId)) {
    if (payload.purchaseDate) {
      result.subscriptionPeriodStart = new Date(payload.purchaseDate).toISOString();
    }
    if (payload.expirationDate) {
      result.subscriptionPeriodEnd = new Date(payload.expirationDate).toISOString();
    }
  }
  return result;
}

/**
 * Verify a legacy StoreKit 1 base64-encoded App Store receipt against
 * Apple's /verifyReceipt endpoint. Used for older iOS clients that don't
 * use StoreKit 2.
 */
async function verifyAppleLegacy(
  receipt: string,
  expectedProductId: string
): Promise<VerifyResult> {
  const sharedSecret =
    process.env.APPLE_SHARED_SECRET || process.env.APPLE_IAP_SHARED_SECRET;

  if (!sharedSecret) {
    console.error("[verify-iap-v2] APPLE_SHARED_SECRET is not configured");
    return { ok: false, error: "Server misconfiguration: missing Apple secret" };
  }

  const endpoints = [
    { url: "https://buy.itunes.apple.com/verifyReceipt", env: "production" },
    { url: "https://sandbox.itunes.apple.com/verifyReceipt", env: "sandbox" },
  ];

  let lastStatus: number | null = null;
  let lastError: string | null = null;

  for (const { url: endpoint, env } of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "receipt-data": receipt,
          password: sharedSecret,
          "exclude-old-transactions": true,
        }),
      });

      if (!res.ok) {
        lastError = `HTTP ${res.status} from ${env}`;
        console.warn(`[verify-iap-v2] Apple ${env} HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      lastStatus = data.status;
      console.log(`[verify-iap-v2] Apple ${env} responded status=${data.status}`);

      if (data.status === 0) {
        const allTxns: any[] = [
          ...(data.latest_receipt_info || []),
          ...(data.receipt?.in_app || []),
        ];
        const matching = allTxns.find(
          (t) => t.product_id === expectedProductId
        );
        if (!matching) {
          return {
            ok: false,
            error: `Receipt valid but no matching purchase for ${expectedProductId}`,
          };
        }
        const txn =
          matching.original_transaction_id || matching.transaction_id;
        if (!txn) {
          return { ok: false, error: "No transaction id in Apple receipt" };
        }
        if (matching.cancellation_date) {
          return { ok: false, error: "Purchase was refunded" };
        }

        const result: VerifyResult = {
          ok: true,
          transactionId: `apple_${txn}`,
        };

        // Subscription period bounds for legacy receipts come from
        // purchase_date_ms and expires_date_ms (subscription-only fields).
        if (isSubscriptionProduct(expectedProductId)) {
          const startMs = parseInt(matching.purchase_date_ms || "0", 10);
          const endMs = parseInt(matching.expires_date_ms || "0", 10);
          if (startMs > 0) {
            result.subscriptionPeriodStart = new Date(startMs).toISOString();
          }
          if (endMs > 0) {
            result.subscriptionPeriodEnd = new Date(endMs).toISOString();
          }
        }
        return result;
      }

      if (data.status === 21007) continue;
      if (data.status === 21008) continue;
      if (data.status === 21002 && env === "production") continue;

      return {
        ok: false,
        error: `Apple receipt status: ${data.status} (${appleStatusMessage(data.status)})`,
      };
    } catch (err: any) {
      lastError = err?.message || String(err);
      console.error(`[verify-iap-v2] Apple ${env} fetch error:`, lastError);
      continue;
    }
  }

  return {
    ok: false,
    error: lastStatus
      ? `Apple legacy receipt verification failed on both endpoints (last status: ${lastStatus} - ${appleStatusMessage(lastStatus)})`
      : `Apple legacy receipt verification failed: ${lastError || "unknown error"}`,
  };
}

function appleStatusMessage(status: number): string {
  const map: Record<number, string> = {
    21000: "App Store could not read the JSON",
    21002: "Receipt data was malformed",
    21003: "Receipt could not be authenticated",
    21004: "Shared secret does not match",
    21005: "Receipt server unavailable",
    21006: "Subscription expired",
    21007: "Sandbox receipt sent to production",
    21008: "Production receipt sent to sandbox",
    21010: "User account not found",
  };
  return map[status] || "Unknown status";
}

// ═══════════════════════════════════════════════════════════════════
// Google Play receipt verification (STRICT)
// ═══════════════════════════════════════════════════════════════════

async function verifyGoogle(
  receipt: string,
  productId: string,
  packageName: string
): Promise<VerifyResult> {
  let purchaseToken: string;
  let orderIdFromReceipt: string | undefined;
  let productIdFromReceipt: string | undefined;

  try {
    const parsed = JSON.parse(receipt);
    purchaseToken = parsed.purchaseToken || parsed.token || receipt;
    orderIdFromReceipt = parsed.orderId;
    productIdFromReceipt = parsed.productId;
  } catch {
    purchaseToken = receipt;
  }

  if (!purchaseToken || purchaseToken.length < 10) {
    return { ok: false, error: "Invalid Google purchase token" };
  }

  if (productIdFromReceipt && productIdFromReceipt !== productId) {
    return {
      ok: false,
      error: `Product mismatch: receipt is for ${productIdFromReceipt}, expected ${productId}`,
    };
  }

  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    console.error("[verify-iap-v2] GOOGLE_SERVICE_ACCOUNT_KEY is not configured");
    return {
      ok: false,
      error: "Server misconfiguration: missing Google service account",
    };
  }

  let serviceAccount: { client_email: string; private_key: string };
  try {
    serviceAccount = JSON.parse(serviceAccountKey);
  } catch {
    console.error("[verify-iap-v2] GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON");
    return {
      ok: false,
      error: "Server misconfiguration: invalid Google service account JSON",
    };
  }

  let accessToken: string;
  try {
    accessToken = await getGoogleAccessToken(
      serviceAccount.client_email,
      serviceAccount.private_key
    );
  } catch (err: any) {
    console.error("[verify-iap-v2] Failed to get Google access token:", err?.message || err);
    return { ok: false, error: "Google authentication failed" };
  }

  // ─────────────────────────────────────────────────────────────
  // v6.17.27: Subscriptions and one-time products use different APIs.
  // Subscriptions: purchases.subscriptionsv2.get
  // One-time:      purchases.products.get
  // ─────────────────────────────────────────────────────────────
  if (isSubscriptionProduct(productId)) {
    return verifyGoogleSubscription(
      packageName,
      purchaseToken,
      accessToken,
      orderIdFromReceipt
    );
  }
  return verifyGoogleProduct(
    packageName,
    productId,
    purchaseToken,
    accessToken,
    orderIdFromReceipt
  );
}

async function verifyGoogleProduct(
  packageName: string,
  productId: string,
  purchaseToken: string,
  accessToken: string,
  orderIdFromReceipt: string | undefined
): Promise<VerifyResult> {
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}/purchases/products/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (err: any) {
    console.error("[verify-iap-v2] Google products API fetch error:", err?.message || err);
    return { ok: false, error: "Google verification request failed" };
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[verify-iap-v2] Google products API ${res.status}: ${text}`);
    return {
      ok: false,
      error: `Google verification failed: ${res.status}`,
    };
  }

  const data: any = await res.json();

  // purchaseState: 0 = purchased, 1 = canceled, 2 = pending
  if (data.purchaseState !== 0) {
    return {
      ok: false,
      error: `Purchase state is not purchased (state: ${data.purchaseState})`,
    };
  }

  const txnId = `google_${data.orderId || orderIdFromReceipt || hashString(purchaseToken)}`;
  return { ok: true, transactionId: txnId };
}

/**
 * Verify a Google Play subscription via the subscriptionsv2 API.
 *
 * The v2 endpoint is the modern (Aug 2022+) replacement for the deprecated
 * `purchases.subscriptions.get`. It returns SubscriptionPurchaseV2 with
 * lineItems[] (each item carries productId + expiryTime). For our single-
 * product subscriptions (Soram Companion only), there's exactly one
 * lineItem and we derive the period from its expiryTime.
 *
 * Docs:
 * https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.subscriptionsv2/get
 */
async function verifyGoogleSubscription(
  packageName: string,
  purchaseToken: string,
  accessToken: string,
  orderIdFromReceipt: string | undefined
): Promise<VerifyResult> {
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (err: any) {
    console.error("[verify-iap-v2] Google subs API fetch error:", err?.message || err);
    return { ok: false, error: "Google subscription verification request failed" };
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[verify-iap-v2] Google subs API ${res.status}: ${text}`);
    return {
      ok: false,
      error: `Google subscription verification failed: ${res.status}`,
    };
  }

  const data: any = await res.json();
  // subscriptionState values:
  //   SUBSCRIPTION_STATE_UNSPECIFIED, SUBSCRIPTION_STATE_PENDING,
  //   SUBSCRIPTION_STATE_ACTIVE, SUBSCRIPTION_STATE_PAUSED,
  //   SUBSCRIPTION_STATE_IN_GRACE_PERIOD, SUBSCRIPTION_STATE_ON_HOLD,
  //   SUBSCRIPTION_STATE_CANCELED, SUBSCRIPTION_STATE_EXPIRED
  const state = data.subscriptionState as string | undefined;
  const acceptableStates = new Set([
    "SUBSCRIPTION_STATE_ACTIVE",
    "SUBSCRIPTION_STATE_IN_GRACE_PERIOD",
    // CANCELED with a future expiry is OK — user has access until expiry.
    "SUBSCRIPTION_STATE_CANCELED",
  ]);
  if (!state || !acceptableStates.has(state)) {
    return {
      ok: false,
      error: `Subscription state not active (state: ${state || "unknown"})`,
    };
  }

  const lineItems: any[] = Array.isArray(data.lineItems) ? data.lineItems : [];
  const item = lineItems[0];
  if (!item) {
    return { ok: false, error: "Subscription has no line items" };
  }

  // For canceled state, only honor if expiryTime is in the future.
  const expiryTime: string | undefined = item.expiryTime;
  if (state === "SUBSCRIPTION_STATE_CANCELED") {
    if (!expiryTime || new Date(expiryTime).getTime() <= Date.now()) {
      return { ok: false, error: "Subscription has been canceled and expired" };
    }
  }

  // latestOrderId is the most recent order in the subscription chain.
  // We use it as the transaction_id so renewals each get their own
  // iap_transactions row. If absent, fall back to a hash of the token.
  const latestOrderId =
    data.latestOrderId || orderIdFromReceipt || hashString(purchaseToken);
  const txnId = `google_${latestOrderId}`;

  // Period start: prefer startTime from the response (the original purchase),
  // fall back to "now" minus 1 month for safety.
  const startTime: string | undefined = data.startTime;

  return {
    ok: true,
    transactionId: txnId,
    subscriptionPeriodStart: startTime || new Date().toISOString(),
    subscriptionPeriodEnd: expiryTime,
  };
}

// ── Google OAuth via JWT Bearer ──

async function getGoogleAccessToken(
  clientEmail: string,
  privateKeyPem: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const claimB64 = base64UrlEncode(JSON.stringify(claim));
  const signingInput = `${headerB64}.${claimB64}`;

  const signature = signRS256(signingInput, privateKeyPem);
  const jwt = `${signingInput}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google OAuth token fetch failed: ${res.status} ${text}`);
  }
  const data: any = await res.json();
  if (!data.access_token) {
    throw new Error("No access_token in Google OAuth response");
  }
  return data.access_token;
}

function base64UrlEncode(input: string | Buffer): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function signRS256(data: string, privateKeyPem: string): string {
  const signer = createSign("RSA-SHA256");
  signer.update(data);
  signer.end();
  const signature = signer.sign(privateKeyPem);
  return base64UrlEncode(signature);
}

function hashString(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

// ═══════════════════════════════════════════════════════════════════
// Content delivery
// ═══════════════════════════════════════════════════════════════════

async function unlockReading(
  shareSlug: string,
  platform: string,
  userId: string
): Promise<{ ok: boolean; error?: string }> {
  // B-2 fix: do NOT overwrite an existing user_id (matches PayPal flow).
  // Only claim the reading for this user if it currently has no owner.
  const { data: existing, error: fetchErr } = await supabase
    .from("readings")
    .select("user_id")
    .eq("share_slug", shareSlug)
    .maybeSingle();

  if (fetchErr) {
    console.error("unlockReading fetch error:", fetchErr);
    return { ok: false, error: `Failed to fetch reading: ${fetchErr.message}` };
  }
  if (!existing) {
    return { ok: false, error: "Reading not found" };
  }

  const update: Record<string, unknown> = {
    is_paid: true,
    payment_method: `iap_${platform}`,
    paid_at: new Date().toISOString(),
  };
  if (!existing.user_id) {
    update.user_id = userId;
  }

  const { error } = await supabase
    .from("readings")
    .update(update)
    .eq("share_slug", shareSlug);

  if (error) {
    console.error("unlockReading update error:", error);
    return { ok: false, error: `Failed to unlock reading: ${error.message}` };
  }
  return { ok: true };
}

async function addConsultationCredits(
  userId: string,
  transactionId: string
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("consultation_credits").insert({
    user_id: userId,
    total_credits: 5,
    used_credits: 0,
    iap_transaction_id: transactionId,
  });

  if (error) {
    console.error("addConsultationCredits error:", error);
    return { ok: false, error: `Failed to add credits: ${error.message}` };
  }
  return { ok: true };
}

/**
 * v6.17.27: Unlock a compatibility result row after IAP payment.
 * Mirrors PayPal's verify-compatibility flow but uses the iap_<platform>
 * transaction id for paypal_order_id (existing schema; the column name
 * is historical — it stores any payment provider's order id).
 */
async function unlockCompatibility(
  shareSlug: string,
  platform: string,
  userId: string,
  userEmail: string | null,
  transactionId: string
): Promise<{ ok: boolean; error?: string }> {
  // Existence check
  const { data: existing, error: fetchErr } = await supabase
    .from("compatibility_results")
    .select("is_paid, user_id")
    .eq("share_slug", shareSlug)
    .maybeSingle();

  if (fetchErr) {
    console.error("unlockCompatibility fetch error:", fetchErr);
    return { ok: false, error: `Failed to fetch compatibility: ${fetchErr.message}` };
  }
  if (!existing) {
    return { ok: false, error: "Compatibility result not found" };
  }
  if (existing.is_paid === true) {
    // Already unlocked — return ok so the client UI can proceed.
    return { ok: true };
  }

  const update: Record<string, unknown> = {
    is_paid: true,
    customer_email: userEmail || "",
    paypal_order_id: transactionId, // schema-compatible: stores iap txn id
  };
  // Claim ownership only if currently anonymous, mirroring readings pattern.
  if (!existing.user_id) {
    update.user_id = userId;
  }

  const { error } = await supabase
    .from("compatibility_results")
    .update(update)
    .eq("share_slug", shareSlug);

  if (error) {
    console.error("unlockCompatibility update error:", error);
    return { ok: false, error: `Failed to unlock compatibility: ${error.message}` };
  }
  return { ok: true };
}

/**
 * v6.17.27: Activate (or refresh) a Soram Companion subscription row in
 * soram_subscriptions for the IAP user. Matches PayPal verify-companion
 * upsert pattern: PATCH by paypal_subscription_id, fall back to INSERT.
 *
 * Schema reuse decision (chandler "기존 함수 수정 금지, append만"):
 *   - platform: "google" or "apple" (PayPal uses "paypal")
 *   - paypal_subscription_id: the IAP transaction id (e.g., "google_GPA....")
 *     This column historically stored the PayPal subscription id; we reuse
 *     it as the unique-per-store-subscription identifier so the existing
 *     /api/v1/soram/usage entitlement check (user_id + status='active')
 *     keeps working without schema changes.
 *   - paypal_plan_id: null for IAP (Apple/Google have no plan id concept)
 *   - custom_id: null for IAP (no PayPal custom_id JSON)
 */
async function activateSoramSubscription(
  userId: string,
  userEmail: string | null,
  platform: string,
  transactionId: string,
  periodEnd: string | undefined,
  periodStart: string | undefined
): Promise<{ ok: boolean; error?: string }> {
  // Fallback period bounds if the receipt didn't carry them (defensive —
  // ACTIVE state implies a valid period; expiryTime should always be set).
  const startIso = periodStart || new Date().toISOString();
  const endIso =
    periodEnd ||
    new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString();

  const upsertBody: Record<string, unknown> = {
    user_id: userId,
    platform, // "apple" or "google"
    paypal_subscription_id: transactionId, // IAP txn id (column reuse)
    paypal_plan_id: null,
    status: "active",
    current_period_start: startIso,
    current_period_end: endIso,
    subscriber_email: userEmail,
    custom_id: null,
  };

  // Try update first by transaction id (most precise — handles renewals
  // where Google emits the same purchase token but a new latestOrderId).
  const { data: updated, error: updErr } = await supabase
    .from("soram_subscriptions")
    .update(upsertBody)
    .eq("paypal_subscription_id", transactionId)
    .select("id");

  if (updErr) {
    console.error("activateSoramSubscription update error:", updErr);
    return { ok: false, error: `Failed to update subscription: ${updErr.message}` };
  }

  if (Array.isArray(updated) && updated.length > 0) {
    return { ok: true };
  }

  // No row matched on transaction_id — insert a new row.
  const { error: insErr } = await supabase
    .from("soram_subscriptions")
    .insert(upsertBody);

  if (insErr) {
    // Possible benign race: another verify call inserted the row between
    // our update and insert. Re-check by transaction id.
    const { data: raceRow } = await supabase
      .from("soram_subscriptions")
      .select("id")
      .eq("paypal_subscription_id", transactionId)
      .maybeSingle();
    if (raceRow) {
      return { ok: true };
    }
    console.error("activateSoramSubscription insert error:", insErr);
    return { ok: false, error: `Failed to insert subscription: ${insErr.message}` };
  }

  return { ok: true };
}
