import { NextRequest, NextResponse } from "next/server";
import { buildFreeReadingPrompt, generateShareSlug } from "@/lib/reading-prompts";
import type { SajuChart } from "@/lib/saju-calculator";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const chart = body.chart as SajuChart;

    // ═══ VALIDATION ═══
    if (!chart || !chart.name || !chart.dayMaster) {
      return NextResponse.json(
        { error: "Invalid chart data: missing name or dayMaster" },
        { status: 400 }
      );
    }

    // Validate pillars exist before accessing nested properties
    if (
      !chart.pillars?.year?.stem?.zh ||
      !chart.pillars?.month?.stem?.zh ||
      !chart.pillars?.day?.stem?.zh ||
      !chart.pillars?.hour?.stem?.zh
    ) {
      return NextResponse.json(
        { error: "Invalid chart data: incomplete pillar information" },
        { status: 400 }
      );
    }

    if (typeof chart.birthDate === "string") {
      chart.birthDate = new Date(chart.birthDate);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase env vars");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const dbHeaders = {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
    };

    // Use birth_date string directly from input to avoid timezone shift
    // e.g., "1990-03-15" stays as "1990-03-15" regardless of server timezone
    let birthDateStr: string;
    if (chart.birthDate instanceof Date) {
      // Construct YYYY-MM-DD from UTC parts to avoid timezone offset issues
      const d = chart.birthDate;
      birthDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    } else {
      // Already a string — extract date portion
      birthDateStr = String(chart.birthDate).split("T")[0];
    }

    // Extract pillar characters for caching
    const ys = chart.pillars.year.stem.zh;
    const yb = chart.pillars.year.branch.zh;
    const ms = chart.pillars.month.stem.zh;
    const mb = chart.pillars.month.branch.zh;
    const ds = chart.pillars.day.stem.zh;
    const db = chart.pillars.day.branch.zh;
    const hs = chart.pillars.hour.stem.zh;
    const hb = chart.pillars.hour.branch.zh;

    // ═══ CHECK 1: Exact same person (same name + gender + birth) ═══
    try {
      const exactParams = new URLSearchParams({
        name: `eq.${chart.name}`,
        gender: `eq.${chart.gender}`,
        birth_date: `eq.${birthDateStr}`,
        birth_city: `eq.${chart.birthCity}`,
        select: "share_slug,free_reading_personality",
        limit: "1",
      });

      const exactRes = await fetch(`${supabaseUrl}/rest/v1/readings?${exactParams}`, {
        headers: dbHeaders,
      });

      if (exactRes.ok) {
        const exact = await exactRes.json();
        if (exact?.length > 0 && exact[0].free_reading_personality) {
          return NextResponse.json({
            success: true,
            shareSlug: exact[0].share_slug,
            existing: true,
          });
        }
      } else {
        console.error("Exact check failed:", exactRes.status, await exactRes.text());
      }
    } catch (e: any) {
      console.error("Exact check error:", e?.message);
      // Non-fatal — continue to pillar check or AI generation
    }

    // ═══ CHECK 2: Same 4 pillars (different name, same saju = reuse AI text) ═══
    try {
      const pillarParams = new URLSearchParams({
        year_stem: `eq.${ys}`,
        year_branch: `eq.${yb}`,
        month_stem: `eq.${ms}`,
        month_branch: `eq.${mb}`,
        day_stem: `eq.${ds}`,
        day_branch: `eq.${db}`,
        hour_stem: `eq.${hs}`,
        hour_branch: `eq.${hb}`,
        select:
          "free_reading_personality,free_reading_year,free_reading_element,paid_reading_career,paid_reading_love,paid_reading_health,paid_reading_decade,paid_reading_monthly,paid_reading_hidden_talent",
        "free_reading_personality": "not.is.null",
        limit: "1",
      });

      const pillarRes = await fetch(`${supabaseUrl}/rest/v1/readings?${pillarParams}`, {
        headers: dbHeaders,
      });

      if (pillarRes.ok) {
        const cached = await pillarRes.json();
        if (cached?.length > 0 && cached[0].free_reading_personality) {
          const shareSlug = generateShareSlug();
          const cachedReading = cached[0];

          const insertBody: Record<string, any> = {
            name: chart.name,
            gender: chart.gender,
            birth_date: birthDateStr,
            birth_hour: 12,
            birth_city: chart.birthCity,
            year_stem: ys, year_branch: yb,
            month_stem: ms, month_branch: mb,
            day_stem: ds, day_branch: db,
            hour_stem: hs, hour_branch: hb,
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
            free_reading_personality: cachedReading.free_reading_personality,
            free_reading_year: cachedReading.free_reading_year,
            free_reading_element: cachedReading.free_reading_element,
            share_slug: shareSlug,
            is_paid: false,
          };

          if (cachedReading.paid_reading_career) {
            insertBody.paid_reading_career = cachedReading.paid_reading_career;
            insertBody.paid_reading_love = cachedReading.paid_reading_love;
            insertBody.paid_reading_health = cachedReading.paid_reading_health;
            insertBody.paid_reading_decade = cachedReading.paid_reading_decade;
            insertBody.paid_reading_monthly = cachedReading.paid_reading_monthly;
            insertBody.paid_reading_hidden_talent = cachedReading.paid_reading_hidden_talent;
          }

          const dbRes = await fetch(`${supabaseUrl}/rest/v1/readings`, {
            method: "POST",
            headers: { ...dbHeaders, Prefer: "return=minimal" },
            body: JSON.stringify(insertBody),
          });

          if (dbRes.ok) {
            return NextResponse.json({ success: true, shareSlug, cached: true });
          }
          console.error("Cached insert failed:", dbRes.status, await dbRes.text());
          // Fall through to generate new
        }
      } else {
        console.error("Pillar check failed:", pillarRes.status, await pillarRes.text());
      }
    } catch (e: any) {
      console.error("Pillar check error:", e?.message);
      // Non-fatal — continue to AI generation
    }

    // ═══ NO CACHE: Generate fresh AI reading ═══
    const apiKey = process.env.ANTHROPIC_API_KEY || "";
    if (!apiKey) {
      console.error("Missing ANTHROPIC_API_KEY");
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    const prompt = buildFreeReadingPrompt(chart);

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("Anthropic error:", anthropicRes.status, errText);
      return NextResponse.json(
        { error: `AI generation failed (${anthropicRes.status})` },
        { status: 500 }
      );
    }

    const aiData = await anthropicRes.json();
    const rawText = aiData.content?.[0]?.text || "";

    let aiReading: { personality: string; year_forecast: string; element_guidance: string };

    try {
      const cleaned = rawText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      aiReading = JSON.parse(cleaned);
    } catch {
      console.error("Parse error. Raw:", rawText.substring(0, 500));
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    if (!aiReading.personality || !aiReading.year_forecast || !aiReading.element_guidance) {
      console.error("Incomplete AI response:", JSON.stringify(aiReading).substring(0, 300));
      return NextResponse.json({ error: "Incomplete AI response" }, { status: 500 });
    }

    const shareSlug = generateShareSlug();

    const dbRes = await fetch(`${supabaseUrl}/rest/v1/readings`, {
      method: "POST",
      headers: { ...dbHeaders, Prefer: "return=minimal" },
      body: JSON.stringify({
        name: chart.name,
        gender: chart.gender,
        birth_date: birthDateStr,
        birth_hour: 12,
        birth_city: chart.birthCity,
        year_stem: ys, year_branch: yb,
        month_stem: ms, month_branch: mb,
        day_stem: ds, day_branch: db,
        hour_stem: hs, hour_branch: hb,
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
      }),
    });

    if (!dbRes.ok) {
      const dbErr = await dbRes.text();
      console.error("Supabase insert error:", dbRes.status, dbErr);
      return NextResponse.json(
        { error: `Database error: ${dbErr.substring(0, 200)}` },
        { status: 500 }
      );
    }

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
    console.error("Unhandled error in /api/reading/generate:", err?.message || err);
    return NextResponse.json(
      { error: "Server error: " + (err?.message || "unknown") },
      { status: 500 }
    );
  }
}
