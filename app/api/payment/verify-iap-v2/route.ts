import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/payment/verify-iap-v2
 *
 * Verifies an in-app purchase receipt and unlocks content.
 * Replaces the old /api/payment/verify-iap which had schema mismatches.
 *
 * Body: {
 *   platform: "apple" | "google",
 *   receipt: string,           // serverVerificationData from Flutter
 *   productId: "full_destiny_reading" | "master_consultation_5",
 *   shareSlug?: string,        // required for full_destiny_reading
 *   userId?: string,           // required for master_consultation_5
 * }
 *
 * Response: { success: true } | { success: false, error: string }
 *
 * Notes:
 * - Idempotency: enforced via iap_transactions(platform, transaction_id) UNIQUE.
 * - Auth: this endpoint trusts userId in the body. Stage 1.4 will add JWT verification.
 * - Receipt verification: Stage 1.4 will harden Apple/Google verification.
 *   Current implementation soft-accepts when shared secrets are unset (TEMP).
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PRODUCT_FULL_READING = "full_destiny_reading";
const PRODUCT_MASTER_CONSULT = "master_consultation_5";

interface VerifyRequest {
  platform: "apple" | "google";
  receipt: string;
  productId: string;
  shareSlug?: string;
  userId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyRequest = await request.json();
    const { platform, receipt, productId, shareSlug, userId } = body;

    // ── Input validation ──
    if (!platform || !["apple", "google"].includes(platform)) {
      return jsonError("Invalid platform", 400);
    }
    if (!receipt || typeof receipt !== "string" || receipt.length < 10) {
      return jsonError("Missing or invalid receipt", 400);
    }
    if (productId !== PRODUCT_FULL_READING && productId !== PRODUCT_MASTER_CONSULT) {
      return jsonError("Unknown product", 400);
    }
    if (productId === PRODUCT_FULL_READING && !shareSlug) {
      return jsonError("Missing shareSlug for reading purchase", 400);
    }
    if (productId === PRODUCT_MASTER_CONSULT && !userId) {
      return jsonError("Missing userId for consultation purchase", 400);
    }

    // ── Verify the receipt with the platform ──
    const verify =
      platform === "apple"
        ? await verifyApple(receipt)
        : await verifyGoogle(receipt);

    if (!verify.ok || !verify.transactionId) {
      // Log failed attempt for diagnostics. Use a unique fake txn id so the
      // UNIQUE constraint doesn't reject the log row.
      await supabase
        .from("iap_transactions")
        .insert({
          platform,
          product_id: productId,
          transaction_id: `failed_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          share_slug: shareSlug || null,
          user_id: userId || null,
          receipt_data: receipt.substring(0, 500),
          verified: false,
          status: "failed",
          error_message: verify.error || "Unknown verification error",
        })
        .then(() => {})
        .then(undefined, () => {}); // swallow logging errors

      return jsonError(verify.error || "Receipt verification failed", 403);
    }

    const transactionId = verify.transactionId;

    // ── Idempotency: check existing transaction ──
    const { data: existing } = await supabase
      .from("iap_transactions")
      .select("status")
      .eq("platform", platform)
      .eq("transaction_id", transactionId)
      .maybeSingle();

    if (existing?.status === "verified") {
      return NextResponse.json({ success: true, already_processed: true });
    }

    // ── Claim the transaction (insert pending row) ──
    // UNIQUE (platform, transaction_id) prevents concurrent double-processing.
    const { error: insertErr } = await supabase
      .from("iap_transactions")
      .insert({
        platform,
        product_id: productId,
        transaction_id: transactionId,
        share_slug: shareSlug || null,
        user_id: userId || null,
        receipt_data: receipt.substring(0, 500),
        verified: true,
        status: "pending",
      });

    // If duplicate (concurrent request slipped past the check), treat as success.
    if (insertErr) {
      const msg = insertErr.message || "";
      const isDuplicate =
        msg.toLowerCase().includes("duplicate") ||
        msg.includes("iap_transactions_unique_txn");
      if (isDuplicate) {
        return NextResponse.json({ success: true, already_processed: true });
      }
      console.error("verify-iap-v2 insert error:", insertErr);
      return jsonError("Database error", 500);
    }

    // ── Deliver content ──
    const deliver =
      productId === PRODUCT_FULL_READING
        ? await unlockReading(shareSlug!, platform, userId)
        : await addConsultationCredits(userId!, transactionId);

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

    // ── Mark as verified ──
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
    console.error("verify-iap-v2 fatal error:", error?.message || error);
    return jsonError("Internal server error", 500);
  }
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

// ═══════════════════════════════════════════════════════════════════
// Receipt verification
// ═══════════════════════════════════════════════════════════════════

interface VerifyResult {
  ok: boolean;
  transactionId?: string;
  error?: string;
}

async function verifyApple(receipt: string): Promise<VerifyResult> {
  const sharedSecret =
    process.env.APPLE_SHARED_SECRET || process.env.APPLE_IAP_SHARED_SECRET;

  // TEMP: Soft-accept if no secret configured. Stage 1.4 will make this strict.
  if (!sharedSecret) {
    console.warn(
      "[verify-iap-v2] APPLE_SHARED_SECRET not set — soft-accepting receipt (TEMP, fix in Stage 1.4)"
    );
    return {
      ok: true,
      transactionId: `apple_unverified_${hashString(receipt)}`,
    };
  }

  const endpoints = [
    "https://buy.itunes.apple.com/verifyReceipt",
    "https://sandbox.itunes.apple.com/verifyReceipt",
  ];

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

      if (data.status === 0) {
        const txn =
          data.latest_receipt_info?.[0]?.original_transaction_id ||
          data.latest_receipt_info?.[0]?.transaction_id ||
          data.receipt?.in_app?.[0]?.original_transaction_id ||
          data.receipt?.in_app?.[0]?.transaction_id;

        if (!txn) {
          return { ok: false, error: "No transaction id in Apple receipt" };
        }
        return { ok: true, transactionId: `apple_${txn}` };
      }

      // 21007: sandbox receipt sent to production → try sandbox URL next
      if (data.status === 21007) continue;
      // 21008: production receipt sent to sandbox → try production URL next
      if (data.status === 21008) continue;

      return { ok: false, error: `Apple receipt status: ${data.status}` };
    } catch (err: any) {
      console.error("Apple verifyReceipt error:", err?.message || err);
      continue;
    }
  }

  return { ok: false, error: "Apple receipt verification failed (all endpoints)" };
}

async function verifyGoogle(receipt: string): Promise<VerifyResult> {
  // Flutter's serverVerificationData on Android contains the purchase JSON
  // (orderId, purchaseToken, etc.) or just the raw token depending on plugin version.
  let purchaseToken: string;
  let orderId: string | undefined;

  try {
    const parsed = JSON.parse(receipt);
    purchaseToken = parsed.purchaseToken || parsed.token || receipt;
    orderId = parsed.orderId;
  } catch {
    purchaseToken = receipt;
  }

  if (!purchaseToken || purchaseToken.length < 10) {
    return { ok: false, error: "Invalid Google purchase token" };
  }

  const txnId = `google_${orderId || hashString(purchaseToken)}`;

  // TEMP: Soft-accept. Stage 1.4 will add Google Play Developer API verification.
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    console.warn(
      "[verify-iap-v2] GOOGLE_SERVICE_ACCOUNT_KEY not set — soft-accepting (TEMP, fix in Stage 1.4)"
    );
    return { ok: true, transactionId: txnId };
  }

  console.warn(
    "[verify-iap-v2] Google Play Developer API verification not yet implemented — soft-accepting (TEMP, fix in Stage 1.4)"
  );
  return { ok: true, transactionId: txnId };
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
  userId: string | undefined
): Promise<{ ok: boolean; error?: string }> {
  const update: Record<string, unknown> = {
    is_paid: true,
    payment_method: `iap_${platform}`,
    paid_at: new Date().toISOString(),
  };
  if (userId) update.user_id = userId;

  const { error } = await supabase
    .from("readings")
    .update(update)
    .eq("share_slug", shareSlug);

  if (error) {
    console.error("unlockReading error:", error);
    return { ok: false, error: `Failed to unlock reading: ${error.message}` };
  }
  return { ok: true };
}

async function addConsultationCredits(
  userId: string,
  transactionId: string
): Promise<{ ok: boolean; error?: string }> {
  // Insert a new credit record (5 credits per IAP purchase).
  // Idempotency is guaranteed upstream by the iap_transactions UNIQUE constraint.
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
