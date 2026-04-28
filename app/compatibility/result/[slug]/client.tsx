"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Heart, Briefcase, Users, Shield, Sparkles, Share2, Check, RotateCcw, Calendar } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { t, type Locale } from "@/lib/translations";
import { ELEMENT_COLORS } from "@/lib/constants";
import { CompatibilityPaywall } from "@/components/compatibility/compat-paywall";
import { CompatibilityUnlockLoader } from "@/components/compatibility/compat-unlock-loader";

interface CompatResult {
  person_a_name: string;
  person_a_element: string;
  person_a_day_master: string;
  person_b_name: string;
  person_b_element: string;
  person_b_day_master: string;
  overall_score: number;
  love_score: number;
  work_score: number;
  friendship_score: number;
  conflict_score: number;
  free_summary: string;
  paid_love: string | null;
  paid_work: string | null;
  paid_friendship: string | null;
  paid_conflict: string | null;
  paid_yearly: string | null;
  share_slug: string;
  created_at: string;
}

const ELEMENT_ICON: Record<string, string> = {
  wood: "🌿", fire: "🔥", earth: "🏔", metal: "⚔", water: "🌊",
};

const ELEMENT_GLOW: Record<string, string> = {
  wood: "rgba(89,222,155,0.3)",
  fire: "rgba(239,68,68,0.3)",
  earth: "rgba(242,202,80,0.3)",
  metal: "rgba(148,163,184,0.3)",
  water: "rgba(59,130,246,0.3)",
};

function getScoreColor(score: number): string {
  if (score >= 80) return "#59DE9B";
  if (score >= 60) return "#F2CA50";
  if (score >= 40) return "#F59E0B";
  return "#EF4444";
}

function getScoreLabel(score: number, locale: Locale): string {
  if (score >= 85) return t("cr.labelSoulmates", locale);
  if (score >= 70) return t("cr.labelHarmony", locale);
  if (score >= 55) return t("cr.labelTension", locale);
  if (score >= 40) return t("cr.labelChallenge", locale);
  return t("cr.labelOpposite", locale);
}

function renderCompatMarkdown(text: string): string {
  if (!text) return "";
  return text
    .replace(/^### (.+)$/gm, '<h3 class="font-serif text-base font-semibold text-primary/80 mt-5 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-serif text-lg font-semibold text-primary border-b border-primary/20 pb-1 mt-6 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="font-serif text-xl font-bold text-primary mt-0 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, "<strong class=\"text-foreground font-semibold\">$1</strong>")
    .replace(/\*(.+?)\*/g, "<em class=\"text-foreground/80\">$1</em>")
    .replace(/^[-•] (.+)$/gm, '<li class="text-foreground/85 leading-relaxed mb-1 ml-4">$1</li>')
    .replace(/(<li[^>]*>[\s\S]*?<\/li>\n?)+/g, (m) => `<ul class="my-3 list-disc space-y-1">${m}</ul>`)
    .replace(/^---$/gm, '<hr class="border-border/30 my-5" />')
    .split(/\n\n+/)
    .map(block => {
      const t = block.trim();
      if (!t) return "";
      if (t.startsWith("<")) return t;
      return `<p class="text-foreground/85 leading-[1.85] mb-4">${t.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");
}

export default function CompatibilityResultClient() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const { user, openSignInModal } = useAuth();
  // v6.15.5 admin bypass — rimfacai@gmail.com skips the $2.99 paywall.
  // Same lowercased-email pattern used in reading/[slug]/client.tsx and
  // consultation-client.tsx. Defined as a const (not state) so it stays
  // truthy on every render once the auth context resolves.
  const isAdmin = (user?.email || "").trim().toLowerCase() === "rimfacai@gmail.com";
  const { locale } = useLanguage();

  const [result, setResult] = useState<CompatResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);

  // ════════════════════════════════════════════════════════════
  // v6.17.33 — "Scroll down to read" banner after unlock
  // ════════════════════════════════════════════════════════════
  // After a $2.99 unlock the page lands at the top, but the paid
  // content sits below the score circle, free summary, and the
  // (now-replaced) paywall block — easily 2-3 viewport heights
  // down. Without a hint, users miss it and think the unlock
  // didn't work.
  //
  // We show a one-time amber banner near the top of the result
  // page when ?payment=success was on the URL. It auto-dismisses
  // after the user scrolls (any scroll past 200px hides it) or
  // after 12 seconds, whichever comes first.
  // ════════════════════════════════════════════════════════════
  const [showUnlockBanner, setShowUnlockBanner] = useState<boolean>(false);

  // ═══ v6.15 paywall state ═══
  // isPaid: whether the user has paid $2.99 to unlock detailed sections.
  // Fetched separately from the main result so we don't have to modify
  // the existing /api/compatibility/get endpoint (append-only principle).
  // v6.15.5: initialize with isAdmin so the paywall never flashes for the
  // admin account before refreshPaidStatus() returns. Auth context may
  // resolve after first render; the second useEffect below also forces
  // setIsPaid(true) once user.email becomes available.
  const [isPaid, setIsPaid] = useState<boolean>(isAdmin);
  // unlockerVisible: shows the verify loader after PayPal returns success.
  const [unlockerVisible, setUnlockerVisible] = useState<boolean>(false);
  // sessionToken: PayPal order id from ?token= param, passed to verify.
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Detect ?payment=success or ?payment=cancelled from PayPal redirect
  useEffect(() => {
    if (!searchParams) return;
    const paymentStatus = searchParams.get("payment");
    const token = searchParams.get("token");
    if (paymentStatus === "success") {
      setSessionToken(token);
      setUnlockerVisible(true);
      // v6.17.33: arm the "scroll down" hint for after the unlocker
      // finishes. The unlocker overlay covers the page during verify,
      // so the banner only becomes visible once unlockerVisible flips
      // back to false in the loader's onDone callback.
      setShowUnlockBanner(true);
    }
    // ?payment=cancelled — silently let the user continue with free tier;
    // no toast because they explicitly clicked "cancel" on PayPal.
  }, [searchParams]);

  // Fetch is_paid status (separate small endpoint for fast polling)
  async function refreshPaidStatus() {
    if (!slug) return;
    // v6.15.5 admin bypass — skip the network call entirely. The server
    // route ALSO bypasses (defense in depth) but doing it here avoids a
    // round-trip and any network-failure flash of the paywall.
    if (isAdmin) {
      setIsPaid(true);
      return;
    }
    try {
      const res = await fetch("/api/compatibility/check-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // v6.15.5: forward user email so the server-side admin bypass
        // can short-circuit. Non-admin users get the same treatment as
        // before (server ignores the field for non-admin emails).
        body: JSON.stringify({ shareSlug: slug, userEmail: user?.email || null }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsPaid(!!data.is_paid);
      }
    } catch {}
  }

  useEffect(() => {
    if (slug) refreshPaidStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // v6.15.5: re-run when the auth context resolves the user email. On the
  // first render user may be null (still loading); once it becomes the
  // admin we want isPaid to flip to true immediately.
  useEffect(() => {
    if (isAdmin) setIsPaid(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  // ════════════════════════════════════════════════════════════════
  // v6.17.4 — refetch result after unlock + poll until paid_* arrive
  // ════════════════════════════════════════════════════════════════
  // v6.17.3 made paid_* generation lazy (background after free is sent).
  // If a user pays for unlock within seconds of viewing the free result,
  // paid_* may still be NULL when isPaid flips to true. Without this
  // refresh, the unlocked sections render blank.
  //
  // Strategy: extract fetchResult so we can call it after unlock too.
  // After unlock, if paid_love is still NULL, poll every 3s up to 8
  // attempts (~24s). Background generation typically completes in
  // 20-50s so most users either already have paid_* OR will see them
  // appear within one or two polls. After the cap, we stop polling
  // to avoid hammering the server — the next page reload will catch
  // up regardless.
  // ════════════════════════════════════════════════════════════════
  const fetchResult = async () => {
    try {
      const res = await fetch("/api/compatibility/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareSlug: slug }),
      });
      if (!res.ok) { setLoading(false); return null; }
      const json = await res.json();
      if (!json.result) { setLoading(false); return null; }
      setResult(json.result as CompatResult);
      setLoading(false);
      return json.result as CompatResult;
    } catch {
      setLoading(false);
      return null;
    }
  };

  useEffect(() => {
    if (slug) fetchResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Poll for paid_* once isPaid flips true but paid_love is still missing.
  // Unconditional cleanup ensures no leak on tab close mid-poll.
  useEffect(() => {
    if (!isPaid || !slug) return;
    if (result && result.paid_love) return; // Already populated — no need to poll
    let cancelled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 8;
    const INTERVAL_MS = 3000;
    const tick = async () => {
      if (cancelled) return;
      attempts += 1;
      const fresh = await fetchResult();
      if (cancelled) return;
      if (fresh && fresh.paid_love) return; // Done — useEffect will not retrigger because result has paid_love now
      if (attempts >= MAX_ATTEMPTS) return; // Give up; user can refresh
      setTimeout(tick, INTERVAL_MS);
    };
    const handle = setTimeout(tick, INTERVAL_MS);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaid, slug, result?.paid_love]);

  // ════════════════════════════════════════════════════════════
  // v6.17.33 — auto-dismiss the unlock banner
  // ════════════════════════════════════════════════════════════
  // Two ways the banner goes away:
  //   1. User scrolls past 200px — they've clearly seen the hint
  //      and started reading.
  //   2. 12 seconds elapse — even if they sit still, the banner
  //      shouldn't camp at the top forever.
  //
  // Both paths set showUnlockBanner=false. The component just
  // doesn't render the banner DOM after that, so no re-show on
  // subsequent state changes.
  // ════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!showUnlockBanner) return;
    if (typeof window === "undefined") return;

    const onScroll = () => {
      if (window.scrollY > 200) setShowUnlockBanner(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const t = setTimeout(() => setShowUnlockBanner(false), 12000);

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(t);
    };
  }, [showUnlockBanner]);

  // ════════════════════════════════════════════════════════════
  // v6.17.34 — Trigger unlock banner on isPaid: false → true
  // ════════════════════════════════════════════════════════════
  // The ?payment=success URL trigger only fires for PayPal (web).
  // IAP (Apple/Google) doesn't add that query param — the Flutter
  // shell calls verify-iap-v2 and then reloads the page. After
  // reload, isPaid flips false→true via refreshPaidStatus.
  //
  // We arm the banner whenever isPaid transitions to true AFTER
  // the page has been mounted long enough (1500ms) that the
  // initial "user revisits already-paid result" case can't be
  // mistaken for a fresh unlock. Without that guard, every
  // already-paying user revisiting their result would see the
  // banner on every visit.
  //
  // The previousIsPaid ref tracks the prior render's value so we
  // detect the rising edge (false → true) cleanly.
  // ════════════════════════════════════════════════════════════
  const previousIsPaidRef = useRef<boolean>(isPaid);
  const mountedAtRef = useRef<number>(Date.now());
  useEffect(() => {
    const wasPaid = previousIsPaidRef.current;
    previousIsPaidRef.current = isPaid;
    if (wasPaid || !isPaid) return;
    if (Date.now() - mountedAtRef.current < 1500) return;
    setShowUnlockBanner(true);
  }, [isPaid]);

  // ════════════════════════════════════════════════════════════
  // v6.17.39 — IAP unlock banner via sessionStorage handoff
  // ════════════════════════════════════════════════════════════
  // Companion to v6.17.34. The rising-edge detector above misses the
  // iOS IAP unlock case: after a successful Apple/Google purchase,
  // the paywall component reloads the page; on the new mount the
  // very first refreshPaidStatus() lands inside the 1500ms guard
  // window with isPaid already true, so the false→true transition
  // never registers as a real edge.
  //
  // The paywall now stores `compat-just-paid:{slug}` in sessionStorage
  // immediately before triggering reload. We pick that up here on
  // mount, fire the banner once, and clear the flag so a manual
  // refresh later doesn't re-show it. PayPal continues to use its
  // own ?payment=success path (above) — this is purely the IAP
  // companion route and never overlaps.
  // ════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!slug) return;
    if (typeof window === "undefined") return;
    try {
      const key = `compat-just-paid:${slug}`;
      if (sessionStorage.getItem(key) === "1") {
        sessionStorage.removeItem(key);
        setShowUnlockBanner(true);
      }
    } catch {
      // sessionStorage can throw in private mode / certain WebViews —
      // a missed banner is the worst case, never a crash.
    }
  }, [slug]);

  const handleShare = () => {
    const url = window.location.href;
    const text = result
      ? `${result.person_a_name} & ${result.person_b_name}: ${result.overall_score}% Compatibility — ${getScoreLabel(result.overall_score, locale)} ✦\n\nCheck yours free: ${url}`
      : url;
    if (navigator.share) {
      navigator.share({ text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!result) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-page-lg text-center">
          <h1 className="text-2xl font-serif text-primary mb-4">{t("cr.notFound", locale)}</h1>
          <p className="text-muted-foreground mb-8">{t("cr.removed", locale)}</p>
          <Link href="/compatibility"><Button className="gold-gradient text-primary-foreground">{t("compat.check", locale)}</Button></Link>
        </div>
        <Footer />
      </main>
    );
  }

  const colorA = ELEMENT_COLORS[result.person_a_element] || "#F2CA50";
  const colorB = ELEMENT_COLORS[result.person_b_element] || "#3B82F6";
  const glowA = ELEMENT_GLOW[result.person_a_element] || "rgba(242,202,80,0.3)";
  const glowB = ELEMENT_GLOW[result.person_b_element] || "rgba(59,130,246,0.3)";
  const iconA = ELEMENT_ICON[result.person_a_element] || "✦";
  const iconB = ELEMENT_ICON[result.person_b_element] || "✦";
  const overallColor = getScoreColor(result.overall_score);

  const categories = [
    { key: "love", label: t("cr.love", locale), compatLabel: t("cr.loveCompat", locale), icon: Heart, score: result.love_score, gradient: "from-pink-500/20 to-rose-500/5", border: "border-pink-500/20", iconColor: "#EC4899", content: result.paid_love },
    { key: "work", label: t("cr.work", locale), compatLabel: t("cr.workCompat", locale), icon: Briefcase, score: result.work_score, gradient: "from-blue-500/20 to-cyan-500/5", border: "border-blue-500/20", iconColor: "#3B82F6", content: result.paid_work },
    { key: "friendship", label: t("cr.friendship", locale), compatLabel: t("cr.friendCompat", locale), icon: Users, score: result.friendship_score, gradient: "from-emerald-500/20 to-green-500/5", border: "border-emerald-500/20", iconColor: "#10B981", content: result.paid_friendship },
    { key: "conflict", label: t("cr.conflict", locale), compatLabel: t("cr.conflictCompat", locale), icon: Shield, score: result.conflict_score, gradient: "from-amber-500/20 to-yellow-500/5", border: "border-amber-500/20", iconColor: "#F59E0B", content: result.paid_conflict },
  ];

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* ═══ v6.15 Unlock loader overlay — shown after PayPal redirect ═══ */}
      {unlockerVisible && (
        <CompatibilityUnlockLoader
          shareSlug={slug}
          sessionId={sessionToken || undefined}
          onDone={async () => {
            // v6.17.4: refresh BOTH paid status AND result so paid_*
            // sections render with content. The polling effect above
            // takes over if paid_* are still NULL at this moment.
            await refreshPaidStatus();
            await fetchResult();
            setUnlockerVisible(false);
            // Clean up the query string so a manual reload doesn't re-trigger
            try {
              const url = new URL(window.location.href);
              url.searchParams.delete("payment");
              url.searchParams.delete("token");
              url.searchParams.delete("PayerID");
              window.history.replaceState(null, "", url.pathname + (url.search ? url.search : ""));
            } catch {}
            // ════════════════════════════════════════════════════════
            // v6.17.53 — scroll to the freshly unlocked content.
            //
            // chandler: "출력되면 탑으로 가지 말고 로딩후에 출력물
            // 제대로 나오게 하고"
            //
            // After PayPal/IAP comes back and the loader closes, the
            // four paid category sections appear in-place above the
            // current scroll position. Without this scroll the user
            // sees the same overall-score panel they were looking at
            // before paying — the new content sits below the fold.
            // We scroll into the #paid-content div with a small
            // offset (scroll-mt-20 on the wrapper) so the section
            // header lands just under the navbar.
            //
            // Wrapped in setTimeout so the DOM has a tick to render
            // the newly-unlocked nodes before we measure their
            // position. Wrapped in try/catch because scrollIntoView
            // is widely supported but we never want a UX nicety to
            // break the unlock flow itself.
            // ════════════════════════════════════════════════════════
            setTimeout(() => {
              try {
                const el = document.getElementById("paid-content");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              } catch {}
            }, 350);
          }}
          onTimeout={async () => {
            // Webhook may still arrive — try one more refresh, then give up
            await refreshPaidStatus();
            await fetchResult();
            setUnlockerVisible(false);
          }}
        />
      )}

      <Navbar />

      {/* Cosmic background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[160px] opacity-30"
          style={{ backgroundColor: colorA }}
        />
        <motion.div
          animate={{ x: [0, -25, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-[140px] opacity-25"
          style={{ backgroundColor: colorB }}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <div className="pt-page pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">

          {/* Back */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
            <button onClick={() => router.push("/compatibility")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> {t("cr.newCheck", locale)}
            </button>
          </motion.div>

          {/* ═══ v6.17.33 Unlock banner ═══════════════════════════════
              Shown when the user has just unlocked the full reading
              ($2.99 IAP / PayPal). Tells them the content is ready
              and to scroll down. Auto-dismisses on scroll>200px or
              after 12s. Only renders for users who unlocked in this
              session (showUnlockBanner is set from ?payment=success
              in searchParams; not set on plain revisits to the page).

              Style: amber gradient pill matching the rest of the
              v1.3 sprint visual language (Soram CTA, dashboard
              "enter your saju" prompt etc.). Down-arrow icon to
              direct attention. Manual close button (×) for users
              who want it gone immediately.
              ════════════════════════════════════════════════════════ */}
          {showUnlockBanner && !unlockerVisible && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="mb-6 relative overflow-hidden rounded-xl border border-amber-400/40 bg-gradient-to-br from-amber-500/12 via-amber-400/6 to-transparent backdrop-blur-sm px-4 py-3.5"
              role="status"
              aria-live="polite"
            >
              <span aria-hidden="true" className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full bg-gradient-to-b from-amber-300 to-amber-500" />
              <button
                type="button"
                onClick={() => setShowUnlockBanner(false)}
                aria-label="Dismiss"
                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-amber-200/60 hover:text-amber-200 hover:bg-amber-500/10 transition-colors"
              >
                <span aria-hidden="true" className="text-base leading-none">×</span>
              </button>
              <div className="flex items-start gap-3 pr-6">
                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="shrink-0 mt-0.5"
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-100 leading-snug">
                    {t("cr.unlockedTitle", locale)}
                  </p>
                  <p className="text-[11px] text-amber-200/75 leading-relaxed mt-0.5">
                    {t("cr.unlockedSub", locale)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ Hero Card — The main event ═══ */}
          <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-10">
            <div className="relative rounded-3xl overflow-hidden"
              style={{ background: "linear-gradient(170deg, rgba(30,20,50,0.9) 0%, rgba(15,15,30,0.95) 50%, rgba(20,15,40,0.9) 100%)", border: "1px solid rgba(255,255,255,0.08)" }}>

              {/* Decorative top line */}
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${colorA}80, ${colorB}80, transparent)` }} />

              <div className="px-6 sm:px-10 py-8 sm:py-12">

                {/* Two people */}
                <div className="flex items-center justify-center gap-6 sm:gap-12 mb-8">
                  {/* Person A */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-center"
                  >
                    <div className="relative mb-3">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto relative"
                        style={{ background: `radial-gradient(circle, ${colorA}25 0%, transparent 70%)`, border: `2px solid ${colorA}50` }}>
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          animate={{ boxShadow: [`0 0 20px ${glowA}`, `0 0 40px ${glowA}`, `0 0 20px ${glowA}`] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                        <span className="text-3xl sm:text-4xl relative z-10">{iconA}</span>
                      </div>
                    </div>
                    <p className="font-serif text-base sm:text-lg font-semibold text-foreground">{result.person_a_name}</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">{result.person_a_day_master}</p>
                  </motion.div>

                  {/* Connection */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.5, type: "spring" }}
                    className="flex flex-col items-center gap-2"
                  >
                    {/* Connecting line */}
                    <div className="w-12 sm:w-20 h-px" style={{ background: `linear-gradient(90deg, ${colorA}60, rgba(236,72,153,0.6), ${colorB}60)` }} />
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Heart className="w-5 h-5 text-pink-400" fill="currentColor" />
                    </motion.div>
                    <div className="w-12 sm:w-20 h-px" style={{ background: `linear-gradient(90deg, ${colorA}60, rgba(236,72,153,0.6), ${colorB}60)` }} />
                  </motion.div>

                  {/* Person B */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-center"
                  >
                    <div className="relative mb-3">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto relative"
                        style={{ background: `radial-gradient(circle, ${colorB}25 0%, transparent 70%)`, border: `2px solid ${colorB}50` }}>
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          animate={{ boxShadow: [`0 0 20px ${glowB}`, `0 0 40px ${glowB}`, `0 0 20px ${glowB}`] }}
                          transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                        />
                        <span className="text-3xl sm:text-4xl relative z-10">{iconB}</span>
                      </div>
                    </div>
                    <p className="font-serif text-base sm:text-lg font-semibold text-foreground">{result.person_b_name}</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">{result.person_b_day_master}</p>
                  </motion.div>
                </div>

                {/* Score — dramatic reveal */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.6, type: "spring" }}
                  className="text-center mb-6"
                >
                  <div className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto mb-4">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
                      <motion.circle cx="50" cy="50" r="42" fill="none" stroke={overallColor} strokeWidth="5" strokeLinecap="round"
                        strokeDasharray={`${(result.overall_score / 100) * 264} 264`}
                        initial={{ strokeDasharray: "0 264" }}
                        animate={{ strokeDasharray: `${(result.overall_score / 100) * 264} 264` }}
                        transition={{ duration: 2, delay: 1, ease: "easeOut" }}
                      />
                      {/* Glow filter */}
                      <defs>
                        <filter id="scoreGlow">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" />
                        </filter>
                      </defs>
                      <motion.circle cx="50" cy="50" r="42" fill="none" stroke={overallColor} strokeWidth="5" strokeLinecap="round"
                        strokeDasharray={`${(result.overall_score / 100) * 264} 264`}
                        initial={{ strokeDasharray: "0 264" }}
                        animate={{ strokeDasharray: `${(result.overall_score / 100) * 264} 264` }}
                        transition={{ duration: 2, delay: 1, ease: "easeOut" }}
                        opacity={0.4} filter="url(#scoreGlow)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span
                        className="text-4xl sm:text-5xl font-bold font-serif"
                        style={{ color: overallColor, textShadow: `0 0 30px ${overallColor}40` }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                      >
                        {result.overall_score}
                      </motion.span>
                      <span className="text-[10px] text-muted-foreground/50 tracking-wider">/ 100</span>
                    </div>
                  </div>

                  <motion.p
                    className="font-serif text-xl sm:text-2xl font-semibold"
                    style={{ color: overallColor, textShadow: `0 0 40px ${overallColor}20` }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8 }}
                  >
                    {getScoreLabel(result.overall_score, locale)}
                  </motion.p>
                </motion.div>

                {/* Share button */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="flex justify-center">
                  <Button variant="outline" size="sm" className="gap-2 text-xs rounded-full px-6 border-amber-500/30 hover:border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/15 text-amber-200" onClick={handleShare}>
                    {linkCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                    {linkCopied ? t("cr.copied", locale) : t("cr.shareResult", locale)}
                  </Button>
                </motion.div>
              </div>

              {/* Decorative bottom line */}
              <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)` }} />
            </div>
          </motion.section>

          {/* ═══ Category Scores — glass cards ═══ */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((cat, i) => {
                const Icon = cat.icon;
                const sc = getScoreColor(cat.score);
                return (
                  <motion.div
                    key={cat.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className={`relative overflow-hidden rounded-xl border ${cat.border} p-4 text-center`}
                    style={{ background: `linear-gradient(135deg, rgba(20,15,35,0.8), rgba(15,15,25,0.9))` }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} pointer-events-none`} />
                    <div className="relative">
                      <Icon className="w-5 h-5 mx-auto mb-2.5" style={{ color: cat.iconColor }} />
                      <p className="text-2xl font-bold font-serif mb-1" style={{ color: sc, textShadow: `0 0 20px ${sc}30` }}>{cat.score}</p>
                      <p className="text-[11px] text-muted-foreground/70 uppercase tracking-wider">{cat.label}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* ═══ Free Summary ═══ */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mb-10">
            <div className="rounded-2xl p-6 sm:p-8" style={{ background: "linear-gradient(135deg, rgba(242,202,80,0.06), rgba(20,15,35,0.5))", border: "1px solid rgba(242,202,80,0.15)" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <h2 className="font-serif text-lg font-semibold">{t("cr.yourConnection", locale)}</h2>
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="prose prose-invert prose-sm max-w-none prose-headings:font-serif prose-headings:text-primary prose-p:leading-[1.85] prose-strong:text-foreground" dangerouslySetInnerHTML={{ __html: renderCompatMarkdown(result.free_summary) }} />
              </div>
            </div>
          </motion.section>

          {/* ═══ Detailed Category Sections — PAYWALL GATED (v6.15) ═══ */}
          {/* When isPaid=true: show all 4 categories normally. */}
          {/* When isPaid=false: show CompatibilityPaywall component instead. */}
          {/* v6.17.53: id="paid-content" so the unlock onDone callback
              can scrollIntoView here instead of leaving the user at
              the top of the page. chandler's report: "출력되면 탑으로
              가지 말고 로딩후에 출력물 제대로 나오게 하고" */}
          <div id="paid-content" className="scroll-mt-20">
          {isPaid ? (
            <>
              {categories.map((cat, i) => cat.content && (
                <motion.section key={cat.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + i * 0.05 }} className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cat.iconColor}20` }}>
                      <cat.icon className="w-4 h-4" style={{ color: cat.iconColor }} />
                    </div>
                    <h2 className="font-serif text-lg font-semibold">{cat.compatLabel}</h2>
                  </div>
                  <div className="rounded-2xl p-6 sm:p-8" style={{ background: "rgba(15,15,25,0.6)", border: `1px solid ${cat.iconColor}15` }}>
                    <div className="prose prose-invert prose-sm max-w-none">
                      {cat.content.split("\n\n").map((para, j) => (
                        <p key={j} className="text-foreground/85 leading-relaxed mb-4 last:mb-0">{para}</p>
                      ))}
                    </div>
                  </div>
                </motion.section>
              ))}
            </>
          ) : (
            <CompatibilityPaywall
              shareSlug={result.share_slug}
              partnerName={`${result.person_a_name} & ${result.person_b_name}`}
            />
          )}
          </div>

          {/* ═══ Yearly Forecast — also paywall-gated (v6.15) ═══ */}
          {isPaid && result.paid_yearly && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }} className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary/15">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <h2 className="font-serif text-lg font-semibold">{new Date().getFullYear()} {t("cr.together", locale)}</h2>
              </div>
              <div className="rounded-2xl p-6 sm:p-8" style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.06), rgba(15,15,25,0.5))", border: "1px solid rgba(167,139,250,0.15)" }}>
                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="prose prose-invert prose-sm max-w-none prose-headings:font-serif prose-headings:text-primary prose-p:leading-[1.85] prose-strong:text-foreground" dangerouslySetInnerHTML={{ __html: renderCompatMarkdown(result.paid_yearly) }} />
                </div>
              </div>
            </motion.section>
          )}

          {/* ═══ Upsell CTA ═══ */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="mb-10">
            <div className="relative rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(242,202,80,0.08), rgba(167,139,250,0.06), rgba(15,15,25,0.8))", border: "1px solid rgba(242,202,80,0.2)" }}>
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(242,202,80,0.4), rgba(167,139,250,0.4), transparent)" }} />
              <div className="p-6 sm:p-8 text-center">
                <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-serif text-xl font-semibold mb-2">{t("cr.discoverDestiny", locale)}</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5">
                  {t("cr.shapedByCore", locale)}
                </p>
                <Link href="/calculate">
                  <Button className="gold-gradient text-primary-foreground font-semibold px-8 rounded-full">
                    <Sparkles className="w-4 h-4 mr-2" />
                    {t("cr.getFullReading", locale)}
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground/40 mt-2">{t("cr.startFree", locale)}</p>
              </div>
            </div>
          </motion.section>

          {/* ═══ Bottom Share Button ═══ */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="flex justify-center mb-6">
            <Button variant="outline" size="sm" className="gap-2 text-xs rounded-full px-6 border-white/10 hover:border-white/20 bg-white/5" onClick={handleShare}>
              {linkCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              {linkCopied ? t("cr.copied", locale) : t("cr.shareResult", locale)}
            </Button>
          </motion.div>

          {/* ═══ Bottom CTAs ═══ */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95 }} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/compatibility">
                <Button variant="outline" className="w-full gap-2 rounded-xl border-white/10 hover:border-white/20">
                  <RotateCcw className="w-4 h-4" /> {t("cr.checkAnother", locale)}
                </Button>
              </Link>
              <Link href="/calculate">
                <Button className="w-full gap-2 gold-gradient text-primary-foreground rounded-xl">
                  <Sparkles className="w-4 h-4" /> {t("cr.getMyFreeReading", locale)}
                </Button>
              </Link>
            </div>

            {!user && (
              <div className="rounded-xl p-4 text-center" style={{ background: "rgba(15,15,25,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-sm text-muted-foreground mb-2">{t("cr.signInToSave", locale)}</p>
                <Button variant="outline" size="sm" className="text-xs gap-2 rounded-full border-white/10" onClick={openSignInModal}>
                  {t("cr.signInGoogle", locale)}
                </Button>
              </div>
            )}
          </motion.section>

          <div className="text-center text-[11px] text-muted-foreground/30 mt-8 space-y-1">
            <p>{t("cr.entertainment", locale)}</p>
            <p>
              {t("compat.generatedAt", locale)}: {new Date(result.created_at).toISOString().replace("T", " ").slice(0, 16)} UTC
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
