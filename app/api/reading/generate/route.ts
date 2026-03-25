import { NextRequest, NextResponse } from "next/server";
import { buildFreeReadingPrompt, generateShareSlug } from "@/lib/reading-prompts";
import type { SajuChart } from "@/lib/saju-calculator";

// Edge runtime for longer timeout on Vercel Hobby
export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const chart = body.chart as SajuChart;

    if (!chart || !chart.name || !chart.dayMaster) {
      return NextResponse.json({ error: "Invalid chart data" }, { status: 400 });
    }

    // Fix Date serialization from JSON
    if (typeof chart.birthDate === "string") {
      chart.birthDate = new Date(chart.birthDate);
    }

    // 1. Generate AI reading via Claude API
    const prompt = buildFreeReadingPrompt(chart);

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("Anthropic error:", anthropicRes.status, errText);
      return NextResponse.json(
        { error: `AI error ${anthropicRes.status}: ${errText.substring(0, 200)}` },
        { status: 500 }
      );
    }

    const aiData = await anthropicRes.json();
    const rawText = aiData.content?.[0]?.text || "";

    // 2. Parse JSON response
    let aiReading: {
      personality: string;
      year_forecast: string;
      element_guidance: string;
    };

    try {
      const cleaned = rawText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      aiReading = JSON.parse(cleaned);
    } catch {
      console.error("Parse error. Raw:", rawText.substring(0, 300));
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    // 3. Save to Supabase via REST API (no SDK needed in Edge)
    const shareSlug = generateShareSlug();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    const birthDateStr = chart.birthDate instanceof Date
      ? chart.birthDate.toISOString().split("T")[0]
      : new Date(chart.birthDate).toISOString().split("T")[0];

    const insertBody = {
      name: chart.name,
      gender: chart.gender,
      birth_date: birthDateStr,
      birth_hour: 12,
      birth_city: chart.birthCity,
      year_stem: chart.pillars.year.stem.zh,
      year_branch: chart.pillars.year.branch.zh,
      month_stem: chart.pillars.month.stem.zh,
      month_branch: chart.pillars.month.branch.zh,
      day_stem: chart.pillars.day.stem.zh,
      day_branch: chart.pillars.day.branch.zh,
      hour_stem: chart.pillars.hour.stem.zh,
      hour_branch: chart.pillars.hour.branch.zh,
      day_master_element: chart.dayMaster.element,
      day_master_yinyang: chart.dayMaster.yinYang,
      archetype: chart.archetype,
      ten_god: chart.tenGod,
      harmony_score: chart.harmonyScore,
      dominant_element: chart.dominantElement,
      weakest_element: chart.weakestElement,
      elements_wood: chart.elements.wood,
      elements_fire: chart.elements.fire,
      elements_earth: chart.elements.earth,
      elements_metal: chart.elements.metal,
      elements_water: chart.elements.water,
      free_reading_personality: aiReading.personality,
      free_reading_year: aiReading.year_forecast,
      free_reading_element: aiReading.element_guidance,
      share_slug: shareSlug,
      is_paid: false,
    };

    const dbRes = await fetch(`${supabaseUrl}/rest/v1/readings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(insertBody),
    });

    if (!dbRes.ok) {
      const dbErr = await dbRes.text();
      console.error("Supabase error:", dbRes.status, dbErr);
      return NextResponse.json(
        { error: `DB error ${dbRes.status}: ${dbErr.substring(0, 200)}` },
        { status: 500 }
      );
    }

    // 4. Success
    return NextResponse.json({
      success: true,
      shareSlug,
      reading: {
        personality: aiReading.personality,
        year_forecast: aiReading.year_forecast,
        element_guidance: aiReading.element_guidance,
      },
    });
  } catch (err: any) {
    console.error("Unhandled error:", err?.message || err);
    return NextResponse.json(
      { error: "Server error: " + (err?.message || "unknown") },
      { status: 500 }
    );
  }
}
