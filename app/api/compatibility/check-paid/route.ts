// ════════════════════════════════════════════════════════════════════
// /api/compatibility/check-paid — return is_paid status for a slug.
// ════════════════════════════════════════════════════════════════════
// v6.15 ADDS this endpoint instead of modifying /api/compatibility/get
// per chandler's "never modify existing functions, append only" rule.
//
// v6.15.5 PATCH: admin bypass.
// rimfacai@gmail.com is the master content-creation account and skips
// all paywalls. We check the optional `userEmail` in the body BEFORE
// touching the DB and short-circuit to is_paid:true. We also fire-and-
// forget a row UPDATE so the DB column matches reality for any other
// code that reads compatibility_results.is_paid directly.
//
// The result page calls this once on mount and again after returning
// from PayPal. Tiny payload (1 boolean) so polling is cheap.
//
// Edge runtime for fast response from anywhere in the world.
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

// Same source of truth as checkout-compatibility / checkout-consultation /
// reading client. Lowercase comparison everywhere.
const ADMIN_EMAILS = ["rimfacai@gmail.com"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({} as any));
    const shareSlug: string | undefined = body?.shareSlug;
    const userEmail: string | undefined = body?.userEmail;

    if (!shareSlug) {
      return NextResponse.json({ error: "Missing shareSlug" }, { status: 400 });
    }

    // ═══ ADMIN BYPASS ═══
    // If the caller's email is on the admin list, return paid immediately
    // and (best-effort) flip the DB column so direct reads stay consistent.
    const normalizedEmail = (userEmail || "").trim().toLowerCase();
    const isAdmin = !!normalizedEmail && ADMIN_EMAILS.includes(normalizedEmail);

    if (isAdmin) {
      // Fire-and-forget DB sync. Failure here MUST NOT break the response —
      // worst case equals current behavior (still returns is_paid:true).
      try {
        await fetch(
          `${supabaseUrl}/rest/v1/compatibility_results?share_slug=eq.${encodeURIComponent(
            shareSlug
          )}`,
          {
            method: "PATCH",
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
              Prefer: "return=minimal",
            },
            body: JSON.stringify({ is_paid: true }),
          }
        );
      } catch {
        // ignore — admin still gets paid:true below
      }
      return NextResponse.json({ is_paid: true });
    }

    // ═══ Normal path (unchanged behavior) ═══
    const res = await fetch(
      `${supabaseUrl}/rest/v1/compatibility_results?share_slug=eq.${encodeURIComponent(
        shareSlug
      )}&select=is_paid&limit=1`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ is_paid: false });
    }

    const rows = await res.json();
    const isPaid = !!(rows?.[0]?.is_paid);
    return NextResponse.json({ is_paid: isPaid });
  } catch {
    return NextResponse.json({ is_paid: false });
  }
}
