import { NextRequest, NextResponse } from "next/server";
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
    maxOutputTokens: 5000,
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

async function callAI(prompt: string, label: string, locale = "en"): Promise<string> {
  // KO/JA: Gemini Pro first (Flash often ignores language instructions)
  // EN: Gemini Flash → Pro → Claude
  const useProFirst = locale !== "en";
  const firstModel = useProFirst ? "gemini-2.5-pro" : "gemini-2.5-flash";
  const secondModel = useProFirst ? "gemini-2.5-flash" : "gemini-2.5-pro";
  try {
    return await callGemini(prompt, label, firstModel, locale);
  } catch (err) {
    console.warn(`${label}: ${firstModel} failed —`, err instanceof Error ? err.message : err);
    try {
      return await callGemini(prompt, label, secondModel, locale);
    } catch (err2) {
      console.warn(`${label}: ${secondModel} failed, falling back to Claude —`, err2 instanceof Error ? err2.message : err2);
      return await callClaudeFallback(prompt, label);
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
    try {
      const cacheRes = await fetch(`${supabaseUrl}/rest/v1/compatibility_results?${new URLSearchParams({
        person_a_birth_date: `eq.${bdStrA}`, person_a_birth_hour: `eq.${hourA}`,
        person_b_birth_date: `eq.${bdStrB}`, person_b_birth_hour: `eq.${hourB}`,
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
      // Reverse check
      const revRes = await fetch(`${supabaseUrl}/rest/v1/compatibility_results?${new URLSearchParams({
        person_a_birth_date: `eq.${bdStrB}`, person_a_birth_hour: `eq.${hourB}`,
        person_b_birth_date: `eq.${bdStrA}`, person_b_birth_hour: `eq.${hourA}`,
        select: "share_slug,free_summary", limit: "1",
      })}`, { headers: dbHeaders });
      if (revRes.ok) {
        const rev = await revRes.json();
        if (rev?.length > 0 && rev[0].free_summary) {
          return NextResponse.json({ success: true, shareSlug: rev[0].share_slug, cached: true });
        }
      }
    } catch {}

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
        sajuDataForRAG, 'compatibility', (locale as 'ko' | 'en' | 'ja')
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

    // ═══ GENERATE ALL CONTENT — Gemini Pro → Claude fallback ═══
    const [freeRaw, raw1, raw2, raw3] = await Promise.all([
      callAI(ragPrefix + buildFreeCompatibilityPrompt(scores, locale), "FreeSummary", locale),
      callAI(ragPrefix + buildPaidCompatPrompt1(scores, locale), "Paid-Love+Work", locale),
      callAI(ragPrefix + buildPaidCompatPrompt2(scores, locale), "Paid-Friend+Conflict", locale),
      callAI(ragPrefix + buildPaidCompatPrompt3(scores, locale), "Paid-Yearly", locale),
    ]);

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
    // Safety: strip JSON wrapper if still present after all parsing attempts
    if (freeSummary && freeSummary.trimStart().startsWith("{")) {
      const innerMatch = freeSummary.match(/"(?:summary|요약|サマリー|概要)"\s*:\s*"([\s\S]+?)"\s*\}?\s*$/);
      if (innerMatch) {
        freeSummary = innerMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
      }
    }
    // Language correction: if KO/JA requested but English returned, try Claude
    if (locale !== "en" && freeSummary) {
      const sample = freeSummary.substring(0, 200);
      const isCorrectLang = locale === "ko"
        ? /[\uAC00-\uD7AF]/.test(sample)
        : /[\u3040-\u309F\u30A0-\u30FF]/.test(sample);
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
      person_a_birth_date: bdStrA, person_a_birth_hour: hourA, person_a_birth_city: personA.birthCity,
      person_a_day_master: `${chartA.dayMaster.zh} ${chartA.dayMaster.en}`, person_a_element: chartA.dayMaster.element,
      person_b_name: personB.name, person_b_gender: personB.gender,
      person_b_birth_date: bdStrB, person_b_birth_hour: hourB, person_b_birth_city: personB.birthCity,
      person_b_day_master: `${chartB.dayMaster.zh} ${chartB.dayMaster.en}`, person_b_element: chartB.dayMaster.element,
      overall_score: scores.overall, love_score: scores.love, work_score: scores.work,
      friendship_score: scores.friendship, conflict_score: scores.conflict,
      free_summary: freeSummary, share_slug: shareSlug,
      locale,
    };

    if (paidData.love) {
      insertBody.paid_love = paidData.love;
      insertBody.paid_work = paidData.work;
      insertBody.paid_friendship = paidData.friendship;
      insertBody.paid_conflict = paidData.conflict;
      insertBody.paid_yearly = paidData.yearly;
    }

    if (citationMeta) {
      insertBody.citation_meta = citationMeta;
    }

    await fetch(`${supabaseUrl}/rest/v1/compatibility_results`, {
      method: "POST", headers: { ...dbHeaders, Prefer: "return=minimal" }, body: JSON.stringify(insertBody),
    });

    return NextResponse.json({ success: true, shareSlug });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
