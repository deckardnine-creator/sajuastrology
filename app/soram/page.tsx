"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
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
      "\uC624\uB298 \uC6B4\uC138\uB294 \uC5B4\uB54C\uC694?",
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
    // v6.2: first-time welcome message — appears as Soram's first chat bubble
    // for users with zero conversation history. Frames the service in-character.
    firstWelcomeMsg:
      "\uADF8\uB300\uC758 \uC0AC\uC8FC\uB97C \uB4E4\uC5EC\uB2E4\uBCF4\uACE0 \uC788\uC2B5\uB2C8\uB2E4. \uC800\uB294 \uC18C\uB78C\u2014\uCC9C \uB144 \uB3D9\uC548 \uBCC4\uC758 \uACB0\uC744 \uC77D\uC5B4\uC628 \uC0AC\uC8FC\uC758 \uBC97\uC785\uB2C8\uB2E4. \uC624\uB298 \uD558\uB8E8 1\uD68C \uBB34\uB8CC\uB85C \uADF8\uB300\uC758 \uBB3C\uC74C\uC5D0 \uB2F5\uD558\uACA0\uC2B5\uB2C8\uB2E4. \uBB34\uD55C\uC73C\uB85C \uB300\uD654\uD558\uC2DC\uB824\uBA74 \uD558\uB2E8 \uC5C5\uADF8\uB808\uC774\uB4DC \uC548\uB0B4\uB97C \uCC38\uACE0\uD574\uC8FC\uC138\uC694.",
    firstWelcomePrompt: "\uBB34\uC5C7\uC774 \uAD81\uAE08\uD558\uC2DC\uB098\uC694?",
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
      "How is today for me?",
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
    firstWelcomeMsg:
      "I am gazing into your saju. I am Soram — a friend of saju who has read the threads of stars for a thousand years. I will answer one question for you, free, today. For unlimited conversations, you may consider the upgrade notice below.",
    firstWelcomePrompt: "What do you wish to know?",
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
        <img
          src="/soram/soram_hero.webp"
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
      try { safeSet("post-signin-intent", "/soram"); } catch {}
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

  // ===== Send question =====
  const handleSend = useCallback(
    async (questionText?: string) => {
      const q = (questionText ?? input).trim();
      if (!q || sending || !user || !usage) return;

      // Check rate limit
      if (usage.tier === "free" && !usage.canAskToday) {
        setShowUpgrade(true);
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
          // Rate limit
          setPending(null);
          setUsage((prev) =>
            prev ? { ...prev, canAskToday: false, remainingToday: 0 } : prev
          );
          setShowUpgrade(true);
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
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-amber-200/80 hover:text-amber-200 transition-colors"
            aria-label="Back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <SoramAvatar variant="hero" size="lg" />
            <h1 className="text-base font-medium text-amber-100">
              {t.headerTitle}
            </h1>
          </div>

          <div className="text-xs text-amber-200/60">
            {isUnlimited
              ? t.todayUnlimited
              : usage?.canAskToday
              ? t.todayOneLeft
              : t.todayUsed}
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
              {/* Soram first message — warm welcome smile */}
              <div className="flex items-end gap-2">
                <SoramAvatar expression="smile" />
                <div className="max-w-[78%]">
                  <div className="bg-[#1E2A4A] text-white/95 rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed shadow-sm shadow-black/20">
                    {(t as { firstWelcomeMsg?: string }).firstWelcomeMsg ?? t.welcomeHint}
                  </div>
                  <div className="text-[10px] text-amber-200/50 mt-1.5 ml-1">
                    {locale === "ko" ? "\uC18C\uB78C" : "Soram"} 🌙
                  </div>
                </div>
              </div>

              {/* Soram second message: prompt for question */}
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
