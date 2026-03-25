import { NextRequest, NextResponse } from "next/server";
import { buildPaidReadingPrompt } from "@/lib/reading-prompts";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, shareSlug } = await request.json();

    if (!sessionId || !shareSlug) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    // 1. Verify payment with Stripe
    const stripeRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
      {
        headers: { Authorization: `Bearer ${stripeSecretKey}` },
      }
    );

    if (!stripeRes.ok) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    const session = await stripeRes.json();

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    // Verify slug matches
    if (session.metadata?.share_slug !== shareSlug) {
      return NextResponse.json({ error: "Slug mismatch" }, { status: 400 });
    }

    // 2. Check if already processed
    const checkRes = await fetch(
      `${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}&select=is_paid,paid_reading_career`,
      {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
      }
    );
    const checkData = await checkRes.json();
    
    if (checkData?.[0]?.is_paid && checkData?.[0]?.paid_reading_career) {
      return NextResponse.json({ success: true, alreadyProcessed: true });
    }

    // 3. Fetch the reading data for AI prompt
    const readingRes = await fetch(
      `${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}&select=*`,
      {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
      }
    );
    const readings = await readingRes.json();
    const reading = readings?.[0];

    if (!reading) {
      return NextResponse.json({ error: "Reading not found" }, { status: 404 });
    }

    // 4. Reconstruct chart object for prompt
    const chart = {
      name: reading.name,
      gender: reading.gender,
      birthDate: new Date(reading.birth_date),
      birthCity: reading.birth_city,
      dayMaster: { element: reading.day_master_element, yinYang: reading.day_master_yinyang, zh: reading.day_stem, en: `${reading.day_master_yinyang === "yang" ? "Yang" : "Yin"} ${reading.day_master_element.charAt(0).toUpperCase() + reading.day_master_element.slice(1)}` },
      archetype: reading.archetype,
      tenGod: reading.ten_god,
      harmonyScore: reading.harmony_score,
      dominantElement: reading.dominant_element,
      weakestElement: reading.weakest_element,
      elements: { wood: reading.elements_wood, fire: reading.elements_fire, earth: reading.elements_earth, metal: reading.elements_metal, water: reading.elements_water },
      pillars: {
        year: { stem: { zh: reading.year_stem }, branch: { zh: reading.year_branch } },
        month: { stem: { zh: reading.month_stem }, branch: { zh: reading.month_branch } },
        day: { stem: { zh: reading.day_stem }, branch: { zh: reading.day_branch } },
        hour: { stem: { zh: reading.hour_stem }, branch: { zh: reading.hour_branch } },
      },
    };

    // 5. Generate paid reading via Claude
    const prompt = buildPaidReadingPrompt(chart as any);

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      // Mark as paid even if AI fails (can regenerate later)
      await fetch(`${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ is_paid: true }),
      });
      return NextResponse.json({ success: true, aiPending: true });
    }

    const aiData = await anthropicRes.json();
    const rawText = aiData.content?.[0]?.text || "";

    let paidReading: {
      career: string;
      love: string;
      health: string;
      decade_forecast: string;
      monthly_energy: string;
    };

    try {
      const cleaned = rawText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      paidReading = JSON.parse(cleaned);
    } catch {
      // Mark paid, AI parse failed
      await fetch(`${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ is_paid: true }),
      });
      return NextResponse.json({ success: true, aiPending: true });
    }

    // 6. Save paid reading to Supabase
    await fetch(`${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        is_paid: true,
        paid_reading_career: paidReading.career,
        paid_reading_love: paidReading.love,
        paid_reading_health: paidReading.health,
        paid_reading_decade: paidReading.decade_forecast,
        paid_reading_monthly: paidReading.monthly_energy,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Verify payment error:", err?.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
