"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { MobileDashboardNav } from "@/components/dashboard/mobile-dashboard-nav";

export default function DashboardPage() {
  const { user, isLoading, openSignInModal } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      openSignInModal();
    }
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
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to access your dashboard</p>
          <button
            onClick={openSignInModal}
            className="text-primary hover:underline"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Layout */}
      <div className="hidden md:flex">
        <DashboardSidebar />
        <main className="flex-1 ml-64 p-8">
          <DashboardContent />
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <main className="pb-20 p-4">
          <DashboardContent />
        </main>
        <MobileDashboardNav />
      </div>
    </div>
  );
}
