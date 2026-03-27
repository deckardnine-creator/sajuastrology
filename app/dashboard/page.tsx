"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { MobileDashboardNav } from "@/components/dashboard/mobile-dashboard-nav";

export default function DashboardPage() {
  const { user, isLoading, openSignInModal } = useAuth();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (!isLoading && !user) openSignInModal();
  }, [isLoading, user, openSignInModal]);

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
          <button onClick={openSignInModal} className="text-primary hover:underline min-h-[44px]">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Layout — min-h-screen ensures content centers properly */}
      <div className="hidden md:flex min-h-screen">
        <DashboardSidebar />
        <main className="flex-1 ml-64 p-8 flex flex-col">
          <DashboardContent />
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <main className="pb-20 px-4 pt-4">
          <DashboardContent />
        </main>
        <MobileDashboardNav />
      </div>
    </div>
  );
}
