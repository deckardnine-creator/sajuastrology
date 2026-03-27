import { NextRequest, NextResponse } from "next/server";
import { buildPaidPromptPart1, buildPaidPromptPart2, buildPaidPromptPart3, buildChartSummary } from "@/lib/paid-prompts";

// Serverless = 60s on Pro
export const maxDuration = 60;

async function callClaude(prompt: string, apiKey: string, label: string, retries = 3): Promise<string> {
  for (let attempt = 0; attempt < retries; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 2000 * attempt));
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
    });
    if (!res.ok) {
      const errText = await res.text();
      if ((res.status === 529 || res.status === 500) && attempt < retries - 1) {
        console.warn(`${label}: ${res.status} — retrying (${attempt + 1}/${retries})`);
        continue;
      }
      throw new Error(`${label}: API ${res.status} — ${errText.substring(0, 200)}`);
    }
    const data = await res.json();
    return data.content?.[0]?.text || "";
  }
  throw new Error(`${label}: all retries exhausted`);
}

function parseJSON(raw: string): any {
  return JSON.parse(raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim());
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shareSlug } = body;
    const locale = body.locale || "en";
    if (!shareSlug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const anthropicKey = process.env.ANTHROPIC_API_KEY || "";
    const dbHeaders = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, "Content-Type": "application/json" };

    // 1. Fetch reading
    const readingRes = await fetch(`${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}&select=*`, { headers: dbHeaders });
    const readings = await readingRes.json();
    const reading = readings?.[0];
    if (!reading) return NextResponse.json({ error: "Not found" }, { status: 404 });
    // EN: skip if already generated. KO/JA: always regenerate (no locale column in DB)
    if (locale === "en" && reading.paid_reading_career) {
      return NextResponse.json({ success: true, alreadyGenerated: true });
    }

    // ═══ PILLAR CACHE — English only ═══
    // Cached content is always English. Skip cache for KO/JA to ensure correct language.
    if (locale === "en") {
      try {
        const cacheRes = await fetch(`${supabaseUrl}/rest/v1/readings?${new URLSearchParams({
          year_stem: `eq.${reading.year_stem}`, year_branch: `eq.${reading.year_branch}`,
          month_stem: `eq.${reading.month_stem}`, month_branch: `eq.${reading.month_branch}`,
          day_stem: `eq.${reading.day_stem}`, day_branch: `eq.${reading.day_branch}`,
          hour_stem: `eq.${reading.hour_stem}`, hour_branch: `eq.${reading.hour_branch}`,
          select: "paid_reading_career,paid_reading_love,paid_reading_health,paid_reading_decade,paid_reading_monthly,paid_reading_hidden_talent",
          "paid_reading_career": "not.is.null", limit: "1",
        })}`, { headers: dbHeaders });
        if (cacheRes.ok) {
          const cached = await cacheRes.json();
          if (cached?.length > 0 && cached[0].paid_reading_career) {
            await fetch(`${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}`, {
              method: "PATCH", headers: dbHeaders,
              body: JSON.stringify({
                paid_reading_career: cached[0].paid_reading_career, paid_reading_love: cached[0].paid_reading_love,
                paid_reading_health: cached[0].paid_reading_health, paid_reading_decade: cached[0].paid_reading_decade,
                paid_reading_monthly: cached[0].paid_reading_monthly, paid_reading_hidden_talent: cached[0].paid_reading_hidden_talent,
              }),
            });
            return NextResponse.json({ success: true, cached: true });
          }
        }
      } catch { /* cache miss */ }
    }

    // 2. THREE parallel Sonnet calls
    const chartSummary = buildChartSummary(reading);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const forecastYear = currentMonth >= 11 ? currentYear + 1 : currentYear;

    const [raw1, raw2, raw3] = await Promise.all([
      callClaude(buildPaidPromptPart1(chartSummary, locale), anthropicKey, "Part1-Career+Love"),
      callClaude(buildPaidPromptPart2(chartSummary, currentYear, locale), anthropicKey, "Part2-Health+Decade"),
      callClaude(buildPaidPromptPart3(chartSummary, locale), anthropicKey, "Part3-Monthly+Talent"),
    ]);

    // 3. Parse
    let part1, part2, part3;
    try { part1 = parseJSON(raw1); } catch { return NextResponse.json({ error: "Parse error: career/love" }, { status: 500 }); }
    try { part2 = parseJSON(raw2); } catch { return NextResponse.json({ error: "Parse error: health/decade" }, { status: 500 }); }
    try { part3 = parseJSON(raw3); } catch { return NextResponse.json({ error: "Parse error: monthly/talent" }, { status: 500 }); }

    // 4. Save
    const patchRes = await fetch(`${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}`, {
      method: "PATCH", headers: dbHeaders,
      body: JSON.stringify({
        paid_reading_career: part1.career, paid_reading_love: part1.love,
        paid_reading_health: part2.health, paid_reading_decade: part2.decade_forecast,
        paid_reading_monthly: part3.monthly_energy, paid_reading_hidden_talent: part3.hidden_talent,
      }),
    });
    if (!patchRes.ok) return NextResponse.json({ error: "DB save failed" }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
