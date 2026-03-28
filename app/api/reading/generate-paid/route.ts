import { NextRequest, NextResponse } from "next/server";
import { buildPaidPromptPart1, buildPaidPromptPart2, buildPaidPromptPart3, buildChartSummary } from "@/lib/paid-prompts";

// Serverless = 60s on Pro
export const maxDuration = 60;

// ═══ AI ENGINE: Gemini Pro → Claude Sonnet (no Haiku — paid quality) ═══

async function callGemini(prompt: string, label: string, model = "gemini-2.5-flash", locale = "en"): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY || "";
  if (!apiKey) throw new Error("Gemini not configured");

  // For non-EN locales, DON'T use responseMimeType — it overrides language instructions
  const genConfig: any = {
    maxOutputTokens: 6000,
    thinkingConfig: { thinkingBudget: 0 },
  };
  if (locale === "en") {
    genConfig.responseMimeType = "application/json";
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: genConfig,
      }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${label} Gemini ${res.status}: ${err.substring(0, 200)}`);
  }
  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const textParts = parts.filter((p: any) => p.text && !p.thought);
  if (textParts.length === 0) {
    const allText = parts.filter((p: any) => p.text).map((p: any) => p.text).join("");
    if (allText) return allText;
    console.error(`${label} Gemini empty. Parts:`, JSON.stringify(parts).substring(0, 500));
    throw new Error(`${label} Gemini returned empty response`);
  }
  return textParts.map((p: any) => p.text).join("");
}

async function callClaude(prompt: string, label: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY || "";
  if (!apiKey) throw new Error("Claude not configured");

  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 2000));
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
      if ((res.status === 529 || res.status === 500) && attempt < 1) {
        console.warn(`${label}: Sonnet ${res.status} — retrying`);
        continue;
      }
      const err = await res.text();
      throw new Error(`${label}: Claude ${res.status} — ${err.substring(0, 200)}`);
    }
    const data = await res.json();
    return data.content?.[0]?.text || "";
  }
  throw new Error(`${label}: Claude retries exhausted`);
}

async function callAI(prompt: string, label: string, locale = "en"): Promise<string> {
  // Gemini Flash → Gemini Pro → Claude Sonnet
  try {
    return await callGemini(prompt, label, "gemini-2.5-flash", locale);
  } catch (err) {
    console.warn(`${label}: Gemini Flash failed —`, err instanceof Error ? err.message : err);
    try {
      return await callGemini(prompt, label, "gemini-2.5-pro", locale);
    } catch (err2) {
      console.warn(`${label}: Gemini Pro failed, falling back to Claude —`, err2 instanceof Error ? err2.message : err2);
      return await callClaude(prompt, label);
    }
  }
}

function parseJSON(raw: string): any {
  const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  let obj: any;
  try {
    obj = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) obj = JSON.parse(match[0]);
    else throw new Error("No JSON found");
  }
  // Normalize localized keys
  const keyMap: Record<string, string> = {
    career: "career", "커리어": "career", "직업운": "career", "キャリア": "career", "事業運": "career",
    love: "love", "연애운": "love", "사랑": "love", "恋愛": "love", "恋愛運": "love",
    health: "health", "건강운": "health", "건강": "health", "健康": "health", "健康運": "health",
    decade_forecast: "decade_forecast", "대운": "decade_forecast", "10년운": "decade_forecast", "大運": "decade_forecast",
    monthly_energy: "monthly_energy", "월별운세": "monthly_energy", "月間運勢": "monthly_energy",
    hidden_talent: "hidden_talent", "숨겨진재능": "hidden_talent", "隠れた才能": "hidden_talent",
  };
  const normalized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const k = key.toLowerCase().replace(/[\s_-]/g, "");
    const mapped = keyMap[key] || keyMap[k] || key;
    normalized[mapped] = value;
  }
  return normalized;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shareSlug } = body;
    const locale = body.locale || "en";
    if (!shareSlug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
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

    // 2. THREE parallel AI calls — Gemini Pro → Claude Sonnet fallback
    const chartSummary = buildChartSummary(reading);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const forecastYear = currentMonth >= 11 ? currentYear + 1 : currentYear;

    const [raw1, raw2, raw3] = await Promise.all([
      callAI(buildPaidPromptPart1(chartSummary, locale), "Part1-Career+Love", locale),
      callAI(buildPaidPromptPart2(chartSummary, currentYear, locale), "Part2-Health+Decade", locale),
      callAI(buildPaidPromptPart3(chartSummary, locale), "Part3-Monthly+Talent", locale),
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
