"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { MobileDashboardNav } from "@/components/dashboard/mobile-dashboard-nav";
import { Navbar } from "@/components/landing/navbar";
import { useNativeApp } from "@/lib/native-app";
import { onFlutterMessage, requestAuth } from "@/lib/flutter-bridge";

export default function DashboardPage() {
  const { user, isLoading, openSignInModal } = useAuth();
  const isNative = useNativeApp();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Listen for auth session from Flutter
  useEffect(() => {
    if (!isNative) return;
    const unsub = onFlutterMessage("auth:session:", async (payload) => {
      const [accessToken, refreshToken] = payload.split("|");
      if (accessToken) {
        try {
          const { createClient } = await import("@supabase/supabase-js");
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });
          window.location.reload();
        } catch (e) {
          console.error("Failed to set session from Flutter:", e);
        }
      }
    });
    return unsub;
  }, [isNative]);

  // Web only: auto-open sign-in modal
  // App mode: do NOT auto-trigger login — IndexedStack renders all tabs
  // at once, so this would fire even when the user hasn't tapped "My" tab
  useEffect(() => {
    if (!isLoading && !user && !isNative) {
      openSignInModal();
    }
  }, [isLoading, user, openSignInModal, isNative]);

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
        <div className="text-center px-4">
          <p className="text-muted-foreground mb-4">Please sign in to access your dashboard</p>
          <button
            onClick={() => isNative ? requestAuth("google") : openSignInModal()}
            className="text-primary hover:underline min-h-[44px]"
          >
            Sign In
          </button>
        </div>
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
        <main className={isNative ? "px-4 pt-4 pb-4" : "pb-20 px-4 pt-20"}>
          <DashboardContent />
        </main>
        {!isNative && <MobileDashboardNav />}
      </div>
    </div>
  );
}
