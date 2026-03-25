import { NextRequest, NextResponse } from "next/server";
import { buildPaidPromptPart1, buildPaidPromptPart2, buildPaidPromptPart3, buildChartSummary } from "@/lib/paid-prompts";

export const runtime = "edge";

// Race Sonnet vs delayed Haiku for a single prompt
// Sonnet starts immediately; Haiku starts after delayMs
// First valid response wins, loser is aborted
async function raceModels(
  prompt: string,
  apiKey: string,
  label: string
): Promise<string> {
  const controller1 = new AbortController();
  const controller2 = new AbortController();

  const callModel = async (
    model: string,
    signal: AbortSignal,
    delayMs: number
  ): Promise<{ text: string; model: string }> => {
    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
      if (signal.aborted) throw new Error("aborted-during-delay");
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
      throw new Error(`${model} ${res.status}: ${errText.substring(0, 100)}`);
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || "";
    if (!text) throw new Error(`${model}: empty response`);

    return { text, model };
  };

  try {
    // Race: Sonnet (immediate) vs Haiku (12s delayed)
    // If Sonnet finishes in <12s → Haiku never makes API call
    // If Sonnet is slow → Haiku starts at t=12s, typically finishes by t=15s
    const winner = await Promise.any([
      callModel("claude-sonnet-4-20250514", controller1.signal, 0)
        .catch((e) => { throw e; }),
      callModel("claude-haiku-4-5-20251001", controller2.signal, 12000)
        .catch((e) => { throw e; }),
    ]);

    // Cancel the loser
    controller1.abort();
    controller2.abort();
    console.log(`${label}: ${winner.model} won`);
    return winner.text;
  } catch (err: any) {
    // Both failed
    controller1.abort();
    controller2.abort();
    throw new Error(`${label}: Both models failed — ${err?.message || "unknown"}`);
  }
}

function parseJSON(raw: string): any {
  const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned);
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const { shareSlug } = await request.json();
    if (!shareSlug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const anthropicKey = process.env.ANTHROPIC_API_KEY || "";

    const dbHeaders = {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
    };

    // 1. Fetch reading
    const readingRes = await fetch(
      `${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}&select=*`,
      { headers: dbHeaders }
    );
    const readings = await readingRes.json();
    const reading = readings?.[0];

    if (!reading) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (reading.paid_reading_career) return NextResponse.json({ success: true, alreadyGenerated: true });

    // ═══ PILLAR CACHE ═══
    const pillarParams = new URLSearchParams({
      year_stem: `eq.${reading.year_stem}`,
      year_branch: `eq.${reading.year_branch}`,
      month_stem: `eq.${reading.month_stem}`,
      month_branch: `eq.${reading.month_branch}`,
      day_stem: `eq.${reading.day_stem}`,
      day_branch: `eq.${reading.day_branch}`,
      hour_stem: `eq.${reading.hour_stem}`,
      hour_branch: `eq.${reading.hour_branch}`,
      select: "paid_reading_career,paid_reading_love,paid_reading_health,paid_reading_decade,paid_reading_monthly,paid_reading_hidden_talent",
      "paid_reading_career": "not.is.null",
      limit: "1",
    });

    try {
      const cacheRes = await fetch(`${supabaseUrl}/rest/v1/readings?${pillarParams}`, { headers: dbHeaders });
      if (cacheRes.ok) {
        const cached = await cacheRes.json();
        if (cached?.length > 0 && cached[0].paid_reading_career) {
          await fetch(`${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}`, {
            method: "PATCH",
            headers: dbHeaders,
            body: JSON.stringify({
              paid_reading_career: cached[0].paid_reading_career,
              paid_reading_love: cached[0].paid_reading_love,
              paid_reading_health: cached[0].paid_reading_health,
              paid_reading_decade: cached[0].paid_reading_decade,
              paid_reading_monthly: cached[0].paid_reading_monthly,
              paid_reading_hidden_talent: cached[0].paid_reading_hidden_talent,
            }),
          });
          console.log(`Paid reading cached in ${Date.now() - startTime}ms`);
          return NextResponse.json({ success: true, cached: true });
        }
      }
    } catch {
      // Cache miss — continue to generate
    }

    // 2. Build prompts
    const chartSummary = buildChartSummary(reading);
    const currentYear = new Date().getFullYear();

    // 3. THREE parallel race calls
    // Each call: Sonnet starts immediately, Haiku starts at t=12s
    // All 3 races run in parallel
    // Best case: all 3 Sonnet win → ~15-20s total
    // Worst case: all 3 Haiku win → ~15s total (12s delay + 3s generation)
    // Total budget: ~20s AI + 2s DB + 1s overhead = 23s < 25s limit
    const aiStartTime = Date.now();

    const [raw1, raw2, raw3] = await Promise.all([
      raceModels(buildPaidPromptPart1(chartSummary), anthropicKey, "Part1-Career+Love"),
      raceModels(buildPaidPromptPart2(chartSummary, currentYear), anthropicKey, "Part2-Health+Decade"),
      raceModels(buildPaidPromptPart3(chartSummary), anthropicKey, "Part3-Monthly+Talent"),
    ]);

    console.log(`AI generation took ${Date.now() - aiStartTime}ms`);

    // 4. Parse
    let part1: { career: string; love: string };
    let part2: { health: string; decade_forecast: string };
    let part3: { monthly_energy: string; hidden_talent: string };

    try { part1 = parseJSON(raw1); } catch {
      console.error("Part1 parse error:", raw1.substring(0, 300));
      return NextResponse.json({ error: "Parse error: career/love" }, { status: 500 });
    }
    try { part2 = parseJSON(raw2); } catch {
      console.error("Part2 parse error:", raw2.substring(0, 300));
      return NextResponse.json({ error: "Parse error: health/decade" }, { status: 500 });
    }
    try { part3 = parseJSON(raw3); } catch {
      console.error("Part3 parse error:", raw3.substring(0, 300));
      return NextResponse.json({ error: "Parse error: monthly/talent" }, { status: 500 });
    }

    // 5. Save
    const patchRes = await fetch(`${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}`, {
      method: "PATCH",
      headers: dbHeaders,
      body: JSON.stringify({
        paid_reading_career: part1.career,
        paid_reading_love: part1.love,
        paid_reading_health: part2.health,
        paid_reading_decade: part2.decade_forecast,
        paid_reading_monthly: part3.monthly_energy,
        paid_reading_hidden_talent: part3.hidden_talent,
      }),
    });

    if (!patchRes.ok) {
      const dbErr = await patchRes.text();
      console.error("DB save error:", dbErr);
      return NextResponse.json({ error: "DB save failed" }, { status: 500 });
    }

    console.log(`Total paid generation: ${Date.now() - startTime}ms`);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(`Generate paid error after ${Date.now() - startTime}ms:`, err?.message || err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
