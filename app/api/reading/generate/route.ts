import { NextRequest, NextResponse } from "next/server";
import { buildFreeReadingPrompt, generateShareSlug } from "@/lib/reading-prompts";
import type { SajuChart } from "@/lib/saju-calculator";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

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

    const cacheTime = Date.now() - startTime;
    console.log(`Cache check took ${cacheTime}ms`);

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
    const apiKey = process.env.ANTHROPIC_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    const prompt = buildFreeReadingPrompt(chart);
    const aiStartTime = Date.now();

    // Strategy: Race Sonnet vs delayed Haiku
    // - Sonnet starts immediately (best quality)
    // - After 10s, Haiku also starts (fast backup)
    // - First valid response wins
    const controller1 = new AbortController();
    const controller2 = new AbortController();

    const makeCall = async (
      model: string,
      signal: AbortSignal,
      delayMs: number = 0
    ): Promise<{ result: any; model: string } | null> => {
      try {
        if (delayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          // Check if already aborted during delay
          if (signal.aborted) return null;
        }

        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model,
            max_tokens: 2000,
            messages: [{ role: "user", content: prompt }],
          }),
          signal,
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error(`${model} API error: ${res.status} ${errText.substring(0, 200)}`);
          return null;
        }

        const data = await res.json();
        const rawText = data.content?.[0]?.text || "";
        const cleaned = rawText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        const parsed = JSON.parse(cleaned);

        if (!parsed.personality || !parsed.year_forecast || !parsed.element_guidance) {
          console.error(`${model} incomplete response`);
          return null;
        }

        return { result: parsed, model };
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error(`${model} error:`, err?.message);
        }
        return null;
      }
    };

    // Race: Sonnet (immediate) vs Haiku (starts after 10s delay)
    // If Sonnet finishes in <10s → Haiku never even starts the API call
    // If Sonnet is slow → Haiku response arrives at ~13-15s mark
    let aiReading: any = null;
    let usedModel = "";

    try {
      const winner = await Promise.any([
        makeCall("claude-sonnet-4-20250514", controller1.signal, 0)
          .then((r) => { if (!r) throw new Error("sonnet-fail"); return r; }),
        makeCall("claude-haiku-4-5-20251001", controller2.signal, 10000)
          .then((r) => { if (!r) throw new Error("haiku-fail"); return r; }),
      ]);

      aiReading = winner.result;
      usedModel = winner.model;

      // Cancel the loser
      controller1.abort();
      controller2.abort();
    } catch {
      // Both failed — try one more time with Haiku only, no race
      console.error("Race failed. Last-resort Haiku attempt...");
      try {
        const lastResort = await makeCall(
          "claude-haiku-4-5-20251001",
          new AbortController().signal,
          0
        );
        if (lastResort) {
          aiReading = lastResort.result;
          usedModel = lastResort.model;
        }
      } catch {
        // Give up
      }
    }

    const aiTime = Date.now() - aiStartTime;
    console.log(`AI generation took ${aiTime}ms using ${usedModel || "none"}`);

    if (!aiReading) {
      const totalTime = Date.now() - startTime;
      return NextResponse.json(
        { error: `AI generation failed after ${Math.round(totalTime / 1000)}s — please try again` },
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

    const totalTime = Date.now() - startTime;
    console.log(`Total request: ${totalTime}ms (cache: ${cacheTime}ms, AI: ${aiTime}ms, model: ${usedModel})`);

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
    const totalTime = Date.now() - startTime;
    console.error(`Unhandled error after ${totalTime}ms:`, err?.message || err);
    return NextResponse.json(
      { error: `Server error after ${Math.round(totalTime / 1000)}s: ${err?.message || "unknown"}` },
      { status: 500 }
    );
  }
}
