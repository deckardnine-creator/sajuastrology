import { NextRequest, NextResponse } from "next/server";
import { calculateSaju } from "@/lib/saju-calculator";
import { calculateAdvancedSaju } from "@/lib/saju-advanced";
import { buildFreeReadingPrompt, generateShareSlug } from "@/lib/reading-prompts";
import { getSystemInstruction } from "@/lib/prompt-locale";
import { injectRAGIntoPrompt } from "@/lib/rag/prompt-injector";
import { CITIES } from "@/lib/cities-data";

export const maxDuration = 120;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";
const dbHeaders = {
  "Content-Type": "application/json",
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
};

// ═══ AI ENGINE ═══
async function callGemini(prompt: string, model = "gemini-2.5-flash", locale = "en"): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY || "";
  if (!apiKey) throw new Error("Gemini not configured");

  const genConfig: any = {
    maxOutputTokens: 4000,
    temperature: 0.7,
  };
  // Only use thinkingConfig for models that support thinkingBudget: 0
  if (model === "gemini-2.5-flash") {
    genConfig.thinkingConfig = { thinkingBudget: 0 };
  }
  // Gemini Pro requires thinking mode — set minimum budget
  if (model === "gemini-2.5-pro") {
    genConfig.thinkingConfig = { thinkingBudget: 1024 };
  }
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
    throw new Error(`Gemini ${model} ${res.status}: ${err.substring(0, 200)}`);
  }
  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const textParts = parts.filter((p: any) => p.text && !p.thought);
  if (textParts.length === 0) {
    const allText = parts.filter((p: any) => p.text).map((p: any) => p.text).join("");
    if (allText) return allText;
    throw new Error(`Gemini ${model} returned empty response`);
  }
  return textParts.map((p: any) => p.text).join("");
}

async function callClaude(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY || "";
  if (!apiKey) throw new Error("Claude not configured");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 2500, messages: [{ role: "user", content: prompt }] }),
  });
  if (!res.ok) throw new Error(`Claude ${res.status}: ${(await res.text()).substring(0, 200)}`);
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

async function generateAI(prompt: string, locale = "en"): Promise<string> {
  const useProFirst = locale !== "en";
  const first = useProFirst ? "gemini-2.5-pro" : "gemini-2.5-flash";
  const second = useProFirst ? "gemini-2.5-flash" : "gemini-2.5-pro";
  try { return await callGemini(prompt, first, locale); } catch (e1) {
    console.warn(`generate-app: ${first} failed:`, e1 instanceof Error ? e1.message : e1);
    try { return await callGemini(prompt, second, locale); } catch (e2) {
      console.warn(`generate-app: ${second} failed, trying Claude:`, e2 instanceof Error ? e2.message : e2);
      return await callClaude(prompt);
    }
  }
}

function normalizeKeys(obj: any): any {
  const keyMap: Record<string, string> = {
    personality: "personality", "\uC131\uACA9": "personality", "\u6027\u683C": "personality",
    year_forecast: "year_forecast", "\uC62C\uD574\uC6B4\uC138": "year_forecast", "\uC62C\uD574_\uC6B4\uC138": "year_forecast",
    "\u4ECA\u5E74\u306E\u904B\u52E2": "year_forecast", "\u4ECA\u5E74\u904B\u52E2": "year_forecast",
    element_guidance: "element_guidance", "\uC624\uD589\uC870\uC5B8": "element_guidance", "\uC624\uD589_\uC870\uC5B8": "element_guidance",
    "\u4E94\u884C\u30A2\u30C9\u30D0\u30A4\u30B9": "element_guidance", "\u4E94\u884C\u6307\u5357": "element_guidance",
  };
  const out: any = {};
  for (const [k, v] of Object.entries(obj)) {
    out[keyMap[k] || keyMap[k.toLowerCase().replace(/[\s_-]/g, "")] || k] = v;
  }
  return out;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, gender, birthYear, birthMonth, birthDay, birthHour, birthMinute, birthCity, locale } = body;

    if (!name || !gender || !birthYear || !birthMonth || !birthDay) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
    const hour = birthHour ?? 12;
    const city = birthCity || "Seoul";
    const birthDateStr = `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`;
    const loc = locale || "en";

    // Calculate chart with true solar time correction
    const cityData = CITIES.find(c => c.name.toLowerCase() === city.toLowerCase());
    const solarOptions = cityData && birthMinute != null
      ? { longitude: cityData.longitude, birthMinute: birthMinute ?? 0, timezone: cityData.timezone }
      : undefined;
    const basicChart = calculateSaju(name, gender, birthDate, hour, city, solarOptions);
    const advancedChart = calculateAdvancedSaju(basicChart);
    const chart = { ...basicChart, ...advancedChart, name, gender, birthCity: city, birthHour: hour };

    const ys = chart.pillars.year.stem.zh, yb = chart.pillars.year.branch.zh;
    const ms = chart.pillars.month.stem.zh, mb = chart.pillars.month.branch.zh;
    const ds = chart.pillars.day.stem.zh, db = chart.pillars.day.branch.zh;
    const hs = chart.pillars.hour.stem.zh, hb = chart.pillars.hour.branch.zh;

    // ═══ CACHE: only return if AI text exists ═══
    // When an incomplete row already exists (e.g. chart-only shell produced
    // by the auto-create helper used after compat / consultation, or a
    // previous generate-app attempt that died mid-way) we capture its
    // share_slug and UPDATE that row in place at the save step. This
    // preserves user_id, share_slug and citation_meta — the key invariant
    // is that any reading linked to a user via user_id must NOT be deleted,
    // because the dashboard and share links depend on that row's identity.
    let existingShareSlug: string | null = null;
    try {
      const cacheRes = await fetch(`${supabaseUrl}/rest/v1/readings?${new URLSearchParams({
        name: `eq.${name}`, gender: `eq.${gender}`,
        birth_date: `eq.${birthDateStr}`, birth_city: `eq.${city}`, birth_hour: `eq.${hour}`,
        select: "share_slug,free_reading_personality",
        limit: "1",
      })}`, { headers: dbHeaders });
      if (cacheRes.ok) {
        const cached = await cacheRes.json();
        if (cached?.[0]?.share_slug && cached[0].free_reading_personality && cached[0].free_reading_personality.length > 20) {
          // Locale check: skip cache if language doesn't match request
          const sample = cached[0].free_reading_personality.substring(0, 200);
          const cachedLocale = /[\uAC00-\uD7AF]/.test(sample) ? "ko" : /[\u3040-\u309F\u30A0-\u30FF]/.test(sample) ? "ja" : "en";
          if (cachedLocale === loc) {
            return NextResponse.json({ success: true, shareSlug: cached[0].share_slug, existing: true });
          }
          // Language mismatch — fall through to regenerate (update in place)
          existingShareSlug = cached[0].share_slug;
        }
        // Incomplete record — capture slug so we can UPDATE it in place
        // (previously this path DELETEd the row, which orphaned any user_id
        // that ensureUserReading had set on the chart-only shell).
        if (cached?.[0]?.share_slug && (!cached[0].free_reading_personality || cached[0].free_reading_personality.length <= 20)) {
          existingShareSlug = cached[0].share_slug;
        }
      }
    } catch {}

    // ═══ RAG ═══
    let ragPrefix = "";
    let citationMeta: any = null;
    try {
      const sajuData = { dayStem: ds, dayBranch: db, monthStem: ms, monthBranch: mb, yearStem: ys, yearBranch: yb, hourStem: hs, hourBranch: hb, dominantElement: chart.dominantElement, weakElement: chart.weakestElement };
      const { prompt: ragPrompt, citations } = await injectRAGIntoPrompt(
        buildFreeReadingPrompt(chart, loc), sajuData, 'free', loc as 'ko' | 'en' | 'ja'
      );
      ragPrefix = ragPrompt;
      if (citations?.length > 0) {
        citationMeta = {
          totalCorpusSize: 562,
          sourceCount: new Set(citations.map((c: any) => c.source_name_ko)).size,
          matchCount: citations.length,
          topSimilarity: Math.round(Math.max(...citations.map((c: any) => c.similarity)) * 1000) / 1000,
          queryDimensions: 1536, dayMaster: ds, monthBranch: mb,
          citations: citations.map((c: any) => ({ source: '', source_name_ko: c.source_name_ko, source_name_cn: c.source_name_cn, chapter: c.chapter, excerpt: c.excerpt, similarity: Math.round(c.similarity * 1000) / 1000 })),
        };
      }
    } catch (ragErr) {
      console.warn("generate-app RAG failed:", ragErr);
      ragPrefix = buildFreeReadingPrompt(chart, loc);
    }

    // ═══ AI GENERATION ═══
    const rawText = await generateAI(ragPrefix, loc);

    // ═══ LANGUAGE CORRECTION — if KO/JA requested but English returned, try Claude ═══
    let finalText = rawText;
    if (loc !== "en" && rawText) {
      const sample = rawText.substring(0, 200);
      const isCorrectLang = loc === "ko"
        ? /[\uAC00-\uD7AF]/.test(sample)
        : /[\u3040-\u309F\u30A0-\u30FF]/.test(sample);
      if (!isCorrectLang) {
        try {
          const corrected = await callClaude(ragPrefix);
          if (corrected) finalText = corrected;
        } catch { /* Claude failed — keep English original */ }
      }
    }

    let aiReading: any;
    try {
      const cleaned = finalText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      aiReading = normalizeKeys(JSON.parse(cleaned));
    } catch {
      const m = finalText.match(/\{[\s\S]*\}/);
      if (m) aiReading = normalizeKeys(JSON.parse(m[0]));
      else return NextResponse.json({ error: "AI parse failed" }, { status: 500 });
    }

    if (!aiReading.personality || !aiReading.year_forecast || !aiReading.element_guidance) {
      console.error("generate-app: Incomplete AI. Keys:", Object.keys(aiReading));
      return NextResponse.json({ error: "Incomplete AI response" }, { status: 500 });
    }

    // ═══ SAVE ═══
    // Two paths:
    //  (A) existingShareSlug captured from cache block → PATCH in place.
    //      This preserves user_id (key for dashboard ownership), the
    //      stable share_slug (bookmarks / share links do not break), any
    //      prior citation_meta, and the birth_hour_unknown flag set by
    //      ensureUserReading. We only overwrite chart + AI fields.
    //  (B) No existing slug → INSERT new row (original behaviour, intact).
    let saveRes: Response;
    let shareSlug: string;

    if (existingShareSlug) {
      shareSlug = existingShareSlug;
      saveRes = await fetch(`${supabaseUrl}/rest/v1/readings?share_slug=eq.${encodeURIComponent(existingShareSlug)}`, {
        method: "PATCH", headers: { ...dbHeaders, Prefer: "return=minimal" },
        body: JSON.stringify({
          // Chart fields — refresh in case any were stale on an old shell
          year_stem: ys, year_branch: yb, month_stem: ms, month_branch: mb,
          day_stem: ds, day_branch: db, hour_stem: hs, hour_branch: hb,
          day_master_element: chart.dayMaster.element, day_master_yinyang: chart.dayMaster.yinYang,
          archetype: chart.archetype, ten_god: chart.tenGod, harmony_score: chart.harmonyScore,
          dominant_element: chart.dominantElement, weakest_element: chart.weakestElement,
          elements_wood: chart.elements.wood, elements_fire: chart.elements.fire,
          elements_earth: chart.elements.earth, elements_metal: chart.elements.metal, elements_water: chart.elements.water,
          // AI fields — the whole point of this request
          free_reading_personality: aiReading.personality,
          free_reading_year: aiReading.year_forecast,
          free_reading_element: aiReading.element_guidance,
          locale: loc,
          ...(citationMeta ? { citation_meta: citationMeta } : {}),
          // Intentionally NOT touched: user_id, share_slug, birth_hour_unknown,
          // is_paid, payment_method, paid_at, paid_reading_*, customer_email,
          // paypal_order_id, created_at. PATCH semantics leave these intact.
        }),
      });
    } else {
      shareSlug = generateShareSlug();
      saveRes = await fetch(`${supabaseUrl}/rest/v1/readings`, {
        method: "POST", headers: { ...dbHeaders, Prefer: "return=minimal" },
        body: JSON.stringify({
          name, gender, birth_date: birthDateStr, birth_hour: hour, birth_city: city,
          year_stem: ys, year_branch: yb, month_stem: ms, month_branch: mb,
          day_stem: ds, day_branch: db, hour_stem: hs, hour_branch: hb,
          day_master_element: chart.dayMaster.element, day_master_yinyang: chart.dayMaster.yinYang,
          archetype: chart.archetype, ten_god: chart.tenGod, harmony_score: chart.harmonyScore,
          dominant_element: chart.dominantElement, weakest_element: chart.weakestElement,
          elements_wood: chart.elements.wood, elements_fire: chart.elements.fire,
          elements_earth: chart.elements.earth, elements_metal: chart.elements.metal, elements_water: chart.elements.water,
          free_reading_personality: aiReading.personality, free_reading_year: aiReading.year_forecast,
          free_reading_element: aiReading.element_guidance, share_slug: shareSlug, is_paid: false, locale: loc,
          ...(citationMeta ? { citation_meta: citationMeta } : {}),
        }),
      });
    }

    if (!saveRes.ok) {
      const err = await saveRes.text().catch(() => "unknown");
      console.error(`generate-app DB save failed (${existingShareSlug ? "PATCH" : "INSERT"}):`, saveRes.status, err);
      return NextResponse.json({ error: "DB save failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, shareSlug });
  } catch (err: any) {
    console.error("generate-app error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
