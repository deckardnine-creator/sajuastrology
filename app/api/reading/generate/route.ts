import { NextRequest, NextResponse } from "next/server";
import { buildFreeReadingPrompt, generateShareSlug } from "@/lib/reading-prompts";
import type { SajuChart } from "@/lib/saju-calculator";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const chart = body.chart as SajuChart;

    if (!chart || !chart.name || !chart.dayMaster) {
      return NextResponse.json({ error: "Invalid chart data" }, { status: 400 });
    }

    if (typeof chart.birthDate === "string") {
      chart.birthDate = new Date(chart.birthDate);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const headers = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` };

    const birthDateStr = chart.birthDate instanceof Date
      ? chart.birthDate.toISOString().split("T")[0]
      : new Date(chart.birthDate).toISOString().split("T")[0];

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
    const exactUrl = `${supabaseUrl}/rest/v1/readings?name=eq.${encodeURIComponent(chart.name)}&gender=eq.${chart.gender}&birth_date=eq.${birthDateStr}&birth_city=eq.${encodeURIComponent(chart.birthCity)}&select=share_slug,free_reading_personality&limit=1`;
    
    const exactRes = await fetch(exactUrl, { headers });
    if (exactRes.ok) {
      const exact = await exactRes.json();
      if (exact?.length > 0 && exact[0].free_reading_personality) {
        return NextResponse.json({ success: true, shareSlug: exact[0].share_slug, existing: true });
      }
    }

    // ═══ CHECK 2: Same 4 pillars (different name, same saju = reuse AI text) ═══
    const pillarUrl = `${supabaseUrl}/rest/v1/readings?year_stem=eq.${encodeURIComponent(ys)}&year_branch=eq.${encodeURIComponent(yb)}&month_stem=eq.${encodeURIComponent(ms)}&month_branch=eq.${encodeURIComponent(mb)}&day_stem=eq.${encodeURIComponent(ds)}&day_branch=eq.${encodeURIComponent(db)}&hour_stem=eq.${encodeURIComponent(hs)}&hour_branch=eq.${encodeURIComponent(hb)}&select=free_reading_personality,free_reading_year,free_reading_element,paid_reading_career,paid_reading_love,paid_reading_health,paid_reading_decade,paid_reading_monthly,paid_reading_hidden_talent&not.free_reading_personality=is.null&limit=1`;

    const pillarRes = await fetch(pillarUrl, { headers });
    if (pillarRes.ok) {
      const cached = await pillarRes.json();
      if (cached?.length > 0 && cached[0].free_reading_personality) {
        // Found same saju! Create new row with this person's name but cached AI text
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
          // Reuse cached AI readings (same saju = same reading)
          free_reading_personality: cachedReading.free_reading_personality,
          free_reading_year: cachedReading.free_reading_year,
          free_reading_element: cachedReading.free_reading_element,
          share_slug: shareSlug,
          is_paid: false,
        };

        // Also copy paid content if available
        if (cachedReading.paid_reading_career) {
          insertBody.paid_reading_career = cachedReading.paid_reading_career;
          insertBody.paid_reading_love = cachedReading.paid_reading_love;
          insertBody.paid_reading_health = cachedReading.paid_reading_health;
          insertBody.paid_reading_decade = cachedReading.paid_reading_decade;
          insertBody.paid_reading_monthly = cachedReading.paid_reading_monthly;
          insertBody.paid_reading_hidden_talent = cachedReading.paid_reading_hidden_talent;
          // Note: is_paid stays false - this person hasn't paid yet
        }

        const dbRes = await fetch(`${supabaseUrl}/rest/v1/readings`, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify(insertBody),
        });

        if (dbRes.ok) {
          return NextResponse.json({ success: true, shareSlug, cached: true });
        }
        // If insert fails, fall through to generate new
      }
    }

    // ═══ NO CACHE: Generate fresh AI reading ═══
    const prompt = buildFreeReadingPrompt(chart);

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
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
        { error: `AI error ${anthropicRes.status}: ${errText.substring(0, 200)}` },
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
      console.error("Parse error. Raw:", rawText.substring(0, 300));
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    const shareSlug = generateShareSlug();

    const dbRes = await fetch(`${supabaseUrl}/rest/v1/readings`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json", Prefer: "return=minimal" },
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
      console.error("Supabase error:", dbRes.status, dbErr);
      return NextResponse.json({ error: `DB error: ${dbErr.substring(0, 200)}` }, { status: 500 });
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
    console.error("Unhandled error:", err?.message || err);
    return NextResponse.json({ error: "Server error: " + (err?.message || "unknown") }, { status: 500 });
  }
}
