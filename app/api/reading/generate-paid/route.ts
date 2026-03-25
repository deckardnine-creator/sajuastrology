import { NextRequest, NextResponse } from "next/server";
import { buildPaidReadingPrompt } from "@/lib/reading-prompts";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { shareSlug } = await request.json();
    if (!shareSlug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    // 1. Fetch reading data
    const readingRes = await fetch(
      `${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}&select=*`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    );
    const readings = await readingRes.json();
    const reading = readings?.[0];

    if (!reading) {
      return NextResponse.json({ error: "Reading not found" }, { status: 404 });
    }

    if (reading.paid_reading_career) {
      return NextResponse.json({ success: true, alreadyGenerated: true });
    }

    // 2. Build chart for prompt
    const chart = {
      name: reading.name,
      gender: reading.gender,
      birthDate: new Date(reading.birth_date),
      birthCity: reading.birth_city,
      dayMaster: {
        element: reading.day_master_element,
        yinYang: reading.day_master_yinyang,
        zh: reading.day_stem,
        en: `${reading.day_master_yinyang === "yang" ? "Yang" : "Yin"} ${reading.day_master_element.charAt(0).toUpperCase() + reading.day_master_element.slice(1)}`,
      },
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

    // 3. Generate with Haiku (fast, under 15s)
    const prompt = buildPaidReadingPrompt(chart as any);

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
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
      console.error("Parse error:", rawText.substring(0, 300));
      return NextResponse.json({ error: "Failed to parse paid reading" }, { status: 500 });
    }

    // 4. Save to Supabase
    await fetch(`${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        paid_reading_career: paidReading.career,
        paid_reading_love: paidReading.love,
        paid_reading_health: paidReading.health,
        paid_reading_decade: paidReading.decade_forecast,
        paid_reading_monthly: paidReading.monthly_energy,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Generate paid error:", err?.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
