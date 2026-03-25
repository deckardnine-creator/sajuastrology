import { NextRequest, NextResponse } from "next/server";
import { buildPaidPromptPart1, buildPaidPromptPart2, buildPaidPromptPart3, buildChartSummary } from "@/lib/paid-prompts";

export const runtime = "edge";

// Call Claude with timeout + Haiku fallback
async function callClaudeWithFallback(
  prompt: string,
  apiKey: string,
  label: string
): Promise<string> {
  // Try Sonnet first (18s timeout — 3 parallel calls share the 25s budget)
  const sonnetResult = await callWithTimeout(
    prompt,
    apiKey,
    "claude-sonnet-4-20250514",
    18000
  );
  if (sonnetResult) {
    console.log(`${label}: Sonnet succeeded`);
    return sonnetResult;
  }

  // Fallback to Haiku (5s timeout)
  console.log(`${label}: Sonnet failed, trying Haiku`);
  const haikuResult = await callWithTimeout(
    prompt,
    apiKey,
    "claude-haiku-4-5-20251001",
    5000
  );
  if (haikuResult) {
    console.log(`${label}: Haiku succeeded`);
    return haikuResult;
  }

  throw new Error(`${label}: Both models failed`);
}

async function callWithTimeout(
  prompt: string,
  apiKey: string,
  model: string,
  timeoutMs: number
): Promise<string | null> {
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
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const errText = await res.text();
      console.error(`${model} error: ${res.status} ${errText.substring(0, 200)}`);
      return null;
    }

    const data = await res.json();
    return data.content?.[0]?.text || "";
  } catch (err: any) {
    clearTimeout(timer);
    if (err?.name === "AbortError") {
      console.log(`${model} timed out after ${timeoutMs}ms`);
    } else {
      console.error(`${model} error:`, err?.message);
    }
    return null;
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

    // ═══ PILLAR CACHE: Check if same saju already has paid content ═══
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

    // 2. Build prompts
    const chartSummary = buildChartSummary(reading);
    const currentYear = new Date().getFullYear();

    // 3. THREE parallel calls with Sonnet→Haiku fallback each
    const aiStartTime = Date.now();
    const [raw1, raw2, raw3] = await Promise.all([
      callClaudeWithFallback(buildPaidPromptPart1(chartSummary), anthropicKey, "Part1-Career+Love"),
      callClaudeWithFallback(buildPaidPromptPart2(chartSummary, currentYear), anthropicKey, "Part2-Health+Decade"),
      callClaudeWithFallback(buildPaidPromptPart3(chartSummary), anthropicKey, "Part3-Monthly+Talent"),
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
