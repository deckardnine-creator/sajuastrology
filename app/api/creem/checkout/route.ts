// app/api/creem/checkout/route.ts
// Creates a Creem checkout session for any of the 4 products.
// Frontend posts { productKey, customId, ... } and receives { checkout_url }.
// Frontend then redirects user to checkout_url.

import { NextRequest, NextResponse } from "next/server";
import {
  createCreemCheckout,
  CREEM_PRODUCT_IDS,
  type CreemProductKey,
} from "@/lib/payment/creem";

export const maxDuration = 30;

interface CheckoutRequestBody {
  productKey: CreemProductKey;
  customId: string;            // shareSlug for one-time, user_id for subscription
  customerEmail?: string;
  successPath?: string;        // path on sajuastrology.com (default chosen below)
  metadata?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CheckoutRequestBody;

    // Validate productKey
    if (!body.productKey || !(body.productKey in CREEM_PRODUCT_IDS)) {
      return NextResponse.json(
        {
          error: "Invalid productKey",
          allowedKeys: Object.keys(CREEM_PRODUCT_IDS),
        },
        { status: 400 }
      );
    }

    if (!body.customId || typeof body.customId !== "string") {
      return NextResponse.json(
        { error: "customId is required (shareSlug or user_id)" },
        { status: 400 }
      );
    }

    // Build success URL on sajuastrology.com.
    // Default success paths per product type:
    //   - subscription (Soram) → /soram?upgraded=1
    //   - one-time (compatibility/reading/master) → /dashboard?paid=1
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sajuastrology.com";
    const defaultSuccessPath =
      body.productKey === "soram_companion"
        ? "/soram?upgraded=1"
        : body.productKey === "compatibility_full"
          ? `/compatibility/result/${body.customId}?paid=1`
          : body.productKey === "full_destiny_reading"
            ? `/reading/${body.customId}?paid=1`
            : "/dashboard?paid=1"; // master_5_pack
    const successUrl = `${baseUrl}${body.successPath || defaultSuccessPath}`;

    const checkout = await createCreemCheckout({
      productKey: body.productKey,
      customId: body.customId,
      successUrl,
      customerEmail: body.customerEmail,
      metadata: body.metadata,
    });

    return NextResponse.json({
      success: true,
      checkout_url: checkout.checkout_url,
      checkout_id: checkout.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("Creem checkout error:", message);
    return NextResponse.json(
      { error: "Checkout creation failed", detail: message },
      { status: 500 }
    );
  }
}
