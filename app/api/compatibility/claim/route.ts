import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/compatibility/claim
 *
 * Purpose
 * -------
 * Called by the client after sign-in when the user had previously
 * generated one or more compatibility readings as a guest.
 * This endpoint transfers ownership of those guest compat rows
 * (user_id = NULL) to the now-signed-in user.
 *
 * Request
 * -------
 *   { userId: string, slugs: string[] }
 *
 * Response (always 200 unless userId missing)
 * -------------------------------------------
 *   { claimed: number, readingCreated: false, error?: string }
 *
 * v6.17.42 NOTE
 * -------------
 * Previously this endpoint also bootstrapped a `readings` row for the
 * user from Person A of the first claimed compat. That auto-bootstrap
 * has been removed: the dashboard's "my saju" must come from the user
 * deliberately entering their own birth data (via /calculate, Soram
 * first-entry, or /setup-primary-chart from the dashboard CTA), NOT
 * from whatever they typed into a casual compat form.
 *
 * `readingCreated` is kept in the response shape for backward
 * compatibility with the existing client code path, but is now
 * always `false`.
 *
 * Design Principles
 * -----------------
 *  1. Best-effort, never crashes. Failures are logged but the response
 *     is still shaped so the client's auth flow can continue cleanly.
 *  2. Per-slug try/catch so one bad slug does not abort the rest.
 *  3. Caps slug count at 10 to defend against malformed/huge payloads.
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

    // ─── 3. Claim each slug ────────────────────────────────────────────
    // Transfers user_id from NULL → userId for each guest compat row.
    // Per-slug try/catch so one failure doesn't kill the rest.
    let claimed = 0;

    for (const slug of slugs) {
      try {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/compatibility_results?share_slug=eq.${encodeURIComponent(
            slug
          )}&user_id=is.null&select=share_slug`,
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
        }
      } catch {
        // Network or JSON error for this slug — move on to the next.
      }
    }

    // ─── 4. v6.17.42 — readings bootstrap REMOVED ──────────────────────
    // See header comment. The dashboard chart now comes ONLY from
    // my_primary_chart, set by the user's deliberate input flows.

    return NextResponse.json({ claimed, readingCreated: false });
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
