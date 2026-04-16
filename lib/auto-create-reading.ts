/**
 * lib/auto-create-reading.ts
 *
 * Purpose
 * -------
 * Ensures a signed-in user has at least one row in `readings` so the
 * Dashboard / Today's Fortune / personal saju widgets always have data
 * to render, regardless of which entry point the user first used
 * (free saju, free compatibility, or paid consultation).
 *
 * Design Principles
 * -----------------
 * 1. NEVER throws. All failures return
 *    { shareSlug: null, created: false, error }.
 *    Callers invoke this as a fire-and-forget side effect inside their
 *    own try/catch, so a failure here must not break the primary flow
 *    (compat generation, consultation start, etc.).
 *
 * 2. Chart-only insert. `free_reading_personality`, `free_reading_year`,
 *    `free_reading_element` are intentionally left NULL. The Dashboard
 *    does not read those columns. The /reading/[slug] page conditionally
 *    hides those sections when NULL. Users who later want the AI
 *    commentary can trigger it via the existing /api/reading/generate
 *    endpoint (cached by the exact-match check there).
 *
 * 3. Idempotent per user. If the user already has any reading,
 *    returns the existing oldest reading's share_slug and does NOT
 *    create a duplicate.
 *
 * 4. Zero new dependencies. Reuses @/lib/saju-calculator and
 *    @/lib/reading-prompts (both already imported across the codebase).
 *
 * 5. Safe for concurrent callers. Two simultaneous calls for the same
 *    user may both pass the pre-check and both insert. Worst case is
 *    two readings rows for the user, which the Dashboard handles fine
 *    (it shows the list and uses the oldest as primary). A UNIQUE
 *    constraint on (user_id) would be stronger but requires schema
 *    migration — deferred to post-v1.1 hardening.
 */

import { calculateSaju } from "@/lib/saju-calculator";
import { generateShareSlug } from "@/lib/reading-prompts";

// ─────────────────────────────────────────────────────────────────────────────
//  Public types
// ─────────────────────────────────────────────────────────────────────────────

export interface EnsureReadingInput {
  /** Supabase auth user id (UUID). Required. */
  userId: string;

  /** Full name as entered by the user. Required. */
  name: string;

  /** Must be exactly "male" or "female" (enforced by readings_gender_check). */
  gender: "male" | "female";

  /** Birth date in "YYYY-MM-DD" format. Required. */
  birthDateStr: string;

  /** Birth hour 0–23. Values outside this range fall back to 12. */
  birthHour: number;

  /** True when the user does not know their birth hour. Defaults to false. */
  birthHourUnknown?: boolean;

  /** City name as selected from the city picker. Required. */
  birthCity: string;

  /** "en" | "ko" | "ja". Defaults to "en". */
  locale?: string;
}

export interface EnsureReadingResult {
  /** Share slug of the user's primary reading (existing or newly created). */
  shareSlug: string | null;
  /** True only if this call inserted a new row. */
  created: boolean;
  /** Populated only on failure; callers should log but NOT throw. */
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
//  ensureUserReading
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ensures the given user has at least one entry in `readings`.
 *
 * Behaviour
 * ---------
 *  1. Look up any existing reading for the user. If found, return its
 *     share_slug with created=false.
 *  2. Otherwise compute the Saju chart from the supplied birth data and
 *     insert a chart-only row (no AI text) with user_id set.
 *  3. On any error, return { shareSlug: null, created: false, error }.
 *     Never throws.
 */
export async function ensureUserReading(
  input: EnsureReadingInput
): Promise<EnsureReadingResult> {
  try {
    // ── 1. Validate inputs ────────────────────────────────────────────────
    if (!input.userId) {
      return { shareSlug: null, created: false, error: "Missing userId" };
    }
    if (!input.name || !input.gender || !input.birthDateStr || !input.birthCity) {
      return {
        shareSlug: null,
        created: false,
        error: "Missing required birth data field(s)",
      };
    }
    if (input.gender !== "male" && input.gender !== "female") {
      return {
        shareSlug: null,
        created: false,
        error: `Invalid gender: ${String(input.gender)}`,
      };
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.birthDateStr)) {
      return {
        shareSlug: null,
        created: false,
        error: `Invalid birthDateStr format: ${input.birthDateStr}`,
      };
    }

    const hour =
      typeof input.birthHour === "number" &&
      Number.isFinite(input.birthHour) &&
      input.birthHour >= 0 &&
      input.birthHour <= 23
        ? Math.floor(input.birthHour)
        : 12;

    const locale = input.locale || "en";

    // ── 2. Supabase config ────────────────────────────────────────────────
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "";
    if (!supabaseUrl || !supabaseKey) {
      return {
        shareSlug: null,
        created: false,
        error: "Supabase environment not configured",
      };
    }
    const dbHeaders = {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    };

    // ── 3. Existence check ────────────────────────────────────────────────
    // Use oldest reading as "primary" (matches Dashboard convention: the
    // first reading the user ever had is treated as their default).
    try {
      const existingRes = await fetch(
        `${supabaseUrl}/rest/v1/readings?user_id=eq.${encodeURIComponent(
          input.userId
        )}&select=share_slug&order=created_at.asc&limit=1`,
        { headers: dbHeaders }
      );
      if (existingRes.ok) {
        const rows = await existingRes.json();
        if (Array.isArray(rows) && rows.length > 0 && rows[0]?.share_slug) {
          return { shareSlug: rows[0].share_slug, created: false };
        }
      }
      // If the check itself failed (non-2xx), fall through to compute+insert.
      // Worst case is a duplicate row, which is strictly better than leaving
      // the user with zero readings on the Dashboard.
    } catch {
      // Network error on existence check — fall through to compute+insert.
    }

    // ── 4. Compute Saju chart ────────────────────────────────────────────
    let chart: ReturnType<typeof calculateSaju>;
    try {
      const birthDateObj = new Date(input.birthDateStr + "T00:00:00");
      if (Number.isNaN(birthDateObj.getTime())) {
        return {
          shareSlug: null,
          created: false,
          error: `Invalid birthDate: ${input.birthDateStr}`,
        };
      }
      chart = calculateSaju(
        input.name,
        input.gender,
        birthDateObj,
        hour,
        input.birthCity
      );
    } catch (err) {
      return {
        shareSlug: null,
        created: false,
        error:
          "calculateSaju failed: " +
          (err instanceof Error ? err.message : String(err)),
      };
    }

    // Defensive: confirm the chart has every field the DB marks NOT NULL.
    // If calculateSaju returned a degraded chart we must not attempt an
    // INSERT that will fail at the DB level with a CHECK violation.
    if (
      !chart?.pillars?.year?.stem?.zh ||
      !chart?.pillars?.year?.branch?.zh ||
      !chart?.pillars?.month?.stem?.zh ||
      !chart?.pillars?.month?.branch?.zh ||
      !chart?.pillars?.day?.stem?.zh ||
      !chart?.pillars?.day?.branch?.zh ||
      !chart?.pillars?.hour?.stem?.zh ||
      !chart?.pillars?.hour?.branch?.zh ||
      !chart?.dayMaster?.element ||
      !chart?.dayMaster?.yinYang ||
      !chart?.archetype ||
      !chart?.tenGod ||
      typeof chart?.harmonyScore !== "number" ||
      !chart?.dominantElement ||
      !chart?.weakestElement
    ) {
      return {
        shareSlug: null,
        created: false,
        error: "Chart computed but missing required fields",
      };
    }

    // ── 5. INSERT chart-only row ─────────────────────────────────────────
    const shareSlug = generateShareSlug();
    const insertBody: Record<string, unknown> = {
      user_id: input.userId,
      name: chart.name,
      gender: chart.gender,
      birth_date: input.birthDateStr,
      birth_hour: hour,
      birth_hour_unknown: !!input.birthHourUnknown,
      birth_city: input.birthCity,
      year_stem: chart.pillars.year.stem.zh,
      year_branch: chart.pillars.year.branch.zh,
      month_stem: chart.pillars.month.stem.zh,
      month_branch: chart.pillars.month.branch.zh,
      day_stem: chart.pillars.day.stem.zh,
      day_branch: chart.pillars.day.branch.zh,
      hour_stem: chart.pillars.hour.stem.zh,
      hour_branch: chart.pillars.hour.branch.zh,
      day_master_element: chart.dayMaster.element,
      day_master_yinyang: chart.dayMaster.yinYang,
      archetype: chart.archetype,
      ten_god: chart.tenGod,
      harmony_score: chart.harmonyScore,
      dominant_element: chart.dominantElement,
      weakest_element: chart.weakestElement,
      elements_wood: chart.elements?.wood ?? 0,
      elements_fire: chart.elements?.fire ?? 0,
      elements_earth: chart.elements?.earth ?? 0,
      elements_metal: chart.elements?.metal ?? 0,
      elements_water: chart.elements?.water ?? 0,
      share_slug: shareSlug,
      is_paid: false,
      locale,
      // free_reading_personality / free_reading_year / free_reading_element:
      //   intentionally omitted (NULL). The Dashboard doesn't read them;
      //   the /reading/[slug] UI hides those sections when NULL; users can
      //   trigger real AI generation via /api/reading/generate on demand.
    };

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/readings`, {
      method: "POST",
      headers: { ...dbHeaders, Prefer: "return=minimal" },
      body: JSON.stringify(insertBody),
    });

    if (!insertRes.ok) {
      const errText = await insertRes.text().catch(() => "unknown");
      return {
        shareSlug: null,
        created: false,
        error: `DB insert failed (${insertRes.status}): ${errText.substring(0, 200)}`,
      };
    }

    return { shareSlug, created: true };
  } catch (err) {
    // Catch-all belt-and-braces: this function must never throw.
    return {
      shareSlug: null,
      created: false,
      error:
        "ensureUserReading unexpected: " +
        (err instanceof Error ? err.message : String(err)),
    };
  }
}
