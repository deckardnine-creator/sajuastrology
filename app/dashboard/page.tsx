"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { MobileDashboardNav } from "@/components/dashboard/mobile-dashboard-nav";
import { Navbar } from "@/components/landing/navbar";
import { useLanguage } from "@/lib/language-context";

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
            {locale === "ko" ? "환영합니다" : locale === "ja" ? "ようこそ" : "Welcome"}
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            {locale === "ko"
              ? "로그인하여 사주 결과를 저장하고 운세를 확인하세요."
              : locale === "ja"
              ? "ログインして鑑定結果を保存し、運勢を確認しましょう。"
              : "Sign in to save readings, track your fortune, and access your cosmic dashboard."}
          </p>

          <button
            onClick={() => openSignInModal()}
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-lg"
          >
            {locale === "ko" ? "로그인" : locale === "ja" ? "ログイン" : "Sign In"}
          </button>

          <p className="text-xs text-muted-foreground/60 mt-6">
            {locale === "ko"
              ? "계속 진행하면 이용약관 및 개인정보 처리방침에 동의하는 것입니다."
              : locale === "ja"
              ? "続行することで、利用規約とプライバシーポリシーに同意したものとみなされます。"
              : "By continuing, you agree to our Terms of Service and Privacy Policy."}
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
