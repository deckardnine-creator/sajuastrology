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

// ── Helpers ─────────────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";
const anthropicKey = process.env.ANTHROPIC_API_KEY || "";

const dbHeaders = {
  "Content-Type": "application/json",
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
};

function generateSlug(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let slug = "c-"; // prefix for compatibility
  for (let i = 0; i < 8; i++) slug += chars[Math.floor(Math.random() * chars.length)];
  return slug;
}

function toBirthDateStr(d: Date | string): string {
  if (typeof d === "string") return d.split("T")[0];
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function callClaude(prompt: string, label: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${label}: API ${res.status} — ${err.substring(0, 200)}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

function parseJSON(raw: string): any {
  return JSON.parse(raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim());
}

// ── Main Handler ────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { personA, personB, userId, generatePaid } = body;

    // Validate input
    if (!personA?.name || !personA?.birthDate || !personA?.gender || !personA?.birthCity) {
      return NextResponse.json({ error: "Missing Person A data" }, { status: 400 });
    }
    if (!personB?.name || !personB?.birthDate || !personB?.gender || !personB?.birthCity) {
      return NextResponse.json({ error: "Missing Person B data" }, { status: 400 });
    }

    // Parse dates
    const dateA = new Date(personA.birthDate);
    const dateB = new Date(personB.birthDate);
    const hourA = personA.birthHour ?? 12;
    const hourB = personB.birthHour ?? 12;
    const bdStrA = toBirthDateStr(dateA);
    const bdStrB = toBirthDateStr(dateB);

    // ═══ CACHE CHECK — same pair → return existing result ═══
    try {
      const cacheRes = await fetch(`${supabaseUrl}/rest/v1/compatibility_results?${new URLSearchParams({
        person_a_birth_date: `eq.${bdStrA}`,
        person_a_birth_hour: `eq.${hourA}`,
        person_b_birth_date: `eq.${bdStrB}`,
        person_b_birth_hour: `eq.${hourB}`,
        select: "share_slug,free_summary,paid_love",
        limit: "1",
      })}`, { headers: dbHeaders });
      if (cacheRes.ok) {
        const cached = await cacheRes.json();
        if (cached?.length > 0 && cached[0].free_summary) {
          // Claim for user if logged in
          if (userId && cached[0].share_slug) {
            fetch(`${supabaseUrl}/rest/v1/compatibility_results?share_slug=eq.${cached[0].share_slug}&user_id=is.null`, {
              method: "PATCH",
              headers: { ...dbHeaders, Prefer: "return=minimal" },
              body: JSON.stringify({ user_id: userId }),
            }).catch(() => {});
          }
          return NextResponse.json({ success: true, shareSlug: cached[0].share_slug, cached: true });
        }
      }
      // Also check reverse order (B,A instead of A,B)
      const revCacheRes = await fetch(`${supabaseUrl}/rest/v1/compatibility_results?${new URLSearchParams({
        person_a_birth_date: `eq.${bdStrB}`,
        person_a_birth_hour: `eq.${hourB}`,
        person_b_birth_date: `eq.${bdStrA}`,
        person_b_birth_hour: `eq.${hourA}`,
        select: "share_slug,free_summary",
        limit: "1",
      })}`, { headers: dbHeaders });
      if (revCacheRes.ok) {
        const revCached = await revCacheRes.json();
        if (revCached?.length > 0 && revCached[0].free_summary) {
          return NextResponse.json({ success: true, shareSlug: revCached[0].share_slug, cached: true });
        }
      }
    } catch { /* cache miss — continue */ }

    // ═══ RATE LIMIT — 3 per 5 minutes per identity ═══
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    try {
      const rateRes = await fetch(`${supabaseUrl}/rest/v1/compatibility_results?${new URLSearchParams({
        person_a_name: `eq.${personA.name}`,
        created_at: `gte.${fiveMinAgo}`,
        select: "id",
        limit: "5",
      })}`, { headers: dbHeaders });
      if (rateRes.ok) {
        const recent = await rateRes.json();
        if (recent && recent.length >= 3) {
          return NextResponse.json({ error: "Too many requests. Please wait a few minutes." }, { status: 429 });
        }
      }
    } catch { /* allow through */ }

    // ═══ CALCULATE ═══
    const chartA = calculateSaju(personA.name, personA.gender, dateA, hourA, personA.birthCity);
    const chartB = calculateSaju(personB.name, personB.gender, dateB, hourB, personB.birthCity);
    const scores = calculateCompatibility(chartA, chartB);

    // ═══ GENERATE FREE SUMMARY ═══
    if (!anthropicKey) {
      return NextResponse.json({ error: "AI not configured" }, { status: 500 });
    }

    const freeRaw = await callClaude(buildFreeCompatibilityPrompt(scores), "FreeSummary");
    let freeSummary: string;
    try {
      const parsed = parseJSON(freeRaw);
      freeSummary = parsed.summary;
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    if (!freeSummary) {
      return NextResponse.json({ error: "Empty AI response" }, { status: 500 });
    }

    // ═══ GENERATE PAID CONTENT (if requested) ═══
    let paidData: { love?: string; work?: string; friendship?: string; conflict?: string; yearly?: string } = {};
    if (generatePaid) {
      try {
        const [raw1, raw2, raw3] = await Promise.all([
          callClaude(buildPaidCompatPrompt1(scores), "Paid-Love+Work"),
          callClaude(buildPaidCompatPrompt2(scores), "Paid-Friend+Conflict"),
          callClaude(buildPaidCompatPrompt3(scores), "Paid-Yearly"),
        ]);
        const p1 = parseJSON(raw1);
        const p2 = parseJSON(raw2);
        const p3 = parseJSON(raw3);
        paidData = {
          love: p1.love,
          work: p1.work,
          friendship: p2.friendship,
          conflict: p2.conflict,
          yearly: p3.yearly,
        };
      } catch (err) {
        console.error("Paid generation failed:", err);
        // Free summary still succeeds — paid can be retried
      }
    }

    // ═══ SAVE TO DB ═══
    const shareSlug = generateSlug();
    const insertBody: Record<string, any> = {
      user_id: userId || null,
      person_a_name: personA.name,
      person_a_gender: personA.gender,
      person_a_birth_date: bdStrA,
      person_a_birth_hour: hourA,
      person_a_birth_city: personA.birthCity,
      person_a_day_master: `${chartA.dayMaster.zh} ${chartA.dayMaster.en}`,
      person_a_element: chartA.dayMaster.element,
      person_b_name: personB.name,
      person_b_gender: personB.gender,
      person_b_birth_date: bdStrB,
      person_b_birth_hour: hourB,
      person_b_birth_city: personB.birthCity,
      person_b_day_master: `${chartB.dayMaster.zh} ${chartB.dayMaster.en}`,
      person_b_element: chartB.dayMaster.element,
      overall_score: scores.overall,
      love_score: scores.love,
      work_score: scores.work,
      friendship_score: scores.friendship,
      conflict_score: scores.conflict,
      free_summary: freeSummary,
      share_slug: shareSlug,
    };

    if (paidData.love) {
      insertBody.paid_love = paidData.love;
      insertBody.paid_work = paidData.work;
      insertBody.paid_friendship = paidData.friendship;
      insertBody.paid_conflict = paidData.conflict;
      insertBody.paid_yearly = paidData.yearly;
    }

    await fetch(`${supabaseUrl}/rest/v1/compatibility_results`, {
      method: "POST",
      headers: { ...dbHeaders, Prefer: "return=minimal" },
      body: JSON.stringify(insertBody),
    });

    return NextResponse.json({ success: true, shareSlug });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
