import { NextRequest, NextResponse } from "next/server";

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

    // Check if credits exist (webhook may have already added them)
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

    // First check
    if (await checkCredits()) {
      return NextResponse.json({ success: true });
    }

    // If LemonSqueezy payment, wait for webhook
    if (sessionId === "lemon") {
      await new Promise((r) => setTimeout(r, 3000));
      if (await checkCredits()) {
        return NextResponse.json({ success: true });
      }
      // Give it one more try
      await new Promise((r) => setTimeout(r, 3000));
      if (await checkCredits()) {
        return NextResponse.json({ success: true });
      }
      // Webhook may still be processing
      return NextResponse.json({ success: true, pending: true });
    }

    // Legacy Stripe flow
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
    if (stripeSecretKey && sessionId && sessionId !== "lemon") {
      const stripeRes = await fetch(
        `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
        { headers: { Authorization: `Bearer ${stripeSecretKey}` } }
      );
      if (stripeRes.ok) {
        const session = await stripeRes.json();
        if (session.payment_status === "paid") {
          // Check idempotency
          const existCheck = await fetch(
            `${supabaseUrl}/rest/v1/consultation_credits?stripe_session_id=eq.${sessionId}&select=id`,
            { headers: dbHeaders }
          );
          const existing = await existCheck.json();
          if (existing && existing.length > 0) {
            return NextResponse.json({ success: true, already_processed: true });
          }
          // Add credits
          await fetch(`${supabaseUrl}/rest/v1/consultation_credits`, {
            method: "POST",
            headers: { ...dbHeaders, Prefer: "return=minimal" },
            body: JSON.stringify({
              user_id: userId,
              total_credits: 5,
              used_credits: 0,
              stripe_session_id: sessionId,
            }),
          });
          return NextResponse.json({ success: true, credits_added: 5 });
        }
      }
    }

    return NextResponse.json({ error: "Payment not confirmed" }, { status: 400 });
  } catch (err: any) {
    console.error("Verify consultation error:", err?.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
