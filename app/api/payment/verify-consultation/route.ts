import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "";
    const dbHeaders = {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    };

    // Check if credits already exist
    const checkCredits = async (): Promise<boolean> => {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/consultation_credits?user_id=eq.${userId}&select=id,total_credits,used_credits&order=purchased_at.desc&limit=1`,
        { headers: dbHeaders }
      );
      if (res.ok) {
        const credits = await res.json();
        if (credits && credits.length > 0) {
          return true;
        }
      }
      return false;
    };

    // Already has credits
    if (await checkCredits()) {
      return NextResponse.json({ success: true });
    }

    // PayPal flow: capture the order
    if (sessionId && sessionId !== "lemon") {
      // Idempotency check — don't add credits twice for same PayPal order
      const existCheck = await fetch(
        `${supabaseUrl}/rest/v1/consultation_credits?paypal_order_id=eq.${sessionId}&select=id`,
        { headers: dbHeaders }
      );
      if (existCheck.ok) {
        const existing = await existCheck.json();
        if (existing && existing.length > 0) {
          return NextResponse.json({ success: true, already_processed: true });
        }
      }

      const result = await capturePayPalOrder(sessionId);

      if (result.success) {
        // Add 5 consultation credits
        await fetch(`${supabaseUrl}/rest/v1/consultation_credits`, {
          method: "POST",
          headers: { ...dbHeaders, Prefer: "return=minimal" },
          body: JSON.stringify({
            user_id: userId,
            total_credits: 5,
            used_credits: 0,
            paypal_order_id: sessionId,
          }),
        });

        return NextResponse.json({ success: true, credits_added: 5 });
      }

      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    // Legacy LemonSqueezy flow
    if (sessionId === "lemon") {
      await new Promise((r) => setTimeout(r, 3000));
      if (await checkCredits()) {
        return NextResponse.json({ success: true });
      }
      await new Promise((r) => setTimeout(r, 3000));
      if (await checkCredits()) {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ success: true, pending: true });
    }

    return NextResponse.json({ error: "Payment not confirmed" }, { status: 400 });
  } catch (err: any) {
    console.error("Verify consultation error:", err?.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
