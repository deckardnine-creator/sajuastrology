"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/ui/google-icon";
import { AppleIcon } from "@/components/ui/apple-icon";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import { requestAuth } from "@/lib/flutter-bridge";
import Link from "next/link";
import { useEffect } from "react";
import { track, Events } from "@/lib/analytics";

// Detect which native platform is hosting the WebView.
// Returns "ios" | "android" | null (null = regular web browser).
//
// v5 fix: this detection MUST be stricter than the generic
// useNativeApp() hook used elsewhere on the site. The generic hook
// also accepts ?app=true URL params and a sessionStorage cache, both
// of which can persist after a single visit through a Flutter shell
// and then incorrectly identify a regular mobile browser as a native
// app — hiding the Apple button on web (chandler's bug report:
// "웹에서 하면 구글과 애플버튼이 모두 나오는게 기본인데 구글만 나온다").
//
// For OAuth button selection, we only trust HARD evidence of being
// inside a Flutter WebView: window.FlutterBridge (injected by
// Flutter's addJavaScriptChannel) or the explicit "SajuApp" UA
// substring set by Flutter via setUserAgent().
function detectNativePlatform(): "ios" | "android" | null {
  if (typeof window === "undefined") return null;
  // HARD evidence only — no sessionStorage cache, no ?app=true.
  const hasFlutterBridge =
    typeof (window as { FlutterBridge?: unknown }).FlutterBridge !== "undefined";
  const ua = navigator.userAgent;
  const hasSajuAppUA = ua.includes("SajuApp");
  if (!hasFlutterBridge && !hasSajuAppUA) return null;
  if (/iPhone|iPad|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return null;
}

export function SignInModal() {
  const { isSignInModalOpen, closeSignInModal, signIn, signInWithApple, isLoading } = useAuth();
  const { locale } = useLanguage();

  // ── Mixpanel: track when the sign-in modal becomes visible ──
  // Debounced via effect so we fire once per open cycle, not on every render.
  useEffect(() => {
    if (isSignInModalOpen) {
      try { track(Events.signin_modal_opened); } catch {}
    }
  }, [isSignInModalOpen]);

  if (!isSignInModalOpen) return null;

  // Platform-specific login buttons:
  //   iOS app    → Apple only   (native Sign in with Apple, no OAuth browser bounce)
  //   Android app → Google only  (native Chrome Custom Tabs, seamless return)
  //   Web browser → both Google + Apple
  const platform = detectNativePlatform();
  const showGoogle = platform !== "ios";     // hide Google on iOS app
  const showApple  = platform !== "android"; // hide Apple on Android app

  // When running inside Flutter WebView, Google blocks embedded OAuth.
  // Route through Flutter native → Chrome Custom Tabs → deep link callback.
  // In a normal browser (no FlutterBridge), fall back to the original web flow.
  const handleGoogleSignIn = () => {
    try { track(Events.signin_clicked, { method: "google", platform: platform ?? "web" }); } catch {}
    if (typeof window !== "undefined" && window.FlutterBridge) {
      requestAuth("google");
      closeSignInModal();
      return;
    }
    signIn();
  };

  const handleAppleSignIn = () => {
    try { track(Events.signin_clicked, { method: "apple", platform: platform ?? "web" }); } catch {}
    if (typeof window !== "undefined" && window.FlutterBridge) {
      requestAuth("apple");
      closeSignInModal();
      return;
    }
    signInWithApple();
  };

  return (
    <AnimatePresence>
      {isSignInModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSignInModal}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-6 sm:p-8 relative overflow-hidden">
              {/* Background particles */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-primary/30"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      opacity: [0.2, 0.6, 0.2],
                      scale: [1, 1.5, 1],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>

              {/* Close button */}
              <button
                onClick={closeSignInModal}
                className="absolute top-2 right-2 w-12 h-12 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors z-10"
                aria-label="Close sign-in modal"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Content */}
              <div className="relative text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                </div>

                <h2 className="text-2xl font-serif text-primary mb-2">
                  {t("signIn.welcome", locale)}
                </h2>
                <p className="text-muted-foreground text-sm mb-8">
                  {t("signIn.saveReading", locale)}
                </p>

                <div className="space-y-3">
                  {showGoogle && (
                  <Button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full h-12 bg-white text-gray-800 hover:bg-gray-100 border border-gray-300 font-medium flex items-center justify-center gap-3"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <GoogleIcon className="w-5 h-5" />
                        {t("signIn.continueGoogle", locale)}
                      </>
                    )}
                  </Button>
                  )}

                  {showApple && (
                  <Button
                    onClick={handleAppleSignIn}
                    disabled={isLoading}
                    className="w-full h-12 bg-black text-white hover:bg-gray-900 border border-gray-700 font-medium flex items-center justify-center gap-3"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <AppleIcon className="w-5 h-5" />
                        {t("signIn.continueApple", locale)}
                      </>
                    )}
                  </Button>
                  )}
                </div>

                <p className="text-xs text-muted-foreground/70 mt-6 leading-relaxed">
                  {t("signIn.agreeTo", locale)}{" "}
                  <Link href="/terms" onClick={closeSignInModal} className="text-primary hover:underline">
                    {t("footer.terms", locale)}
                  </Link>{" "}
                  {t("signIn.and", locale)}{" "}
                  <Link href="/privacy" onClick={closeSignInModal} className="text-primary hover:underline">
                    {t("footer.privacy", locale)}
                  </Link>
                  {t("signIn.agreeSuffix", locale)}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
