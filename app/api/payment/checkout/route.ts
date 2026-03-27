import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const LEMON_API_KEY = process.env.LEMONSQUEEZY_API_KEY || "";
const VARIANT_ID = process.env.LEMONSQUEEZY_VARIANT_READING || "1453441";

export async function POST(request: NextRequest) {
  try {
    const { shareSlug, readingName, userEmail } = await request.json();

    if (!shareSlug) {
      return NextResponse.json({ error: "Missing shareSlug" }, { status: 400 });
    }
    if (!LEMON_API_KEY) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
    }

    // Get store ID
    const storesRes = await fetch("https://api.lemonsqueezy.com/v1/stores", {
      headers: { Authorization: `Bearer ${LEMON_API_KEY}`, Accept: "application/vnd.api+json" },
    });
    if (!storesRes.ok) {
      return NextResponse.json({ error: "Failed to connect to payment provider" }, { status: 500 });
    }
    const storesData = await storesRes.json();
    const storeId = storesData.data?.[0]?.id;
    if (!storeId) {
      return NextResponse.json({ error: "Store not found" }, { status: 500 });
    }

    // Create checkout
    const checkoutRes = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LEMON_API_KEY}`,
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: userEmail || undefined,
              custom: {
                share_slug: shareSlug,
                payment_type: "reading",
              },
            },
            checkout_options: {
              button_color: "#F2CA50",
            },
            product_options: {
              redirect_url: `https://sajuastrology.com/reading/${shareSlug}?payment=success&session_id=lemon`,
              receipt_button_text: "View My Reading",
              receipt_link_url: `https://sajuastrology.com/reading/${shareSlug}`,
            },
          },
          relationships: {
            store: { data: { type: "stores", id: storeId } },
            variant: { data: { type: "variants", id: VARIANT_ID } },
          },
        },
      }),
    });

    if (!checkoutRes.ok) {
      const errText = await checkoutRes.text();
      console.error("LemonSqueezy checkout error:", checkoutRes.status, errText);
      return NextResponse.json({ error: "Payment setup failed" }, { status: 500 });
    }

    const checkoutData = await checkoutRes.json();
    const checkoutUrl = checkoutData.data?.attributes?.url;

    if (!checkoutUrl) {
      return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (err: any) {
    console.error("Checkout error:", err?.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
