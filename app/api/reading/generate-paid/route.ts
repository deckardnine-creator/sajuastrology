import { NextRequest, NextResponse } from "next/server";
import { buildPaidPromptPart1, buildPaidPromptPart2, buildPaidPromptPart3, buildChartSummary } from "@/lib/paid-prompts";

export const runtime = "edge";

async function callClaude(prompt: string, apiKey: string, label: string): Promise<string> {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`${label}: API ${res.status} — ${errText.substring(0, 200)}`);
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || "";
    console.log(`${label}: ${Date.now() - start}ms`);
    return text;
  } catch (err: any) {
    clearTimeout(timer);
    throw new Error(`${label}: ${err?.message || "unknown"}`);
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
    if (!shareSlug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

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
    try {
      const pillarParams = new URLSearchParams({
        year_stem: `eq.${reading.year_stem}`, year_branch: `eq.${reading.year_branch}`,
        month_stem: `eq.${reading.month_stem}`, month_branch: `eq.${reading.month_branch}`,
        day_stem: `eq.${reading.day_stem}`, day_branch: `eq.${reading.day_branch}`,
        hour_stem: `eq.${reading.hour_stem}`, hour_branch: `eq.${reading.hour_branch}`,
        select: "paid_reading_career,paid_reading_love,paid_reading_health,paid_reading_decade,paid_reading_monthly,paid_reading_hidden_talent",
        "paid_reading_career": "not.is.null",
        limit: "1",
      });

      const cacheRes = await fetch(`${supabaseUrl}/rest/v1/readings?${pillarParams}`, { headers: dbHeaders });
      if (cacheRes.ok) {
        const cached = await cacheRes.json();
        if (cached?.length > 0 && cached[0].paid_reading_career) {
          await fetch(`${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}`, {
            method: "PATCH", headers: dbHeaders,
            body: JSON.stringify({
              paid_reading_career: cached[0].paid_reading_career,
              paid_reading_love: cached[0].paid_reading_love,
              paid_reading_health: cached[0].paid_reading_health,
              paid_reading_decade: cached[0].paid_reading_decade,
              paid_reading_monthly: cached[0].paid_reading_monthly,
              paid_reading_hidden_talent: cached[0].paid_reading_hidden_talent,
            }),
          });
          console.log(`Paid cached: ${Date.now() - startTime}ms`);
          return NextResponse.json({ success: true, cached: true });
        }
      }
    } catch { /* cache miss */ }

    // 2. Generate — 3 parallel Sonnet calls (Vercel Pro = 60s limit)
    const chartSummary = buildChartSummary(reading);
    const currentYear = new Date().getFullYear();
    const aiStart = Date.now();

    const [raw1, raw2, raw3] = await Promise.all([
      callClaude(buildPaidPromptPart1(chartSummary), anthropicKey, "Part1-Career+Love"),
      callClaude(buildPaidPromptPart2(chartSummary, currentYear), anthropicKey, "Part2-Health+Decade"),
      callClaude(buildPaidPromptPart3(chartSummary), anthropicKey, "Part3-Monthly+Talent"),
    ]);

    console.log(`AI total: ${Date.now() - aiStart}ms`);

    // 3. Parse
    let part1: { career: string; love: string };
    let part2: { health: string; decade_forecast: string };
    let part3: { monthly_energy: string; hidden_talent: string };

    try { part1 = parseJSON(raw1); } catch { return NextResponse.json({ error: "Parse error: career/love" }, { status: 500 }); }
    try { part2 = parseJSON(raw2); } catch { return NextResponse.json({ error: "Parse error: health/decade" }, { status: 500 }); }
    try { part3 = parseJSON(raw3); } catch { return NextResponse.json({ error: "Parse error: monthly/talent" }, { status: 500 }); }

    // 4. Save
    const patchRes = await fetch(`${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}`, {
      method: "PATCH", headers: dbHeaders,
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
      return NextResponse.json({ error: `DB error: ${dbErr.substring(0, 200)}` }, { status: 500 });
    }

    console.log(`Paid total: ${Date.now() - startTime}ms`);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(`Paid error after ${Date.now() - startTime}ms:`, err?.message || err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
