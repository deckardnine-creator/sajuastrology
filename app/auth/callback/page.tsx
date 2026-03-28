"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { safeGet, safeRemove } from "@/lib/safe-storage";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Completing sign in...");

  useEffect(() => {
    let cancelled = false;

    const handleCallback = async () => {
      // Wait for Supabase to process the OAuth hash in the URL
      // detectSessionInUrl: true handles this, but we need to wait for it
      let session = null;

      // Poll for session — Supabase processes the URL hash asynchronously
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

      // Redirect to return URL or dashboard
      const returnUrl = safeGet("auth-return-url");
      if (returnUrl) {
        safeRemove("auth-return-url");
        // Use window.location.href for full page load — ensures auth state is fresh
        window.location.href = returnUrl;
      } else {
        window.location.href = "/dashboard";
      }
    };

    // Small delay to let Supabase auth listener process the URL hash first
    setTimeout(handleCallback, 150);

    return () => { cancelled = true; };
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
