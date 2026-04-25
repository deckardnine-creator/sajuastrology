"use client";

import {
  createContext, useContext, useState, useEffect, useCallback, type ReactNode,
} from "react";
import { supabase } from "./supabase-client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { SajuChart } from "./saju-calculator";
import { reconstructChartFromReading } from "./constants";
import { safeGet, safeSet, safeRemove } from "./safe-storage";
import { isNativeApp } from "./native-app";
import { track, identify, setUserProperties, resetAnalytics, Events } from "./analytics";

export interface User {
  id: string; name: string; email: string; image?: string;
  subscription: "free" | "premium" | "master";
}

export interface UserSajuData {
  chart: SajuChart | null; birthDate: Date | null; birthTime: string | null;
  birthCity: string | null; gender: "male" | "female" | null; readingGeneratedAt: Date | null;
}

interface AuthContextType {
  user: User | null; sajuData: UserSajuData; isLoading: boolean;
  isSignInModalOpen: boolean; openSignInModal: () => void; closeSignInModal: () => void;
  signIn: () => Promise<void>; signInWithApple: () => Promise<void>; signOut: () => Promise<void>; saveSajuChart: (chart: SajuChart) => void;
  isPremium: boolean;
  claimTrigger: number;
  isSigningOut: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSupabaseUser(su: SupabaseUser): User {
  const meta = su.user_metadata ?? {};
  return {
    id: su.id, name: meta.full_name || meta.name || "User",
    email: su.email || "", image: meta.avatar_url || meta.picture || undefined,
    subscription: "free",
  };
}

const EMPTY_SAJU: UserSajuData = {
  chart: null, birthDate: null, birthTime: null, birthCity: null, gender: null, readingGeneratedAt: null,
};

function loadSajuData(): UserSajuData {
  try {
    const raw = safeGet("saju-data");
    if (!raw) return EMPTY_SAJU;
    const parsed = JSON.parse(raw);
    return {
      ...parsed,
      birthDate: parsed.birthDate ? new Date(parsed.birthDate) : null,
      readingGeneratedAt: parsed.readingGeneratedAt ? new Date(parsed.readingGeneratedAt) : null,
      chart: parsed.chart ? { ...parsed.chart, birthDate: new Date(parsed.chart.birthDate) } : null,
    };
  } catch { return EMPTY_SAJU; }
}

async function claimReadings(userId: string) {
  try {
    const pendingSlug = safeGet("pending-claim-slug");
    if (pendingSlug) {
      safeRemove("pending-claim-slug");
      await fetch("/api/reading/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareSlug: pendingSlug, userId }),
      }).catch(() => {});
    }

    const raw = safeGet("saju-data");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const chart = parsed.chart;
    if (!chart?.name || !chart?.birthDate) return;
    const bd = new Date(chart.birthDate);
    const bds = `${bd.getFullYear()}-${String(bd.getMonth() + 1).padStart(2, "0")}-${String(bd.getDate()).padStart(2, "0")}`;
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from("readings")
      .select("share_slug")
      .eq("name", chart.name)
      .eq("birth_date", bds)
      .is("user_id", null)
      .gte("created_at", cutoff)
      .limit(5);
    if (data && data.length > 0) {
      for (const r of data) {
        await fetch("/api/reading/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shareSlug: r.share_slug, userId }),
        }).catch(() => {});
      }
    }
  } catch {}
}

// ─── [PHASE 1 STEP 5] claim pending guest compatibility slugs ──────────────
// Mirrors claimReadings' "single-shot, remove-before-fetch" pattern:
// accept loss on network failure in exchange for zero risk of infinite
// retry loops. The server endpoint itself is idempotent, so double-calls
// from a retry would be safe too, but this client-side clearing is the
// existing house style and preserves it.
async function claimPendingCompat(userId: string) {
  try {
    const raw = safeGet("pending-compat-slugs");
    if (!raw) return;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      safeRemove("pending-compat-slugs");
      return;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      safeRemove("pending-compat-slugs");
      return;
    }

    const cleanSlugs = parsed
      .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
      .map((s) => s.trim());

    if (cleanSlugs.length === 0) {
      safeRemove("pending-compat-slugs");
      return;
    }

    safeRemove("pending-compat-slugs");

    await fetch("/api/compatibility/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, slugs: cleanSlugs }),
    }).catch(() => {});
  } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sajuData, setSajuData] = useState<UserSajuData>(EMPTY_SAJU);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [claimTrigger, setClaimTrigger] = useState(0);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    // Hard guarantee: isLoading flips to false within 4 seconds, no matter what.
    //
    // Background: in iOS WKWebView, supabase.auth.getSession() has been observed
    // to hang indefinitely — neither resolving nor rejecting. The original code
    // only called setIsLoading(false) in the .then() callback, so a hang trapped
    // every authenticated page (consultation, dashboard, my, reading, …) on an
    // infinite spinner. This timer is the safety net.
    const failsafeTimer = setTimeout(() => {
      setIsLoading((prev) => (prev ? false : prev));
    }, 1500);

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
          safeSet("current-user-id", session.user.id);
        }
        setIsLoading(false);
        clearTimeout(failsafeTimer);
      })
      .catch((err) => {
        // Network failure, hung promise rejection, etc — never let UI stay stuck.
        console.warn("[auth] getSession failed:", err);
        setIsLoading(false);
        clearTimeout(failsafeTimer);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const newUser = mapSupabaseUser(session.user);
        // Clear previous user's data if different account
        const prevUserId = safeGet("current-user-id");
        const isFirstTimeSignIn = !prevUserId;
        if (prevUserId && prevUserId !== newUser.id) {
          safeRemove("saju-data");
          safeRemove("primary-reading-id");
          safeRemove("primary-changed-date");
          safeRemove("dashboard-stale");
          safeRemove(`dashboard-readings-${prevUserId}`);
          safeRemove(`dashboard-compat-${prevUserId}`);
          setSajuData(EMPTY_SAJU);
        }
        safeSet("current-user-id", newUser.id);
        setUser(newUser);
        setIsSignInModalOpen(false);
        setIsLoading(false);
        setIsSigningOut(false);

        // ── Mixpanel: link this session to the Supabase user ──────────
        // identify() merges anonymous pre-signin events into this user's
        // timeline so we can reconstruct the full journey. Set a few
        // durable properties so we can segment by provider / signup date.
        try {
          identify(newUser.id);
          const provider =
            session.user.app_metadata?.provider ||
            (session.user.identities?.[0]?.provider ?? "unknown");
          setUserProperties({
            $email: newUser.email,
            $name: newUser.name,
            provider,
            platform: isNativeApp() ? "native" : "web",
          });
          // Fire signup_first_time ONLY when this browser has never seen a
          // current-user-id before — proxy for "newly registered". Any
          // subsequent signin (same browser, same account) fires signin_completed.
          track(
            isFirstTimeSignIn ? Events.signup_first_time : Events.signin_completed,
            { provider, platform: isNativeApp() ? "native" : "web" }
          );
        } catch {}

        await claimReadings(session.user.id);
        await claimPendingCompat(session.user.id);
        setClaimTrigger(prev => prev + 1);

        // ════════════════════════════════════════════════════════════
        // v1.3 Sprint 2-B v5: post-signin reload (with /auth/ guard)
        // ════════════════════════════════════════════════════════════
        // CRITICAL GUARD: never reload while on /auth/* pages.
        // The Supabase OAuth callback page (/auth/callback) fires
        // SIGNED_IN as part of its own flow. If we reload it, we
        // either:
        //   (a) tear it down before it can perform its own redirect
        //       to the post-login destination, leaving the user
        //       stranded at the callback URL (or worse, bounced back
        //       to the sign-in modal because the session token in
        //       the URL was already consumed),
        //   (b) cause an infinite reload loop on /auth/callback.
        // So /auth/* pages run their own redirect logic; we only
        // intervene on actual app pages where the user is "back"
        // from sign-in and needs the cookie re-read consistently.
        //
        // Two reasons we ALWAYS reload on app pages (not just when
        // an intent exists):
        //
        //   1. Intent path: when the user clicked a gated entry
        //      (e.g. the home "Talk to Soram" card while logged out),
        //      we stored their destination in `post-signin-intent`
        //      so the reload lands exactly where they were trying
        //      to go.
        //
        //   2. NO intent (e.g. user clicked the navbar "Sign in"
        //      from the home page): we reload the current page
        //      anyway. Reason — on mobile Safari/Chrome, supabase's
        //      OAuth callback occasionally writes the session cookie
        //      under a slightly different origin/path than the page
        //      they sign in from, so React state from setUser()
        //      shows them as logged in, but the NEXT navigation
        //      (clicking the hamburger or a /dashboard link) re-runs
        //      getSession() in a fresh module scope and reads `null`.
        //      A full reload forces the cookie to be re-read once
        //      everywhere.
        //
        // Safety:
        //   - intent must start with "/" (same-origin) — open-redirect guard.
        //   - intent must NOT start with "/auth/" — never auto-route
        //     into auth machinery.
        //   - if no intent, we use the CURRENT pathname + query,
        //     preserving ?app=true on Flutter shells.
        // ════════════════════════════════════════════════════════════
        try {
          const currentPath = window.location.pathname;
          // Hard guard: do nothing on auth pages — let them finish.
          if (currentPath.startsWith("/auth/")) {
            // No reload. setUser() above is enough — auth callback
            // will route the user itself.
          } else {
            const intent = safeGet("post-signin-intent");
            const intentValid =
              intent &&
              typeof intent === "string" &&
              intent.startsWith("/") &&
              !intent.startsWith("/auth/");
            let dest: string;
            if (intentValid) {
              safeRemove("post-signin-intent");
              dest = isNativeApp() && !intent!.includes("?")
                ? `${intent}?app=true`
                : intent!;
            } else {
              // No (valid) intent — reload current page for state consistency.
              const path =
                window.location.pathname +
                window.location.search +
                window.location.hash;
              dest = path || "/";
            }
            // Defer one tick so any pending setState (claim toggles, etc.)
            // can flush before the page tears down.
            setTimeout(() => {
              window.location.href = dest;
            }, 50);
            return;
          }
        } catch {}
      } else if (event === "SIGNED_OUT") {
        // Don't set user to null if signing out — the redirect will handle it
        // This prevents the flash of logged-out UI before redirect
        if (!isSigningOut) {
          setUser(null);
        }
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        setUser(mapSupabaseUser(session.user));
      }
    });
    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setSajuData(loadSajuData()); }, []);

  useEffect(() => {
    if (!user) return;
    const local = loadSajuData();
    if (local.chart) return;
    (async () => {
      try {
        const { data } = await supabase.from("readings")
          .select("name,gender,birth_date,birth_city,day_master_element,day_master_yinyang,year_stem,year_branch,month_stem,month_branch,day_stem,day_branch,hour_stem,hour_branch,archetype,ten_god,harmony_score,dominant_element,weakest_element,elements_wood,elements_fire,elements_earth,elements_metal,elements_water,created_at")
          .eq("user_id", user.id).order("created_at", { ascending: false }).limit(1);
        if (data && data.length > 0) {
          const r = data[0];
          const newSajuData: UserSajuData = {
            chart: reconstructChartFromReading(r) as SajuChart,
            birthDate: new Date(r.birth_date), birthTime: "12:00", birthCity: r.birth_city,
            gender: r.gender as "male" | "female", readingGeneratedAt: new Date(r.created_at),
          };
          setSajuData(newSajuData);
          safeSet("saju-data", JSON.stringify(newSajuData));
        }
      } catch {}
    })();
  }, [user]);

  const openSignInModal = useCallback(() => setIsSignInModalOpen(true), []);
  const closeSignInModal = useCallback(() => setIsSignInModalOpen(false), []);

  const signIn = async () => {
    setIsLoading(true);
    if (!safeGet("auth-return-url")) {
      safeSet("auth-return-url", window.location.href);
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        // Force Google account picker on every sign-in attempt. Without this,
        // Google silently auto-selects the last-used account, which prevents
        // users with multiple Google accounts from switching between them.
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) { safeRemove("auth-return-url"); setIsLoading(false); }
  };

  const signInWithApple = async () => {
    setIsLoading(true);
    if (!safeGet("auth-return-url")) {
      safeSet("auth-return-url", window.location.href);
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { safeRemove("auth-return-url"); setIsLoading(false); }
  };

  const signOut = async () => {
    // Set signing out flag FIRST — prevents UI flash
    setIsSigningOut(true);

    // ── Mixpanel: log out cleanly so next anonymous session starts fresh ──
    // Fired BEFORE clearing user state so we still have the user id.
    try {
      track(Events.signout_completed, {
        platform: isNativeApp() ? "native" : "web",
      });
      resetAnalytics();
    } catch {}

    // Immediately clear user so UI reflects logged-out state without delay
    setUser(null);

    // Use 'local' scope: clears local session only, no remote RPC.
    // This avoids hangs in WebView environments where the network call
    // to revoke the refresh token may stall indefinitely.
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch {}

    // Defensive: also wipe any sb-* / supabase localStorage keys directly,
    // in case Supabase client failed or schema differs.
    try {
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith("sb-") || k.includes("supabase"))) {
          toRemove.push(k);
        }
      }
      toRemove.forEach((k) => localStorage.removeItem(k));
    } catch {}

    // Clear sessionStorage (native-app flag, etc.)
    try { sessionStorage.clear(); } catch {}

    // Clear app-specific localStorage
    safeRemove("saju-data");
    safeRemove("primary-reading-id");
    safeRemove("primary-changed-date");
    safeRemove("pending-claim-slug");
    safeRemove("pending-compat-slugs");
    safeRemove("current-user-id");
    safeRemove("return-to-consultation");
    safeRemove("auth-return-url");
    safeRemove("dashboard-stale");
    safeRemove("post-signin-intent");

    // Force full page reload to clear all React state.
    // Preserve ?app=true so Flutter shell stays in app mode and
    // does not re-render web navbar/footer.
    window.location.href = isNativeApp() ? "/?app=true" : "/";
  };

  const saveSajuChart = (chart: SajuChart) => {
    const newSajuData: UserSajuData = {
      chart, birthDate: chart.birthDate, birthTime: "12:00",
      birthCity: chart.birthCity, gender: chart.gender, readingGeneratedAt: new Date(),
    };
    setSajuData(newSajuData);
    safeSet("saju-data", JSON.stringify(newSajuData));
  };

  const isPremium = user?.subscription === "premium" || user?.subscription === "master";

  return (
    <AuthContext.Provider value={{ user, sajuData, isLoading, isSignInModalOpen, openSignInModal, closeSignInModal, signIn, signInWithApple, signOut, saveSajuChart, isPremium, claimTrigger, isSigningOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
