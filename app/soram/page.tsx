"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";

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
// Constants
// ============================================================

const LOADING_STAGES = [
  { ms: 0, text: "📖 그대의 사주를 펼치고 있어요" },
  { ms: 2000, text: "📚 고전을 살피고 있어요... 적천수, 궁통보감" },
  { ms: 5000, text: "🔮 그대의 일주와 오늘의 흐름을 맞추는 중이에요" },
  { ms: 7500, text: "✨ 답변을 정성스럽게 다듬고 있어요" },
];

const SAMPLE_QUESTIONS = [
  "오늘 운세는 어때요?",
  "오늘 어떤 옷을 입을까요?",
  "이번 주 좋은 일이 있을까요?",
  "지금 만나는 사람과 잘 맞을까요?",
];

// ============================================================
// Helpers
// ============================================================

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");

  if (sameDay) return `오늘 ${hh}:${mm}`;
  if (isYesterday) return `어제 ${hh}:${mm}`;
  
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}월 ${day}일 ${hh}:${mm}`;
}

function shouldShowDateDivider(prev: { createdAt: string } | null, current: { createdAt: string }): boolean {
  if (!prev) return true;
  return new Date(prev.createdAt).toDateString() !== new Date(current.createdAt).toDateString();
}

function formatDateDivider(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return "오늘";
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "어제";
  
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}월 ${day}일`;
}

// ============================================================
// Sub-components (inline)
// ============================================================

function SoramAvatar({ size = 36 }: { size?: number }) {
  return (
    <div
      className="flex-shrink-0 rounded-full flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #2A1E5C 0%, #1E2A4A 100%)",
        boxShadow: "0 2px 8px rgba(255, 215, 0, 0.2)",
        border: "1px solid rgba(255, 215, 0, 0.3)",
      }}
    >
      <span style={{ fontSize: size * 0.5, lineHeight: 1 }}>🌙</span>
    </div>
  );
}

function DateDivider({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 my-4 px-2">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-xs text-white/40 font-medium">{text}</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

function UserBubble({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex flex-col items-end mb-3 px-3">
      <div
        className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-sm"
        style={{
          background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
          color: "#1a1a1a",
          fontSize: 15,
          lineHeight: 1.5,
          fontWeight: 500,
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
        }}
      >
        {text}
      </div>
      <span className="text-[11px] text-white/40 mt-1 mr-1">{time}</span>
    </div>
  );
}

function SoramBubble({ text, time }: { text: string; time: string }) {
  // Split answer to highlight signature
  const sigIdx = text.lastIndexOf("— 소람 🌙");
  const body = sigIdx > 0 ? text.substring(0, sigIdx).trim() : text;
  const signature = sigIdx > 0 ? text.substring(sigIdx) : "";

  return (
    <div className="flex items-start gap-2 mb-3 px-3">
      <SoramAvatar size={32} />
      <div className="flex flex-col items-start max-w-[85%]">
        <div
          className="px-4 py-3 rounded-2xl rounded-tl-sm"
          style={{
            background: "rgba(30, 42, 74, 0.8)",
            border: "1px solid rgba(255, 215, 0, 0.15)",
            color: "#f5f5f5",
            fontSize: 15,
            lineHeight: 1.7,
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
          }}
        >
          {body}
          {signature && (
            <div
              style={{
                marginTop: 12,
                fontSize: 12,
                color: "rgba(255, 215, 0, 0.7)",
                fontStyle: "italic",
              }}
            >
              {signature}
            </div>
          )}
        </div>
        <span className="text-[11px] text-white/40 mt-1 ml-1">{time}</span>
      </div>
    </div>
  );
}

function LoadingBubble() {
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    LOADING_STAGES.forEach((stage, idx) => {
      if (idx === 0) return; // first one is already showing
      const timer = setTimeout(() => setStageIdx(idx), stage.ms);
      timers.push(timer);
    });
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <div className="flex items-start gap-2 mb-3 px-3">
      <SoramAvatar size={32} />
      <div
        className="px-4 py-3 rounded-2xl rounded-tl-sm"
        style={{
          background: "rgba(30, 42, 74, 0.6)",
          border: "1px solid rgba(255, 215, 0, 0.15)",
          color: "rgba(245, 245, 245, 0.85)",
          fontSize: 14,
          lineHeight: 1.6,
          fontStyle: "italic",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex">
            <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse mx-1" style={{ animationDelay: "200ms" }} />
            <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: "400ms" }} />
          </span>
          <span style={{ transition: "opacity 0.4s" }}>
            {LOADING_STAGES[stageIdx].text}
          </span>
        </div>
      </div>
    </div>
  );
}

function WelcomeCard({
  userName,
  onSampleClick,
}: {
  userName: string | null;
  onSampleClick: (q: string) => void;
}) {
  const greeting = userName ? `${userName}님,` : "반갑습니다,";

  return (
    <div className="flex flex-col items-center px-4 py-8 mb-2">
      <div
        className="rounded-2xl p-5 max-w-md w-full"
        style={{
          background: "linear-gradient(135deg, rgba(42, 30, 92, 0.6) 0%, rgba(30, 42, 74, 0.6) 100%)",
          border: "1px solid rgba(255, 215, 0, 0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <SoramAvatar size={48} />
          <div>
            <div className="text-base font-semibold" style={{ color: "#FFD700" }}>
              소람
            </div>
            <div className="text-xs text-white/60">천 년의 사주 학자</div>
          </div>
        </div>
        <div className="text-sm text-white/85 leading-relaxed">
          {greeting} 저는 천 년 동안 사주를 들여다본 소람이에요.
          <br />
          그대의 명(命)과 오늘의 흐름을 맞추어,
          <br />
          매일 한 걸음씩 함께 풀어드릴게요.
        </div>
      </div>

      <div className="mt-5 w-full max-w-md">
        <div className="text-xs text-white/40 mb-2 text-center">
          이렇게 물어보실 수 있어요
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {SAMPLE_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => onSampleClick(q)}
              className="px-3 py-1.5 rounded-full text-xs transition-all hover:scale-105"
              style={{
                background: "rgba(255, 215, 0, 0.08)",
                border: "1px solid rgba(255, 215, 0, 0.25)",
                color: "rgba(255, 215, 0, 0.9)",
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function UpgradeCard({ userName }: { userName: string | null }) {
  const router = useRouter();
  const namePart = userName ? `${userName}님,` : "";

  return (
    <div className="px-3 mb-3">
      <div
        className="rounded-2xl p-5"
        style={{
          background: "linear-gradient(135deg, rgba(42, 30, 92, 0.7) 0%, rgba(30, 42, 74, 0.7) 100%)",
          border: "1px solid rgba(255, 215, 0, 0.3)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <SoramAvatar size={36} />
          <div className="text-sm font-semibold" style={{ color: "#FFD700" }}>
            소람과 매일
          </div>
        </div>
        <div className="text-sm text-white/85 leading-relaxed mb-4">
          {namePart} 오늘의 한 걸음을 모두 함께했습니다.
          <br />
          매일 무한히 곁에 머물길 원하신다면,
          <br />
          <span style={{ color: "#FFD700", fontWeight: 600 }}>
            소람 동행 — $4.99/월
          </span>
        </div>
        <ul className="text-xs text-white/70 space-y-1.5 mb-4">
          <li className="flex items-start gap-2">
            <span style={{ color: "#FFD700" }}>✓</span>
            <span>매일 무제한 질문</span>
          </li>
          <li className="flex items-start gap-2">
            <span style={{ color: "#FFD700" }}>✓</span>
            <span>정밀 사주 상담 1회 매월 ($29.99 가치)</span>
          </li>
          <li className="flex items-start gap-2">
            <span style={{ color: "#FFD700" }}>✓</span>
            <span>모든 답변 영구 저장</span>
          </li>
        </ul>
        <button
          onClick={() => router.push("/pricing")}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
            color: "#1a1a1a",
          }}
        >
          소람과 매일 함께
        </button>
        <div className="text-[11px] text-white/40 text-center mt-3">
          내일 다시 오시면 한 번 더 함께할 수 있어요.
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function SoramPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { locale } = useLanguage();

  const [usage, setUsage] = useState<UsageState | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState<PendingMessage | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [oldestCursor, setOldestCursor] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const focusedMessageId = searchParams.get("focus");
  const focusRef = useRef<HTMLDivElement>(null);

  // ============= 1. Auth check =============
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

  // ============= 2. Initial load: usage + history =============
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      try {
        // Parallel fetch
        const [usageRes, historyRes] = await Promise.all([
          fetch("/api/v1/soram/usage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id }),
          }),
          fetch("/api/v1/soram/history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, limit: 30 }),
          }),
        ]);

        if (cancelled) return;

        if (usageRes.ok) {
          const usageData = await usageRes.json();
          setUsage(usageData);

          // No primary chart? Redirect to setup
          if (!usageData.hasPrimaryChart) {
            router.replace("/setup-primary-chart");
            return;
          }
        }

        if (historyRes.ok) {
          const histData = await historyRes.json();
          setMessages(histData.messages || []);
          setHasMore(histData.hasMore || false);
          setOldestCursor(histData.oldestCursor || null);
        }
      } catch (err) {
        console.error("[soram page] initial load failed:", err);
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, router]);

  // ============= 3. Auto-scroll to bottom on new messages =============
  useEffect(() => {
    if (loadingHistory) return;
    if (focusedMessageId) return; // don't auto-scroll if focusing on specific message

    const container = scrollContainerRef.current;
    if (!container) return;

    // Scroll to bottom
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }, [messages, pending, loadingHistory, focusedMessageId]);

  // ============= 4. Focus on specific message (from dashboard click) =============
  useEffect(() => {
    if (!focusedMessageId) return;
    if (loadingHistory) return;

    setTimeout(() => {
      const el = document.querySelector(`[data-msg-id="${focusedMessageId}"]`);
      if (el && "scrollIntoView" in el) {
        (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
        // brief highlight
        (el as HTMLElement).style.transition = "background-color 0.6s";
        (el as HTMLElement).style.backgroundColor = "rgba(255, 215, 0, 0.1)";
        setTimeout(() => {
          (el as HTMLElement).style.backgroundColor = "transparent";
        }, 1500);
      }
    }, 200);
  }, [focusedMessageId, loadingHistory, messages]);

  // ============= 5. Load older messages (scroll up) =============
  const loadMore = useCallback(async () => {
    if (!user || !hasMore || loadingMore || !oldestCursor) return;

    setLoadingMore(true);
    const container = scrollContainerRef.current;
    const prevScrollHeight = container?.scrollHeight || 0;

    try {
      const res = await fetch("/api/v1/soram/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, before: oldestCursor, limit: 30 }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...(data.messages || []), ...prev]);
        setHasMore(data.hasMore || false);
        setOldestCursor(data.oldestCursor || null);

        // Maintain scroll position after prepending
        requestAnimationFrame(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - prevScrollHeight;
          }
        });
      }
    } catch (err) {
      console.error("[soram] load more failed:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [user, hasMore, loadingMore, oldestCursor]);

  // ============= 6. Detect scroll-up to load more =============
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop < 100 && hasMore && !loadingMore) {
        loadMore();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMore, loadingMore, loadMore]);

  // ============= 7. Send question =============
  const sendQuestion = async () => {
    const trimmed = input.trim();
    if (!trimmed || submitting || !user || !usage) return;

    if (trimmed.length > 200) {
      setErrorMsg("질문은 200자 이내로 적어주세요.");
      return;
    }

    if (usage.tier === "free" && !usage.canAskToday) {
      setErrorMsg("오늘의 한 걸음을 모두 사용하셨어요.");
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);

    const tempId = `pending-${Date.now()}`;
    const now = new Date().toISOString();

    setPending({
      id: tempId,
      question: trimmed,
      status: "loading",
      createdAt: now,
    });
    setInput("");

    // Haptic feedback (mobile)
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(30);
      } catch {}
    }

    try {
      const res = await fetch("/api/v1/soram/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          question: trimmed,
          locale: locale || "ko",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPending(null);
        if (res.status === 429) {
          setErrorMsg("오늘의 한 걸음을 모두 사용하셨어요.");
          setUsage((u) => (u ? { ...u, canAskToday: false, remainingToday: 0 } : u));
        } else if (res.status === 403) {
          router.replace("/setup-primary-chart");
        } else {
          setErrorMsg(data?.error || "잠시 후 다시 시도해주세요.");
        }
        setSubmitting(false);
        return;
      }

      // Success: add to messages
      const answer = data.answer || "";
      // Extract score from answer
      let score = 0.5;
      const sigMatch = answer.match(/—\s*소람\s*🌙\s*([\d.]+)/);
      if (sigMatch) {
        const parsed = parseFloat(sigMatch[1]);
        if (!isNaN(parsed)) score = parsed;
      }

      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        question: trimmed,
        answer,
        createdAt: new Date().toISOString(),
        score,
      };

      setMessages((prev) => [...prev, newMsg]);
      setPending(null);

      // Haptic on answer arrival
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(50);
        } catch {}
      }

      // Update usage (free tier loses their daily question)
      if (usage.tier === "free") {
        setUsage((u) => (u ? { ...u, canAskToday: false, remainingToday: 0 } : u));
      }
    } catch (err: any) {
      console.error("[soram] send failed:", err);
      setPending(null);
      setErrorMsg("연결에 문제가 있어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuestion();
    }
  };

  const handleSampleClick = (q: string) => {
    setInput(q);
    inputRef.current?.focus();
  };

  // ============= Loading auth =============
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0D1126" }}>
        <div className="text-white/60 text-sm">···</div>
      </div>
    );
  }

  // ============= Render =============
  const showWelcome = !loadingHistory && messages.length === 0 && !pending;
  const showUpgrade = usage?.tier === "free" && !usage.canAskToday && !submitting;
  const inputDisabled = !!(submitting || (usage?.tier === "free" && !usage.canAskToday));

  // Header status text
  const statusText = (() => {
    if (!usage) return "";
    if (usage.tier === "subscriber") return "✨ 오늘도 무한히";
    if (usage.canAskToday) return "🎁 오늘 1회 남음";
    return null;
  })();

  return (
    <div
      className="flex flex-col"
      style={{
        height: "100dvh",
        background: "#0D1126",
        color: "#fff",
      }}
    >
      {/* ============= Header ============= */}
      <header
        className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{
          background: "rgba(13, 17, 38, 0.95)",
          borderColor: "rgba(255, 215, 0, 0.1)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-white/70 hover:text-white p-1 -ml-1"
            aria-label="뒤로"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <SoramAvatar size={32} />
          <div>
            <div className="text-sm font-semibold">소람과의 대화</div>
            {statusText && (
              <div className="text-[11px] text-white/50">{statusText}</div>
            )}
          </div>
        </div>
        {usage?.tier === "free" && !usage.canAskToday && (
          <button
            onClick={() => router.push("/pricing")}
            className="text-xs px-3 py-1.5 rounded-full font-medium"
            style={{
              background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
              color: "#1a1a1a",
            }}
          >
            매일 함께 →
          </button>
        )}
      </header>

      {/* ============= Messages ============= */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
        style={{
          paddingTop: 12,
          paddingBottom: 8,
        }}
      >
        {loadingHistory && (
          <div className="text-center py-12 text-white/40 text-sm">
            ···
          </div>
        )}

        {loadingMore && (
          <div className="text-center py-3 text-white/40 text-xs">
            이전 대화 불러오는 중···
          </div>
        )}

        {showWelcome && <WelcomeCard userName={usage?.userName || null} onSampleClick={handleSampleClick} />}

        {messages.map((msg, idx) => {
          const prev = idx > 0 ? messages[idx - 1] : null;
          const showDateDivider = shouldShowDateDivider(
            prev ? { createdAt: prev.createdAt } : null,
            msg
          );
          return (
            <div key={msg.id} data-msg-id={msg.id}>
              {showDateDivider && <DateDivider text={formatDateDivider(msg.createdAt)} />}
              <UserBubble text={msg.question} time={formatRelativeTime(msg.createdAt)} />
              <SoramBubble text={msg.answer} time={formatRelativeTime(msg.createdAt)} />
            </div>
          );
        })}

        {pending && (
          <div>
            <UserBubble text={pending.question} time={formatRelativeTime(pending.createdAt)} />
            <LoadingBubble />
          </div>
        )}

        {showUpgrade && <UpgradeCard userName={usage?.userName || null} />}

        <div style={{ height: 8 }} />
      </div>

      {/* ============= Error toast ============= */}
      {errorMsg && (
        <div
          className="px-3 py-2 mx-3 mb-2 rounded-lg text-xs"
          style={{
            background: "rgba(220, 38, 38, 0.15)",
            border: "1px solid rgba(220, 38, 38, 0.4)",
            color: "rgba(255, 200, 200, 0.95)",
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* ============= Input ============= */}
      <div
        className="flex-shrink-0 p-3 border-t"
        style={{
          background: "rgba(13, 17, 38, 0.95)",
          borderColor: "rgba(255, 215, 0, 0.1)",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
        }}
      >
        <div
          className="flex items-end gap-2 rounded-2xl px-3 py-2"
          style={{
            background: "rgba(30, 42, 74, 0.6)",
            border: "1px solid rgba(255, 215, 0, 0.15)",
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value.substring(0, 200))}
            onKeyDown={handleKeyDown}
            placeholder={
              inputDisabled
                ? "오늘은 여기까지··· 내일 다시 만나요"
                : "소람에게 무엇이든 물어보세요"
            }
            disabled={inputDisabled}
            rows={1}
            className="flex-1 bg-transparent outline-none resize-none text-sm placeholder:text-white/30"
            style={{
              color: "#fff",
              minHeight: 22,
              maxHeight: 100,
            }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 100) + "px";
            }}
          />
          <button
            onClick={sendQuestion}
            disabled={inputDisabled || !input.trim()}
            className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{
              background: inputDisabled || !input.trim()
                ? "rgba(255, 215, 0, 0.2)"
                : "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
              color: "#1a1a1a",
              opacity: inputDisabled || !input.trim() ? 0.5 : 1,
            }}
            aria-label="보내기"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 12L22 2L18 22L11 14L2 12Z" />
            </svg>
          </button>
        </div>
        <div className="text-[10px] text-white/30 text-center mt-2">
          소람의 답변은 사주학적 관점의 참고용입니다 · {input.length}/200
        </div>
      </div>
    </div>
  );
}
