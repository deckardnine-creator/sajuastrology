"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";

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
  },
} as const;

function getT(locale: string) {
  return (T as any)[locale] || T.en;
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
  const { user, isLoading: authLoading } = useAuth();
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

  // ===== Auth check =====
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      const params = new URLSearchParams();
      params.set("signin", "1");
      params.set("from", "soram");
      if (locale && locale !== "en") params.set("lang", locale);
      router.replace(`/?${params.toString()}`);
      return;
    }
  }, [authLoading, user, locale, router]);

  // ===== Initial load: usage + history =====
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      try {
        // 1. Usage
        const usageRes = await fetch("/api/v1/soram/usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
        if (!usageRes.ok) throw new Error("usage fetch failed");
        const u = (await usageRes.json()) as UsageState;
        if (cancelled) return;

        if (!u.hasPrimaryChart) {
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
        if (!cancelled) setPageState("ready");
      }
    })();

    return () => {
      cancelled = true;
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
            {/* Soram avatar placeholder - golden circle with moon */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-base shadow-lg shadow-amber-500/20">
              🌙
            </div>
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
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Welcome card */}
          {showWelcome && usage && (
            <div className="text-center pt-8 pb-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-300/20 to-amber-500/20 mb-5">
                <span className="text-4xl">🌙</span>
              </div>
              <h2 className="text-lg font-medium text-amber-100 mb-2 leading-relaxed">
                {t.welcomeTitle(userName)}
              </h2>
              <p className="text-amber-200/70 text-sm mb-1">{t.welcomeSub}</p>
              <p className="text-amber-200/50 text-xs mt-3">{t.welcomeHint}</p>

              {/* Sample question chips */}
              <div className="mt-8">
                <p className="text-xs text-amber-200/40 mb-3">{t.samplesTitle}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {t.samples.map((s: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => handleSend(s)}
                      disabled={sending}
                      className="px-4 py-2 text-sm rounded-full bg-amber-500/10 text-amber-100/90 border border-amber-500/20 hover:bg-amber-500/20 transition-colors disabled:opacity-40"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Past messages */}
          {messages.map((msg, idx) => {
            const prev = idx > 0 ? messages[idx - 1] : null;
            const showDate = shouldShowDateDivider(prev, msg);
            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex items-center justify-center my-6">
                    <div className="px-3 py-1 text-xs text-amber-200/40 bg-amber-500/5 rounded-full">
                      {formatDateLabel(msg.createdAt, locale)}
                    </div>
                  </div>
                )}

                {/* User bubble (right, gold) */}
                <div className="flex justify-end mb-3">
                  <div className="max-w-[75%]">
                    <div className="bg-gradient-to-br from-amber-300 to-amber-500 text-black rounded-2xl rounded-tr-md px-4 py-2.5 text-sm leading-relaxed">
                      {msg.question}
                    </div>
                    <div className="text-[10px] text-amber-200/40 mt-1 text-right">
                      {formatTime(msg.createdAt, locale)}
                    </div>
                  </div>
                </div>

                {/* Soram bubble (left, navy) */}
                <div className="flex justify-start">
                  <div className="max-w-[80%]">
                    <div className="bg-[#1E2A4A] text-white rounded-2xl rounded-tl-md px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pending message */}
          {pending && (
            <div>
              {/* User question (right) */}
              <div className="flex justify-end mb-3">
                <div className="max-w-[75%]">
                  <div className="bg-gradient-to-br from-amber-300 to-amber-500 text-black rounded-2xl rounded-tr-md px-4 py-2.5 text-sm">
                    {pending.question}
                  </div>
                </div>
              </div>

              {/* Soram thinking (left) */}
              {pending.status === "loading" && (
                <div className="flex justify-start">
                  <div className="bg-[#1E2A4A] text-white rounded-2xl rounded-tl-md px-4 py-3 max-w-[80%]">
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
                <div className="flex justify-start">
                  <div className="bg-red-900/30 text-red-200 rounded-2xl rounded-tl-md px-4 py-3 text-sm border border-red-500/20">
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
