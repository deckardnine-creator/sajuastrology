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
        // v1.3 Sprint 2-B v5/v6.9: post-signin reload (with /auth/ guard
        // AND infinite-reload guard)
        // ════════════════════════════════════════════════════════════
        // CRITICAL GUARD #1: never reload while on /auth/* pages.
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
        // CRITICAL GUARD #2 (v6.9): the infinite-reload bug chandler
        // reported. SIGNED_IN can fire EVERY page load when a session
        // already exists (Supabase replays it on init). Without a
        // guard, every reload re-triggers reload — infinite loop.
        // We use sessionStorage to mark "we already reloaded for
        // this signin"; the flag clears on browser tab close, so the
        // next genuine signin (later session) reloads cleanly.
        //
        // Two reasons we ALWAYS reload (when not yet reloaded):
        //
        //   1. Intent path: when the user clicked a gated entry
        //      (e.g. the home "Talk to Soram" card while logged out),
        //      we stored their destination in `post-signin-intent`
        //      so the reload lands exactly where they were trying
        //      to go.
        //
        //   2. NO intent: we reload the current page once. Reason —
        //      on mobile Safari/Chrome, supabase's OAuth callback
        //      occasionally writes the session cookie under a
        //      slightly different origin/path. A single full reload
        //      forces the cookie to be re-read consistently.
        //
        // Safety:
        //   - intent must start with "/" (same-origin) — open-redirect guard.
        //   - intent must NOT start with "/auth/" — never auto-route
        //     into auth machinery.
        //   - if no intent, we use the CURRENT pathname + query,
        //     preserving ?app=true on Flutter shells.
        //   - reload runs at most once per browser tab session.
        // ════════════════════════════════════════════════════════════
        try {
          const currentPath = window.location.pathname;
          // Hard guard #1: do nothing on auth pages — let them finish.
          if (currentPath.startsWith("/auth/")) {
            // No reload. setUser() above is enough — auth callback
            // will route the user itself.
          } else {
            // Hard guard #2 (v6.9): one-reload-per-session lock.
            // sessionStorage scoped to current tab; clears on tab close.
            // Wrapped in try/catch in case sessionStorage is unavailable
            // (private mode etc.) — in that case we simply don't reload,
            // which is safer than risking the infinite loop.
            //
            // Hard guard #3 (v6.12): callback-completed lock.
            // /auth/callback already runs window.location.href = returnUrl
            // as the LAST step of OAuth completion. After that hard nav,
            // SIGNED_IN fires AGAIN on the destination page (Supabase
            // replays it after detectSessionInUrl), and our reload here
            // would cause a SECOND visible page swap. The callback page
            // sets `auth-callback-completed: "1"` immediately before its
            // redirect, and we honor that flag here to skip the reload.
            // We clear the flag right after reading it so subsequent
            // signins (after a signout) reload normally.
            let alreadyReloaded = false;
            let callbackCompleted = false;
            try {
              alreadyReloaded =
                window.sessionStorage.getItem("post-signin-reloaded") === "1";
              callbackCompleted =
                window.sessionStorage.getItem("auth-callback-completed") === "1";
              if (callbackCompleted) {
                window.sessionStorage.removeItem("auth-callback-completed");
                // Mark reload-done so any future SIGNED_IN replays
                // also skip — same lock semantics, just pre-populated.
                window.sessionStorage.setItem("post-signin-reloaded", "1");
              }
            } catch {}

            if (alreadyReloaded || callbackCompleted) {
              // Skip the reload entirely. setUser() above already
              // updated React state; that's enough now that the
              // session cookie has been read once.
            } else {
              try {
                window.sessionStorage.setItem("post-signin-reloaded", "1");
              } catch {}

              const intentRaw = safeGet("post-signin-intent");
              // ════════════════════════════════════════════════════════
              // v6.13: time-bounded post-signin-intent (5min TTL).
              //
              // The intent value can be either a plain path ("/soram")
              // for backward compatibility with older code paths that
              // call `safeSet("post-signin-intent", "/soram")`, OR a
              // JSON envelope with a `path` and `expires` field for
              // newer write paths that want freshness guarantees.
              //
              // Any plain-string intent older than the page-tab session
              // is, by definition, stale — the user who set it likely
              // navigated away or abandoned signin minutes ago. We
              // accept BOTH formats but tighten the JSON-format ones
              // by checking the expiry. Plain strings remain best-effort
              // since we can't know their age.
              //
              // Why this matters (chandler's report):
              //   "로그인했더니 홈으로 가는데 채팅창이 잠깐 나왔다가
              //    다시 다른 페이지로 가니 일반 홈이 나온다"
              //
              // Root cause: stale `post-signin-intent` from an older
              // session pointed to /soram. Modern sign-in entries
              // (hero-section.tsx) write the intent right before the
              // OAuth round-trip, so a 5-minute TTL covers the legitimate
              // case (OAuth round-trip averages 5–20s) while killing
              // hour-old or day-old strays.
              // ════════════════════════════════════════════════════════
              let intent: string | null = null;
              if (intentRaw && typeof intentRaw === "string") {
                if (intentRaw.startsWith("{")) {
                  try {
                    const parsed = JSON.parse(intentRaw);
                    if (
                      parsed &&
                      typeof parsed.path === "string" &&
                      typeof parsed.expires === "number" &&
                      parsed.expires > Date.now()
                    ) {
                      intent = parsed.path;
                    }
                  } catch {}
                } else {
                  intent = intentRaw; // plain-string legacy form
                }
              }
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
          }
        } catch {}
      } else if (event === "SIGNED_OUT") {
        // Don't set user to null if signing out — the redirect will handle it
        // This prevents the flash of logged-out UI before redirect
        if (!isSigningOut) {
          setUser(null);
          // v6.9: clear the reload-once lock so the NEXT signin
          // (after this signout) gets to reload again.
          try {
            window.sessionStorage.removeItem("post-signin-reloaded");
          } catch {}
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
    // ════════════════════════════════════════════════════════════
    // v6.13: ALWAYS overwrite auth-return-url, never keep stale values.
    //
    // Old behavior: `if (!safeGet) { safeSet(...) }` skipped the write
    // when auth-return-url already existed. That guard was meant to
    // prevent a child component (like reading/[slug]/client.tsx) from
    // overwriting a parent's intent, but it had a worse failure mode:
    //
    //   - User clicks "Sign in" on /reading/abc → auth-return-url = /reading/abc
    //   - User cancels the sign-in modal (or closes the OAuth tab)
    //   - auth-return-url stays in localStorage forever
    //   - User goes to home, clicks "Sign in" again → auth-return-url
    //     is still /reading/abc → callback sends them to a stale page
    //
    // Chandler reported: "로그인했더니 홈으로 가는데 채팅창이 잠깐 나왔다가
    // 다시 다른 페이지로 가니 일반 홈이 나온다" — symptom of stale
    // auth-return-url pointing back to /soram from a previous session.
    //
    // Now we always set the FRESH current URL. The "child overwriting
    // parent" concern is moot in practice because there's no nested
    // signIn() chain — every sign-in entry point computes its intent
    // freshly from the current page.
    // ════════════════════════════════════════════════════════════
    safeSet("auth-return-url", window.location.href);
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
    // v6.13: same overwrite-always fix as signIn() above.
    safeSet("auth-return-url", window.location.href);
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

    // ════════════════════════════════════════════════════════════
    // v6.12 fix: selective sessionStorage clear instead of clear-all.
    //
    // The previous `sessionStorage.clear()` was nuking the
    // `native-app` flag set by detectNative() in lib/native-app.ts.
    // Symptom: in the Flutter shell, signing out caused a brief
    // flicker of web navbar/footer because:
    //   1. signOut clears the flag
    //   2. window.location.href = '/?app=true' starts a navigation
    //   3. while React hydrates the new home page, useNativeApp()'s
    //      lazy initializer runs detectNative() → checks
    //      sessionStorage 'native-app' first → MISS (we just cleared
    //      it) → falls through to URL ?app=true check → eventually
    //      returns true, but a few frames later than ideal.
    //
    // Now we clear ONLY the keys we own and preserve the native
    // detection flag. Auth-related sessionStorage keys are listed
    // explicitly so the cleanup is auditable.
    //
    // Snapshot+restore is the simplest pattern: capture native flag
    // before the loop, restore after. This is safer than enumerating
    // delete-list keys, because if we add a new auth-only sessionStorage
    // key in the future, .clear() naturally cleans it without us
    // having to remember to add it to the delete list.
    // ════════════════════════════════════════════════════════════
    try {
      const wasNative = sessionStorage.getItem("native-app");
      sessionStorage.clear();
      if (wasNative === "1") {
        sessionStorage.setItem("native-app", "1");
      }
    } catch {}

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
