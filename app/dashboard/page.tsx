"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { Navbar } from "@/components/landing/navbar";
import { useLanguage } from "@/lib/language-context";
import { isNativeApp } from "@/lib/native-app";
import { safeSet } from "@/lib/safe-storage";

// ════════════════════════════════════════════════════════════════════
// v1.3 Sprint 2-B: removed <MobileDashboardNav /> import + render.
// Global <MobileBottomNav /> is now mounted in app/layout.tsx and
// covers Home / Reading / Soram / Match / My across the whole app.
// Bottom padding bumped from pb-20 → pb-24 to give the gold raised
// Soram tab room without overlapping the dashboard footer links.
// ════════════════════════════════════════════════════════════════════

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { locale } = useLanguage();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // ════════════════════════════════════════════════════════════════
  // Redirect unauthenticated users to home with ?signin=1.
  // Home detects the param and auto-opens the sign-in modal. This
  // prevents the "dashboard flash before modal" UX — unauthenticated
  // users never see dashboard chrome and never land on a dead
  // /dashboard URL.
  //
  // v6.12 fixes (chandler: "마이에서 로그인 하면 평소랑 다르다"):
  //
  //   1. PRESERVE ?app=true. The Flutter shell loads this page as
  //      /dashboard?app=true&lang=ko. The previous redirect built
  //      `/?${params}` from scratch and dropped the app marker, so
  //      home rendered web navbar/footer briefly while detectNative
  //      caught up. We now propagate `app=true` explicitly when in
  //      native mode.
  //
  //   2. STORE auth-return-url so the user lands BACK on /dashboard
  //      after signing in (not on / where they'll have to tap "My"
  //      again). The /auth/callback flow already honors auth-return-
  //      url; we just need to set it here. Path is preserved with
  //      ?app=true on native so dashboard reloads in app mode.
  //
  //   3. Fallback when isNativeApp() returns false on first call
  //      (rare race during hydration): we still set the auth-return-
  //      url path; callback's withAppParam() helper will inject
  //      ?app=true at redirect time as a second line of defense.
  // ════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!isLoading && !user) {
      // (2) Set return-url BEFORE we navigate away, so callback
      // can route back here. Use the current window.location which
      // already has the right app/lang params from Flutter's loadUrl.
      try {
        const here =
          typeof window !== "undefined"
            ? window.location.pathname + window.location.search
            : "/dashboard";
        safeSet("auth-return-url", here);
      } catch {}

      // (1) Build the home redirect, preserving ?app=true on native.
      const params = new URLSearchParams();
      params.set("signin", "1");
      if (locale && locale !== "en") params.set("lang", locale);
      if (isNativeApp()) params.set("app", "true");
      router.replace(`/?${params.toString()}`);
    }
  }, [isLoading, user, locale, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:flex min-h-screen">
        <DashboardSidebar />
        <main className="flex-1 ml-64 p-8 flex flex-col">
          <DashboardContent />
        </main>
      </div>

      <div className="md:hidden">
        <Navbar />
        <main className="pb-24 px-4 pt-page">
          <DashboardContent />
        </main>
        {/* MobileBottomNav is rendered globally in app/layout.tsx */}
      </div>
    </div>
  );
}
