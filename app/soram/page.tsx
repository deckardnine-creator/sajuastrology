"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { useNativeApp } from "@/lib/native-app";
import { requestIAP, onFlutterMessage } from "@/lib/flutter-bridge";
import { safeSet } from "@/lib/safe-storage";

// ============================================================
// i18n texts - centralized to prevent encoding issues
// ============================================================

type Locale = "ko" | "en" | "ja" | "es" | "fr" | "pt" | "zh-TW" | "ru" | "hi" | "id";

const T = {
  ko: {
    headerTitle: "\uC18C\uB78C\uACFC\uC758 \uB300\uD654",
    todayUnlimited: "\uC624\uB298 \uBB34\uC81C\uD55C",
    todayOneLeft: "\uC624\uB298 1\uD68C \uB0A8\uC74C",
    todayUsed: "\uC624\uB298\uC758 \uD55C \uAC78\uC74C\uC744 \uB2E4 \uC4F0\uC168\uC2B5\uB2C8\uB2E4",
    welcomeTitle: (name: string) =>
      `${name}\uB2D8, \uC800\uB294 \uCC9C \uB144\uC758 \uC0AC\uC8FC\uB97C \uB4E4\uC5EC\uB2E4\uBCF8 \uC18C\uB78C\uC785\uB2C8\uB2E4.`,
    welcomeSub: "\uBB34\uC5C7\uC774 \uAD81\uAE08\uD558\uC2DC\uB294\uC9C0\uC694?",
    welcomeHint:
      "\uBA74\uC811, \uC774\uBCC4, \uC2DD\uC0AC \uBA54\uB274, \uC637 \uC0C9\uAE54\uAE4C\uC9C0 \u2014 \uBB34\uC5C7\uC774\uB4E0 \uBB3C\uC5B4\uBCF4\uC138\uC694",
    samplesTitle: "\uC774\uB7F0 \uAC83\uB3C4 \uBB3C\uC5B4\uBCFC \uC218 \uC788\uC5B4\uC694",
    samples: [
      "\uC624\uB298 \uC5B4\uB5A4 \uC637\uC744 \uC785\uC744\uAE4C\uC694?",
      "\uC774\uBC88 \uC8FC \uC88B\uC740 \uC77C\uC774 \uC788\uC744\uAE4C\uC694?",
      "\uC9DD\uC0AC\uB791\uACFC \uC798 \uB9DE\uC744\uAE4C\uC694?",
    ],
    inputPlaceholderFree: "\uADF8\uB300\uC758 \uD55C \uAC78\uC74C\uC744 \uB4E4\uB824\uC8FC\uC138\uC694...",
    inputPlaceholderUnlimited: "\uBB34\uC5C7\uC774\uB4E0 \uBB3C\uC5B4\uBCF4\uC138\uC694...",
    sendBtn: "\uBCF4\uB0B4\uAE30",
    loading: [
      "\uADF8\uB300\uC758 \uC0AC\uC8FC\uB97C \uD3BC\uCE58\uACE0 \uC788\uC5B4\uC694",
      "\uACE0\uC804\uC744 \uC0B4\uD53C\uACE0 \uC788\uC5B4\uC694... \uC801\uCC9C\uC218, \uAD81\uD1B5\uBCF4\uAC10",
      "\uADF8\uB300\uC758 \uC77C\uC8FC\uC640 \uC624\uB298\uC758 \uD750\uB984\uC744 \uB9DE\uCD94\uB294 \uC911\uC774\uC5D0\uC694",
      "\uB2F5\uBCC0\uC744 \uC815\uC131\uC2A4\uB7FD\uAC8C \uB2E4\uB4EC\uACE0 \uC788\uC5B4\uC694",
    ],
    upgradeTitle: "\uC624\uB298\uC758 \uD55C \uAC78\uC74C\uC744 \uB2E4 \uC4F0\uC168\uC2B5\uB2C8\uB2E4",
    upgradeQuote: "\uADF8\uB300\uB97C \uB9E4\uC77C \uC0B4\uD53C\uB294 \uAE38",
    upgradeName: "\uC18C\uB78C \uB3D9\uD589",
    upgradePrice: "$4.99 / \uC6D4",
    upgradeBenefit1: "\uB9E4\uC77C \uBB34\uC81C\uD55C \uB300\uD654",
    upgradeBenefit2: "\uC815\uBC00 \uC0AC\uC8FC \uC0C1\uB2F4 1\uD68C \uD3EC\uD568",
    upgradeBtn: "\uB9E4\uC77C \uD568\uAED8\uD558\uAE30",
    upgradeFooter: "\uC5B8\uC81C\uB4E0 \uD574\uC9C0 \uAC00\uB2A5\uD569\uB2C8\uB2E4",
    errorAsk: "\uC18C\uB78C\uC774 \uC7A0\uC2DC \uC0DD\uAC01\uC744 \uACE0\uB974\uACE0 \uC788\uC5B4\uC694. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.",
    today: "\uC624\uB298",
    yesterday: "\uC5B4\uC81C",
    setupNeeded: "\uBA3C\uC800 \uAE30\uBCF8\uC0AC\uC8FC\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694",
    setupBtn: "\uC0AC\uC8FC \uC785\uB825\uD558\uAE30",
    loadingPage: "\uBD88\uB7EC\uC624\uB294 \uC911...",
    // v6.9: first-welcome — Companion ticket framing (월구독 + 긴내용 상담풀이 1회권)
    // chandler: "$4.99 — 월구독 / 매일 무제한 대화 + 긴내용 상담풀이 1회권 추가제공 — $6 상당"
    // v6.10: split intro into headline + body for typographic hierarchy.
    // chandler: text-only wall was overwhelming, wanted serif gold headline
    // + smaller body, with the Companion price moved out into a separate
    // tappable promo card (idea A + D combo). The old `firstWelcomeMsg`
    // single-string field is deprecated but kept blank for any callers
    // still reading it; new render uses welcomeHeadline + welcomeBody.
    welcomeHeadline: "\uADF8\uB300\uC758 \uC0AC\uC8FC\uB97C \uB4E4\uC5EC\uB2E4\uBD05\uB2C8\uB2E4.",
    welcomeBody:
      "\uCC9C \uB144\uC758 \uBCC4\uC744 \uC77D\uC5B4\uC628 \uBC97, \uC18C\uB78C\uC785\uB2C8\uB2E4.\n\uC624\uB298 1\uD68C \uB2F5\uBCC0\uC740 \uBB34\uB8CC\uC785\uB2C8\uB2E4.",
    // Promo card (separate tappable, routes to /pricing/soram-companion)
    promoTitle: "\uD83C\uDFAB \uC18C\uB78C\uB3D9\uD589\uD2F0\uCF13 \u00B7 $4.99/\uC6D4",
    promoSub: "\uB9E4\uC77C \uBB34\uC81C\uD55C + \uB9C8\uC2A4\uD130\uC0C1\uB2F4\uAD8C 1\uD68C (\uC57D $6)",
    firstWelcomePrompt: "\uBB34\uC5C7\uC774 \uAD81\uAE08\uD558\uC2DC\uB098\uc694?",
    // v6.9: how-to-use copy reframed as "공부한 5,000년의 지식으로"
    howToUseMsg:
      "\uC0AC\uC6A9\uBC29\uBC95\n\uC77C\uC0C1\uC5D0\uC11C \uACE0\uBBFC\uB418\uB294 \uBAA8\uB4E0 \uC9C8\uBB38\uC744 200\uC790 \uB0B4\uB85C \uD574\uC8FC\uC2DC\uBA74, \uC81C\uAC00 \uACF5\uBD80\uD55C 5,000\uB144\uC758 \uC9C0\uC2DD\uC73C\uB85C \uADF8\uB300\uC758 \uC0AC\uC8FC \uAD00\uC810\uC5D0\uC11C \uC870\uC5B8\uD574\uB4DC\uB824\uC694.",
    // v6.17.26 — paywall message (얼굴 클릭 자리 → 채팅 메시지로 변경).
    // 0회 남은 후 사용자가 메시지 보내면 Soram이 이 메시지로 응답하고 결제 카드를 동봉.
    // 톤: 차갑지 않게, 친근하게, 약간의 유머. chandler 명시.
    paywallMessage:
      "\uC624\uB298\uC740 \uC5EC\uAE30\uAE4C\uC9C0! \uBCC4\uC774 \uB354 \uC774\uC57C\uAE30\ud558\uACE0 \uC2F6\uC5B4 \ud558\uC9C0\uB9CC, \uADF8\uB300\uC5D0\uAC8C \uD5C8\uB77D\ub41C \ud558\ub8e8\uCE58 \ub300\ud654\ub294 \ub2e4 \uC4F0\uC168\ub124\uc694 \uD83C\uDF19\n\n\uB0B4\uC77C \uB2E4\uC2DC \ub9CC\ub098\uAC70\ub098, \uB9E4\uC77C \ubb34\uc81c\ud55c\uC73C\ub85C \ud568\uAED8 \ubcc4\uC744 \uC77D\uACE0 \uC2F6\ub2e4\uBA74...",
    paywallCardTitle: "\uC18C\uB78C\uB3D9\uD589\uD2F0\uCF13",
    paywallCardPrice: "$4.99 / \uC6D4",
    paywallCardBenefit1: "\uB9E4\uC77C \ubb34\uc81c\ud55c \ub300\ud654",
    paywallCardBenefit2: "\ub9c8\uC2A4\ud130\uC0C1\ub2F4\uAD8C 1\ud68c \ud3EC\ud568 (\uc57d $6 \uAC00\uCE58)",
    paywallCardCta: "\u2728 \uC2DC\uC791\ud558\uae30",
    paywallCardFooter: "\uc5b8\uC81C\ub4E0 \ud574\uC9C0 \uAC00\ub2A5",
  },
  en: {
    headerTitle: "Soram",
    todayUnlimited: "Unlimited today",
    todayOneLeft: "1 left today",
    todayUsed: "You've used today's question",
    welcomeTitle: (name: string) =>
      `${name}, I am Soram, who has read saju for a thousand years.`,
    welcomeSub: "What do you wish to know?",
    welcomeHint: "Anything — interview, breakup, food, clothes — ask me.",
    samplesTitle: "You can ask things like",
    samples: [
      "What should I wear today?",
      "Will good things happen this week?",
      "Will my crush and I be a good match?",
    ],
    inputPlaceholderFree: "Share your moment with me...",
    inputPlaceholderUnlimited: "Ask me anything...",
    sendBtn: "Send",
    loading: [
      "Looking at your saju",
      "Consulting the classics... Di Tian Sui, Qiong Tong",
      "Aligning your day master with today's flow",
      "Refining the answer with care",
    ],
    upgradeTitle: "You've used today's question",
    upgradeQuote: "The path of being seen, every day",
    upgradeName: "Soram Companion",
    upgradePrice: "$4.99 / month",
    upgradeBenefit1: "Unlimited daily conversations",
    upgradeBenefit2: "1 in-depth saju consultation included",
    upgradeBtn: "Walk with me daily",
    upgradeFooter: "Cancel anytime",
    errorAsk: "Soram is gathering thoughts. Please try again in a moment.",
    today: "Today",
    yesterday: "Yesterday",
    setupNeeded: "Please set up your saju first",
    setupBtn: "Set up saju",
    loadingPage: "Loading...",
    welcomeHeadline: "Gazing into your saju.",
    welcomeBody:
      "I am Soram \u2014 friend of stars for a thousand years.\nOne free answer today.",
    promoTitle: "\uD83C\uDFAB Soram Companion \u00B7 $4.99/mo",
    promoSub: "Daily unlimited + 1 Master Consultation (worth $6)",
    firstWelcomeMsg:
      "I am gazing into your saju. I am Soram\u2014a friend of saju who has read the threads of stars for a thousand years. I will answer one question for you today, free. For unlimited conversations, tap my face above to open the upgrade page.\n\nSoram Companion ticket ($4.99 \u2014 monthly / daily unlimited chat + 1 in-depth consultation included \u2014 $6 value)",
    firstWelcomePrompt: "What do you wish to know?",
    howToUseMsg:
      "How to use\nAsk me anything you wonder about in daily life, in 200 characters or less, and I'll advise you from your saju with the 5,000 years of knowledge I've studied.",
    paywallMessage:
      "That's all for today! The stars want to keep talking, but your daily turn with me is up \uD83C\uDF19\n\nCome back tomorrow, or join me every day for unlimited stargazing...",
    paywallCardTitle: "Soram Companion",
    paywallCardPrice: "$4.99 / month",
    paywallCardBenefit1: "Unlimited daily conversations",
    paywallCardBenefit2: "1 Master Consultation included (worth $6)",
    paywallCardCta: "\u2728 Begin",
    paywallCardFooter: "Cancel anytime",
  },
} as const;

function getT(locale: string) {
  return (T as any)[locale] || T.en;
}

// ============================================================
// v6.2 — Chat-bubble avatars
// ============================================================
//
// Two tiny presentation components used inline by message rows.
// Kept as separate components (not inline JSX) because they appear
// many times per render (every message row) and React's perf is
// happier when these are stable function references with no
// per-render closures.
//
// SoramAvatar:
//   - 32px circular, gold gradient base, /soram/soram_nav.webp
//     overlay (the default-expression close-up). If the asset
//     fails (404 in dev / first deploy), onError hides the <img>
//     and the gold + 🌙 fallback stays visible. Same fallback
//     pattern used elsewhere on the site.
//   - `invisible` prop renders an empty 32px placeholder so we
//     can keep alignment for stacked Soram messages without
//     repeating the avatar image — chandler's UX intuition: same
//     speaker doesn't need their face every line.
//
// UserAvatar:
//   - 32px circular, deep navy with a subtle gold border and
//     a sparkle/star glyph. The user has no real avatar in our
//     system, so we use a starlight motif — visually paired with
//     Soram's moon glyph (sun↔moon, star↔moon — celestial pair).
//
// Both intentionally small (8 = 32px) so the bubbles dominate
// and the avatars feel like signatures, not portraits.
// ============================================================
// ============================================================
// v6.5: 16-expression rotation + hero variant
// ============================================================
//
// EXPRESSION_ROTATION lists all 16 expression slugs that exist
// under /public/soram/expressions/. Soram message bubbles cycle
// through this list by passing an `index` prop — typically the
// message index from messages.map. The first welcome bubble
// uses index 8 (smile, happy mood) intentionally; subsequent
// real answers rotate through default/contemplation/etc.
//
// Grouping rationale (chandler "내용과 매칭은 가능할 런지"):
//   • "answering" expressions (mostly thoughtful or warm)
//     dominate the rotation — no laughing-face on a serious
//     answer about, say, a breakup.
//   • Loading state always shows contemplation (paw-on-chin).
//   • Rate-limited / used-up state shows exhausted or void.
//
// Rather than try to infer mood from the answer text (which
// requires per-message NLP and is fragile), we just rotate
// through the curated "answer-appropriate" subset. This gives
// visual variety without ever showing a wildly wrong face.
//
// variant="hero" forces the constellation-bg close-up
// (soram_hero.webp). Used in the chat header where chandler
// wants a different image than the bubble avatars.
// ============================================================

const ANSWER_EXPRESSIONS = [
  "default",          // neutral baseline
  "smile",            // warm, friendly
  "soft_smile",       // subtle warmth
  "wink_happy",       // playful but kind
  "hidden_joy",       // knowing smile
  "contemplation",    // thoughtful
  "concern",          // serious / careful
  "cheeky",           // mildly playful
] as const;

function pickExpression(messageIndex: number): string {
  return ANSWER_EXPRESSIONS[messageIndex % ANSWER_EXPRESSIONS.length];
}

type SoramAvatarProps = {
  invisible?: boolean;
  /** Message index for expression rotation (Soram bubbles only) */
  index?: number;
  /** "nav" = small bubble avatar; "hero" = constellation-bg close-up for header */
  variant?: "nav" | "hero";
  /** Larger size for header — defaults 32px, "lg" = 40px */
  size?: "sm" | "lg";
  /** Override expression by name (e.g. "contemplation" during loading) */
  expression?: string;
};

function SoramAvatar({
  invisible = false,
  index = 0,
  variant = "nav",
  size = "sm",
  expression,
}: SoramAvatarProps) {
  const sizeClass = size === "lg" ? "w-10 h-10" : "w-8 h-8";

  if (invisible) {
    return <div className={`${sizeClass} shrink-0`} aria-hidden="true" />;
  }

  // Hero variant for chat header — uses constellation background
  // close-up (the "first" image chandler made for the home CTA).
  // Not part of the rotation pool.
  if (variant === "hero") {
    return (
      <div className={`relative ${sizeClass} rounded-full bg-gradient-to-br from-indigo-900 to-slate-900 shrink-0 overflow-hidden shadow-md shadow-amber-500/20 ring-1 ring-amber-400/30`}>
        <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-sm">
          🌙
        </span>
        {/* v6.9: chat-header close-up portrait. Replaces soram_hero.webp
            (which was the wider constellation-bg shot also used on the
            home Soram CTA card). chandler asked for a different,
            tighter close-up here so the chat header reads as a
            "profile picture" — eye-contact, hat + glasses detail
            sharp at small sizes (32–40px). The asset is pre-circle-
            masked at 480x480 so the rounded-full container is mostly
            cosmetic, but the gradient bg + ring stay as fallback if
            the image 404s. */}
        <img
          src="/soram/soram_chat_header.webp"
          alt=""
          aria-hidden="true"
          onError={(ev) => {
            (ev.currentTarget as HTMLImageElement).style.display = "none";
          }}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </div>
    );
  }

  // Nav variant — bubble avatar with rotating expression.
  // Pick by name override, else by index rotation.
  const expr = expression ?? pickExpression(index);
  const src = `/soram/expressions/${expr}.webp`;

  return (
    <div className={`relative ${sizeClass} rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shrink-0 overflow-hidden shadow-sm shadow-amber-500/30`}>
      <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-sm">
        🌙
      </span>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        onError={(ev) => {
          (ev.currentTarget as HTMLImageElement).style.display = "none";
        }}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
    </div>
  );
}

function UserAvatar() {
  return (
    <div
      className="w-8 h-8 rounded-full bg-[#1E2A4A] border border-amber-400/30 shrink-0 flex items-center justify-center shadow-sm shadow-black/30"
      aria-hidden="true"
    >
      {/* Star/sparkle glyph — celestial counterpart to Soram's moon */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-300/80">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6L12 2z" />
      </svg>
    </div>
  );
}

// ============================================================
// Types
// ============================================================

interface ChatMessage {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
  score: number;
  // v6.17.26 — paywall message marker. true면 answer 본문 아래에 결제 카드
  // (native: IAP / web: PayPal) 인라인 렌더. 일반 chat 메시지와 동일하게
  // history에 저장되지만 렌더 시 결제 카드 컴포넌트가 추가로 표시됨.
  isPaywall?: boolean;
}

interface PendingMessage {
  id: string;
  question: string;
  status: "loading" | "complete" | "error";
  answer?: string;
  score?: number;
  createdAt: string;
}

interface UsageState {
  tier: "free" | "subscriber";
  canAskToday: boolean;
  remainingToday: number;
  subscriptionEnd: string | null;
  hasPrimaryChart: boolean;
  userName: string | null;
}

// ============================================================
// v6.17.26 — PaywallCard
// ────────────────────────────────────────────────────────────
// Inline 결제 카드. isPaywall=true 인 ChatMessage 바로 아래에 렌더.
// chandler 명시: "결제링크 주면서 채팅으로, 앱은 앱링크 웹은 페이팔
// 바로 줘. 프라이싱 페이지 거치지 말고".
//
// 동작:
//   • native (Flutter WebView): requestIAP("soram_companion_monthly")
//     → Flutter native IAP sheet 표시. 결제 성공 시 Flutter가
//     `iap:success:soram_companion` 메시지 → web reload하여
//     usage state subscriber로 갱신.
//   • web (브라우저): /api/payment/checkout-companion fetch →
//     PayPal approval URL 받아서 window.location.href 로 redirect.
//
// 디자인: Soram 답변 말풍선과 시각적 일관성 유지하되 결제 가능 영역
// 임을 명확히 (gold gradient border + amber background tint). promo
// card 패턴과 유사하지만 가격/혜택 더 prominent.
// ============================================================

interface PaywallCardProps {
  isNative: boolean;
  userId: string;
  userEmail: string;
  userName: string;
  locale: string;
  labels: {
    title: string;
    price: string;
    b1: string;
    b2: string;
    cta: string;
    footer: string;
  };
}

function PaywallCard({ isNative, userId, userEmail, userName, locale, labels }: PaywallCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (!userId) return;
    setError(null);
    setLoading(true);

    if (isNative) {
      // ════════════════════════════════════════════════════════════
      // Native IAP flow — Flutter Bridge.
      // Product ID: soram_companion_monthly (Auto-renewable subscription).
      // chandler가 App Store Connect + Google Play Console에 등록 후
      // 활성화. 등록 전엔 Flutter IAP plugin이 "Item Unavailable"
      // 에러 반환 → onFlutterMessage("iap:error:") 가 받아서 표시.
      // ════════════════════════════════════════════════════════════
      const unsubSuccess = onFlutterMessage("iap:success:", () => {
        unsubSuccess();
        unsubError();
        // 결제 성공 시 페이지 reload — usage state가 subscriber로
        // 갱신되어 다음 메시지부터 무제한 응답.
        window.location.reload();
      });
      const unsubError = onFlutterMessage("iap:error:", (payload) => {
        unsubSuccess();
        unsubError();
        setError(payload || "Purchase cancelled.");
        setLoading(false);
      });
      requestIAP("soram_companion_monthly");
      // Safety timeout — user closed sheet, network blip etc.
      setTimeout(() => {
        unsubSuccess();
        unsubError();
        setLoading(false);
      }, 60000);
      return;
    }

    // ─── Web mode: PayPal subscription approval URL ───
    try {
      const res = await fetch("/api/payment/checkout-companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userEmail, userName }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Payment setup failed");
      }
      window.location.href = data.url;
    } catch (e: any) {
      setError(e?.message || "Payment error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[78%] w-full">
      <div className="relative overflow-hidden rounded-2xl border border-amber-400/50 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-[#1E2A4A]/40 backdrop-blur-sm p-4 shadow-md shadow-amber-500/10">
        {/* gold accent bar (left edge) */}
        <span aria-hidden="true" className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-gradient-to-b from-amber-300 to-amber-500" />
        <div className="flex items-baseline justify-between mb-3 pl-2">
          <span className="text-sm font-semibold text-amber-100">{labels.title}</span>
          <span className="text-amber-300 font-bold text-base">{labels.price}</span>
        </div>
        <div className="space-y-1.5 mb-4 pl-2">
          <div className="flex items-start gap-2">
            <span className="text-amber-400 text-xs mt-0.5">✓</span>
            <span className="text-xs text-amber-100/85 leading-snug">{labels.b1}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400 text-xs mt-0.5">✓</span>
            <span className="text-xs text-amber-100/85 leading-snug">{labels.b2}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={loading || !userId}
          className="w-full py-2.5 rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 text-black font-semibold text-sm transition-all duration-200 hover:from-amber-200 hover:to-amber-400 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "..." : labels.cta}
        </button>
        <p className="text-[10px] text-amber-200/50 mt-2 text-center">
          {labels.footer}
        </p>
        {error && (
          <p className="text-[10px] text-red-400/80 mt-2 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Helpers
// ============================================================

function formatTime(iso: string, locale: string): string {
  try {
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  } catch {
    return "";
  }
}

function formatDateLabel(iso: string, locale: string): string {
  const t = getT(locale);
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return t.today;
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return t.yesterday;
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${month}/${day}`;
}

function shouldShowDateDivider(
  prev: { createdAt: string } | null,
  curr: { createdAt: string }
): boolean {
  if (!prev) return true;
  const a = new Date(prev.createdAt);
  const b = new Date(curr.createdAt);
  return a.toDateString() !== b.toDateString();
}

// ============================================================
// Main Component
// ============================================================

export default function SoramChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading, openSignInModal } = useAuth();
  const { locale } = useLanguage();
  const t = getT(locale);
  const isNative = useNativeApp();

  const [pageState, setPageState] = useState<
    "loading" | "needs_setup" | "ready" | "redirecting"
  >("loading");
  const [usage, setUsage] = useState<UsageState | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState<PendingMessage | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ════════════════════════════════════════════════════════════════
  // Auth gate (v1.3 Sprint 2-B follow-up)
  // ════════════════════════════════════════════════════════════════
  // Previously: hard router.replace('/?signin=1&from=soram') which
  // caused a visible URL flicker and made the post-signin destination
  // ambiguous (the home page kept the ?from=soram param but never
  // acted on it after sign-in).
  //
  // Now: stay on /soram, store the post-signin intent, open the
  // sign-in modal in place. The modal lives in app/layout.tsx (global)
  // so it overlays this page seamlessly. After sign-in, auth-context
  // reads post-signin-intent and full-redirects back here, where this
  // effect re-runs with `user` populated and the gate falls through
  // to the normal usage/history load below.
  //
  // While not signed in, pageState stays at "loading" and the render
  // path returns a friendly placeholder (see render section below).
  // ════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      // v6.13: JSON envelope with 5-min TTL (auth-context reader honors it)
      try {
        safeSet(
          "post-signin-intent",
          JSON.stringify({ path: "/soram", expires: Date.now() + 5 * 60 * 1000 })
        );
      } catch {}
      openSignInModal();
      // No router.replace — we want the user to see they're on /soram
      // (URL bar reads /soram, page chrome shows the Soram header) so
      // there's a clear "I am about to enter Soram" mental model.
      return;
    }
  }, [authLoading, user, openSignInModal]);

  // ===== Initial load: usage + history =====
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    // ════════════════════════════════════════════════════════════
    // v6.6 — defensive timeout against the infinite-loading bug
    // chandler reported: a brand-new signed-in user landing on
    // /soram could see the loading spinner forever. Likely causes:
    //  • usage API hangs (cold start, network)
    //  • API returns 500/401 silently and we landed in catch but
    //    set state to "ready" — leaving usage null and confusing
    //    later renders
    //  • OAuth callback completes but the access token isn't yet
    //    propagated to the server route by the time usage is called
    //
    // Defenses now in place:
    //  1. Hard 12-second client-side timeout on the load chain.
    //     If we haven't reached "ready" or "redirecting" by then,
    //     fall through to "needs_setup" (a real screen with a
    //     visible "사주 입력하기" button — way better than spinning
    //     forever).
    //  2. catch block now sets "needs_setup" instead of "ready" so
    //     a failed usage call doesn't drop us into a half-broken
    //     ready state with usage=null.
    //  3. Explicit hasPrimaryChart === true check — if usage came
    //     back malformed (undefined hasPrimaryChart), treat it as
    //     missing chart and redirect to setup.
    // ════════════════════════════════════════════════════════════
    const watchdog = setTimeout(() => {
      if (cancelled) return;
      // Read current pageState via setState callback to avoid stale closure
      setPageState((prev) => {
        if (prev === "loading") {
          console.warn("[soram] load timed out after 12s — falling back to needs_setup");
          return "needs_setup";
        }
        return prev;
      });
    }, 12000);

    (async () => {
      try {
        // 1. Usage
        const usageRes = await fetch("/api/v1/soram/usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
        if (!usageRes.ok) throw new Error(`usage fetch failed: ${usageRes.status}`);
        const u = (await usageRes.json()) as UsageState;
        if (cancelled) return;

        // Only proceed if hasPrimaryChart is explicitly true.
        // false OR undefined OR malformed → setup redirect.
        if (u.hasPrimaryChart !== true) {
          setPageState("redirecting");
          router.replace("/setup-primary-chart?next=/soram");
          return;
        }
        setUsage(u);

        // 2. History
        const historyRes = await fetch("/api/v1/soram/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, limit: 30 }),
        });
        if (historyRes.ok) {
          const h = await historyRes.json();
          if (!cancelled && Array.isArray(h.messages)) {
            setMessages(h.messages);
          }
        }

        if (!cancelled) setPageState("ready");
      } catch (e) {
        console.error("[soram] load failed", e);
        // v6.6: was "ready" — that left usage null and produced a
        // half-broken page. Now we land on needs_setup which has
        // a clear button to set up saju and recover the flow.
        if (!cancelled) setPageState("needs_setup");
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(watchdog);
    };
  }, [user, router]);

  // ===== Auto-scroll to bottom =====
  useEffect(() => {
    if (pageState !== "ready") return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending, pageState]);

  // ===== Loading stage cycle =====
  useEffect(() => {
    if (!pending || pending.status !== "loading") {
      setLoadingStage(0);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setLoadingStage(1), 2000));
    timers.push(setTimeout(() => setLoadingStage(2), 5000));
    timers.push(setTimeout(() => setLoadingStage(3), 7500));
    return () => timers.forEach(clearTimeout);
  }, [pending]);

  // v6.17.26 — push paywall message helper.
  // chandler 명시: "결제 해달라고 소람이가 채팅으로 말하게 해라. 결제링크
  // 주면서 채팅으로, 앱은 앱링크 웹은 페이팔 바로 줘. 프라이싱 페이지 거치지 말고".
  // 0회 남은 후 사용자 메시지 보낼 때 호출됨. 사용자 질문은 그대로 유지하고
  // (history에 들어감), Soram의 "오늘은 여기까지" 응답을 친근한 어투로 추가
  // + isPaywall=true 플래그로 결제 카드 인라인 렌더 트리거.
  const pushPaywallMessage = useCallback((question: string) => {
    const newMsg: ChatMessage = {
      id: `paywall_${Date.now()}`,
      question,
      answer: t.paywallMessage,
      createdAt: new Date().toISOString(),
      score: 0.5,
      isPaywall: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    setUsage((prev) =>
      prev ? { ...prev, canAskToday: false, remainingToday: 0 } : prev
    );
  }, [t.paywallMessage]);

  // ===== Send question =====
  const handleSend = useCallback(
    async (questionText?: string) => {
      const q = (questionText ?? input).trim();
      if (!q || sending || !user || !usage) return;

      // ════════════════════════════════════════════════════════════
      // v6.17.26 — Rate limit: chat 메시지로 결제 권유 (modal 제거).
      // chandler: "결제 해달라고 소람이가 채팅으로 말하게 해라".
      // 사용자 질문은 input에서 비우고, paywall 메시지를 history에 push.
      // ════════════════════════════════════════════════════════════
      if (usage.tier === "free" && !usage.canAskToday) {
        setInput("");
        pushPaywallMessage(q);
        return;
      }

      setSending(true);
      setInput("");
      setLoadingStage(0);

      const tempId = `pending_${Date.now()}`;
      const nowIso = new Date().toISOString();
      setPending({
        id: tempId,
        question: q,
        status: "loading",
        createdAt: nowIso,
      });

      try {
        const res = await fetch("/api/v1/soram/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            question: q,
            locale,
          }),
        });

        if (res.status === 429) {
          // ════════════════════════════════════════════════════════
          // v6.17.26 — Backend rate limit 응답도 동일 chat paywall로.
          // (race condition: client usage에선 canAskToday=true였지만
          // 서버 도착 시 already exhausted 케이스)
          // ════════════════════════════════════════════════════════
          setPending(null);
          pushPaywallMessage(q);
          setSending(false);
          return;
        }

        if (!res.ok) throw new Error("ask failed");

        const data = await res.json();
        if (!data.answer) throw new Error("no answer");

        // Parse score from answer trailing pattern: "— 소람 🌙 0.83"
        let score = 0.5;
        const m = data.answer.match(/([0-9]\.[0-9]{2})\s*$/);
        if (m) {
          const v = parseFloat(m[1]);
          if (!isNaN(v)) score = v;
        }

        // Add to messages permanently
        const newMsg: ChatMessage = {
          id: `msg_${Date.now()}`,
          question: q,
          answer: data.answer,
          createdAt: nowIso,
          score,
        };
        setMessages((prev) => [...prev, newMsg]);
        setPending(null);

        // Update usage (free user just used their daily)
        if (usage.tier === "free") {
          setUsage((prev) =>
            prev ? { ...prev, canAskToday: false, remainingToday: 0 } : prev
          );
        }

        // Haptic on mobile
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          try {
            (navigator as any).vibrate?.(40);
          } catch {}
        }
      } catch (e) {
        console.error("[soram] send failed", e);
        setPending({
          id: tempId,
          question: q,
          status: "error",
          createdAt: nowIso,
        });
      } finally {
        setSending(false);
      }
    },
    [input, sending, user, usage, locale]
  );

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ===== Render: loading =====
  if (authLoading || pageState === "loading" || pageState === "redirecting") {
    return (
      <div className="min-h-screen bg-[#0D1126] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">🌙</div>
          <div className="text-amber-200/60 text-sm">{t.loadingPage}</div>
        </div>
      </div>
    );
  }

  // ===== Render: needs setup (fallback, normally redirected) =====
  if (pageState === "needs_setup") {
    return (
      <div className="min-h-screen bg-[#0D1126] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🌙</div>
          <p className="text-white text-base mb-6">{t.setupNeeded}</p>
          <button
            onClick={() => router.push("/setup-primary-chart?next=/soram")}
            className="px-6 py-3 bg-amber-400 text-black font-semibold rounded-full"
          >
            {t.setupBtn}
          </button>
        </div>
      </div>
    );
  }

  const userName = usage?.userName || (user?.name ?? "");
  const isUnlimited = usage?.tier === "subscriber";
  const showWelcome = messages.length === 0 && !pending;

  return (
    <div className="min-h-screen bg-[#0D1126] flex flex-col">
      {/* ============= HEADER ============= */}
      <header className="sticky top-0 z-20 bg-[#0D1126]/95 backdrop-blur border-b border-amber-500/10">
        {/* v6.7: 3-column grid so the center column truly centers the avatar.
            Was flex justify-between which made the avatar shift toward the
            shorter side. Each column is min-w-0 + same flex-basis so the
            center stays optically dead-center regardless of side widths.
            Avatar+title is a button now — clicking it routes to the
            Soram Companion upgrade page (per chandler v6.7:
            "상단의 소람이 얼굴을 누르면 결제창으로 이동합니다"). */}
        <div className="max-w-2xl mx-auto px-4 py-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="flex justify-start">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-amber-200/80 hover:text-amber-200 transition-colors"
              aria-label="Back"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </div>

          {/* v6.17.26 — chandler 명시: "얼굴클릭하면 뭔가 넘어가는 상태를 없애라".
              이전: <button onClick={() => router.push("/pricing/soram-companion")}>
              현재: <div> — 클릭해도 navigation 없음. SoramAvatar는 visual 만.
              결제 진입은 채팅 메시지 (paywall message) + 우상단 plan card로만
              유지하여 사용자가 "결제할래" 명시한 경우만 routing. */}
          <div
            className="flex items-center gap-2"
            aria-label={t.headerTitle}
          >
            <SoramAvatar variant="hero" size="lg" />
            <h1 className="text-base font-medium text-amber-100">
              {t.headerTitle}
            </h1>
          </div>

          {/* v6.17.26 — chandler 명시: "우상단 글자 누르면 남은 기회가
              없으면 프라이싱 페이지 가야겠지". 단순 span을 button으로
              변경. 무제한 사용자는 클릭 의미 없으므로 disable, 0회면
              /pricing 으로 이동. */}
          <div className="flex justify-end">
            {isUnlimited ? (
              <span className="text-xs text-amber-200/60 truncate">
                {t.todayUnlimited}
              </span>
            ) : usage?.canAskToday ? (
              <span className="text-xs text-amber-200/60 truncate">
                {t.todayOneLeft}
              </span>
            ) : (
              // v6.17.28: chandler 명시 — 헤더에서 pricing으로 가는 링크 제거.
              // 결제 안내는 채팅 안 paywall 카드로 충분히 표시되므로 헤더는
              // 단순 상태 텍스트만 보여주도록 button → span으로 변경.
              <span className="text-xs text-amber-200/60 truncate">
                {t.todayUsed}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ============= MESSAGES ============= */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6"
      >
        <div className="max-w-2xl mx-auto space-y-5">
          {/* ════════════════════════════════════════════════════════
              v6.2 — first-time welcome rendered AS a Soram chat bubble.
              Per chandler: 신규 사용자가 사주 입력 후 채팅창에 들어오면
              소람이 채팅글로 서비스 안내를 먼저 해야 한다.
              
              Old version showed a centered welcome CARD with sample
              chips. Now: same content but framed as Soram's first
              message with avatar on the left, then a separate small
              row with sample chips below — feels like a real chat
              opening, not a settings screen.
          ════════════════════════════════════════════════════════ */}
          {showWelcome && usage && (
            <>
              {/* ════════════════════════════════════════════════════════
                  v6.10: intro bubble redesigned (idea A + D combo).
                  
                  Why the old single-string firstWelcomeMsg felt heavy:
                  ~100 Korean characters in one paragraph, no visual
                  hierarchy, plus the Companion price spliced in as
                  a parenthetical — which made the whole bubble read
                  like an ad. Chandler's image (mobile screenshot)
                  showed a "wall of text" effect.
                  
                  New structure:
                    1. Headline (serif, gold gradient, larger)
                       → "그대의 사주를 들여다봅니다." — sets the tone
                          immediately, feels like an opening line of
                          a literary letter rather than a system msg.
                    2. Body (sans, white/80, smaller, separated)
                       → identity + free-tier limit, two short sentences.
                    3. Subtle divider (gold-tinted hairline) between
                       headline and body — typographic separation.
                  
                  The Companion price is now a SEPARATE tappable promo
                  card BELOW the bubble (rendered next, see below).
                  This:
                    (a) keeps the intro bubble short and elegant,
                    (b) makes the price a clickable CTA instead of
                        dead text, doubling the conversion entry
                        points (header avatar + this card).
                  
                  Fallback: if a locale doesn't yet have welcomeHeadline
                  /welcomeBody (older translations), we fall back to the
                  legacy firstWelcomeMsg string. This keeps non-KO/EN
                  locales rendering until v1.2 retranslates them.
              ════════════════════════════════════════════════════════ */}
              <div className="flex items-end gap-2">
                <SoramAvatar expression="smile" />
                <div className="max-w-[78%]">
                  <div className="bg-[#1E2A4A] text-white/95 rounded-2xl rounded-bl-md px-4 py-3.5 shadow-sm shadow-black/20">
                    {(t as { welcomeHeadline?: string }).welcomeHeadline ? (
                      <>
                        {/* Headline — serif + gold gradient */}
                        <p
                          className="font-serif text-base sm:text-lg leading-snug bg-gradient-to-br from-amber-200 to-amber-400 bg-clip-text text-transparent"
                          style={{ WebkitBackgroundClip: "text" }}
                        >
                          {(t as { welcomeHeadline?: string }).welcomeHeadline}
                        </p>
                        {/* Hairline divider — barely visible, just enough to separate */}
                        <div className="my-2.5 h-px bg-gradient-to-r from-amber-400/30 via-amber-300/15 to-transparent" />
                        {/* Body — sans, slightly muted, smaller */}
                        <p className="text-sm leading-relaxed text-white/80 whitespace-pre-line">
                          {(t as { welcomeBody?: string }).welcomeBody}
                        </p>
                      </>
                    ) : (
                      // Legacy fallback for locales not yet migrated
                      <p className="text-sm leading-relaxed whitespace-pre-line">
                        {(t as { firstWelcomeMsg?: string }).firstWelcomeMsg ?? t.welcomeHint}
                      </p>
                    )}
                  </div>
                  <div className="text-[10px] text-amber-200/50 mt-1.5 ml-1">
                    {locale === "ko" ? "\uC18C\uB78C" : "Soram"} 🌙
                  </div>
                </div>
              </div>

              {/* ════════════════════════════════════════════════════════
                  v6.10: Companion promo card — separate tappable CTA
                  
                  This was the price/upgrade content that used to live
                  inside the intro bubble. Now extracted as its own
                  card so it:
                    - looks like a product card, not a sentence
                    - is touchable (whole card tap target)
                    - routes to /pricing/soram-companion (same dest
                      as the header avatar tap, but more discoverable
                      because it's right under the welcome — users
                      who missed the "↑ tap face" instruction still
                      see the upgrade option naturally)
                  
                  Style: same gold-accent treatment as the home
                  Soram CTA card (consistent visual language across
                  the product). aria-label uses the title for screen
                  readers.
              ════════════════════════════════════════════════════════ */}
              {(t as { promoTitle?: string }).promoTitle && (
                <div className="flex items-end gap-2">
                  {/* invisible spacer matching avatar width so card aligns
                      with the bubble above (not the avatar gutter) */}
                  <SoramAvatar invisible />
                  <button
                    type="button"
                    onClick={() => router.push("/pricing/soram-companion")}
                    aria-label={(t as { promoTitle?: string }).promoTitle}
                    className="block text-left max-w-[78%] w-full group"
                  >
                    <div className="relative overflow-hidden rounded-xl border border-amber-400/40 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent backdrop-blur-sm pl-3.5 pr-3 py-2.5 transition-all duration-200 hover:border-amber-300/70 hover:shadow-[0_8px_24px_rgba(234,179,8,0.25)] active:scale-[0.99]">
                      {/* gold left accent bar — same as home CTA */}
                      <span aria-hidden="true" className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-gradient-to-b from-amber-300 to-amber-500" />
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-amber-100 leading-tight">
                            {(t as { promoTitle?: string }).promoTitle}
                          </p>
                          <p className="text-[10px] text-amber-200/70 leading-snug mt-0.5 line-clamp-2">
                            {(t as { promoSub?: string }).promoSub}
                          </p>
                        </div>
                        {/* inline arrow icon — avoids new lucide-react import */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-4 h-4 text-amber-300/80 shrink-0 transition-transform group-hover:translate-x-1"
                          aria-hidden="true"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* v6.7: how-to-use bubble — separate message so it reads as
                  a follow-up explanation rather than crammed into the
                  welcome paragraph. Uses contemplation expression for
                  the "explaining" mood.
                  v6.9: chandler asked to put the scholar illustration
                  (cat scholar at desk with books, globe, oil lamp)
                  INSIDE this how-to-use bubble. Image sits at the top
                  of the bubble (rounded-t to match), text sits below.
                  This visually anchors the "5,000 years of knowledge
                  I've studied" claim — readers see Soram studying.
                  Image is loading="lazy" + decoding="async" because
                  it's below the welcome bubble (off the initial paint
                  in most viewports) and ~50KB; lazy keeps first-paint
                  text-only. */}
              <div className="flex items-end gap-2">
                <SoramAvatar expression="contemplation" />
                <div className="max-w-[78%] w-[78%] sm:w-auto">
                  <div className="bg-[#1E2A4A] text-white/95 rounded-2xl rounded-bl-md overflow-hidden shadow-sm shadow-black/20">
                    {/* Scholar illustration — 16:10 aspect, fills bubble width */}
                    <img
                      src="/soram/soram_scholar.webp"
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      onError={(ev) => {
                        (ev.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                      className="block w-full h-auto"
                      draggable={false}
                    />
                    <div className="px-4 py-3 text-sm leading-relaxed whitespace-pre-line">
                      {(t as { howToUseMsg?: string }).howToUseMsg ?? t.welcomeHint}
                    </div>
                  </div>
                </div>
              </div>

              {/* Soram third message: prompt for question */}
              <div className="flex items-end gap-2">
                <SoramAvatar invisible />
                <div className="max-w-[78%]">
                  <div className="bg-[#1E2A4A] text-white/95 rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed shadow-sm shadow-black/20">
                    {(t as { firstWelcomePrompt?: string }).firstWelcomePrompt ?? t.welcomeSub}
                  </div>
                </div>
              </div>

              {/* Sample chips — quieter than before, indented under Soram */}
              <div className="pl-12">
                <p className="text-[11px] text-amber-200/45 mb-2 ml-1">{t.samplesTitle}</p>
                <div className="flex flex-wrap gap-2">
                  {t.samples.map((s: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => handleSend(s)}
                      disabled={sending}
                      className="px-3.5 py-1.5 text-[13px] rounded-full bg-amber-500/8 text-amber-100/90 border border-amber-500/20 hover:bg-amber-500/16 hover:border-amber-400/40 active:scale-[0.97] transition-all disabled:opacity-40"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Past messages */}
          {messages.map((msg, idx) => {
            const prev = idx > 0 ? messages[idx - 1] : null;
            const showDate = shouldShowDateDivider(prev, msg);
            return (
              <div key={msg.id} className="space-y-3">
                {showDate && (
                  <div className="flex items-center justify-center my-6">
                    <div className="px-3 py-1 text-[11px] text-amber-200/45 bg-amber-500/5 rounded-full">
                      {formatDateLabel(msg.createdAt, locale)}
                    </div>
                  </div>
                )}

                {/* User row (right, gold) — moon-glyph avatar on right edge */}
                <div className="flex items-end justify-end gap-2">
                  <div className="max-w-[72%]">
                    <div className="bg-gradient-to-br from-amber-300 to-amber-500 text-black rounded-2xl rounded-br-md px-4 py-2.5 text-sm leading-relaxed shadow-sm shadow-amber-500/20">
                      {msg.question}
                    </div>
                    <div className="text-[10px] text-amber-200/45 mt-1 mr-1 text-right">
                      {formatTime(msg.createdAt, locale)}
                    </div>
                  </div>
                  <UserAvatar />
                </div>

                {/* Soram row (left, navy) — expression rotates by index */}
                <div className="flex items-end gap-2">
                  <SoramAvatar index={idx} />
                  <div className="max-w-[78%]">
                    <div className="bg-[#1E2A4A] text-white/95 rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm shadow-black/20">
                      {msg.answer}
                    </div>
                  </div>
                </div>

                {/* v6.17.26 — Paywall card inline (chandler 명시: 채팅으로
                    결제링크 줘. 앱은 IAP, 웹은 PayPal). isPaywall=true 메시지
                    바로 아래에 인라인 카드 렌더. SoramAvatar 폭만큼 invisible
                    spacer로 들여쓰기하여 답변 본문과 정렬 일치. */}
                {msg.isPaywall && (
                  <div className="flex items-end gap-2">
                    <SoramAvatar invisible />
                    <PaywallCard
                      isNative={isNative}
                      userId={user?.id || ""}
                      userEmail={user?.email || ""}
                      userName={usage?.userName || ""}
                      locale={locale}
                      labels={{
                        title: t.paywallCardTitle,
                        price: t.paywallCardPrice,
                        b1: t.paywallCardBenefit1,
                        b2: t.paywallCardBenefit2,
                        cta: t.paywallCardCta,
                        footer: t.paywallCardFooter,
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Pending message */}
          {pending && (
            <div className="space-y-3">
              {/* User question (right) — with avatar */}
              <div className="flex items-end justify-end gap-2">
                <div className="max-w-[72%]">
                  <div className="bg-gradient-to-br from-amber-300 to-amber-500 text-black rounded-2xl rounded-br-md px-4 py-2.5 text-sm shadow-sm shadow-amber-500/20">
                    {pending.question}
                  </div>
                </div>
                <UserAvatar />
              </div>

              {/* Soram thinking (left) — contemplation expression while loading */}
              {pending.status === "loading" && (
                <div className="flex items-end gap-2">
                  <SoramAvatar expression="contemplation" />
                  <div className="bg-[#1E2A4A] text-white rounded-2xl rounded-bl-md px-4 py-3 max-w-[78%] shadow-sm shadow-black/20">
                    <div className="flex items-center gap-2 text-sm text-amber-100/80">
                      <span className="inline-flex gap-1">
                        <span className="w-1.5 h-1.5 bg-amber-300 rounded-full animate-pulse"></span>
                        <span className="w-1.5 h-1.5 bg-amber-300 rounded-full animate-pulse [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 bg-amber-300 rounded-full animate-pulse [animation-delay:0.4s]"></span>
                      </span>
                      <span className="text-xs italic transition-opacity duration-500">
                        {t.loading[loadingStage]}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {pending.status === "error" && (
                <div className="flex items-end gap-2">
                  <SoramAvatar expression="concern" />
                  <div className="bg-red-900/30 text-red-200 rounded-2xl rounded-bl-md px-4 py-3 text-sm border border-red-500/20 max-w-[78%]">
                    {t.errorAsk}
                  </div>
                </div>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ============= INPUT ============= */}
      <div className="sticky bottom-0 z-20 bg-[#0D1126]/95 backdrop-blur border-t border-amber-500/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 200))}
            onKeyDown={handleKeyPress}
            placeholder={
              isUnlimited ? t.inputPlaceholderUnlimited : t.inputPlaceholderFree
            }
            rows={1}
            disabled={sending}
            className="flex-1 bg-amber-500/5 border border-amber-500/20 rounded-2xl px-4 py-3 text-sm text-amber-50 placeholder-amber-200/30 focus:outline-none focus:border-amber-400/50 resize-none disabled:opacity-50"
            style={{ minHeight: "44px", maxHeight: "120px" }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || sending}
            className="px-4 py-3 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-black font-medium text-sm disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
            aria-label="Send"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ============= UPGRADE MODAL ============= */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0">
          <div className="bg-gradient-to-b from-[#1A2240] to-[#0D1126] border border-amber-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 mb-4">
                <span className="text-3xl">🌙</span>
              </div>
              <h3 className="text-lg font-medium text-amber-100 mb-2">
                {t.upgradeTitle}
              </h3>
              <p className="text-sm italic text-amber-200/60">
                "{t.upgradeQuote}"
              </p>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 mb-5">
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-base text-amber-100 font-medium">
                  {t.upgradeName}
                </span>
                <span className="text-amber-300 font-semibold">
                  {t.upgradePrice}
                </span>
              </div>
              <div className="space-y-2 text-sm text-amber-100/80">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">✓</span>
                  <span>{t.upgradeBenefit1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">✓</span>
                  <span>{t.upgradeBenefit2}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push("/pricing?plan=daily_pass")}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-black font-semibold text-base mb-3"
            >
              {t.upgradeBtn}
            </button>

            <button
              onClick={() => setShowUpgrade(false)}
              className="w-full py-2 text-xs text-amber-200/40"
            >
              {t.upgradeFooter}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
