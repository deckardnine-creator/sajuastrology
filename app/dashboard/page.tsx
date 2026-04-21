"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { MobileDashboardNav } from "@/components/dashboard/mobile-dashboard-nav";
import { Navbar } from "@/components/landing/navbar";
import { useLanguage } from "@/lib/language-context";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { locale } = useLanguage();

  useEffect(() => { window.scrollTo(0, 0); }, []);
  // Redirect unauthenticated users to home with ?signin=1.
  // Home detects the param and auto-opens the sign-in modal. This prevents
  // the "dashboard flash before modal" UX — unauthenticated users never
  // see dashboard chrome and never land on a dead /dashboard URL.
  useEffect(() => {
    if (!isLoading && !user) {
      const params = new URLSearchParams();
      params.set("signin", "1");
      if (locale && locale !== "en") params.set("lang", locale);
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
        <main className="pb-20 px-4 pt-page">
          <DashboardContent />
        </main>
        <MobileDashboardNav />
      </div>
    </div>
  );
}
