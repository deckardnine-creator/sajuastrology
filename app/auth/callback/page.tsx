"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Supabase JS detects the auth code/hash in the URL automatically
    // via detectSessionInUrl: true in the client config.
    // We just need to wait for the session to be established, then redirect.

    const handleCallback = async () => {
      // Wait for Supabase to process the URL params
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth callback error:", error);
        router.replace("/");
        return;
      }

      if (session) {
        // Session established — the AuthProvider's onAuthStateChange
        // will handle claimReadings and return URL redirect.
        // Just go to home; the auth-context will redirect to return URL if set.
        router.replace("/");
      } else {
        // No session yet — might need a moment for the exchange
        // Poll briefly then redirect
        let attempts = 0;
        const poll = setInterval(async () => {
          attempts++;
          const { data } = await supabase.auth.getSession();
          if (data.session || attempts > 10) {
            clearInterval(poll);
            router.replace("/");
          }
        }, 500);
      }
    };

    // Small delay to let Supabase JS process URL params first
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
