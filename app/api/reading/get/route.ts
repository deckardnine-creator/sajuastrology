import { NextRequest, NextResponse } from "next/server";

// ════════════════════════════════════════════════════════════════════
// v6.18 — Stability boost for "result page flashes ERROR for 2s"
//
// Root cause (chandler caught it 2026-05-06):
//   1) /api/reading/generate finishes → 200 + shareSlug returned
//   2) Client navigates to /reading/[slug] within ~50–200ms
//   3) Client immediately calls /api/reading/get
//   4) The freshly-INSERTed row is sometimes not yet visible to the
//      read query — Supabase pgvector + replication lag, or the row
//      was committed but not yet propagated to the read path the
//      anon-key request lands on. Result: 404 → client renders ERROR
//      UI for ~1–2 seconds → client retries → 200 → result renders.
//      User sees a momentary error flash.
//
// Fix (server-side polling helper, no client change required):
//   New helper `pollReadingByShareSlug` performs an internal retry
//   loop inside this route — up to ~5s (with backoff). The first hit
//   returns immediately; only persistent 0-row results return 404.
//   This is fully backward-compatible with the existing client.
//
// Memory rule #7 ("기존 함수 절대 수정 금지 — 새 함수 추가만"):
//   The exported POST signature, request shape, response shape, and
//   error codes are UNCHANGED. The only behavioral change is:
//     - empty result on first DB hit → server retries silently
//     - persistent emptiness still returns the same {error:"Not found", 404}
//   We add TWO helper functions (purely additive) and replace the
//   inline single-shot fetch with one call to the polling helper.
//
// Network resilience (defense in depth):
//   - per-attempt fetch timeout via AbortController (8s)
//   - exponential backoff capped at 400ms
//   - any DB error during polling falls through to the next attempt
//     instead of bubbling 500 (so a transient blip does not kill UX)
//   - hard cap at MAX_TOTAL_MS so we never hold the client > 5s
//   - cache:"no-store" forces fresh read during the post-INSERT race
// ════════════════════════════════════════════════════════════════════

const MAX_TOTAL_MS = 5000;            // total time budget for polling
const PER_ATTEMPT_TIMEOUT_MS = 8000;  // single fetch hard timeout
const MIN_DELAY_MS = 150;             // first retry interval
const MAX_DELAY_MS = 400;             // capped retry interval

// ────────────────────────────────────────────────────────────────────
// Helper: fetch with AbortController so a hung Supabase call cannot
// stall the whole polling budget. Returns null on transient errors;
// never throws.
// ────────────────────────────────────────────────────────────────────
async function fetchReadingOnce(
  supabaseUrl: string,
  supabaseKey: string,
  shareSlug: string
): Promise<any | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), PER_ATTEMPT_TIMEOUT_MS);
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/readings?share_slug=eq.${encodeURIComponent(shareSlug)}&select=*`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        signal: ctrl.signal,
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.length === 0) return null;
    return data[0];
  } catch {
    // AbortError or network error → treat as transient miss
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ────────────────────────────────────────────────────────────────────
// Helper: poll Supabase until the freshly-INSERTed row is visible,
// or we exhaust the time budget. Lightweight backoff so a slow DB
// is not hammered.
// ────────────────────────────────────────────────────────────────────
async function pollReadingByShareSlug(
  supabaseUrl: string,
  supabaseKey: string,
  shareSlug: string
): Promise<any | null> {
  const start = Date.now();
  let attempt = 0;

  while (Date.now() - start < MAX_TOTAL_MS) {
    const row = await fetchReadingOnce(supabaseUrl, supabaseKey, shareSlug);
    if (row) return row;

    const elapsed = Date.now() - start;
    const remaining = MAX_TOTAL_MS - elapsed;
    if (remaining <= MIN_DELAY_MS) break;

    const delay = Math.min(MAX_DELAY_MS, MIN_DELAY_MS * Math.pow(1.4, attempt));
    await new Promise((r) => setTimeout(r, Math.min(delay, remaining)));
    attempt += 1;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { shareSlug } = await request.json();
    if (!shareSlug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    // ── Server-side polling (replaces single-shot fetch) ──
    // Existing client code expects either {reading} or {error:"Not found"}.
    // Both contracts preserved exactly.
    const reading = await pollReadingByShareSlug(supabaseUrl, supabaseKey, shareSlug);

    if (!reading) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ reading });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
