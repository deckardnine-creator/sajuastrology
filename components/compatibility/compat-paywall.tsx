"use client";

// ════════════════════════════════════════════════════════════════════
// CompatibilityPaywall (v6.15) — paywall card with blurred preview.
// ════════════════════════════════════════════════════════════════════
// Shown when is_paid === false. Provides:
//   1. A blurred glimpse of what's locked (creates curiosity)
//   2. List of what user gets ($2.99 value bullets)
//   3. CTA button → /api/payment/checkout-compatibility → PayPal redirect
//   4. Loading state while waiting for PayPal URL
//
// Conversion-focused decisions:
//   • Use icons + concrete text ("당신의 장기 시너지" not generic "프리미엄 기능")
//   • Display the $2.99 prominently — it's a low-friction price
//   • Show "lifetime access" — one-time payment, not recurring
//   • Always-on subtle animation — keeps the eye drawn to the unlock button
//   • Mobile-first: card width 100%, button full-width on small screens
//
// SafeStorage usage (auth-return-url): persists user intent across the
// PayPal redirect → return cycle. After successful payment, /api/verify
// fires and the page reloads with is_paid=true, so the paywall vanishes.
// ════════════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Sparkles, Heart, Briefcase, Users, Shield, Check, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { useNativeApp } from "@/lib/native-app";
import { requestIAP, requestAuth, onFlutterMessage } from "@/lib/flutter-bridge";
import { t } from "@/lib/translations";
import { safeSet } from "@/lib/safe-storage";
import { track, Events } from "@/lib/analytics";

// ────────────────────────────────────────────────────────────────────
// Fallback strings — used IF translations.ts does not have the key yet.
// This protects against showing raw "paywall.compat.heading" in UI.
// Once chandler adds these keys to translations.ts, t() returns the
// real translation. Until then, English/Korean/Japanese show here.
// ────────────────────────────────────────────────────────────────────
const FALLBACKS: Record<string, Record<string, string>> = {
  ko: {
    "paywall.compat.heading": "전체 풀이 해제하기",
    "paywall.compat.sub": "두 사람이 어디에서 잘 흐르고, 어디에서 인내가 필요한지 확인하세요.",
    "paywall.compat.love": "사랑 궁합",
    "paywall.compat.work": "업무 시너지",
    "paywall.compat.friendship": "우정 흐름",
    "paywall.compat.conflict": "갈등 패턴",
    "paywall.compat.yearly": "올해의 두 사람",
    "paywall.compat.bullet1": "사랑 · 업무 · 우정 · 갈등 — 4개 영역 상세 분석",
    "paywall.compat.bullet2": "두 일주가 어떻게 어우러지는지 쉬운 말로",
    "paywall.compat.bullet3": "올해 두 사람의 흐름과 시기 예측",
    "paywall.compat.bullet4": "평생 소장 — 언제든 다시 읽을 수 있어요",
    "paywall.compat.unlockCta": "$2.99에 잠금 해제",
    "paywall.compat.starting": "결제 준비중...",
    "paywall.compat.oneTime": "일회 결제 · 평생",
    "paywall.compat.lifetime": "한 번 결제, 평생 열람. 구독이 아닙니다.",
  },
  ja: {
    "paywall.compat.heading": "詳しい読み解きを解放する",
    "paywall.compat.sub": "二人がどこで響き合い、どこで忍耐が必要か——その全てが明らかに。",
    "paywall.compat.love": "恋愛相性",
    "paywall.compat.work": "仕事の相乗効果",
    "paywall.compat.friendship": "友情の流れ",
    "paywall.compat.conflict": "葛藤のパターン",
    "paywall.compat.yearly": "今年の二人",
    "paywall.compat.bullet1": "恋愛・仕事・友情・葛藤——4つの領域の詳細分析",
    "paywall.compat.bullet2": "二人の日柱がどう響き合うか、わかりやすい言葉で",
    "paywall.compat.bullet3": "今年の二人の流れと時期予測",
    "paywall.compat.bullet4": "生涯アクセス——いつでも読み返せます",
    "paywall.compat.unlockCta": "$2.99で解放する",
    "paywall.compat.starting": "決済を準備中...",
    "paywall.compat.oneTime": "一回・生涯",
    "paywall.compat.lifetime": "一度の支払い、生涯閲覧。サブスクではありません。",
  },
  en: {
    "paywall.compat.heading": "Unlock the full reading",
    "paywall.compat.sub": "See where the two of you flow together — and where you'll need patience.",
    "paywall.compat.love": "Love compatibility",
    "paywall.compat.work": "Work synergy",
    "paywall.compat.friendship": "Friendship dynamic",
    "paywall.compat.conflict": "Conflict patterns",
    "paywall.compat.yearly": "Year-by-year forecast",
    "paywall.compat.bullet1": "Detailed analysis of love, work, friendship, and conflict",
    "paywall.compat.bullet2": "How your two day-masters interact, in plain words",
    "paywall.compat.bullet3": "Forecast for this year, together",
    "paywall.compat.bullet4": "Lifetime access — read it again whenever you need it",
    "paywall.compat.unlockCta": "Unlock for $2.99",
    "paywall.compat.starting": "Starting payment...",
    "paywall.compat.oneTime": "one-time, lifetime",
    "paywall.compat.lifetime": "Pay once, read forever. No subscription.",
  },
};

// tt() — wraps t() with our local fallback. If translations.ts already
// has the key, t() returns the translation. If t() returns the key
// string verbatim (meaning it's missing), we use FALLBACKS instead.
function tt(key: string, locale: string): string {
  const translated = t(key as any, locale as any);
  // If t() returned the key verbatim, the key is missing — use fallback
  if (typeof translated === "string" && translated === key) {
    const langKey = (locale === "ko" || locale === "ja") ? locale : "en";
    return FALLBACKS[langKey]?.[key] ?? FALLBACKS.en[key] ?? key;
  }
  return translated as string;
}

interface Props {
  shareSlug: string;
  partnerName: string;       // "{Person A} & {Person B}" — for PayPal description
}

export function CompatibilityPaywall({ shareSlug, partnerName }: Props) {
  const { user, openSignInModal } = useAuth();
  const { locale } = useLanguage();
  const isNative = useNativeApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async () => {
    setError(null);

    // Analytics — track the click attempt regardless of auth state
    try {
      track(Events.pricing_cta_clicked, {
        plan: "compat",
        price: 2.99,
        href: "checkout-compatibility",
        signed_in: !!user,
      });
    } catch {}

    // Auth gate: anonymous users can SEE the result but can't pay until
    // they sign in. After sign-in we want them back on this exact page.
    if (!user) {
      try {
        safeSet("auth-return-url", window.location.href);
      } catch {}
      // ════════════════════════════════════════════════════════════
      // v6.17.26 — native auth dispatch.
      // 앱은 modal 대신 Flutter native auth sheet 사용. consultation-client.tsx
      // line 467 패턴 동일: native에선 Google sign-in 직접 trigger.
      // ════════════════════════════════════════════════════════════
      if (isNative) {
        // iOS는 App Store policy로 Apple sign-in을, Android는 Google.
        // navigator.userAgent에 "iPhone"/"iPad" 있으면 Apple, 그 외 Google.
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        requestAuth(isIOS ? "apple" : "google");
      } else {
        openSignInModal();
      }
      return;
    }

    // ════════════════════════════════════════════════════════════════
    // v6.17.26 — native IAP branch (chandler 명시: "앱은 2.99 4.99 IAP")
    // ────────────────────────────────────────────────────────────────
    // Compat Full $2.99 = Consumable IAP product.
    // Product ID: "compat_full" (chandler가 App Store Connect + Google Play
    // Console에 등록 필요. v6.17.26 코드는 ID로 호출만, 등록 전엔 "Item
    // Unavailable" 에러 반환. 등록 즉시 활성화.)
    //
    // shareSlug를 IAP 메시지에 동봉해서 Flutter가 결제 성공 시 backend
    // /api/iap/verify-iap-v2 호출 시 어떤 compat 결과에 entitlement를
    // 부여할지 알 수 있게 함 (full_destiny_reading 패턴 동일).
    // ════════════════════════════════════════════════════════════════
    if (isNative) {
      setLoading(true);
      // Subscribe to IAP success/error before triggering
      const unsubSuccess = onFlutterMessage("iap:success:", (payload) => {
        // payload format: "compat_full:{shareSlug}" 또는 그냥 shareSlug
        // verify-iap-v2가 reading is_paid를 true로 update → 페이지 reload
        // 시 paywall 사라짐. 단순화: 결제 성공 시 페이지 reload.
        unsubSuccess();
        unsubError();
        // ════════════════════════════════════════════════════════════
        // v6.17.39 — drop a "just paid" flag for the result page to read
        // after reload. Without this the amber unlock banner never fires
        // on iOS WebView: the rising-edge detector in the result client
        // can't distinguish a genuine post-purchase reload from a normal
        // revisit because the very first refreshPaidStatus() already
        // returns isPaid=true. The result client clears this flag the
        // moment it consumes it (single-shot), so subsequent revisits
        // stay silent. sessionStorage is intentional: scoped to this
        // tab, naturally cleared on tab close, and survives the reload.
        // ════════════════════════════════════════════════════════════
        try {
          sessionStorage.setItem(`compat-just-paid:${shareSlug}`, "1");
        } catch {}
        window.location.reload();
      });
      const unsubError = onFlutterMessage("iap:error:", (payload) => {
        unsubSuccess();
        unsubError();
        setError(payload || "Payment cancelled.");
        setLoading(false);
      });
      // Trigger Flutter IAP. Format: iap:compat_full:{shareSlug}
      // (Flutter가 platform 자동 인식, iOS/Android 동일 product ID).
      requestIAP("compat_full", shareSlug);
      // Safety: clear loading after 60s if no response (user closed sheet etc)
      setTimeout(() => {
        unsubSuccess();
        unsubError();
        if (loading) setLoading(false);
      }, 60000);
      return;
    }

    // ─── Web mode: PayPal flow ───
    setLoading(true);
    try {
      const res = await fetch("/api/payment/checkout-compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compatSlug: shareSlug,
          partnerName,
          userEmail: user.email,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "Failed to start payment");
      }

      const { url } = await res.json();
      if (!url) throw new Error("No payment URL returned");

      // Admin bypass returns ?payment=success directly — same URL handler
      // works for both real PayPal and admin path. Just redirect.
      window.location.href = url;
    } catch (e: any) {
      setError(e?.message || "Payment error. Please try again.");
      setLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────
  // Lock-icon items showing what's behind the paywall.
  // v6.17.28: reduced from 5 to 4 cards (removed Calendar/yearly) and
  // shortened card height (aspect-square → 1:1 instead of 4:5 portrait)
  // so the paywall doesn't dominate the scroll between free summary
  // and the CTA card.
  // ──────────────────────────────────────────────────────────────────
  const lockedItems = [
    { icon: Heart, label: tt("paywall.compat.love", locale), color: "#EC4899" },
    { icon: Briefcase, label: tt("paywall.compat.work", locale), color: "#3B82F6" },
    { icon: Users, label: tt("paywall.compat.friendship", locale), color: "#10B981" },
    { icon: Shield, label: tt("paywall.compat.conflict", locale), color: "#F59E0B" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65, duration: 0.6 }}
      className="mb-10"
    >
      {/* ═══ Locked-content blur preview cards ═══ */}
      {/* v6.17.28: grid-cols-4 (was 2/sm:5), aspect-square (was aspect-[4/5])
          → cards are noticeably shorter so the user reaches the $2.99 CTA
          quickly without long scrolling between free summary and unlock. */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6">
        {lockedItems.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.05 }}
            className="relative aspect-square rounded-xl overflow-hidden"
            style={{
              background: `linear-gradient(160deg, ${item.color}15, rgba(15,15,25,0.85))`,
              border: `1px solid ${item.color}30`,
            }}
          >
            {/* Fake-content lines, blurred */}
            <div className="absolute inset-0 p-3 flex flex-col justify-end gap-1.5 opacity-40 blur-[3px] select-none pointer-events-none">
              <div className="h-1 w-full rounded-full" style={{ background: `${item.color}60` }} />
              <div className="h-1 w-3/4 rounded-full" style={{ background: `${item.color}40` }} />
              <div className="h-1 w-5/6 rounded-full" style={{ background: `${item.color}50` }} />
              <div className="h-1 w-2/3 rounded-full" style={{ background: `${item.color}30` }} />
            </div>
            {/* Lock + label overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-2 text-center">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: `${item.color}20`, border: `1px solid ${item.color}40` }}
              >
                <Lock className="w-3.5 h-3.5" style={{ color: item.color }} />
              </div>
              <p className="text-[10px] sm:text-xs font-medium text-foreground/80 leading-tight">
                {item.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ═══ Main CTA card ═══ */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(244,114,182,0.08), rgba(167,139,250,0.06), rgba(15,15,25,0.85))",
          border: "1px solid rgba(244,114,182,0.25)",
        }}
      >
        {/* Animated top accent line */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-px"
          animate={{
            background: [
              "linear-gradient(90deg, transparent, rgba(244,114,182,0.6), transparent)",
              "linear-gradient(90deg, transparent, rgba(167,139,250,0.6), transparent)",
              "linear-gradient(90deg, transparent, rgba(244,114,182,0.6), transparent)",
            ],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        <div className="p-6 sm:p-8 text-center">
          <motion.div
            animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="inline-flex w-12 h-12 rounded-full items-center justify-center mb-4"
            style={{
              background: "linear-gradient(135deg, rgba(244,114,182,0.2), rgba(167,139,250,0.2))",
              border: "1px solid rgba(244,114,182,0.4)",
            }}
          >
            <Sparkles className="w-5 h-5 text-pink-300" />
          </motion.div>

          <h3 className="font-serif text-xl sm:text-2xl font-semibold mb-2">
            {tt("paywall.compat.heading", locale)}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5 leading-relaxed">
            {tt("paywall.compat.sub", locale)}
          </p>

          {/* Value bullets */}
          <ul className="text-left max-w-sm mx-auto mb-6 space-y-2">
            {[
              tt("paywall.compat.bullet1", locale),
              tt("paywall.compat.bullet2", locale),
              tt("paywall.compat.bullet3", locale),
              tt("paywall.compat.bullet4", locale),
            ].map((line, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-pink-300 shrink-0 mt-0.5" />
                <span className="text-sm text-foreground/85 leading-snug">{line}</span>
              </li>
            ))}
          </ul>

          {/* Price + CTA */}
          <div className="flex items-baseline justify-center gap-1.5 mb-4">
            <span className="text-3xl font-bold text-primary">$2.99</span>
            <span className="text-xs text-muted-foreground">
              {tt("paywall.compat.oneTime", locale)}
            </span>
          </div>

          <Button
            onClick={handleUnlock}
            disabled={loading}
            size="lg"
            className="w-full sm:w-auto sm:min-w-[260px] gap-2 rounded-full font-semibold text-sm tracking-wide"
            style={{
              background: "linear-gradient(135deg, #EC4899, #A78BFA)",
              color: "#fff",
              border: "none",
              boxShadow: "0 4px 20px rgba(236,72,153,0.3)",
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {tt("paywall.compat.starting", locale)}
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                {tt("paywall.compat.unlockCta", locale)}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>

          <p className="text-[11px] text-muted-foreground/60 mt-3">
            {tt("paywall.compat.lifetime", locale)}
          </p>

          {error && (
            <p className="text-xs text-red-400 mt-3 max-w-md mx-auto">
              {error}
            </p>
          )}

          {locale === "ko" && (
            <p className="text-[10px] text-muted-foreground/40 mt-2 leading-tight">
              {t("upgrade.koNotice", locale)}
            </p>
          )}
        </div>
      </div>
    </motion.section>
  );
}
