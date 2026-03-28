import { NextRequest, NextResponse } from "next/server";
import { calculateSaju, type SajuChart } from "@/lib/saju-calculator";
import { calculateCompatibility } from "@/lib/compatibility-calculator";
import {
  buildFreeCompatibilityPrompt,
  buildPaidCompatPrompt1,
  buildPaidCompatPrompt2,
  buildPaidCompatPrompt3,
} from "@/lib/compatibility-prompts";

export const maxDuration = 60;

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

async function callGemini(prompt: string, label: string, model = "gemini-2.5-flash"): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY || "";
  if (!apiKey) throw new Error("Gemini not configured");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: 3000,
        },
      }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${label} Gemini ${res.status}: ${err.substring(0, 200)}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
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

async function callAI(prompt: string, label: string): Promise<string> {
  // Gemini Flash → Gemini Pro → Claude Haiku
  try {
    return await callGemini(prompt, label, "gemini-2.5-flash");
  } catch (err) {
    console.warn(`${label}: Gemini Flash failed —`, err instanceof Error ? err.message : err);
    try {
      return await callGemini(prompt, label, "gemini-2.5-pro");
    } catch (err2) {
      console.warn(`${label}: Gemini Pro failed, falling back to Claude —`, err2 instanceof Error ? err2.message : err2);
      return await callClaudeFallback(prompt, label);
    }
  }
}

function parseJSON(raw: string): any {
  return JSON.parse(raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim());
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

    // ═══ GENERATE ALL CONTENT — Gemini Pro → Claude fallback ═══
    const [freeRaw, raw1, raw2, raw3] = await Promise.all([
      callAI(buildFreeCompatibilityPrompt(scores, locale), "FreeSummary"),
      callAI(buildPaidCompatPrompt1(scores, locale), "Paid-Love+Work"),
      callAI(buildPaidCompatPrompt2(scores, locale), "Paid-Friend+Conflict"),
      callAI(buildPaidCompatPrompt3(scores, locale), "Paid-Yearly"),
    ]);

    let freeSummary: string;
    try { freeSummary = parseJSON(freeRaw).summary; } catch { return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 }); }
    if (!freeSummary) return NextResponse.json({ error: "Empty AI response" }, { status: 500 });

    let paidData: Record<string, string> = {};
    try {
      const p1 = parseJSON(raw1);
      const p2 = parseJSON(raw2);
      const p3 = parseJSON(raw3);
      paidData = { love: p1.love, work: p1.work, friendship: p2.friendship, conflict: p2.conflict, yearly: p3.yearly };
    } catch (err) {
      console.error("Paid compat generation failed:", err);
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
    };

    if (paidData.love) {
      insertBody.paid_love = paidData.love;
      insertBody.paid_work = paidData.work;
      insertBody.paid_friendship = paidData.friendship;
      insertBody.paid_conflict = paidData.conflict;
      insertBody.paid_yearly = paidData.yearly;
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
