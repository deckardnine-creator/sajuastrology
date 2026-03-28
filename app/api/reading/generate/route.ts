import { NextRequest, NextResponse } from "next/server";
import { buildFreeReadingPrompt, generateShareSlug } from "@/lib/reading-prompts";
import { getSystemInstruction } from "@/lib/prompt-locale";
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
  const engines = [
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
      console.warn(`Free reading: ${engines[i].name} failed —`, err instanceof Error ? err.message : err);
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
    if (chart.birthDate instanceof Date) {
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
    try {
      const exactRes = await fetch(`${supabaseUrl}/rest/v1/readings?${new URLSearchParams({
        name: `eq.${chart.name}`, gender: `eq.${chart.gender}`,
        birth_date: `eq.${birthDateStr}`, birth_city: `eq.${chart.birthCity}`,
        select: "share_slug", limit: "1",
      })}`, { headers: dbHeaders });
      if (exactRes.ok) {
        const exactData = await exactRes.json();
        if (exactData?.length > 0 && exactData[0].share_slug) {
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

    // ═══ GENERATE — Gemini Pro → Claude Sonnet → Claude Haiku ═══
    const prompt = buildFreeReadingPrompt(chart, locale);
    const rawText = await generateWithFallback(prompt, locale);

    // ═══ Normalize keys: Gemini may localize JSON keys in KO/JA ═══
    function normalizeReadingKeys(obj: any): { personality: string; year_forecast: string; element_guidance: string } {
      const keyMap: Record<string, string> = {
        personality: "personality", "성격": "personality", "性格": "personality", "パーソナリティ": "personality",
        year_forecast: "year_forecast", "연간운세": "year_forecast", "연간_운세": "year_forecast", "올해운세": "year_forecast",
        "年間運勢": "year_forecast", "年間予測": "year_forecast", "年运": "year_forecast",
        element_guidance: "element_guidance", "오행조언": "element_guidance", "오행_조언": "element_guidance", "오행가이드": "element_guidance",
        "五行アドバイス": "element_guidance", "元素ガイダンス": "element_guidance", "五行指导": "element_guidance",
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
      const cleaned = rawText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      aiReading = normalizeReadingKeys(JSON.parse(cleaned));
    } catch {
      try {
        // Try to extract any JSON object from the response
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiReading = normalizeReadingKeys(JSON.parse(jsonMatch[0]));
        } else {
          console.error("No JSON found in AI response. Raw (first 500):", rawText.substring(0, 500));
          return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
        }
      } catch (e2) {
        console.error("JSON parse error:", e2, "Raw (first 500):", rawText.substring(0, 500));
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
        birth_hour: 12, birth_city: chart.birthCity,
        year_stem: ys, year_branch: yb, month_stem: ms, month_branch: mb,
        day_stem: ds, day_branch: db, hour_stem: hs, hour_branch: hb,
        day_master_element: chart.dayMaster.element, day_master_yinyang: chart.dayMaster.yinYang,
        archetype: chart.archetype, ten_god: chart.tenGod, harmony_score: chart.harmonyScore,
        dominant_element: chart.dominantElement, weakest_element: chart.weakestElement,
        elements_wood: chart.elements.wood, elements_fire: chart.elements.fire,
        elements_earth: chart.elements.earth, elements_metal: chart.elements.metal, elements_water: chart.elements.water,
        free_reading_personality: aiReading.personality, free_reading_year: aiReading.year_forecast,
        free_reading_element: aiReading.element_guidance, share_slug: shareSlug, is_paid: false,
        ...(userId ? { user_id: userId } : {}),
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
