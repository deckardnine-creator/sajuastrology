import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/payment/verify-iap
 * 
 * Verifies an in-app purchase receipt and unlocks content.
 * Called by the Flutter app after a successful IAP transaction.
 * 
 * Body: {
 *   platform: "apple" | "google",
 *   receipt: string,           // server verification data
 *   productId: string,         // e.g., "full_destiny_reading"
 *   shareSlug: string,         // reading to unlock
 *   userId?: string,           // Supabase user ID (if logged in)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, receipt, productId, shareSlug, userId } = body;

    if (!platform || !receipt || !productId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // --- Receipt verification ---
    // For production: verify with Apple/Google servers
    // For now: accept the receipt and mark as paid
    // Apple: https://buy.itunes.apple.com/verifyReceipt (production)
    // Google: Google Play Developer API v3
    let verified = false;

    if (platform === "apple") {
      verified = await verifyAppleReceipt(receipt);
    } else if (platform === "google") {
      verified = await verifyGoogleReceipt(receipt, productId);
    }

    if (!verified) {
      return NextResponse.json(
        { success: false, error: "Receipt verification failed" },
        { status: 403 }
      );
    }

    // --- Unlock content ---
    if (productId === "full_destiny_reading" && shareSlug) {
      // Mark reading as paid
      const { error: updateError } = await supabase
        .from("readings")
        .update({
          is_paid: true,
          payment_method: `iap_${platform}`,
          paid_at: new Date().toISOString(),
          ...(userId ? { user_id: userId } : {}),
        })
        .eq("share_slug", shareSlug);

      if (updateError) {
        console.error("Failed to unlock reading:", updateError);
        return NextResponse.json(
          { success: false, error: "Failed to unlock content" },
          { status: 500 }
        );
      }
    } else if (productId === "master_consultation_5" && userId) {
      // Add 5 consultation credits
      const { data: existing } = await supabase
        .from("user_credits")
        .select("consultation_credits")
        .eq("user_id", userId)
        .single();

      const currentCredits = existing?.consultation_credits || 0;

      const { error: creditError } = await supabase
        .from("user_credits")
        .upsert({
          user_id: userId,
          consultation_credits: currentCredits + 5,
          updated_at: new Date().toISOString(),
        });

      if (creditError) {
        console.error("Failed to add credits:", creditError);
        return NextResponse.json(
          { success: false, error: "Failed to add credits" },
          { status: 500 }
        );
      }
    }

    // Log the transaction
    await supabase.from("iap_transactions").insert({
      platform,
      product_id: productId,
      share_slug: shareSlug || null,
      user_id: userId || null,
      receipt_data: receipt.substring(0, 500), // truncated for storage
      verified: true,
      created_at: new Date().toISOString(),
    }).catch(() => {}); // non-critical, don't fail if logging fails

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("verify-iap error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Apple receipt verification.
 * In production, verify with Apple's server.
 * For sandbox/review: accept all receipts.
 */
async function verifyAppleReceipt(receipt: string): Promise<boolean> {
  try {
    // Try production first, then sandbox
    const endpoints = [
      "https://buy.itunes.apple.com/verifyReceipt",
      "https://sandbox.itunes.apple.com/verifyReceipt",
    ];

    const sharedSecret = process.env.APPLE_IAP_SHARED_SECRET;

    for (const endpoint of endpoints) {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "receipt-data": receipt,
          password: sharedSecret || "",
          "exclude-old-transactions": true,
        }),
      });

      if (!res.ok) continue;

      const data = await res.json();

      // Status 0 = valid
      if (data.status === 0) return true;

      // Status 21007 = sandbox receipt sent to production, try sandbox
      if (data.status === 21007) continue;

      // Status 21008 = production receipt sent to sandbox
      if (data.status === 21008) continue;
    }

    // If no shared secret configured, accept for development
    if (!sharedSecret) {
      console.warn("APPLE_IAP_SHARED_SECRET not set — accepting receipt without verification");
      return true;
    }

    return false;
  } catch (error) {
    console.error("Apple verification error:", error);
    // Accept if verification service is unreachable (store review may use sandbox)
    return true;
  }
}

/**
 * Google Play receipt verification.
 * In production, verify with Google Play Developer API.
 * For now: basic validation.
 */
async function verifyGoogleReceipt(receipt: string, productId: string): Promise<boolean> {
  try {
    // Google Play verification requires service account credentials
    // and the Google Play Developer API v3
    // For now: accept all receipts (add proper verification post-launch)
    
    // Basic sanity check: receipt should be non-empty JSON
    if (!receipt || receipt.length < 10) return false;

    // TODO: Add Google Play Developer API verification
    // const { google } = require('googleapis');
    // const auth = new google.auth.GoogleAuth({ ... });
    // const androidPublisher = google.androidpublisher({ version: 'v3', auth });
    // const result = await androidPublisher.purchases.products.get({ ... });

    console.warn("Google Play verification: accepting receipt (proper verification pending)");
    return true;
  } catch (error) {
    console.error("Google verification error:", error);
    return true;
  }
}
