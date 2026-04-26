"use client";

// ════════════════════════════════════════════════════════════════════
// CompatibilityUnlockLoader (v6.15) — Verification screen shown right
// after PayPal redirects user back with ?payment=success.
// ════════════════════════════════════════════════════════════════════
// Different intent than the $9.99 ReadingLoader:
//   • $9.99 reading: 30–60s, AI is GENERATING content. Long animation
//                    with progress steps explains the wait.
//   • $2.99 compat:  Content already exists in DB. Only need to mark
//                    is_paid=true via /api/payment/verify-compatibility,
//                    which is ~1–3 seconds. Animation is "unlocking",
//                    not "analyzing". Calmer, shorter, more elegant.
//
// Visual concept:
//   • Two glowing hearts that connect into one with a key/lock motion
//   • 3 short status messages cycling fast (each ~1.5s)
//   • Auto-dismisses when verify returns success
//   • Falls back to "회원이 다시 로드해주세요" after 12s if verify hangs
//
// Why not just spin a small spinner inline? Because at this exact
// moment the user has just paid $2.99 and we want them to feel the
// transaction was meaningful. A quick beautiful "unlocking" moment
// reinforces the value perception.
// ════════════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Lock, Unlock, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";

// ────────────────────────────────────────────────────────────────────
// Fallback strings — see comments in compat-paywall.tsx for rationale.
// ────────────────────────────────────────────────────────────────────
const FALLBACKS: Record<string, Record<string, string>> = {
  ko: {
    "compat.unlock.title": "전체 풀이를 여는 중...",
    "compat.unlock.step1": "결제를 확인하고 있어요...",
    "compat.unlock.step2": "두 사람의 사주를 맞추는 중...",
    "compat.unlock.step3": "두 분의 이야기를 빛으로 가져오는 중...",
  },
  ja: {
    "compat.unlock.title": "詳しい読み解きを開いています...",
    "compat.unlock.step1": "決済を確認しています...",
    "compat.unlock.step2": "二人の命式を重ねています...",
    "compat.unlock.step3": "二人の物語を光に変えています...",
  },
  en: {
    "compat.unlock.title": "Unlocking your full reading",
    "compat.unlock.step1": "Confirming the payment...",
    "compat.unlock.step2": "Aligning the two charts...",
    "compat.unlock.step3": "Bringing your story to light...",
  },
};

function tt(key: string, locale: string): string {
  const translated = t(key as any, locale as any);
  if (typeof translated === "string" && translated === key) {
    const langKey = (locale === "ko" || locale === "ja") ? locale : "en";
    return FALLBACKS[langKey]?.[key] ?? FALLBACKS.en[key] ?? key;
  }
  return translated as string;
}

interface Props {
  shareSlug: string;
  sessionId?: string;       // PayPal order id from ?token= query param
  onDone: () => void;       // called when verify succeeds; parent should reload result
  onTimeout?: () => void;   // optional: called if verify takes >12s
}

const STEP_KEYS = [
  "compat.unlock.step1",
  "compat.unlock.step2",
  "compat.unlock.step3",
];

export function CompatibilityUnlockLoader({ shareSlug, sessionId, onDone, onTimeout }: Props) {
  const { locale } = useLanguage();
  const [stepIndex, setStepIndex] = useState(0);
  const [verifying, setVerifying] = useState(true);

  // Cycle status messages every ~1.5s for visual rhythm
  useEffect(() => {
    const id = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEP_KEYS.length);
    }, 1500);
    return () => clearInterval(id);
  }, []);

  // Call verify endpoint. On success → onDone. Webhook is the redundant
  // path so even if verify fails (timeout, network), the row will be
  // marked is_paid by webhook and a page reload will clear the paywall.
  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    async function run() {
      // Hard timeout — if 12s pass, give up and tell parent to retry/reload.
      timeoutId = setTimeout(() => {
        if (cancelled) return;
        setVerifying(false);
        onTimeout?.();
      }, 12000);

      try {
        const res = await fetch("/api/payment/verify-compatibility", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, compatSlug: shareSlug }),
        });
        if (cancelled) return;
        if (timeoutId) clearTimeout(timeoutId);
        const data = await res.json().catch(() => ({}));
        if (data.success) {
          onDone();
        } else {
          // Verify said no — but webhook may still arrive. Wait briefly
          // and let parent reload. If parent does check-paid and gets
          // is_paid=true, the user sees content. Otherwise paywall stays.
          setTimeout(() => onDone(), 2500);
        }
      } catch {
        if (cancelled) return;
        if (timeoutId) clearTimeout(timeoutId);
        // Network error — let webhook handle it; trigger reload after
        // a beat so the page can re-fetch is_paid.
        setTimeout(() => onDone(), 2500);
      }
    }
    run();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareSlug, sessionId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md">
      <div className="text-center px-6 max-w-sm">
        {/* ═══ Heart-lock animation ═══ */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* Pulsing aura */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                "0 0 30px rgba(236,72,153,0.4)",
                "0 0 60px rgba(167,139,250,0.5)",
                "0 0 30px rgba(236,72,153,0.4)",
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          {/* Outer rotating ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, rgba(236,72,153,0.6), rgba(167,139,250,0.6), rgba(236,72,153,0.6))",
              padding: 1,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-full h-full rounded-full bg-background" />
          </motion.div>
          {/* Center icon — morphs from Lock → Unlock */}
          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {verifying ? (
                <motion.div
                  key="hearts"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.4, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center gap-1.5"
                >
                  <motion.div
                    animate={{ x: [-4, 0, -4], scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Heart className="w-7 h-7 text-pink-400" fill="currentColor" />
                  </motion.div>
                  <motion.div
                    animate={{ x: [4, 0, 4], scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  >
                    <Heart className="w-7 h-7 text-purple-400" fill="currentColor" />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="unlock"
                  initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 16 }}
                >
                  <Unlock className="w-10 h-10 text-primary" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Floating sparkles */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                top: `${20 + (i % 2) * 60}%`,
                left: `${15 + (i % 3) * 30}%`,
              }}
              animate={{
                y: [0, -10, 0],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            >
              <Sparkles className="w-3 h-3 text-pink-300/60" />
            </motion.div>
          ))}
        </div>

        {/* ═══ Status text ═══ */}
        <h2 className="font-serif text-xl text-primary mb-3">
          {tt("compat.unlock.title", locale)}
        </h2>
        <AnimatePresence mode="wait">
          <motion.p
            key={stepIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="text-sm text-muted-foreground min-h-[1.5em]"
          >
            {tt(STEP_KEYS[stepIndex], locale)}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
