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
      people?: { set: (props: Record<string, unknown>) => void };
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
