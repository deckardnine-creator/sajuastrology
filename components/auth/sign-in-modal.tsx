"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/ui/google-icon";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import Link from "next/link";

export function SignInModal() {
  const { isSignInModalOpen, closeSignInModal, signIn, isLoading } = useAuth();
  const { locale } = useLanguage();

  if (!isSignInModalOpen) return null;

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

              {/* Close button — 44px touch target */}
              <button
                onClick={closeSignInModal}
                className="absolute top-3 right-3 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close sign-in modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="relative text-center">
                {/* Logo */}
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

                {/* Google Sign In Button */}
                <Button
                  onClick={signIn}
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

                <p className="text-xs text-muted-foreground mt-6">
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
