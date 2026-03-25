import { NextRequest, NextResponse } from "next/server";
import { buildFreeReadingPrompt, generateShareSlug } from "@/lib/reading-prompts";
import type { SajuChart } from "@/lib/saju-calculator";

export const runtime = "edge";

// Call Anthropic with a timeout — returns null on timeout instead of throwing
async function callAnthropic(
  apiKey: string,
  model: string,
  prompt: string,
  maxTokens: number,
  timeoutMs: number
): Promise<{ personality: string; year_forecast: string; element_guidance: string } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Anthropic error (${model}):`, res.status, errText.substring(0, 200));
      return null;
    }

    const data = await res.json();
    const rawText = data.content?.[0]?.text || "";
    const cleaned = rawText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.personality || !parsed.year_forecast || !parsed.element_guidance) {
      console.error(`Incomplete response from ${model}:`, cleaned.substring(0, 200));
      return null;
    }

    return parsed;
  } catch (err: any) {
    clearTimeout(timer);
    if (err?.name === "AbortError") {
      console.log(`${model} timed out after ${timeoutMs}ms — will fallback`);
    } else {
      console.error(`${model} error:`, err?.message);
    }
    return null;
  }
}

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
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const dbHeaders = {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
    };

    let birthDateStr: string;
    if (chart.birthDate instanceof Date) {
      const d = chart.birthDate;
      birthDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    } else {
      birthDateStr = String(chart.birthDate).split("T")[0];
    }

    const ys = chart.pillars.year.stem.zh;
    const yb = chart.pillars.year.branch.zh;
    const ms = chart.pillars.month.stem.zh;
    const mb = chart.pillars.month.branch.zh;
    const ds = chart.pillars.day.stem.zh;
    const db = chart.pillars.day.branch.zh;
    const hs = chart.pillars.hour.stem.zh;
    const hb = chart.pillars.hour.branch.zh;

    // ═══ PARALLEL CACHE CHECK ═══
    const exactParams = new URLSearchParams({
      name: `eq.${chart.name}`,
      gender: `eq.${chart.gender}`,
      birth_date: `eq.${birthDateStr}`,
      birth_city: `eq.${chart.birthCity}`,
      select: "share_slug,free_reading_personality",
      limit: "1",
    });

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

    const [exactResult, pillarResult] = await Promise.allSettled([
      fetch(`${supabaseUrl}/rest/v1/readings?${exactParams}`, { headers: dbHeaders })
        .then(async (r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(`${supabaseUrl}/rest/v1/readings?${pillarParams}`, { headers: dbHeaders })
        .then(async (r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ]);

    const exactData = exactResult.status === "fulfilled" ? exactResult.value : null;
    const pillarData = pillarResult.status === "fulfilled" ? pillarResult.value : null;

    // ═══ CHECK 1: Exact same person ═══
    if (exactData?.length > 0 && exactData[0].free_reading_personality) {
      return NextResponse.json({
        success: true,
        shareSlug: exactData[0].share_slug,
        existing: true,
      });
    }

    // ═══ CHECK 2: Same pillars → reuse cached AI text ═══
    if (pillarData?.length > 0 && pillarData[0].free_reading_personality) {
      const shareSlug = generateShareSlug();
      const cachedReading = pillarData[0];

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
    }

    // ═══ NO CACHE: Generate fresh AI reading ═══
    // Vercel Edge Runtime = 25s hard limit
    // Budget: ~1.5s cache check + 14s Sonnet + 7s Haiku fallback + 1.5s DB = ~24s max
    const apiKey = process.env.ANTHROPIC_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    const prompt = buildFreeReadingPrompt(chart);

    // Try Sonnet first (14s timeout)
    let aiReading = await callAnthropic(
      apiKey,
      "claude-sonnet-4-20250514",
      prompt,
      2000,
      14000
    );

    // Sonnet failed or timed out → Haiku fallback (7s timeout)
    if (!aiReading) {
      console.log("Sonnet unavailable, falling back to Haiku 4.5");
      aiReading = await callAnthropic(
        apiKey,
        "claude-haiku-4-5-20251001",
        prompt,
        2000,
        7000
      );
    }

    if (!aiReading) {
      return NextResponse.json(
        { error: "AI generation failed — please try again" },
        { status: 500 }
      );
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
