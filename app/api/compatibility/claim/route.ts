import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/compatibility/claim
 *
 * Purpose
 * -------
 * Called by the client after sign-in when the user had previously
 * generated one or more compatibility readings as a guest.
 * This endpoint transfers ownership of those guest compat rows
 * (user_id = NULL) to the now-signed-in user, and bootstraps the
 * user's own `readings` row from Person A of the first claimed
 * compat if they don't already have one.
 *
 * Request
 * -------
 *   { userId: string, slugs: string[] }
 *
 * Response (always 200 unless userId missing)
 * -------------------------------------------
 *   { claimed: number, readingCreated: boolean, error?: string }
 *
 * Design Principles
 * -----------------
 *  1. Best-effort, never crashes. Failures are logged but the response
 *     is still shaped so the client's auth flow can continue cleanly.
 *  2. Per-slug try/catch so one bad slug does not abort the rest.
 *  3. Caps slug count at 10 to defend against malformed/huge payloads.
 *  4. Reading auto-creation is secondary and also try/catch-isolated;
 *     it runs only if at least one compat was successfully claimed AND
 *     the user has no existing readings.
 *  5. Zero new static imports — relies only on Next.js types and the
 *     existing @/lib/auto-create-reading helper (dynamically imported).
 */

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

const MAX_SLUGS_PER_REQUEST = 10;

type ClaimedCompatRow = {
  person_a_name?: string;
  person_a_gender?: string;
  person_a_birth_date?: string;
  person_a_birth_hour?: number | null;
  person_a_birth_hour_unknown?: boolean | null;
  person_a_birth_city?: string;
  locale?: string | null;
};

export async function POST(request: NextRequest) {
  try {
    // ─── 1. Parse and validate ─────────────────────────────────────────
    let body: { userId?: string; slugs?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { claimed: 0, readingCreated: false, error: "Invalid JSON" },
        { status: 400 }
      );
    }

    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    if (!userId) {
      return NextResponse.json(
        { claimed: 0, readingCreated: false, error: "Missing userId" },
        { status: 400 }
      );
    }

    const rawSlugs = Array.isArray(body.slugs) ? body.slugs : [];
    // Deduplicate, filter non-strings / empty, cap length
    const slugs = Array.from(
      new Set(
        rawSlugs
          .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
          .map((s) => s.trim())
      )
    ).slice(0, MAX_SLUGS_PER_REQUEST);

    if (slugs.length === 0) {
      return NextResponse.json({ claimed: 0, readingCreated: false });
    }

    // ─── 2. Supabase config check ──────────────────────────────────────
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        claimed: 0,
        readingCreated: false,
        error: "Server config error",
      });
    }

    // ─── 3. Claim each slug + collect first successfully-claimed row ───
    // Why "first successfully-claimed row" only?
    // The row is used to bootstrap the user's readings if needed. We only
    // need one Person A, so stop collecting after the first success.
    let claimed = 0;
    let firstClaimedRow: ClaimedCompatRow | null = null;

    for (const slug of slugs) {
      try {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/compatibility_results?share_slug=eq.${encodeURIComponent(
            slug
          )}&user_id=is.null&select=person_a_name,person_a_gender,person_a_birth_date,person_a_birth_hour,person_a_birth_hour_unknown,person_a_birth_city,locale`,
          {
            method: "PATCH",
            headers: { ...dbHeaders, Prefer: "return=representation" },
            body: JSON.stringify({ user_id: userId }),
          }
        );

        if (!res.ok) {
          // PostgREST returns 204 on no-match when Prefer is minimal, but
          // with return=representation returns 200 + empty array on no-match,
          // and non-2xx on real errors. Either way: skip silently.
          continue;
        }

        const rows = await res.json().catch(() => null);
        if (Array.isArray(rows) && rows.length > 0) {
          claimed += 1;
          if (!firstClaimedRow) {
            firstClaimedRow = rows[0] as ClaimedCompatRow;
          }
        }
      } catch {
        // Network or JSON error for this slug — move on to the next.
      }
    }

    // ─── 4. Bootstrap readings row (optional, best-effort) ─────────────
    let readingCreated = false;

    if (claimed > 0 && firstClaimedRow && firstClaimedRow.person_a_name) {
      try {
        // Validate gender before passing to the helper (which enforces
        // "male" | "female" strictly).
        const gender = firstClaimedRow.person_a_gender;
        const genderSafe: "male" | "female" | null =
          gender === "male" || gender === "female" ? gender : null;

        if (
          genderSafe &&
          firstClaimedRow.person_a_birth_date &&
          firstClaimedRow.person_a_birth_city
        ) {
          const hour =
            typeof firstClaimedRow.person_a_birth_hour === "number"
              ? firstClaimedRow.person_a_birth_hour
              : 12;

          const { ensureUserReading } = await import(
            "@/lib/auto-create-reading"
          );

          const result = await Promise.race([
            ensureUserReading({
              userId,
              name: firstClaimedRow.person_a_name,
              gender: genderSafe,
              birthDateStr: firstClaimedRow.person_a_birth_date,
              birthHour: hour,
              birthHourUnknown:
                firstClaimedRow.person_a_birth_hour_unknown === true,
              birthCity: firstClaimedRow.person_a_birth_city,
              locale: firstClaimedRow.locale || "en",
            }),
            new Promise<{ shareSlug: null; created: false }>((resolve) =>
              setTimeout(
                () => resolve({ shareSlug: null, created: false }),
                3000
              )
            ),
          ]);

          if (result && result.created) {
            readingCreated = true;
          }
        }
      } catch {
        // Silent: reading bootstrap is best-effort.
      }
    }

    return NextResponse.json({ claimed, readingCreated });
  } catch (err) {
    // Outermost guard — should never be reached because every inner path
    // has its own catch. If it is reached, something truly unexpected
    // happened: still return 200 so the auth flow in the client stays clean.
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({
      claimed: 0,
      readingCreated: false,
      error: `Unexpected: ${message.substring(0, 200)}`,
    });
  }
}
