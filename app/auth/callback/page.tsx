"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { Sparkles } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // The Supabase client automatically detects the ?code= parameter
    // and exchanges it for a session (PKCE flow).
    // We listen for the result and redirect.

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        // Successfully signed in — go home
        router.replace("/");
      }
    });

    // Also check if session already exists (e.g. code already exchanged)
    supabase.auth.getSession().then(({ data: { session }, error: err }) => {
      if (err) {
        setError(err.message);
        return;
      }
      if (session) {
        router.replace("/");
      }
    });

    // Safety timeout — if nothing happens in 15s, redirect home
    const timeout = setTimeout(() => {
      router.replace("/");
    }, 15000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-6">
          <p className="text-destructive font-medium mb-2">
            Sign in failed
          </p>
          <p className="text-sm text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => router.replace("/")}
            className="text-sm text-primary hover:underline"
          >
            Go back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
        </div>
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">
          Completing sign in...
        </p>
      </div>
    </div>
  );
}
