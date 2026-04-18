import { NextRequest, NextResponse } from "next/server";
import { buildFreeReadingPrompt, generateShareSlug } from "@/lib/reading-prompts";
import { getSystemInstruction } from "@/lib/prompt-locale";
import { injectRAGIntoPrompt } from "@/lib/rag/prompt-injector";
import type { SajuChart } from "@/lib/saju-calculator";

// Serverless = 60s on Pro (Edge is always 25s even on Pro)
export const maxDuration = 60;

// ═══ AI ENGINE: Gemini Pro → Claude Sonnet → Claude Haiku ═══
async function callGemini(prompt: string, model = "gemini-2.5-flash", locale = "en"): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY || "";
  if (!apiKey) throw new Error("Gemini not configured");

  const genConfig: any = {
    maxOutputTokens: 4000,
    temperature: 0.7,
    thinkingConfig: { thinkingBudget: 0 },
  };
  if (locale === "en") {
    genConfig.responseMimeType = "application/json";
  }

  const body: any = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: genConfig,
  };

  // Add systemInstruction for KO/JA — forces correct language output
  const sysInstr = getSystemInstruction(locale);
  if (sysInstr) {
    body.systemInstruction = { parts: [{ text: sysInstr }] };
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini ${res.status}: ${err.substring(0, 200)}`);
  }
  const data = await res.json();
  // Gemini 2.5 Flash returns thinking parts (thought:true) — skip them
  const parts = data.candidates?.[0]?.content?.parts || [];
  const textParts = parts.filter((p: any) => p.text && !p.thought);
  if (textParts.length === 0) {
    // Fallback: try all text parts if no non-thought parts found
    const allText = parts.filter((p: any) => p.text).map((p: any) => p.text).join("");
    if (allText) return allText;
    console.error("Gemini empty response. Parts:", JSON.stringify(parts).substring(0, 500));
    throw new Error("Gemini returned empty response");
  }
  return textParts.map((p: any) => p.text).join("");
}

async function callClaude(prompt: string, model: string): Promise<string> {
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
      max_tokens: 2500,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude ${model} ${res.status}: ${err.substring(0, 200)}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

async function generateWithFallback(prompt: string, locale = "en"): Promise<string> {
  // KO/JA: Gemini Pro first (Flash often ignores language instructions)
  const engines = locale !== "en"
    ? [
        { name: "Gemini-Pro",   fn: () => callGemini(prompt, "gemini-2.5-pro", locale) },
        { name: "Gemini-Flash", fn: () => callGemini(prompt, "gemini-2.5-flash", locale) },
        { name: "Haiku",        fn: () => callClaude(prompt, "claude-haiku-4-5-20251001") },
      ]
    : [
        { name: "Gemini-Flash", fn: () => callGemini(prompt, "gemini-2.5-flash", locale) },
        { name: "Gemini-Pro",   fn: () => callGemini(prompt, "gemini-2.5-pro", locale) },
        { name: "Haiku",        fn: () => callClaude(prompt, "claude-haiku-4-5-20251001") },
      ];

  for (let i = 0; i < engines.length; i++) {
    try {
      if (i > 0) await new Promise((r) => setTimeout(r, 1500));
      const result = await engines[i].fn();
      if (result) return result;
    } catch (err) {
      console.warn(`Free reading: ${engines[i].name} failed`, err instanceof Error ? err.message : err);
      if (i === engines.length - 1) throw err;
    }
  }
  throw new Error("All AI engines failed");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const chart = body.chart as SajuChart;
    const userId = body.userId || null;
    const locale = body.locale || "en";
    const clientBirthDateStr = body.birthDateStr || null;

    if (!chart || !chart.name || !chart.dayMaster) {
      return NextResponse.json({ error: "Invalid chart data" }, { status: 400 });
    }
    if (!chart.pillars?.year?.stem?.zh || !chart.pillars?.month?.stem?.zh ||
        !chart.pillars?.day?.stem?.zh || !chart.pillars?.hour?.stem?.zh) {
      return NextResponse.json({ error: "Incomplete pillar data" }, { status: 400 });
    }

    if (typeof chart.birthDate === "string") {
      chart.birthDate = new Date(chart.birthDate);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    const dbHeaders = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, "Content-Type": "application/json" };

    let birthDateStr: string;
    if (clientBirthDateStr && /^\d{4}-\d{2}-\d{2}$/.test(clientBirthDateStr)) {
      birthDateStr = clientBirthDateStr;
    } else if (chart.birthDate instanceof Date) {
      const d = chart.birthDate;
      birthDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    } else {
      birthDateStr = String(chart.birthDate).split("T")[0];
    }

    const ys = chart.pillars.year.stem.zh, yb = chart.pillars.year.branch.zh;
    const ms = chart.pillars.month.stem.zh, mb = chart.pillars.month.branch.zh;
    const ds = chart.pillars.day.stem.zh, db = chart.pillars.day.branch.zh;
    const hs = chart.pillars.hour.stem.zh, hb = chart.pillars.hour.branch.zh;

    // ═══ RATE LIMITING — prevent AI API cost abuse ═══
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    try {
      const rateRes = await fetch(`${supabaseUrl}/rest/v1/readings?${new URLSearchParams({
        name: `eq.${chart.name}`, birth_date: `eq.${birthDateStr}`,
        created_at: `gte.${fiveMinAgo}`, select: "id", limit: "5",
      })}`, { headers: dbHeaders });
      if (rateRes.ok) {
        const recent = await rateRes.json();
        if (recent && recent.length >= 3) {
          return NextResponse.json({ error: "Too many requests. Please wait a few minutes." }, { status: 429 });
        }
      }
    } catch { /* rate limit check failed — allow through */ }

    // ═══ EXACT MATCH CHECK — same person gets same slug (no AI re-generation) ═══
    // Match includes birth_hour to avoid collisions (e.g., two "Mike" born same day in same city)
    // Also requires citation_meta to exist — old readings without RAG get regenerated
    try {
      const exactRes = await fetch(`${supabaseUrl}/rest/v1/readings?${new URLSearchParams({
        name: `eq.${chart.name}`, gender: `eq.${chart.gender}`,
        birth_date: `eq.${birthDateStr}`, birth_city: `eq.${chart.birthCity}`,
        birth_hour: `eq.${chart.birthHour ?? 12}`,
        select: "share_slug,citation_meta", limit: "1",
      })}`, { headers: dbHeaders });
      if (exactRes.ok) {
        const exactData = await exactRes.json();
        if (exactData?.length > 0 && exactData[0].share_slug && exactData[0].citation_meta) {
          if (userId) {
            await fetch(`${supabaseUrl}/rest/v1/readings?share_slug=eq.${exactData[0].share_slug}&user_id=is.null`, {
              method: "PATCH",
              headers: { ...dbHeaders, Prefer: "return=minimal" },
              body: JSON.stringify({ user_id: userId }),
            }).catch(() => {});
          }
          return NextResponse.json({ success: true, shareSlug: exactData[0].share_slug, existing: true });
        }
      }
    } catch { /* exact check failed — generate new */ }

    // ═══ GENERATE — with RAG injection ═══
    const basePrompt = buildFreeReadingPrompt(chart, locale);

    // RAG: 사주 특성을 기준으로 고전 원전 검색 → 프롬프트에 주입
    // 실패 시 basePrompt 그대로 사용 (폴백)
    const sajuDataForRAG = {
      dayStem: ds,
      dayBranch: db,
      monthStem: ms,
      monthBranch: mb,
      yearStem: ys,
      yearBranch: yb,
      hourStem: hs,
      hourBranch: hb,
      dominantElement: chart.dominantElement,
      weakElement: chart.weakestElement,
    };
    const { prompt, citations: ragCitations } = await injectRAGIntoPrompt(
      basePrompt, sajuDataForRAG, 'free', locale as 'ko' | 'en' | 'ja' | 'es' | 'fr' | 'pt' | 'zh-TW' | 'ru' | 'hi'
    );

    // Build citation metadata for frontend UI
    const citationMeta = ragCitations && ragCitations.length > 0 ? {
      totalCorpusSize: 562,
      sourceCount: new Set(ragCitations.map((c: any) => c.source_name_ko)).size,
      matchCount: ragCitations.length,
      topSimilarity: Math.round(Math.max(...ragCitations.map((c: any) => c.similarity)) * 1000) / 1000,
      queryDimensions: 1536,
      dayMaster: ds,
      monthBranch: mb,
      citations: ragCitations.map((c: any) => ({
        source: '',
        source_name_ko: c.source_name_ko,
        source_name_cn: c.source_name_cn,
        chapter: c.chapter,
        excerpt: c.excerpt,
        similarity: Math.round(c.similarity * 1000) / 1000,
      })),
    } : null;

    const rawText = await generateWithFallback(prompt, locale);

    // ═══ LANGUAGE CORRECTION — if KO/JA/ES requested but English returned, try Claude ═══
    let finalText = rawText;
    if (locale !== "en" && rawText) {
      const sample = rawText.substring(0, 200);
      let isCorrectLang: boolean;
      if (locale === "ko") {
        isCorrectLang = /[\uAC00-\uD7AF]/.test(sample);
      } else if (locale === "ja") {
        isCorrectLang = /[\u3040-\u309F\u30A0-\u30FF]/.test(sample);
      } else if (locale === "es") {
        // Spanish uses Latin script (same as English), so we detect by:
        // (1) presence of Spanish-specific characters (ñ, ¿, ¡, accents),
        // (2) presence of common Spanish stopwords, and
        // (3) absence of overwhelming English stopwords.
        const hasSpanishChars = /[ñÑ¿¡áéíóúÁÉÍÓÚ]/.test(sample);
        const hasSpanishStopwords = /\b(el|la|los|las|de|que|en|un|una|es|eres|son|y|o|pero|tu|tú|tus|con|para|por|como|del|al|se|su|sus|este|esta|estos|estas|más|pero|porque|cuando)\b/i.test(sample);
        const hasEnglishStopwords = /\b(the|and|your|you are|this|that|with|from|what|when|which|their|these|those)\b/i.test(sample);
        // Spanish if we see Spanish markers AND Spanish isn't overwhelmed by English
        isCorrectLang = (hasSpanishChars || hasSpanishStopwords) && !(hasEnglishStopwords && !hasSpanishStopwords);
      } else if (locale === "fr") {
        // French uses Latin script (same as English), detected by:
        // (1) French-specific characters (à, â, ç, é, è, ê, ë, î, ï, ô, ù, û, ü, ÿ, œ),
        // (2) common French stopwords (le, la, les, tu, etc.),
        // (3) French-specific apostrophe contractions (l', d', n', s', etc.),
        // (4) absence of overwhelming English stopwords.
        const hasFrenchChars = /[àâçéèêëîïôùûüÿœÀÂÇÉÈÊËÎÏÔÙÛÜŸŒ]/.test(sample);
        const hasFrenchStopwords = /\b(le|la|les|de|du|des|que|en|un|une|est|es|sont|et|ou|mais|tu|tes|ton|ta|avec|pour|par|comme|au|aux|se|son|ses|ce|cette|ces|plus|parce|quand|qui|qu)\b/i.test(sample);
        const hasFrenchApostrophe = /\b[lndsjmtcLNDSJMTC]'[a-zA-ZàâçéèêëîïôùûüÿœÀÂÇÉÈÊËÎÏÔÙÛÜŸŒ]/.test(sample);
        const hasEnglishStopwords = /\b(the|and|your|you are|this|that|with|from|what|when|which|their|these|those)\b/i.test(sample);
        // French if we see French markers AND French isn't overwhelmed by English
        isCorrectLang = (hasFrenchChars || hasFrenchStopwords || hasFrenchApostrophe) && !(hasEnglishStopwords && !hasFrenchStopwords && !hasFrenchChars);
      } else if (locale === "pt") {
        // Portuguese uses Latin script (same as English), detected by:
        // (1) Portuguese-specific characters (ã, õ, ç, á, é, í, ó, ú, â, ê, ô),
        // (2) common Portuguese stopwords (você, é, são, está, etc.),
        // (3) absence of overwhelming English stopwords.
        // Brazilian Portuguese standard: "você" form, not "tu".
        const hasPortugueseChars = /[ãõçáéíóúâêôÃÕÇÁÉÍÓÚÂÊÔ]/.test(sample);
        const hasPortugueseStopwords = /\b(o|a|os|as|de|do|da|dos|das|que|em|no|na|nos|nas|um|uma|é|são|está|estão|você|seu|sua|seus|suas|com|para|por|como|e|ou|mas|se|este|esta|estes|estas|isso|mais|porque|quando|também|muito|já)\b/i.test(sample);
        const hasEnglishStopwords = /\b(the|and|your|you are|this|that|with|from|what|when|which|their|these|those)\b/i.test(sample);
        isCorrectLang = (hasPortugueseChars || hasPortugueseStopwords) && !(hasEnglishStopwords && !hasPortugueseStopwords && !hasPortugueseChars);
      } else if (locale === "zh-TW") {
        // Traditional Chinese: presence of CJK ideographs (U+4E00–U+9FFF range)
        // AND absence of Korean Hangul or Japanese Kana (which would indicate
        // misclassification). Note: simplified vs traditional differentiation
        // is not enforced here since Gemini honors the system instruction.
        const hasCJK = /[\u4E00-\u9FFF]/.test(sample);
        const hasHangul = /[\uAC00-\uD7AF]/.test(sample);
        const hasKana = /[\u3040-\u309F\u30A0-\u30FF]/.test(sample);
        isCorrectLang = hasCJK && !hasHangul && !hasKana;
      } else if (locale === "ru") {
        // Russian: Cyrillic script (U+0400–U+04FF). Trivially distinguishable
        // from Latin/Hangul/Kana/CJK. A few Cyrillic chars are enough.
        isCorrectLang = /[\u0400-\u04FF]/.test(sample);
      } else if (locale === "hi") {
        // Hindi: Devanagari script (U+0900–U+097F). Unambiguous detection.
        isCorrectLang = /[\u0900-\u097F]/.test(sample);
      } else {
        isCorrectLang = true;
      }
      if (!isCorrectLang) {
        try {
          const corrected = await callClaude(prompt, "claude-haiku-4-5-20251001");
          if (corrected) finalText = corrected;
        } catch { /* Claude failed — keep English original */ }
      }
    }

    // ═══ Normalize keys: Gemini may localize JSON keys in KO/JA ═══
    function normalizeReadingKeys(obj: any): { personality: string; year_forecast: string; element_guidance: string } {
      const keyMap: Record<string, string> = {
        personality: "personality", "\uC131\uACA9": "personality", "\u6027\u683C": "personality", "\u30D1\u30FC\u30BD\u30CA\u30EA\u30C6\u30A3": "personality",
        year_forecast: "year_forecast", "\uC62C\uD574\uC6B4\uC138": "year_forecast", "\uC62C\uD574_\uC6B4\uC138": "year_forecast", "\uB144\uD574\uC6B4\uC138": "year_forecast",
        "\u4ECA\u5E74\u306E\u904B\u52E2": "year_forecast", "\u4ECA\u5E74\u904B\u52E2": "year_forecast", "\u4ECA\u5E74\u904B": "year_forecast",
        element_guidance: "element_guidance", "\uC624\uD589\uC870\uC5B8": "element_guidance", "\uC624\uD589_\uC870\uC5B8": "element_guidance", "\uC624\uD589\uAC00\uC774\uB4DC": "element_guidance",
        "\u4E94\u884C\u30A2\u30C9\u30D0\u30A4\u30B9": "element_guidance", "\u30A8\u30EC\u30E1\u30F3\u30C8\u30AC\u30A4\u30C0\u30F3\u30B9": "element_guidance", "\u4E94\u884C\u6307\u5357": "element_guidance",
      };
      const normalized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const mapped = keyMap[key] || keyMap[key.toLowerCase().replace(/[\s_-]/g, "")] || key;
        normalized[mapped] = value;
      }
      return normalized as any;
    }

    let aiReading: { personality: string; year_forecast: string; element_guidance: string };
    try {
      const cleaned = finalText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      aiReading = normalizeReadingKeys(JSON.parse(cleaned));
    } catch {
      try {
        // Try to extract any JSON object from the response
        const jsonMatch = finalText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiReading = normalizeReadingKeys(JSON.parse(jsonMatch[0]));
        } else {
          console.error("No JSON found in AI response. Raw (first 500):", finalText.substring(0, 500));
          return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
        }
      } catch (e2) {
        console.error("JSON parse error:", e2, "Raw (first 500):", finalText.substring(0, 500));
        return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
      }
    }

    if (!aiReading.personality || !aiReading.year_forecast || !aiReading.element_guidance) {
      return NextResponse.json({ error: "Incomplete AI response" }, { status: 500 });
    }

    const shareSlug = generateShareSlug();
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/readings`, {
      method: "POST", headers: { ...dbHeaders, Prefer: "return=minimal" },
      body: JSON.stringify({
        name: chart.name, gender: chart.gender, birth_date: birthDateStr,
        birth_hour: chart.birthHour ?? 12, birth_city: chart.birthCity,
        year_stem: ys, year_branch: yb, month_stem: ms, month_branch: mb,
        day_stem: ds, day_branch: db, hour_stem: hs, hour_branch: hb,
        day_master_element: chart.dayMaster.element, day_master_yinyang: chart.dayMaster.yinYang,
        archetype: chart.archetype, ten_god: chart.tenGod, harmony_score: chart.harmonyScore,
        dominant_element: chart.dominantElement, weakest_element: chart.weakestElement,
        elements_wood: chart.elements.wood, elements_fire: chart.elements.fire,
        elements_earth: chart.elements.earth, elements_metal: chart.elements.metal, elements_water: chart.elements.water,
        free_reading_personality: aiReading.personality, free_reading_year: aiReading.year_forecast,
        free_reading_element: aiReading.element_guidance, share_slug: shareSlug, is_paid: false, locale, birth_hour_unknown: chart.birthHourUnknown || false,
        ...(userId ? { user_id: userId } : {}),
        ...(citationMeta ? { citation_meta: citationMeta } : {}),
      }),
    });

    if (!insertRes.ok) {
      const errText = await insertRes.text().catch(() => "unknown");
      console.error("DB insert failed:", insertRes.status, errText);
      return NextResponse.json({ error: `DB insert failed (${insertRes.status})` }, { status: 500 });
    }

    return NextResponse.json({ success: true, shareSlug });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown";
    return NextResponse.json({ error: "Server error: " + message }, { status: 500 });
  }
}
