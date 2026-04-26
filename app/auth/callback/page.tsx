"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { safeGet, safeRemove } from "@/lib/safe-storage";
import { isNativeApp } from "@/lib/native-app";

// ════════════════════════════════════════════════════════════════════
// /auth/callback — finalize OAuth, claim pending content, redirect.
// ════════════════════════════════════════════════════════════════════
// v6.12 fixes layered on top of the existing flow:
//
//   1. Preserve ?app=true on the returnUrl. The OAuth provider may
//      strip query params from the originating URL by the time we
//      redirect back. If we're inside the Flutter shell, the
//      destination MUST keep ?app=true or the next page will render
//      with web navbar/footer (race with native detection).
//
//   2. Default destination is /dashboard (was already the case),
//      and on native we ensure /dashboard?app=true.
//
//   3. Set sessionStorage "auth-callback-completed" RIGHT BEFORE
//      navigating, so auth-context's SIGNED_IN handler on the
//      destination page knows to skip its post-signin reload —
//      otherwise the destination would get reloaded once on top
//      of our redirect (visible double-flash). The flag is single-
//      use: auth-context reads it once and removes it.
//
//   4. URL hardening helper applies the ?app=true rule consistently
//      whether the dest comes from auth-return-url, dashboard, or
//      a custom path. Same-origin paths only.
// ════════════════════════════════════════════════════════════════════
function withAppParam(dest: string): string {
  // Only mutate if we're in the native shell. Web stays clean.
  if (!isNativeApp()) return dest;

  try {
    // Allow either same-origin path ("/foo?bar") or absolute URL.
    // Build a parser-friendly URL using the current origin if needed.
    const base =
      typeof window !== "undefined" ? window.location.origin : "https://sajuastrology.com";
    const url = new URL(dest, base);
    // Same-origin guard: never inject ?app=true into a third-party URL.
    if (typeof window !== "undefined" && url.origin !== window.location.origin) {
      return dest;
    }
    if (url.searchParams.get("app") !== "true") {
      url.searchParams.set("app", "true");
    }
    // Return relative form when caller passed a path (preserve their convention)
    // — easier on consumers and indistinguishable for window.location.href assignment.
    return dest.startsWith("/") ? `${url.pathname}${url.search}${url.hash}` : url.toString();
  } catch {
    // If URL parsing fails (rare), fall back to the original.
    return dest;
  }
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Completing sign in...");

  useEffect(() => {
    let cancelled = false;

    const handleCallback = async () => {
      // Wait for Supabase to process the OAuth hash in the URL.
      // detectSessionInUrl: true handles this, but we need to wait for it.
      let session = null;

      // Poll for session — Supabase processes the URL hash asynchronously.
      for (let i = 0; i < 20; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          session = data.session;
          break;
        }
        await new Promise((r) => setTimeout(r, 300));
        if (i === 5) setStatus("Almost there...");
      }

      if (cancelled) return;

      // Claim pending reading
      if (session?.user) {
        try {
          const pendingSlug = safeGet("pending-claim-slug");
          if (pendingSlug) {
            safeRemove("pending-claim-slug");
            await fetch("/api/reading/claim", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ shareSlug: pendingSlug, userId: session.user.id }),
            }).catch(() => {});
          }
        } catch {}
      }

      // ════════════════════════════════════════════════════════════
      // Determine final destination.
      //
      // Priority:
      //   1. auth-return-url stored before signIn() was called.
      //      This was set by lib/auth-context.tsx:signIn() to remember
      //      the URL the user was on when they clicked the sign-in
      //      button — bringing them back to that exact page is the
      //      least surprising flow for a "sign in mid-task" user.
      //   2. /dashboard fallback for users who arrive at sign-in
      //      from a generic entry point with no captured return-url.
      //
      // v6.12: both paths run through withAppParam() so the Flutter
      // shell's ?app=true marker is preserved across the redirect.
      // ════════════════════════════════════════════════════════════
      let dest: string;
      const returnUrl = safeGet("auth-return-url");
      if (returnUrl) {
        safeRemove("auth-return-url");
        dest = withAppParam(returnUrl);
      } else {
        dest = withAppParam("/dashboard");
      }

      // ════════════════════════════════════════════════════════════
      // v6.12: signal to auth-context's SIGNED_IN handler on the
      // destination page that the post-signin reload has effectively
      // already happened (we're doing a hard navigation right now,
      // which serves the same purpose). Without this flag, the
      // destination page receives SIGNED_IN, sees no `post-signin-
      // reloaded` lock, and runs ANOTHER window.location.href reload
      // → user sees two page transitions for one signin. The flag
      // is read-and-cleared on the destination side.
      // ════════════════════════════════════════════════════════════
      try {
        sessionStorage.setItem("auth-callback-completed", "1");
      } catch {}

      // Use window.location.href for full page load — ensures auth state is fresh
      // and React re-renders with the new authenticated user from frame 1.
      window.location.href = dest;
    };

    // Small delay to let Supabase auth listener process the URL hash first.
    setTimeout(handleCallback, 150);

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">{status}</p>
      </div>
    </div>
  );
}
