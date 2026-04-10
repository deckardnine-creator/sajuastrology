import { NextRequest, NextResponse } from "next/server";
import { buildPaidPromptPart1, buildPaidPromptPart2, buildPaidPromptPart3, buildChartSummary } from "@/lib/paid-prompts";
import { getSystemInstruction } from "@/lib/prompt-locale";
import { buildRAGContext } from "@/lib/rag/prompt-injector";

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
    // Force JSON output for ALL locales. Previously KO/JA were omitted, which
    // caused Gemini to occasionally return plain text instead of JSON. Even when
    // JSON-shaped, the model would sometimes default to English content because
    // the structural constraint was loose. Forcing JSON mode + KO/JA system
    // instruction yields valid JSON with localized string values.
    responseMimeType: "application/json",
  };

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
// KO/JA: Pro first (Flash often ignores language instructions for non-EN)
async function callAIRobust(prompt: string, label: string, locale: string): Promise<string> {
  const engines = locale !== "en"
    ? [
        { name: "Pro",     fn: () => callGemini(prompt, label, "gemini-2.5-pro", locale) },
        { name: "Flash",   fn: () => callGemini(prompt, label, "gemini-2.5-flash", locale) },
        { name: "Flash-R", fn: () => callGemini(prompt, label, "gemini-2.5-flash", locale) },
        { name: "Sonnet",  fn: () => callClaude(prompt, label, "claude-sonnet-4-20250514") },
        { name: "Haiku",   fn: () => callClaude(prompt, label, "claude-haiku-4-5-20251001") },
      ]
    : [
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

// ═══ LANGUAGE CHECK — verify content matches requested locale ═══
// Some Gemini engines (especially Flash) occasionally return English text
// even when given a KO/JA system instruction. This helper samples the longest
// generated string and checks for the expected character range.
function checkContentLanguage(parsed: Record<string, any>, locale: string): boolean {
  if (locale === "en") return true;
  const longest = Object.values(parsed)
    .filter((v): v is string => typeof v === "string")
    .sort((a, b) => b.length - a.length)[0] || "";
  if (!longest) return true; // nothing to check; do not block
  const sample = longest.substring(0, 300);
  if (locale === "ko") return /[\uAC00-\uD7AF]/.test(sample);
  if (locale === "ja") return /[\u3040-\u309F\u30A0-\u30FF]/.test(sample);
  return true;
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
    const hasKeys = expectedKeys.every((k) => parsed[k] && typeof parsed[k] === "string" && parsed[k].length > 50);
    if (hasKeys) {
      // Verify the content is in the requested language; if not, fall through
      // to attempt 2 which will use Claude (more reliable for non-EN locales).
      if (checkContentLanguage(parsed, locale)) {
        return parsed;
      }
      console.warn(`[${label}] wrong language detected (locale=${locale}), retrying with Claude`);
    } else {
      console.warn(`[${label}] parsed but missing keys. Got: ${Object.keys(parsed).join(",")}`);
    }
  } catch (err) {
    console.warn(`[${label}] attempt 1 failed:`, err instanceof Error ? err.message : err);
  }

  // Attempt 2 — parse failed, missing keys, or wrong language
  // For KO/JA, go straight to Claude Sonnet which honors language instructions
  // more reliably than Gemini Flash. For EN, retry the AIRobust chain normally.
  await new Promise((r) => setTimeout(r, 2000));
  try {
    const raw = locale !== "en"
      ? await callClaude(promptFn(), label + "-retry-claude", "claude-sonnet-4-20250514")
      : await callAIRobust(promptFn(), label + "-retry", locale);
    const parsed = parseJSON(raw);
    const hasKeys = expectedKeys.every((k) => parsed[k] && typeof parsed[k] === "string" && parsed[k].length > 50);
    if (hasKeys) {
      if (checkContentLanguage(parsed, locale)) return parsed;
      console.warn(`[${label}] retry also produced wrong language; accepting anyway to avoid empty result`);
      return parsed;
    }
    // Accept even with short content
    const hasAnyKeys = expectedKeys.some((k) => parsed[k]);
    if (hasAnyKeys) return parsed;
  } catch (err) {
    console.warn(`[${label}] attempt 2 failed:`, err instanceof Error ? err.message : err);
  }

  return null; // This part completely failed
}

// ═══ IMMEDIATE DB PATCH — save each part as soon as it's ready ═══
async function patchDB(
  supabaseUrl: string,
  dbHeaders: Record<string, string>,
  shareSlug: string,
  data: Record<string, string>
): Promise<boolean> {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}`, {
      method: "PATCH",
      headers: dbHeaders,
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
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

    // Skip if already generated in the same language
    if (reading.paid_reading_career) {
      const existingLocale = detectLocaleFromContent(reading.paid_reading_career);
      if (existingLocale === locale || (!existingLocale && locale === "en")) {
        return NextResponse.json({ success: true, alreadyGenerated: true });
      }
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

    // 2. Build chart summary + RAG context
    const chartSummary = buildChartSummary(reading);
    const currentYear = new Date().getFullYear();

    // RAG: 사주 특성 기반 고전 원전 검색 (실패 시 빈 컨텍스트 → 기존과 동일)
    let ragPrefix = "";
    let citationMeta: any = null;
    try {
      const sajuDataForRAG = {
        dayStem: reading.day_stem,
        dayBranch: reading.day_branch,
        monthStem: reading.month_stem,
        monthBranch: reading.month_branch,
        yearStem: reading.year_stem,
        yearBranch: reading.year_branch,
        hourStem: reading.hour_stem,
        hourBranch: reading.hour_branch,
        dominantElement: reading.dominant_element,
        weakElement: reading.weakest_element,
      };
      const ragContext = await buildRAGContext(
        sajuDataForRAG, 'paid', (locale as 'ko' | 'en' | 'ja')
      );
      ragPrefix = ragContext.contextText || "";

      // Build citation metadata for frontend UI
      if (ragContext.citations && ragContext.citations.length > 0) {
        citationMeta = {
          totalCorpusSize: 562,
          sourceCount: new Set(ragContext.citations.map((c: any) => c.source_name_ko)).size,
          matchCount: ragContext.citations.length,
          topSimilarity: Math.round(Math.max(...ragContext.citations.map((c: any) => c.similarity)) * 1000) / 1000,
          queryDimensions: 1536,
          dayMaster: reading.day_stem,
          monthBranch: reading.month_branch,
          citations: ragContext.citations.map((c: any) => ({
            source: '',
            source_name_ko: c.source_name_ko,
            source_name_cn: c.source_name_cn,
            chapter: c.chapter,
            excerpt: c.excerpt,
            similarity: Math.round(c.similarity * 1000) / 1000,
          })),
        };
        // Save citation metadata to DB immediately (before parallel generation)
        await patchDB(supabaseUrl, dbHeaders, shareSlug, { citation_meta: citationMeta } as any);
      }
    } catch (ragErr) {
      console.warn("RAG context failed (continuing without):", ragErr);
      ragPrefix = "";
    }

    // Track success count across all parts
    let successCount = 0;

    const part1Promise = (async () => {
      const result = await generatePart(
        () => ragPrefix + buildPaidPromptPart1(chartSummary, locale),
        "Part1-Career+Love", locale, ["career", "love"]
      );
      if (result) {
        const patch: Record<string, string> = {};
        if (result.career) patch.paid_reading_career = result.career;
        if (result.love) patch.paid_reading_love = result.love;
        if (Object.keys(patch).length > 0) {
          await patchDB(supabaseUrl, dbHeaders, shareSlug, patch);
          successCount += Object.keys(patch).length;
        }
      }
      return result;
    })();

    const part2Promise = (async () => {
      const result = await generatePart(
        () => ragPrefix + buildPaidPromptPart2(chartSummary, currentYear, locale),
        "Part2-Health+Decade", locale, ["health", "decade_forecast"]
      );
      if (result) {
        const patch: Record<string, string> = {};
        if (result.health) patch.paid_reading_health = result.health;
        if (result.decade_forecast) patch.paid_reading_decade = result.decade_forecast;
        if (Object.keys(patch).length > 0) {
          await patchDB(supabaseUrl, dbHeaders, shareSlug, patch);
          successCount += Object.keys(patch).length;
        }
      }
      return result;
    })();

    const part3Promise = (async () => {
      const result = await generatePart(
        () => ragPrefix + buildPaidPromptPart3(chartSummary, locale),
        "Part3-Monthly+Talent", locale, ["monthly_energy", "hidden_talent"]
      );
      if (result) {
        const patch: Record<string, string> = {};
        if (result.monthly_energy) patch.paid_reading_monthly = result.monthly_energy;
        if (result.hidden_talent) patch.paid_reading_hidden_talent = result.hidden_talent;
        if (Object.keys(patch).length > 0) {
          await patchDB(supabaseUrl, dbHeaders, shareSlug, patch);
          successCount += Object.keys(patch).length;
        }
      }
      return result;
    })();

    await Promise.all([part1Promise, part2Promise, part3Promise]);

    if (successCount === 0) {
      return NextResponse.json({ error: "AI generation failed after multiple retries" }, { status: 500 });
    }

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
