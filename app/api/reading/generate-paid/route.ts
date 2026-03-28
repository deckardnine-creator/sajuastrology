import { NextRequest, NextResponse } from "next/server";
import { buildPaidPromptPart1, buildPaidPromptPart2, buildPaidPromptPart3, buildChartSummary } from "@/lib/paid-prompts";
import { getSystemInstruction } from "@/lib/prompt-locale";

// 120s — enough for retries across multiple AI engines
export const maxDuration = 120;

// ═══ SERVER-SIDE LOCALE DETECTION ═══
function detectLocaleFromContent(text: string | null): string | null {
  if (!text || text.length < 20) return null;
  const sample = text.substring(0, 300);
  if (/[\uAC00-\uD7AF]/.test(sample)) return "ko";
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(sample)) return "ja";
  return "en";
}

// ═══ AI ENGINE — 5-level fallback per call ═══
// Flash → Flash retry → Pro → Sonnet → Haiku
// Customer should NEVER see "generation failed"

async function callGemini(prompt: string, label: string, model: string, locale: string): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY || "";
  if (!apiKey) throw new Error("Gemini not configured");

  const genConfig: any = {
    maxOutputTokens: 6000,
    thinkingConfig: { thinkingBudget: 0 },
  };
  if (locale === "en") {
    genConfig.responseMimeType = "application/json";
  }

  const body: any = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: genConfig,
  };

  const sysInstr = getSystemInstruction(locale);
  if (sysInstr) {
    body.systemInstruction = { parts: [{ text: sysInstr }] };
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${label} Gemini ${model} ${res.status}: ${err.substring(0, 200)}`);
  }
  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const textParts = parts.filter((p: any) => p.text && !p.thought);
  if (textParts.length === 0) {
    const allText = parts.filter((p: any) => p.text).map((p: any) => p.text).join("");
    if (allText) return allText;
    throw new Error(`${label} Gemini ${model} empty response`);
  }
  return textParts.map((p: any) => p.text).join("");
}

async function callClaude(prompt: string, label: string, model: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY || "";
  if (!apiKey) throw new Error("Claude not configured");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${label} Claude ${model} ${res.status}: ${err.substring(0, 200)}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// 5-level fallback: Flash → Flash(retry) → Pro → Sonnet → Haiku
async function callAIRobust(prompt: string, label: string, locale: string): Promise<string> {
  const engines = [
    { name: "Flash",   fn: () => callGemini(prompt, label, "gemini-2.5-flash", locale) },
    { name: "Flash-R", fn: () => callGemini(prompt, label, "gemini-2.5-flash", locale) },
    { name: "Pro",     fn: () => callGemini(prompt, label, "gemini-2.5-pro", locale) },
    { name: "Sonnet",  fn: () => callClaude(prompt, label, "claude-sonnet-4-20250514") },
    { name: "Haiku",   fn: () => callClaude(prompt, label, "claude-haiku-4-5-20251001") },
  ];

  for (let i = 0; i < engines.length; i++) {
    try {
      if (i > 0) await new Promise((r) => setTimeout(r, 1000));
      const result = await engines[i].fn();
      if (result) {
        if (i > 0) console.log(`[${label}] succeeded on ${engines[i].name} (attempt ${i + 1})`);
        return result;
      }
    } catch (err) {
      console.warn(`[${label}] ${engines[i].name} failed:`, err instanceof Error ? err.message : err);
      if (i === engines.length - 1) throw err;
    }
  }
  throw new Error(`${label}: all 5 engines failed`);
}

// ═══ JSON PARSING — with extensive key normalization ═══

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
  const keyMap: Record<string, string> = {
    career: "career", "커리어": "career", "직업운": "career", "직업": "career",
    "キャリア": "career", "事業運": "career", "キャリア運": "career", "仕事運": "career",
    love: "love", "연애운": "love", "사랑": "love", "연애": "love",
    "恋愛": "love", "恋愛運": "love", "恋愛運勢": "love",
    health: "health", "건강운": "health", "건강": "health",
    "健康": "health", "健康運": "health", "健康運勢": "health",
    decade_forecast: "decade_forecast", "대운": "decade_forecast", "10년운": "decade_forecast",
    "십년운세": "decade_forecast", "10년 운세": "decade_forecast",
    "大運": "decade_forecast", "十年運勢": "decade_forecast",
    monthly_energy: "monthly_energy", "월별운세": "monthly_energy", "월간에너지": "monthly_energy",
    "월별 운세": "monthly_energy", "月間運勢": "monthly_energy", "月間エネルギー": "monthly_energy",
    hidden_talent: "hidden_talent", "숨겨진재능": "hidden_talent", "숨겨진 재능": "hidden_talent",
    "隠れた才能": "hidden_talent", "隠された才能": "hidden_talent",
  };
  const normalized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const k = key.toLowerCase().replace(/[\s_-]/g, "");
    const mapped = keyMap[key] || keyMap[k] || key;
    normalized[mapped] = value;
  }
  return normalized;
}

// ═══ GENERATE ONE PART — call AI + parse, with parse-failure retry ═══
async function generatePart(
  promptFn: () => string,
  label: string,
  locale: string,
  expectedKeys: string[]
): Promise<Record<string, string> | null> {
  // Attempt 1
  try {
    const raw = await callAIRobust(promptFn(), label, locale);
    const parsed = parseJSON(raw);
    // Verify expected keys exist
    const hasKeys = expectedKeys.every((k) => parsed[k] && typeof parsed[k] === "string" && parsed[k].length > 50);
    if (hasKeys) return parsed;
    console.warn(`[${label}] parsed but missing keys. Got: ${Object.keys(parsed).join(",")}`);
  } catch (err) {
    console.warn(`[${label}] attempt 1 failed:`, err instanceof Error ? err.message : err);
  }

  // Attempt 2 — parse failed or keys missing, try once more
  await new Promise((r) => setTimeout(r, 2000));
  try {
    const raw = await callAIRobust(promptFn(), label + "-retry", locale);
    const parsed = parseJSON(raw);
    const hasKeys = expectedKeys.every((k) => parsed[k] && typeof parsed[k] === "string" && parsed[k].length > 50);
    if (hasKeys) return parsed;
    // Accept even with short content
    const hasAnyKeys = expectedKeys.some((k) => parsed[k]);
    if (hasAnyKeys) return parsed;
  } catch (err) {
    console.warn(`[${label}] attempt 2 failed:`, err instanceof Error ? err.message : err);
  }

  return null; // This part completely failed
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shareSlug } = body;
    const clientLocale = body.locale || "en";
    if (!shareSlug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const dbHeaders = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, "Content-Type": "application/json" };

    // 1. Fetch reading
    const readingRes = await fetch(`${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}&select=*`, { headers: dbHeaders });
    const readings = await readingRes.json();
    const reading = readings?.[0];
    if (!reading) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Server-side locale detection
    const detectedLocale = detectLocaleFromContent(reading.free_reading_personality);
    const locale = detectedLocale || clientLocale;
    console.log(`[generate-paid] slug=${shareSlug} locale=${locale} (detected=${detectedLocale}, client=${clientLocale})`);

    // Skip if already generated (EN only)
    if (locale === "en" && reading.paid_reading_career) {
      return NextResponse.json({ success: true, alreadyGenerated: true });
    }

    // Pillar cache — EN only
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

    // 2. Generate 3 parts INDEPENDENTLY — each has its own 5-level fallback + parse retry
    const chartSummary = buildChartSummary(reading);
    const currentYear = new Date().getFullYear();

    const [part1, part2, part3] = await Promise.all([
      generatePart(
        () => buildPaidPromptPart1(chartSummary, locale),
        "Part1-Career+Love", locale, ["career", "love"]
      ),
      generatePart(
        () => buildPaidPromptPart2(chartSummary, currentYear, locale),
        "Part2-Health+Decade", locale, ["health", "decade_forecast"]
      ),
      generatePart(
        () => buildPaidPromptPart3(chartSummary, locale),
        "Part3-Monthly+Talent", locale, ["monthly_energy", "hidden_talent"]
      ),
    ]);

    // 3. Check results — save whatever succeeded
    const patchData: Record<string, string | null> = {
      paid_reading_career: part1?.career || null,
      paid_reading_love: part1?.love || null,
      paid_reading_health: part2?.health || null,
      paid_reading_decade: part2?.decade_forecast || null,
      paid_reading_monthly: part3?.monthly_energy || null,
      paid_reading_hidden_talent: part3?.hidden_talent || null,
    };

    // Count successes
    const successCount = Object.values(patchData).filter(Boolean).length;
    console.log(`[generate-paid] ${successCount}/6 sections generated successfully`);

    if (successCount === 0) {
      return NextResponse.json({ error: "AI generation failed after multiple retries" }, { status: 500 });
    }

    // Save whatever we have — even partial results
    // Only include non-null values in patch
    const cleanPatch: Record<string, string> = {};
    for (const [k, v] of Object.entries(patchData)) {
      if (v) cleanPatch[k] = v;
    }

    const patchRes = await fetch(`${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}`, {
      method: "PATCH", headers: dbHeaders,
      body: JSON.stringify(cleanPatch),
    });
    if (!patchRes.ok) return NextResponse.json({ error: "DB save failed" }, { status: 500 });

    // Return success with info about what was generated
    return NextResponse.json({
      success: true,
      generated: successCount,
      total: 6,
      partial: successCount < 6,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
