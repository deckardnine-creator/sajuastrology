"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Claim pending reading before redirect
        try {
          const pendingSlug = localStorage.getItem("pending-claim-slug");
          if (pendingSlug) {
            localStorage.removeItem("pending-claim-slug");
            await fetch("/api/reading/claim", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ shareSlug: pendingSlug, userId: session.user.id }),
            }).catch(() => {});
          }
        } catch {}

        const returnUrl = localStorage.getItem("auth-return-url");
        if (returnUrl) {
          localStorage.removeItem("auth-return-url");
          window.location.href = returnUrl;
        } else {
          router.replace("/dashboard");
        }
        return;
      }

      // No session yet — poll briefly
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        const { data } = await supabase.auth.getSession();
        if (data.session || attempts > 10) {
          clearInterval(poll);
          const returnUrl = localStorage.getItem("auth-return-url");
          if (returnUrl) {
            localStorage.removeItem("auth-return-url");
            window.location.href = returnUrl;
          } else {
            router.replace("/dashboard");
          }
        }
      }, 500);
    };

    setTimeout(handleCallback, 100);
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">Completing sign in...</p>
      </div>
    </div>
  );
}
