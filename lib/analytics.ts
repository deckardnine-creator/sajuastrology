// ═══════════════════════════════════════════════════════════════════
// Unified analytics wrapper — Mixpanel (primary) + GA4 (secondary).
//
// Design principles:
//   1. FIRE-AND-FORGET. Every function tolerates missing SDKs and never
//      throws. A broken analytics pipeline must not degrade the product.
//   2. IDEMPOTENT identify/reset. Safe to call multiple times.
//   3. NO PII IN EVENT NAMES. Event names are stable; properties carry
//      the variable context.
//   4. CENTRAL EVENT CATALOG. The Events object below is the single
//      source of truth — components import from here and never type raw
//      strings, so renaming stays cheap.
// ═══════════════════════════════════════════════════════════════════

declare global {
  interface Window {
    // Mixpanel SDK is loaded asynchronously via inline script in app/layout.tsx.
    // Before load, `mixpanel` is a queue stub; after load, it's the real SDK.
    mixpanel?: {
      track: (event: string, props?: Record<string, unknown>) => void;
      identify: (id: string) => void;
      reset: () => void;
      people?: { set: (props: Record<string, unknown>) => void; set_once?: (props: Record<string, unknown>) => void };
      register?: (props: Record<string, unknown>) => void;
      __loaded?: boolean;
    };
    // Google Analytics 4 (gtag.js) — also loaded in app/layout.tsx.
    gtag?: (...args: unknown[]) => void;
  }
}

// ─── Event catalog ───────────────────────────────────────────────────
// All event names used across the codebase. Grouped by domain for easier
// review. Adding an event here without a corresponding track() call is a
// no-op; removing a name used elsewhere is a compile-time error.
export const Events = {
  // ─ Auth ─
  signin_modal_opened: "signin_modal_opened",
  signin_clicked: "signin_clicked",
  signin_completed: "signin_completed",
  signup_first_time: "signup_first_time",
  signout_completed: "signout_completed",

  // ─ Localization ─
  locale_changed: "locale_changed",

  // ─ Pricing / upgrade surfaces ─
  pricing_cta_clicked: "pricing_cta_clicked",
  upgrade_cta_clicked: "upgrade_cta_clicked",

  // ─ Reading page payment flow ─
  reading_unlock_clicked: "reading_unlock_clicked",
  reading_payment_initiated: "reading_payment_initiated",
  reading_payment_return: "reading_payment_return",

  // ─ Native in-app purchase (web-side mirror of Flutter events) ─
  iap_purchase_requested_web: "iap_purchase_requested_web",
  iap_purchase_success_web: "iap_purchase_success_web",
  iap_purchase_error_web: "iap_purchase_error_web",

  // ─ Apple 4.10 compliance ─
  restore_purchases_clicked: "restore_purchases_clicked",
  restore_purchases_success: "restore_purchases_success",

  // ─ Engagement / funnel ─
  dashboard_viewed: "dashboard_viewed",
  consultation_question_submitted: "consultation_question_submitted",

  // ─ Reserved for future server-side events ─
  // (API routes fire these via Mixpanel HTTP ingestion, not via the
  //  browser SDK. Listed here so the codebase is one place.)
  reading_generated_free: "reading_generated_free",
  reading_generated_paid: "reading_generated_paid",
  consultation_answered: "consultation_answered",

  // ─ Acquisition funnel (added 2026-04-22) ─
  // Fires once per session on first page arrival. Entry point of the
  // global acquisition funnel. Deduplication via sessionStorage flag.
  landing_viewed: "landing_viewed",

  // ─ Basic behavior (added 2026-04-22) ─
  // Wired from the birth-data form and the reading result page.
  reading_calculation_started: "reading_calculation_started",
  reading_calculation_completed: "reading_calculation_completed",
  compatibility_viewed: "compatibility_viewed",

  // ─ Engagement depth (added 2026-04-22) ─
  // Fires at 70% scroll on any page. Dedup per page_path per session.
  page_deep_scrolled: "page_deep_scrolled",

  // ─ Blog → Product conversion (added 2026-04-22) ─
  // The blog is the primary SEO acquisition channel (Celebrity Series,
  // Korean-astrology guides). Separate milestones (50/80) on article
  // scroll so we can tell completion rate from engagement.
  blog_article_viewed: "blog_article_viewed",
  blog_cta_clicked: "blog_cta_clicked",
  blog_scroll_depth: "blog_scroll_depth",
} as const;

export type AnalyticsEvent = (typeof Events)[keyof typeof Events];

// ─── Core API ────────────────────────────────────────────────────────

/**
 * Fire a tracked event. Silent on any failure.
 *
 * @param event One of the Events catalog entries.
 * @param params Optional properties to attach. Keep keys snake_case for
 *   Mixpanel's dashboard auto-faceting.
 */
export function track(
  event: AnalyticsEvent | string,
  params?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;

  // Mixpanel — primary pipeline. The inline loader defines a queue stub
  // so calls before SDK load still enqueue correctly.
  try {
    window.mixpanel?.track(event, params);
  } catch {}

  // GA4 — secondary pipeline. gtag accepts "event" as the command verb
  // followed by the name and properties object.
  try {
    window.gtag?.("event", event, params ?? {});
  } catch {}
}

/**
 * Bind subsequent events to a specific user identity. Typically called
 * once after successful sign-in. Subsequent calls with the same id are
 * safe no-ops.
 */
export function identify(userId: string): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    window.mixpanel?.identify(userId);
  } catch {}
  // GA4 equivalent — user_id parameter on every subsequent event
  try {
    window.gtag?.("set", { user_id: userId });
  } catch {}
}

/**
 * Persist user-level properties (email, provider, locale, etc.) to the
 * identified profile. Called immediately after identify().
 */
export function setUserProperties(props: Record<string, unknown>): void {
  if (typeof window === "undefined" || !props) return;
  try {
    window.mixpanel?.people?.set(props);
  } catch {}
  try {
    // GA4 carries user_properties as a separate config call.
    window.gtag?.("set", "user_properties", props);
  } catch {}
}

/**
 * Persist user-level properties ONCE and never overwrite.
 * Use for immutable-at-signup attributes like $created, first_language,
 * first_platform, first_country. Calling set() on these would
 * silently clobber the historical truth — set_once is the right tool.
 *
 * GA4 has no native set_once equivalent; we mirror via regular set().
 */
export function setUserPropertiesOnce(props: Record<string, unknown>): void {
  if (typeof window === "undefined" || !props) return;
  try {
    window.mixpanel?.people?.set_once?.(props);
  } catch {}
  try {
    window.gtag?.("set", "user_properties", props);
  } catch {}
}

/**
 * Register super properties — auto-attached to every subsequent event.
 * Call once on app bootstrap and again whenever platform/language/login
 * state changes. Mixpanel merges, so partial updates are fine.
 *
 * This is what powers cross-cutting dashboard breakdowns like
 * "funnel conversion by language" without repeating the property in
 * every track() call.
 */
export function registerSuperProperties(
  props: Record<string, unknown>
): void {
  if (typeof window === "undefined" || !props) return;
  try {
    window.mixpanel?.register?.(props);
  } catch {}
  // GA4: super-property concept maps to default event parameters, which
  // can't be registered at runtime from gtag. Accept the asymmetry —
  // Mixpanel is the analytical source of truth; GA4 is the backup.
}

/**
 * Clear identity and any cached super-properties. Called on sign-out to
 * prevent the next anonymous session from being merged into the
 * previous user's timeline.
 */
export function resetAnalytics(): void {
  if (typeof window === "undefined") return;
  try {
    window.mixpanel?.reset();
  } catch {}
  // GA4 has no formal reset for anonymous flows; removing the user_id
  // binding is the closest equivalent.
  try {
    window.gtag?.("set", { user_id: null });
  } catch {}
}

// ─── Utility helpers ─────────────────────────────────────────────────
// Small pure functions that populate common event-property values.
// Kept here (not in a separate file) so the analytics surface remains
// a single import site for the rest of the codebase.

/**
 * Extract hostname from document.referrer.
 * Returns "direct" when there is no referrer (user typed the URL,
 * clicked a bookmark, opened from an app, etc.).
 */
export function getReferrerDomain(): string {
  if (typeof document === "undefined") return "direct";
  const ref = document.referrer;
  if (!ref) return "direct";
  try {
    return new URL(ref).hostname;
  } catch {
    return "direct";
  }
}

/**
 * Return whether this is the user's first-ever visit (based on
 * localStorage). On first call, seeds the marker so subsequent visits
 * return { is_first_visit: false }.
 *
 * The stored timestamp is also used by daysSinceFirstVisit() below to
 * compute time-to-convert at signup.
 */
export function getOrInitFirstVisit(): {
  first_visit_at: string;
  is_first_visit: boolean;
} {
  if (typeof window === "undefined") {
    return { first_visit_at: new Date().toISOString(), is_first_visit: true };
  }
  try {
    const existing = localStorage.getItem("mp_first_visit_at");
    if (existing) {
      return { first_visit_at: existing, is_first_visit: false };
    }
    const now = new Date().toISOString();
    localStorage.setItem("mp_first_visit_at", now);
    return { first_visit_at: now, is_first_visit: true };
  } catch {
    return { first_visit_at: new Date().toISOString(), is_first_visit: true };
  }
}

/** Whole-day diff between first visit and now. 0 for same-session conversions. */
export function daysSinceFirstVisit(): number {
  if (typeof window === "undefined") return 0;
  try {
    const first = localStorage.getItem("mp_first_visit_at");
    if (!first) return 0;
    const ms = Date.now() - new Date(first).getTime();
    return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
  } catch {
    return 0;
  }
}

/**
 * Extract ISO 3166 country code from navigator.language.
 * "ko-KR" -> "KR", "en-US" -> "US". Empty string when unavailable
 * (bare language tag like "en" with no region, or navigator missing).
 */
export function getUserLocaleRegion(): string {
  if (typeof navigator === "undefined") return "";
  const lang = navigator.language || "";
  const parts = lang.split("-");
  return parts[1]?.toUpperCase() || "";
}

/**
 * Fire landing_viewed at most once per tab session.
 * Safe to call from multiple places (e.g. RootLayout bootstrap AND
 * route-change handlers) — only the first call of a session actually
 * reaches Mixpanel.
 */
export function trackLandingViewedOnce(params: {
  is_first_visit: boolean;
  entry_page: string;
  referrer_domain?: string;
  utm_source?: string;
}): void {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem("mp_landing_fired") === "1") return;
    sessionStorage.setItem("mp_landing_fired", "1");
  } catch {
    // sessionStorage might be disabled (private mode on some browsers).
    // Fall through and fire anyway — duplicate signals are preferable
    // to zero signals.
  }
  track(Events.landing_viewed, params);
}
