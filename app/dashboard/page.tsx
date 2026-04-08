"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { MobileDashboardNav } from "@/components/dashboard/mobile-dashboard-nav";
import { Navbar } from "@/components/landing/navbar";
import { useNativeApp } from "@/lib/native-app";
import { onFlutterMessage, requestAuth } from "@/lib/flutter-bridge";
import { useLanguage } from "@/lib/language-context";

export default function DashboardPage() {
  const { user, isLoading, openSignInModal } = useAuth();
  const isNative = useNativeApp();
  const { locale } = useLanguage();

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

          {isNative ? (
            /* App mode: use web sign-in modal (OAuth flows inside WebView) */
            <div className="space-y-3">
              <button
                onClick={() => openSignInModal()}
                className="w-full h-12 bg-white text-gray-800 hover:bg-gray-100 border border-gray-300 font-medium flex items-center justify-center gap-3 rounded-lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {locale === "ko" ? "Google로 계속하기" : locale === "ja" ? "Googleで続ける" : "Continue with Google"}
              </button>
              <button
                onClick={() => openSignInModal()}
                className="w-full h-12 bg-black text-white hover:bg-gray-900 border border-gray-700 font-medium flex items-center justify-center gap-3 rounded-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                {locale === "ko" ? "Apple로 계속하기" : locale === "ja" ? "Appleで続ける" : "Continue with Apple"}
              </button>
            </div>
          ) : (
            /* Web mode: open sign-in modal */
            <button
              onClick={() => openSignInModal()}
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-lg"
            >
              {locale === "ko" ? "로그인" : locale === "ja" ? "ログイン" : "Sign In"}
            </button>
          )}

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
        <main className={isNative ? "px-4 pt-4 pb-4" : "pb-20 px-4 pt-20"}>
          <DashboardContent />
        </main>
        {!isNative && <MobileDashboardNav />}
      </div>
    </div>
  );
}
