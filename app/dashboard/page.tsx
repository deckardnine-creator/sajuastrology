"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { MobileDashboardNav } from "@/components/dashboard/mobile-dashboard-nav";
import { Navbar } from "@/components/landing/navbar";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";

export default function DashboardPage() {
  const { user, isLoading, openSignInModal } = useAuth();
  const { locale } = useLanguage();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Auto-open sign-in modal for unauthenticated users
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
        <div className="text-center px-6 max-w-sm w-full">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
          </div>

          <h2 className="text-xl font-serif text-primary mb-2">
            {t("dash.welcomeGuest", locale)}
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            {t("dash.signInDesc", locale)}
          </p>

          <button
            onClick={() => openSignInModal()}
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-lg"
          >
            {t("nav.signIn", locale)}
          </button>

          <p className="text-xs text-muted-foreground/60 mt-6">
            {t("dash.termsConsent", locale)}
          </p>
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
        <main className="pb-20 px-4 pt-page">
          <DashboardContent />
        </main>
        <MobileDashboardNav />
      </div>
    </div>
  );
}
