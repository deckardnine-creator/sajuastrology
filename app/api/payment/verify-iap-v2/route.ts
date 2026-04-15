import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSign } from "crypto";

/**
 * POST /api/payment/verify-iap-v2
 *
 * STRICT MODE — Stage 1.4 hardened version (audit fixes B-2, B-3, B-4 applied).
 *
 * Auth:
 * - Requires Authorization: Bearer {supabase_access_token}
 * - Server resolves user.id from token. The body's userId is IGNORED.
 *
 * Receipt verification:
 * - Apple: requires APPLE_SHARED_SECRET. No soft-accept fallback.
 * - Google: requires GOOGLE_SERVICE_ACCOUNT_KEY. Calls Google Play Developer
 *   API to verify the purchase token.
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
const ANDROID_PACKAGE_NAME = "com.rimfactory.sajuastrology";

/** Returns true if the product ID is any variant of the full reading product */
function isFullReadingProduct(pid: string): boolean {
  return pid === PRODUCT_FULL_READING || pid === PRODUCT_FULL_READING_V2;
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

    // ── 2. Parse and validate body ──
    const body: VerifyRequest = await request.json();
    const { platform, receipt, productId, shareSlug, packageName } = body;

    if (!platform || !["apple", "google"].includes(platform)) {
      return jsonError("Invalid platform", 400);
    }
    if (!receipt || typeof receipt !== "string" || receipt.length < 10) {
      return jsonError("Missing or invalid receipt", 400);
    }
    if (!isFullReadingProduct(productId) && productId !== PRODUCT_MASTER_CONSULT) {
      return jsonError("Unknown product", 400);
    }
    if (isFullReadingProduct(productId) && !shareSlug) {
      return jsonError("Missing shareSlug for reading purchase", 400);
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
    const deliver =
      isFullReadingProduct(productId)
        ? await unlockReading(shareSlug!, platform, authenticatedUserId)
        : await addConsultationCredits(authenticatedUserId, transactionId);

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
}

async function verifyApple(
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
    "https://buy.itunes.apple.com/verifyReceipt",
    "https://sandbox.itunes.apple.com/verifyReceipt",
  ];

  let lastStatus: number | null = null;

  for (const endpoint of endpoints) {
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

      if (!res.ok) continue;
      const data = await res.json();
      lastStatus = data.status;

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
        return { ok: true, transactionId: `apple_${txn}` };
      }

      // 21007: sandbox receipt sent to production → try sandbox URL next
      if (data.status === 21007) continue;
      // 21008: production receipt sent to sandbox → loop ends, returns error
      if (data.status === 21008) continue;

      return {
        ok: false,
        error: `Apple receipt status: ${data.status} (${appleStatusMessage(data.status)})`,
      };
    } catch (err: any) {
      console.error("[verify-iap-v2] Apple verifyReceipt error:", err?.message || err);
      continue;
    }
  }

  return {
    ok: false,
    error: `Apple receipt verification failed (last status: ${lastStatus})`,
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

  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}/purchases/products/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (err: any) {
    console.error("[verify-iap-v2] Google API fetch error:", err?.message || err);
    return { ok: false, error: "Google verification request failed" };
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[verify-iap-v2] Google API ${res.status}: ${text}`);
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
