import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildFreeReadingPrompt, generateShareSlug } from "@/lib/reading-prompts";
import type { SajuChart } from "@/lib/saju-calculator";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { chart } = (await request.json()) as { chart: SajuChart };

    if (!chart || !chart.name || !chart.dayMaster) {
      return NextResponse.json({ error: "Invalid chart data" }, { status: 400 });
    }

    // 1. Generate AI reading via Claude API
    const prompt = buildFreeReadingPrompt(chart);
    
    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      console.error("Anthropic API error:", errorText);
      return NextResponse.json(
        { error: "Failed to generate reading" },
        { status: 500 }
      );
    }

    const anthropicData = await anthropicResponse.json();
    const rawText = anthropicData.content[0]?.text || "";

    // 2. Parse the JSON response
    let aiReading: {
      personality: string;
      year_forecast: string;
      element_guidance: string;
    };

    try {
      // Clean potential markdown fences
      const cleaned = rawText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      aiReading = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", rawText.substring(0, 500));
      return NextResponse.json(
        { error: "Failed to parse reading" },
        { status: 500 }
      );
    }

    // 3. Generate share slug and save to Supabase
    const shareSlug = generateShareSlug();

    const { data, error } = await supabase
      .from("readings")
      .insert({
        name: chart.name,
        gender: chart.gender,
        birth_date: chart.birthDate,
        birth_hour: chart.birthDate instanceof Date 
          ? chart.birthDate.getHours() 
          : new Date(chart.birthDate).getHours(),
        birth_city: chart.birthCity,
        // Pillars
        year_stem: chart.pillars.year.stem.zh,
        year_branch: chart.pillars.year.branch.zh,
        month_stem: chart.pillars.month.stem.zh,
        month_branch: chart.pillars.month.branch.zh,
        day_stem: chart.pillars.day.stem.zh,
        day_branch: chart.pillars.day.branch.zh,
        hour_stem: chart.pillars.hour.stem.zh,
        hour_branch: chart.pillars.hour.branch.zh,
        // Analysis
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
        // AI Reading (free)
        free_reading_personality: aiReading.personality,
        free_reading_year: aiReading.year_forecast,
        free_reading_element: aiReading.element_guidance,
        // Meta
        share_slug: shareSlug,
        is_paid: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to save reading" },
        { status: 500 }
      );
    }

    // 4. Return the complete reading
    return NextResponse.json({
      success: true,
      shareSlug,
      reading: {
        personality: aiReading.personality,
        year_forecast: aiReading.year_forecast,
        element_guidance: aiReading.element_guidance,
      },
      chart: {
        name: chart.name,
        gender: chart.gender,
        dayMaster: chart.dayMaster,
        archetype: chart.archetype,
        tenGod: chart.tenGod,
        harmonyScore: chart.harmonyScore,
        dominantElement: chart.dominantElement,
        weakestElement: chart.weakestElement,
        elements: chart.elements,
        pillars: chart.pillars,
      },
    });
  } catch (err) {
    console.error("Reading generation error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
