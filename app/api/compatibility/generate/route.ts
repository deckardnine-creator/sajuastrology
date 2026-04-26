import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { calculateSaju, type SajuChart } from "@/lib/saju-calculator";
import { calculateCompatibility } from "@/lib/compatibility-calculator";
import { getSystemInstruction } from "@/lib/prompt-locale";
import {
  buildFreeCompatibilityPrompt,
  buildPaidCompatPrompt1,
  buildPaidCompatPrompt2,
  buildPaidCompatPrompt3,
} from "@/lib/compatibility-prompts";
import { buildRAGContext } from "@/lib/rag/prompt-injector";

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

function generateSlug(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let slug = "c-";
  for (let i = 0; i < 8; i++) slug += chars[Math.floor(Math.random() * chars.length)];
  return slug;
}

function toBirthDateStr(d: Date | string): string {
  if (typeof d === "string") return d.split("T")[0];
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ═══ AI ENGINE: Gemini Pro → Claude Sonnet → Claude Haiku ═══

async function callGemini(prompt: string, label: string, model = "gemini-2.5-flash", locale = "en"): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY || "";
  if (!apiKey) throw new Error("Gemini not configured");

  const genConfig: any = {
    // 8000: previous 5000 caused truncation on long compatibility readings
    // (citations + detailed analysis), leaving the JSON response cut off
    // mid-string with no closing quote. This triggered parseJSON to fail
    // and the raw JSON wrapper to be stored as freeSummary, which showed
    // up in the UI as literal {"summary": "..." text.
    maxOutputTokens: 8000,
    // Force JSON output for ALL locales. Previously KO/JA were omitted, which
    // caused Gemini to return plain text and parseJSON to fail downstream,
    // resulting in empty paidData and NULL paid_* columns in the DB. JSON
    // mode does not affect output language — Gemini honors the locale-specific
    // system instruction and returns localized strings inside the JSON object.
    responseMimeType: "application/json",
  };

  // Only send thinkingBudget:0 to Flash. Gemini 2.5 Pro rejects this parameter
  // (Pro requires dynamic thinking mode and returns 400 if thinkingBudget is
  // hard-set to 0). Same bug/fix as consultation route.
  if (model.includes("flash")) {
    genConfig.thinkingConfig = { thinkingBudget: 0 };
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
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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

async function callClaudeFallback(prompt: string, label: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY || "";
  if (!apiKey) throw new Error("Claude not configured");

  const models = ["claude-sonnet-4-20250514", "claude-haiku-4-5-20251001"];
  for (let i = 0; i < models.length; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, 2000));
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: models[i],
        max_tokens: 3000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) {
      if ((res.status === 529 || res.status === 500) && i < models.length - 1) {
        console.warn(`${label}: ${models[i]} ${res.status} — trying next`);
        continue;
      }
      const err = await res.text();
      throw new Error(`${label}: Claude ${res.status} — ${err.substring(0, 200)}`);
    }
    const data = await res.json();
    return data.content?.[0]?.text || "";
  }
  throw new Error(`${label}: all Claude models exhausted`);
}

// ════════════════════════════════════════════════════════════════════
// v6.17.28 — Per-locale language verification
// ════════════════════════════════════════════════════════════════════
// Detects whether a generated text matches the requested locale. Used
// for paid_* fields (love/work/friendship/conflict/yearly) AND extends
// to English (the original implementation only checked KO/JA/ES, which
// allowed the LLM to leak Chinese characters from RAG passages into
// English responses — which is exactly what happened to chandler's
// c-kcd55vza row).
//
// For each locale we sample the first 300 chars and apply a heuristic:
//   - en: must NOT contain CJK ideographs (excluding the brief 甲乙
//     stem/branch tokens which appear in any locale via classical refs).
//     We allow up to 30 CJK chars in 300 (i.e., scattered classical
//     citations are OK, but a paragraph in Chinese is not).
//   - ko: must contain Hangul.
//   - ja: must contain hiragana or katakana.
//   - es: Spanish-specific stopwords or accented chars, no English
//     stopwords. Mirrors the existing free_summary check.
//   - fr/pt/ru/hi/id/zh-TW: best-effort detection. zh-TW must contain
//     CJK; ru must contain Cyrillic; hi must contain Devanagari; id/fr/pt
//     fall back to "non-English wins" (must NOT match >30% English
//     stopwords if the requested locale is non-English).
//
// Returns true if the text matches the locale, false if it should be
// re-generated via Claude.
// ════════════════════════════════════════════════════════════════════
function isLocaleMatch(text: string, locale: string): boolean {
  if (!text || text.length < 50) return true; // too short to judge
  const sample = text.substring(0, 300);

  // CJK ideograph regex (covers Chinese + Japanese kanji + Korean hanja)
  const cjkRegex = /[\u4E00-\u9FFF]/g;
  const cjkCount = (sample.match(cjkRegex) || []).length;

  if (locale === "en") {
    // English must not be dominated by CJK. Allow up to 30 CJK chars
    // (scattered classical references like 甲木, 寅 are OK).
    if (cjkCount > 30) return false;
    // Must contain ASCII letters
    if (!/[a-zA-Z]/.test(sample)) return false;
    return true;
  }
  if (locale === "ko") {
    return /[\uAC00-\uD7AF]/.test(sample);
  }
  if (locale === "ja") {
    return /[\u3040-\u309F\u30A0-\u30FF]/.test(sample);
  }
  if (locale === "es") {
    const hasSpanishChars = /[ñÑ¿¡áéíóúÁÉÍÓÚ]/.test(sample);
    const hasSpanishStopwords = /\b(el|la|los|las|que|en|un|una|es|eres|son|pero|tu|tú|con|para|por|como|del|al|se|su|este|esta|más|porque|cuando)\b/i.test(sample);
    const hasEnglishStopwords = /\b(the|and|your|you are|this|that|with|from|what|when|which|their|these|those)\b/i.test(sample);
    return (hasSpanishChars || hasSpanishStopwords) && !(hasEnglishStopwords && !hasSpanishStopwords);
  }
  if (locale === "zh-TW") {
    // Chinese must have CJK, and must not be predominantly English
    if (cjkCount < 30) return false;
    return true;
  }
  if (locale === "ru") {
    return /[\u0400-\u04FF]/.test(sample);
  }
  if (locale === "hi") {
    return /[\u0900-\u097F]/.test(sample);
  }
  if (locale === "fr") {
    const hasFrenchChars = /[àâçéèêëîïôœùûüÿÀÂÇÉÈÊËÎÏÔŒÙÛÜŸ]/.test(sample);
    const hasFrenchStopwords = /\b(le|la|les|un|une|des|de|du|et|est|sont|votre|votre|vous|nous|ce|cette|ces|qui|que|avec|pour|dans|sur|par|mais|où|quand)\b/i.test(sample);
    const hasEnglishStopwords = /\b(the|and|your|you are|this|that|with|from|what|when|which|their|these|those)\b/i.test(sample);
    return (hasFrenchChars || hasFrenchStopwords) && !(hasEnglishStopwords && !hasFrenchStopwords);
  }
  if (locale === "pt") {
    const hasPortugueseChars = /[ãõâêôáéíóúçÃÕÂÊÔÁÉÍÓÚÇ]/.test(sample);
    const hasPortugueseStopwords = /\b(o|a|os|as|um|uma|de|do|da|dos|das|e|é|são|você|seu|sua|este|esta|esses|essas|com|para|por|que|quando|onde|porque|mas|também)\b/i.test(sample);
    const hasEnglishStopwords = /\b(the|and|your|you are|this|that|with|from|what|when|which|their|these|those)\b/i.test(sample);
    return (hasPortugueseChars || hasPortugueseStopwords) && !(hasEnglishStopwords && !hasPortugueseStopwords);
  }
  if (locale === "id") {
    const hasIndonesianStopwords = /\b(yang|dan|atau|dengan|dari|untuk|pada|dalam|adalah|akan|tidak|saya|kamu|anda|kita|mereka|ini|itu|ada|bisa|sudah)\b/i.test(sample);
    const hasEnglishStopwords = /\b(the|and|your|you are|this|that|with|from|what|when|which|their|these|those)\b/i.test(sample);
    return hasIndonesianStopwords && !(hasEnglishStopwords && !hasIndonesianStopwords);
  }
  // Unknown locale — accept (don't block valid output)
  return true;
}

async function callAI(prompt: string, label: string, locale = "en"): Promise<string> {
  // KO/JA: Gemini Pro first (Flash often ignores language instructions)
  // EN: Gemini Flash → Pro → Claude
  const useProFirst = locale !== "en";
  const firstModel = useProFirst ? "gemini-2.5-pro" : "gemini-2.5-flash";
  const secondModel = useProFirst ? "gemini-2.5-flash" : "gemini-2.5-pro";

  // Per-call timeouts — prevents any single model call from hanging the
  // whole request. Gemini Pro commonly takes 20–40s for long compat
  // responses, so 30s is a reasonable ceiling. Claude is slower (~15–30s)
  // but when it runs it's the last line of defense, so give it 45s.
  const GEMINI_TIMEOUT_MS = 30000;
  const CLAUDE_TIMEOUT_MS = 45000;

  const withTimeout = <T>(p: Promise<T>, ms: number, what: string): Promise<T> =>
    Promise.race([
      p,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`${what} timed out after ${ms}ms`)), ms)
      ),
    ]);

  try {
    return await withTimeout(
      callGemini(prompt, label, firstModel, locale),
      GEMINI_TIMEOUT_MS,
      `${label} ${firstModel}`
    );
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn(`${label}: ${firstModel} failed —`, errMsg);

    // If Google returned 503 (model overloaded), skip the second Gemini
    // attempt — the whole Gemini fleet is likely strained and a second
    // call will usually hit the same wall. Go straight to Claude for a
    // faster response to the user.
    const is503 = errMsg.includes("503");

    if (is503) {
      try {
        console.warn(`${label}: 503 detected, skipping ${secondModel}, using Claude directly`);
        return await withTimeout(
          callClaudeFallback(prompt, label),
          CLAUDE_TIMEOUT_MS,
          `${label} Claude`
        );
      } catch (claudeErr) {
        // Claude also failed. Last resort: try the other Gemini model anyway.
        console.warn(`${label}: Claude failed after 503 path —`, claudeErr instanceof Error ? claudeErr.message : claudeErr);
        return await withTimeout(
          callGemini(prompt, label, secondModel, locale),
          GEMINI_TIMEOUT_MS,
          `${label} ${secondModel} (last resort)`
        );
      }
    }

    // Non-503 error (timeout, parse, auth, etc): try second Gemini then Claude
    try {
      return await withTimeout(
        callGemini(prompt, label, secondModel, locale),
        GEMINI_TIMEOUT_MS,
        `${label} ${secondModel}`
      );
    } catch (err2) {
      console.warn(`${label}: ${secondModel} failed, falling back to Claude —`, err2 instanceof Error ? err2.message : err2);
      return await withTimeout(
        callClaudeFallback(prompt, label),
        CLAUDE_TIMEOUT_MS,
        `${label} Claude`
      );
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
  const keyMap: Record<string, string> = {
    summary: "summary", "요약": "summary", "サマリー": "summary", "概要": "summary",
    love: "love", "연애": "love", "사랑": "love", "恋愛": "love",
    work: "work", "직장": "work", "업무": "work", "仕事": "work",
    friendship: "friendship", "우정": "friendship", "友情": "friendship",
    conflict: "conflict", "갈등": "conflict", "葛藤": "conflict", "対立": "conflict",
    yearly: "yearly", "연간": "yearly", "年間": "yearly",
  };
  const normalized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const mapped = keyMap[key] || keyMap[key.toLowerCase()] || key;
    normalized[mapped] = value;
  }
  return normalized;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { personA, personB, userId } = body;
    const locale = body.locale || "en";

    if (!personA?.name || !personA?.birthDate || !personA?.gender || !personA?.birthCity) {
      return NextResponse.json({ error: "Missing Person A data" }, { status: 400 });
    }
    if (!personB?.name || !personB?.birthDate || !personB?.gender || !personB?.birthCity) {
      return NextResponse.json({ error: "Missing Person B data" }, { status: 400 });
    }

    const dateA = new Date(personA.birthDate);
    const dateB = new Date(personB.birthDate);
    const hourA = personA.birthHour ?? 12;
    const hourB = personB.birthHour ?? 12;
    const bdStrA = toBirthDateStr(dateA);
    const bdStrB = toBirthDateStr(dateB);

    // ═══ CACHE CHECK ═══
    // Cache is only consulted for signed-in users. For guests we always run
    // full generation so they always get their OWN orphan row — this makes
    // the "guest compat → sign-in → claim on dashboard" flow work correctly.
    // If guests could hit cache, they would receive a shareSlug owned by
    // another signed-in user, and the subsequent claim-on-sign-in would
    // no-op (user_id=is.null filter miss), leaving the new account with an
    // empty dashboard.
    if (userId) {
    try {
      // v6.17.28: locale must match — otherwise an English requester could
      // hit a Korean cached row (or vice versa) and see content in the wrong
      // language. The previous match was birthdate+hour only.
      const cacheRes = await fetch(`${supabaseUrl}/rest/v1/compatibility_results?${new URLSearchParams({
        person_a_birth_date: `eq.${bdStrA}`, person_a_birth_hour: `eq.${hourA}`,
        person_b_birth_date: `eq.${bdStrB}`, person_b_birth_hour: `eq.${hourB}`,
        locale: `eq.${locale}`,
        select: "share_slug,free_summary,paid_love", limit: "1",
      })}`, { headers: dbHeaders });
      if (cacheRes.ok) {
        const cached = await cacheRes.json();
        if (cached?.length > 0 && cached[0].free_summary && cached[0].paid_love) {
          if (userId) {
            fetch(`${supabaseUrl}/rest/v1/compatibility_results?share_slug=eq.${cached[0].share_slug}&user_id=is.null`, {
              method: "PATCH", headers: { ...dbHeaders, Prefer: "return=minimal" },
              body: JSON.stringify({ user_id: userId }),
            }).catch(() => {});
          }
          return NextResponse.json({ success: true, shareSlug: cached[0].share_slug, cached: true });
        }
      }
      // Reverse check (also locale-scoped — see forward note above)
      const revRes = await fetch(`${supabaseUrl}/rest/v1/compatibility_results?${new URLSearchParams({
        person_a_birth_date: `eq.${bdStrB}`, person_a_birth_hour: `eq.${hourB}`,
        person_b_birth_date: `eq.${bdStrA}`, person_b_birth_hour: `eq.${hourA}`,
        locale: `eq.${locale}`,
        select: "share_slug,free_summary", limit: "1",
      })}`, { headers: dbHeaders });
      if (revRes.ok) {
        const rev = await revRes.json();
        if (rev?.length > 0 && rev[0].free_summary) {
          return NextResponse.json({ success: true, shareSlug: rev[0].share_slug, cached: true });
        }
      }
    } catch {}
    }

    // ═══ RATE LIMIT ═══
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    try {
      const rateRes = await fetch(`${supabaseUrl}/rest/v1/compatibility_results?${new URLSearchParams({
        person_a_name: `eq.${personA.name}`, created_at: `gte.${fiveMinAgo}`, select: "id", limit: "5",
      })}`, { headers: dbHeaders });
      if (rateRes.ok) {
        const recent = await rateRes.json();
        if (recent && recent.length >= 3) {
          return NextResponse.json({ error: "Too many requests. Please wait a few minutes." }, { status: 429 });
        }
      }
    } catch {}

    // ═══ CALCULATE ═══
    const chartA = calculateSaju(personA.name, personA.gender, dateA, hourA, personA.birthCity);
    const chartB = calculateSaju(personB.name, personB.gender, dateB, hourB, personB.birthCity);
    const scores = calculateCompatibility(chartA, chartB);

    // ═══ RAG: Classical corpus search based on Person A's saju ═══
    let ragPrefix = "";
    let citationMeta: any = null;
    try {
      const sajuDataForRAG = {
        dayStem: chartA.pillars.day.stem.zh,
        dayBranch: chartA.pillars.day.branch.zh,
        monthStem: chartA.pillars.month.stem.zh,
        monthBranch: chartA.pillars.month.branch.zh,
        yearStem: chartA.pillars.year.stem.zh,
        yearBranch: chartA.pillars.year.branch.zh,
        hourStem: chartA.pillars.hour.stem.zh,
        hourBranch: chartA.pillars.hour.branch.zh,
        dominantElement: chartA.dominantElement,
        weakElement: chartA.weakestElement,
      };
      const ragContext = await buildRAGContext(
        sajuDataForRAG, 'compatibility', (locale as 'ko' | 'en' | 'ja' | 'es')
      );
      ragPrefix = ragContext.contextText || "";
      if (ragContext.citations && ragContext.citations.length > 0) {
        citationMeta = {
          totalCorpusSize: 562,
          sourceCount: new Set(ragContext.citations.map((c: any) => c.source_name_ko)).size,
          matchCount: ragContext.citations.length,
          topSimilarity: Math.round(Math.max(...ragContext.citations.map((c: any) => c.similarity)) * 1000) / 1000,
          queryDimensions: 1536,
          dayMaster: chartA.pillars.day.stem.zh,
          monthBranch: chartA.pillars.month.branch.zh,
          citations: ragContext.citations.map((c: any) => ({
            source: '',
            source_name_ko: c.source_name_ko,
            source_name_cn: c.source_name_cn,
            chapter: c.chapter,
            excerpt: c.excerpt,
            similarity: Math.round(c.similarity * 1000) / 1000,
          })),
        };
      }
    } catch (ragErr) {
      console.warn("[compat] RAG context failed (continuing without):", ragErr);
      ragPrefix = "";
    }

    // ════════════════════════════════════════════════════════════
    // v6.17.3 — fast free path, lazy paid generation
    // ════════════════════════════════════════════════════════════
    // OLD: all 4 LLM calls awaited in parallel. The slowest call
    // (often Gemini Pro for KO/JA) gated the response. Free users
    // waited 30-60s to see free_summary even though paid_* would
    // be hidden behind a $2.99 paywall they hadn't crossed.
    //
    // NEW: only free_summary is awaited. The 3 paid prompts are
    // kicked off in the background and persisted via UPDATE when
    // they resolve. The compatibility result page (/compatibility/
    // result/[slug]) shows free_summary immediately. When the user
    // unlocks paid (admin bypass OR $2.99 PayPal return), the page
    // polls /api/compatibility/check-paid which returns is_paid:true.
    // If the paid_* columns aren't filled yet at that moment, the
    // existing UI already handles the null-content case gracefully.
    //
    // Stability:
    //   - Background promises catch all errors locally — they cannot
    //     crash the route after the response is sent.
    //   - DB INSERT runs with free_summary first; UPDATEs follow for
    //     paid_* fields. If the INSERT fails, paid background work
    //     still tries to UPDATE by share_slug — those UPDATEs will
    //     just match 0 rows, no harm done.
    //   - Worst case === current behavior: if a background promise
    //     dies, paid_* columns stay null, and the eventual paywall
    //     still operates on free_summary alone.
    // ════════════════════════════════════════════════════════════

    // 1. Generate free summary (awaited — gates the response)
    const freeRaw = await callAI(
      ragPrefix + buildFreeCompatibilityPrompt(scores, locale),
      "FreeSummary",
      locale
    );

    // 2. Kick off paid prompts in the background. We capture the
    //    promises but do NOT await them here.
    const paidPromises: Array<Promise<{ key: string; raw: string } | null>> = [
      callAI(ragPrefix + buildPaidCompatPrompt1(scores, locale), "Paid-Love+Work", locale)
        .then((raw) => ({ key: "p1", raw }))
        .catch(() => null),
      callAI(ragPrefix + buildPaidCompatPrompt2(scores, locale), "Paid-Friend+Conflict", locale)
        .then((raw) => ({ key: "p2", raw }))
        .catch(() => null),
      callAI(ragPrefix + buildPaidCompatPrompt3(scores, locale), "Paid-Yearly", locale)
        .then((raw) => ({ key: "p3", raw }))
        .catch(() => null),
    ];

    // Sentinels so the legacy code below stays unchanged in shape.
    // We will not actually parse these synchronously — they'll be
    // populated by the background task and persisted via UPDATE.
    const raw1 = "";
    const raw2 = "";
    const raw3 = "";

    let freeSummary: string;
    try {
      const parsed = parseJSON(freeRaw);
      freeSummary = parsed.summary || parsed.free_summary || Object.values(parsed).find((v: any) => typeof v === "string" && v.length > 50) as string || "";
    } catch {
      // Gemini KO/JA may return plain text instead of JSON — use raw text as summary
      const cleaned = freeRaw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      // Try to extract from markdown or plain text
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const obj = JSON.parse(jsonMatch[0]);
          freeSummary = obj.summary || obj["요약"] || obj["サマリー"] || obj["概要"] || Object.values(obj).find((v: any) => typeof v === "string" && v.length > 50) as string || "";
        } catch {
          freeSummary = cleaned;
        }
      } else {
        freeSummary = cleaned;
      }
    }
    // Safety: strip JSON wrapper if still present after all parsing attempts.
    // Handles two cases:
    //   1. Complete JSON: {"summary": "..."} with closing
    //   2. Truncated JSON: {"summary": "..." — response was cut off by
    //      maxOutputTokens before the model could close the string. In this
    //      case we grab everything after "summary": " and treat it as the
    //      content, stripping any trailing incomplete JSON artifacts.
    if (freeSummary && freeSummary.trimStart().startsWith("{")) {
      // Try complete JSON wrapper first (with closing quote + brace)
      const completeMatch = freeSummary.match(/"(?:summary|요약|サマリー|概要)"\s*:\s*"([\s\S]+?)"\s*\}?\s*$/);
      if (completeMatch) {
        freeSummary = completeMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
      } else {
        // Fallback: truncated JSON — take everything after "summary": " to end
        const truncatedMatch = freeSummary.match(/"(?:summary|요약|サマリー|概要)"\s*:\s*"([\s\S]+)/);
        if (truncatedMatch) {
          let extracted = truncatedMatch[1];
          // Drop any trailing `", "otherKey": ...` or trailing `"}` if they exist
          extracted = extracted.replace(/"\s*,\s*"[^"]*"\s*:[\s\S]*$/, "");
          extracted = extracted.replace(/"\s*\}\s*$/, "");
          // Convert JSON escape sequences to real characters
          freeSummary = extracted.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\t/g, "\t");
        }
      }
    }
    // Language correction: if KO/JA/ES requested but English returned, try Claude
    if (locale !== "en" && freeSummary) {
      const sample = freeSummary.substring(0, 200);
      let isCorrectLang: boolean;
      if (locale === "ko") {
        isCorrectLang = /[\uAC00-\uD7AF]/.test(sample);
      } else if (locale === "ja") {
        isCorrectLang = /[\u3040-\u309F\u30A0-\u30FF]/.test(sample);
      } else if (locale === "es") {
        const hasSpanishChars = /[ñÑ¿¡áéíóúÁÉÍÓÚ]/.test(sample);
        const hasSpanishStopwords = /\b(el|la|los|las|que|en|un|una|es|eres|son|pero|tu|tú|con|para|por|como|del|al|se|su|este|esta|más|porque|cuando)\b/i.test(sample);
        const hasEnglishStopwords = /\b(the|and|your|you are|this|that|with|from|what|when|which|their|these|those)\b/i.test(sample);
        isCorrectLang = (hasSpanishChars || hasSpanishStopwords) && !(hasEnglishStopwords && !hasSpanishStopwords);
      } else {
        isCorrectLang = true;
      }
      if (!isCorrectLang) {
        try {
          const corrected = await callClaudeFallback(ragPrefix + buildFreeCompatibilityPrompt(scores, locale), "LangFix");
          if (corrected) {
            try {
              const cp = parseJSON(corrected);
              freeSummary = cp.summary || cp.free_summary || Object.values(cp).find((v: any) => typeof v === "string" && v.length > 50) as string || freeSummary;
            } catch { freeSummary = corrected.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim(); }
          }
        } catch { /* Claude failed — keep original */ }
      }
    }
    if (!freeSummary || freeSummary.length < 20) {
      console.error("[compat-generate] Empty free summary. Raw:", freeRaw.substring(0, 300));
      return NextResponse.json({ error: "Empty AI response" }, { status: 500 });
    }

    let paidData: Record<string, string> = {};
    try {
      const p1 = parseJSON(raw1);
      const p2 = parseJSON(raw2);
      const p3 = parseJSON(raw3);
      paidData = {
        love: p1.love || p1["연애"] || p1["恋愛"] || "",
        work: p1.work || p1["직장"] || p1["仕事"] || "",
        friendship: p2.friendship || p2["우정"] || p2["友情"] || "",
        conflict: p2.conflict || p2["갈등"] || p2["葛藤"] || "",
        yearly: p3.yearly || p3["연간"] || p3["年間"] || "",
      };
      // Fallback: if keys missing, try first/second values
      if (!paidData.love && Object.values(p1).length > 0) {
        const vals = Object.values(p1).filter((v: any) => typeof v === "string" && v.length > 50) as string[];
        if (vals.length >= 2) { paidData.love = vals[0]; paidData.work = vals[1]; }
        else if (vals.length === 1) { paidData.love = vals[0]; }
      }
      if (!paidData.friendship && Object.values(p2).length > 0) {
        const vals = Object.values(p2).filter((v: any) => typeof v === "string" && v.length > 50) as string[];
        if (vals.length >= 2) { paidData.friendship = vals[0]; paidData.conflict = vals[1]; }
        else if (vals.length === 1) { paidData.friendship = vals[0]; }
      }
      if (!paidData.yearly && Object.values(p3).length > 0) {
        const vals = Object.values(p3).filter((v: any) => typeof v === "string" && v.length > 50) as string[];
        if (vals.length >= 1) { paidData.yearly = vals[0]; }
      }
    } catch (err) {
      console.error("Paid compat parse failed:", err);
      // Try raw text fallback for each
      try { const c = raw1.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim(); const m = c.match(/\{[\s\S]*\}/); if (m) { const o = JSON.parse(m[0]); paidData.love = paidData.love || Object.values(o)[0] as string || ""; paidData.work = paidData.work || Object.values(o)[1] as string || ""; } } catch {}
      try { const c = raw2.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim(); const m = c.match(/\{[\s\S]*\}/); if (m) { const o = JSON.parse(m[0]); paidData.friendship = paidData.friendship || Object.values(o)[0] as string || ""; paidData.conflict = paidData.conflict || Object.values(o)[1] as string || ""; } } catch {}
      try { const c = raw3.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim(); const m = c.match(/\{[\s\S]*\}/); if (m) { const o = JSON.parse(m[0]); paidData.yearly = paidData.yearly || Object.values(o)[0] as string || ""; } } catch {}
    }

    // ═══ SAVE ═══
    const shareSlug = generateSlug();
    const insertBody: Record<string, any> = {
      user_id: userId || null,
      person_a_name: personA.name, person_a_gender: personA.gender,
      person_a_birth_date: bdStrA, person_a_birth_hour: hourA, person_a_birth_hour_unknown: personA.birthHourUnknown || false, person_a_birth_city: personA.birthCity,
      person_a_day_master: `${chartA.dayMaster.zh} ${chartA.dayMaster.en}`, person_a_element: chartA.dayMaster.element,
      person_b_name: personB.name, person_b_gender: personB.gender,
      person_b_birth_date: bdStrB, person_b_birth_hour: hourB, person_b_birth_hour_unknown: personB.birthHourUnknown || false, person_b_birth_city: personB.birthCity,
      person_b_day_master: `${chartB.dayMaster.zh} ${chartB.dayMaster.en}`, person_b_element: chartB.dayMaster.element,
      overall_score: scores.overall, love_score: scores.love, work_score: scores.work,
      friendship_score: scores.friendship, conflict_score: scores.conflict,
      free_summary: freeSummary, share_slug: shareSlug,
      locale,
    };

    // v6.17.3: paidData is intentionally empty in the new flow because
    // raw1/raw2/raw3 above are sentinels (""). The block below executes
    // but never adds paid_* fields to insertBody — those land in the
    // background PATCH after Promise.allSettled resolves. Kept here for
    // back-compat in case a future caller wires raw1..3 differently.
    // Save each paid field independently. Previously the entire block was
    // gated on `paidData.love` being truthy, which meant a single failed
    // love-prompt parse would drop work/friendship/conflict/yearly even when
    // those parsed successfully. Now we persist whatever the AI/parser
    // produced for each field individually.
    if (paidData.love)       insertBody.paid_love       = paidData.love;
    if (paidData.work)       insertBody.paid_work       = paidData.work;
    if (paidData.friendship) insertBody.paid_friendship = paidData.friendship;
    if (paidData.conflict)   insertBody.paid_conflict   = paidData.conflict;
    if (paidData.yearly)     insertBody.paid_yearly     = paidData.yearly;

    if (citationMeta) {
      insertBody.citation_meta = citationMeta;
    }

    await fetch(`${supabaseUrl}/rest/v1/compatibility_results`, {
      method: "POST", headers: { ...dbHeaders, Prefer: "return=minimal" }, body: JSON.stringify(insertBody),
    });

    // ════════════════════════════════════════════════════════════
    // v6.17.3 — background paid resolution
    // ════════════════════════════════════════════════════════════
    // The free response is already on its way to the user (or about
    // to be — we send it below). The 3 paid promises kicked off
    // earlier are still in flight. We wait for them in the
    // background and PATCH the row by share_slug as each one lands.
    //
    // Why PATCH per-field rather than a single grand UPDATE: a failed
    // promise should not block the others. Each successful paid
    // bucket gets persisted independently, mirroring the field-level
    // safety from the previous "Save each paid field independently"
    // block.
    //
    // This Promise.allSettled is INTENTIONALLY NOT awaited. In Vercel
    // Node runtime, async work after the response is sent runs to
    // completion within the function timeout (maxDuration=120). For
    // KO/JA Pro calls this typically resolves in 20-50s — well under
    // the cap.
    //
    // If Vercel ever changes this behavior or the function times out,
    // worst case is paid_* stays null and the user sees "content
    // pending" on paid unlock. The check-paid endpoint already
    // handles missing paid content gracefully.
    // ════════════════════════════════════════════════════════════
    // ════════════════════════════════════════════════════════════
    // v6.17.29 — waitUntil() to guarantee background paid resolution
    // ════════════════════════════════════════════════════════════
    // Previously this Promise.allSettled was fire-and-forget and the
    // comment claimed Vercel Node runtime would let it run to completion.
    // VERCEL LOGS PROVED THIS WRONG: function exits at ~8s right after
    // the response, killing the background promise mid-flight. Result:
    // c-9334ynf3 had paid_* all NULL despite is_paid=true.
    //
    // Vercel's documented solution is `waitUntil()` from @vercel/functions
    // — it extends the lambda lifetime until the wrapped promise settles
    // (capped at maxDuration=120 here). Without it, "fire-and-forget"
    // simply doesn't work in serverless.
    // ════════════════════════════════════════════════════════════
    waitUntil(
      Promise.allSettled(paidPromises)
      .then(async (results) => {
        const patch: Record<string, any> = {};
        for (const r of results) {
          if (r.status !== "fulfilled" || !r.value) continue;
          const { key, raw } = r.value;
          if (!raw) continue;
          try {
            const parsed = parseJSON(raw);
            if (key === "p1") {
              const love = parsed.love || parsed["연애"] || parsed["恋愛"] || "";
              const work = parsed.work || parsed["직장"] || parsed["仕事"] || "";
              if (love) patch.paid_love = love;
              if (work) patch.paid_work = work;
              if (!love || !work) {
                const vals = Object.values(parsed).filter((v: any) => typeof v === "string" && v.length > 50) as string[];
                if (!love && vals[0]) patch.paid_love = vals[0];
                if (!work && vals[1]) patch.paid_work = vals[1];
              }
            } else if (key === "p2") {
              const fr = parsed.friendship || parsed["우정"] || parsed["友情"] || "";
              const cf = parsed.conflict || parsed["갈등"] || parsed["葛藤"] || "";
              if (fr) patch.paid_friendship = fr;
              if (cf) patch.paid_conflict = cf;
              if (!fr || !cf) {
                const vals = Object.values(parsed).filter((v: any) => typeof v === "string" && v.length > 50) as string[];
                if (!fr && vals[0]) patch.paid_friendship = vals[0];
                if (!cf && vals[1]) patch.paid_conflict = vals[1];
              }
            } else if (key === "p3") {
              const yearly = parsed.yearly || parsed["연간"] || parsed["年間"] || "";
              if (yearly) patch.paid_yearly = yearly;
              if (!yearly) {
                const vals = Object.values(parsed).filter((v: any) => typeof v === "string" && v.length > 50) as string[];
                if (vals[0]) patch.paid_yearly = vals[0];
              }
            }
          } catch {
            // parse failed for this bucket — try raw cleanup fallback
            try {
              const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
              const m = cleaned.match(/\{[\s\S]*\}/);
              if (m) {
                const obj = JSON.parse(m[0]);
                const vals = Object.values(obj).filter((v: any) => typeof v === "string" && v.length > 50) as string[];
                if (key === "p1") {
                  if (!patch.paid_love && vals[0]) patch.paid_love = vals[0];
                  if (!patch.paid_work && vals[1]) patch.paid_work = vals[1];
                } else if (key === "p2") {
                  if (!patch.paid_friendship && vals[0]) patch.paid_friendship = vals[0];
                  if (!patch.paid_conflict && vals[1]) patch.paid_conflict = vals[1];
                } else if (key === "p3") {
                  if (!patch.paid_yearly && vals[0]) patch.paid_yearly = vals[0];
                }
              }
            } catch {}
          }
        }

        // ════════════════════════════════════════════════════════════
        // v6.17.28 — Language verification for paid_* fields
        // ════════════════════════════════════════════════════════════
        // The free_summary already has a language check (above), but
        // paid_* (love/work/friendship/conflict/yearly) had no
        // verification at all — letting Gemini occasionally leak
        // Chinese (from RAG passages) into English/other-locale
        // responses. This caused chandler's c-kcd55vza row to render
        // Chinese paid_* in the English UI.
        //
        // For each field that didn't match the requested locale, we
        // re-call Claude with the exact same prompt that produced the
        // bucket. If Claude also fails or also returns wrong language,
        // we keep the original (worst case === current behavior).
        //
        // This runs in the background after the response, so any
        // latency added here doesn't affect the user-perceived
        // response time. Polling on result_client.tsx (every 3s, up
        // to 8 attempts) catches the corrected content.
        // ════════════════════════════════════════════════════════════
        const langFixTargets: Array<{ field: string; promptBuilder: (s: any, l: string) => string; jsonKey: string; altKeys: string[] }> = [
          { field: "paid_love",       promptBuilder: buildPaidCompatPrompt1, jsonKey: "love",       altKeys: ["연애", "恋愛"] },
          { field: "paid_work",       promptBuilder: buildPaidCompatPrompt1, jsonKey: "work",       altKeys: ["직장", "仕事"] },
          { field: "paid_friendship", promptBuilder: buildPaidCompatPrompt2, jsonKey: "friendship", altKeys: ["우정", "友情"] },
          { field: "paid_conflict",   promptBuilder: buildPaidCompatPrompt2, jsonKey: "conflict",   altKeys: ["갈등", "葛藤"] },
          { field: "paid_yearly",     promptBuilder: buildPaidCompatPrompt3, jsonKey: "yearly",     altKeys: ["연간", "年間"] },
        ];

        // Group by promptBuilder so we don't make the same Claude call
        // 2-3 times for love+work (which share the same prompt).
        const prompts = new Map<string, string>();
        for (const t of langFixTargets) {
          if (!patch[t.field]) continue; // not generated yet; nothing to verify
          if (isLocaleMatch(patch[t.field], locale)) continue; // language OK
          // mark the bucket as needing re-generation
          const promptKey = t.promptBuilder === buildPaidCompatPrompt1 ? "p1" :
                            t.promptBuilder === buildPaidCompatPrompt2 ? "p2" : "p3";
          if (!prompts.has(promptKey)) {
            prompts.set(promptKey, ragPrefix + t.promptBuilder(scores, locale));
          }
        }

        if (prompts.size > 0) {
          console.log(`[compat-generate] LangFix triggered for locale=${locale}, buckets=${Array.from(prompts.keys()).join(",")}`);
          const fixResults = await Promise.allSettled(
            Array.from(prompts.entries()).map(async ([key, prompt]) => ({
              key,
              raw: await callClaudeFallback(prompt, `LangFix-${key}`),
            }))
          );
          for (const fr of fixResults) {
            if (fr.status !== "fulfilled" || !fr.value?.raw) continue;
            const { key, raw } = fr.value;
            try {
              const parsed = parseJSON(raw);
              if (key === "p1") {
                const love = parsed.love || parsed["연애"] || parsed["恋愛"] || "";
                const work = parsed.work || parsed["직장"] || parsed["仕事"] || "";
                if (love && isLocaleMatch(love, locale)) patch.paid_love = love;
                if (work && isLocaleMatch(work, locale)) patch.paid_work = work;
                if (!love || !work) {
                  const vals = Object.values(parsed).filter((v: any) => typeof v === "string" && v.length > 50) as string[];
                  if (!love && vals[0] && isLocaleMatch(vals[0], locale)) patch.paid_love = vals[0];
                  if (!work && vals[1] && isLocaleMatch(vals[1], locale)) patch.paid_work = vals[1];
                }
              } else if (key === "p2") {
                const fr2 = parsed.friendship || parsed["우정"] || parsed["友情"] || "";
                const cf = parsed.conflict || parsed["갈등"] || parsed["葛藤"] || "";
                if (fr2 && isLocaleMatch(fr2, locale)) patch.paid_friendship = fr2;
                if (cf && isLocaleMatch(cf, locale)) patch.paid_conflict = cf;
                if (!fr2 || !cf) {
                  const vals = Object.values(parsed).filter((v: any) => typeof v === "string" && v.length > 50) as string[];
                  if (!fr2 && vals[0] && isLocaleMatch(vals[0], locale)) patch.paid_friendship = vals[0];
                  if (!cf && vals[1] && isLocaleMatch(vals[1], locale)) patch.paid_conflict = vals[1];
                }
              } else if (key === "p3") {
                const yearly = parsed.yearly || parsed["연간"] || parsed["年間"] || "";
                if (yearly && isLocaleMatch(yearly, locale)) patch.paid_yearly = yearly;
                if (!yearly) {
                  const vals = Object.values(parsed).filter((v: any) => typeof v === "string" && v.length > 50) as string[];
                  if (vals[0] && isLocaleMatch(vals[0], locale)) patch.paid_yearly = vals[0];
                }
              }
            } catch {
              // parse failed — keep original Gemini output (worst case === current behavior)
            }
          }
        }

        if (Object.keys(patch).length === 0) return;
        try {
          await fetch(
            `${supabaseUrl}/rest/v1/compatibility_results?share_slug=eq.${encodeURIComponent(shareSlug)}`,
            {
              method: "PATCH",
              headers: { ...dbHeaders, Prefer: "return=minimal" },
              body: JSON.stringify(patch),
            }
          );
        } catch (e) {
          console.warn("[compat-generate] paid patch failed (non-fatal):", e);
        }
      })
      .catch(() => {
        // Outer catch: should be unreachable thanks to inner catches,
        // but defensive against any unexpected throw path.
      })
    ); // closes waitUntil()

    // ─── [PHASE 1 STEP 2] Auto-create user's own readings row ────────────
    // If the user is signed in and has no readings yet, bootstrap one from
    // Person A (who is semantically "the user" in compatibility flows).
    // Dynamic import keeps the top-level import list untouched. Wrapped in
    // try/catch with a 3s timeout cap — never affects the compat response.
    if (userId) {
      try {
        const { ensureUserReading } = await import("@/lib/auto-create-reading");
        await Promise.race([
          ensureUserReading({
            userId,
            name: personA.name,
            gender: personA.gender,
            birthDateStr: bdStrA,
            birthHour: hourA,
            birthHourUnknown: personA.birthHourUnknown === true,
            birthCity: personA.birthCity,
            locale,
          }),
          new Promise<void>((resolve) => setTimeout(resolve, 3000)),
        ]);
      } catch {
        // Silent — helper never throws, but extra protection anyway
      }
    }

    return NextResponse.json({ success: true, shareSlug });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
