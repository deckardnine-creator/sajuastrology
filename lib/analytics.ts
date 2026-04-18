// lib/analytics.ts
//
// Unified analytics layer: every event fires to BOTH GA4 and Mixpanel from
// a single call site. Use track() everywhere — never call gtag/mixpanel
// directly from components.
//
// Setup:
// - GA4: tag G-CBGH7EYJWJ loaded in app/layout.tsx (afterInteractive)
// - Mixpanel: SDK loaded in app/layout.tsx via CDN (afterInteractive)
// - NEXT_PUBLIC_MIXPANEL_TOKEN must be set in Vercel env vars
//
// Why both: GA4 is free + good for traffic/SEO/Google ads. Mixpanel is
// 1-year free + best-in-class for funnels/cohorts/retention which is what
// VC due diligence will look at.

type EventProps = Record<string, unknown>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    mixpanel?: {
      init: (token: string, config?: unknown) => void;
      track: (eventName: string, props?: EventProps) => void;
      identify: (userId: string) => void;
      reset: () => void;
      register: (props: EventProps) => void;
      people: {
        set: (props: EventProps) => void;
        set_once: (props: EventProps) => void;
      };
      get_distinct_id: () => string;
      __loaded?: boolean;
    };
  }
}

// Production-only safety: dev/preview can opt-in via NEXT_PUBLIC_ANALYTICS_DEBUG=1
const isProduction = process.env.NODE_ENV === 'production';
const debugMode = process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === '1';
const enabled = isProduction || debugMode;

function safeGA(eventName: string, props?: EventProps) {
  if (typeof window === 'undefined' || !window.gtag) return;
  try {
    window.gtag('event', eventName, props || {});
  } catch (err) {
    if (debugMode) console.warn('[analytics] GA4 track failed:', err);
  }
}

function safeMixpanel(eventName: string, props?: EventProps) {
  if (typeof window === 'undefined' || !window.mixpanel || !window.mixpanel.__loaded) return;
  try {
    window.mixpanel.track(eventName, props);
  } catch (err) {
    if (debugMode) console.warn('[analytics] Mixpanel track failed:', err);
  }
}

/**
 * Track a single event to both GA4 and Mixpanel.
 *
 * Naming convention: snake_case verbs in past tense (e.g. signup_completed,
 * reading_generated_free, consultation_purchased). Stay consistent — Mixpanel
 * funnels group by exact event name.
 *
 * @param eventName - Event name in snake_case
 * @param props - Optional properties (will be sent to both platforms)
 */
export function track(eventName: string, props?: EventProps): void {
  if (!enabled) {
    if (debugMode) console.log('[analytics] track', eventName, props);
    return;
  }
  safeGA(eventName, props);
  safeMixpanel(eventName, props);
}

/**
 * Identify a user across both platforms. Call this once on sign-in / app load
 * if user is authenticated. Subsequent track() calls will attribute to this user.
 *
 * @param userId - Stable user ID (e.g. Supabase auth user.id)
 * @param traits - Optional profile traits to set
 */
export function identify(userId: string, traits?: EventProps): void {
  if (!enabled) {
    if (debugMode) console.log('[analytics] identify', userId, traits);
    return;
  }
  // GA4: set user_id on the config (only way to attribute server-side too)
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('config', 'G-CBGH7EYJWJ', { user_id: userId });
    } catch { /* ignore */ }
  }
  // Mixpanel: identify + set people properties
  if (typeof window !== 'undefined' && window.mixpanel && window.mixpanel.__loaded) {
    try {
      window.mixpanel.identify(userId);
      if (traits) window.mixpanel.people.set(traits);
    } catch { /* ignore */ }
  }
}

/**
 * Set persistent user properties (super properties in Mixpanel).
 * Sent with every subsequent event automatically.
 */
export function setUserProperties(props: EventProps): void {
  if (!enabled) return;
  if (typeof window !== 'undefined' && window.mixpanel && window.mixpanel.__loaded) {
    try {
      window.mixpanel.register(props);
      window.mixpanel.people.set(props);
    } catch { /* ignore */ }
  }
}

/**
 * Reset analytics on sign-out. Mixpanel needs this to clear distinct_id
 * so the next sign-in is treated as a new user identification event.
 */
export function resetAnalytics(): void {
  if (typeof window !== 'undefined' && window.mixpanel && window.mixpanel.__loaded) {
    try {
      window.mixpanel.reset();
    } catch { /* ignore */ }
  }
}

// ─── Predefined event names (use these constants, not raw strings) ─────────
// Funnel order: page_viewed → signup_completed → free_reading → paid_reading
export const Events = {
  // Acquisition
  PAGE_VIEWED: 'page_viewed', // GA4 auto-tracks this; only fire manually if needed
  LANGUAGE_CHANGED: 'language_changed',
  // Auth
  SIGNUP_COMPLETED: 'signup_completed',
  SIGNIN_COMPLETED: 'signin_completed',
  SIGNOUT_COMPLETED: 'signout_completed',
  // Free reading funnel (top of funnel)
  CALCULATOR_OPENED: 'calculator_opened',
  READING_FORM_SUBMITTED: 'reading_form_submitted',
  READING_GENERATED_FREE: 'reading_generated_free',
  // Compatibility (free)
  COMPATIBILITY_FORM_SUBMITTED: 'compatibility_form_submitted',
  COMPATIBILITY_GENERATED: 'compatibility_generated',
  // Paid reading conversion (key VC metric)
  UPGRADE_CTA_CLICKED: 'upgrade_cta_clicked',
  PAID_CHECKOUT_STARTED: 'paid_checkout_started',
  READING_GENERATED_PAID: 'reading_generated_paid',
  // Consultation
  CONSULTATION_OPENED: 'consultation_opened',
  CONSULTATION_FORM_SUBMITTED: 'consultation_form_submitted',
  CONSULTATION_PURCHASED: 'consultation_purchased',
  CONSULTATION_GENERATED: 'consultation_generated',
  // Engagement
  DAILY_FORTUNE_VIEWED: 'daily_fortune_viewed',
  READING_SHARED: 'reading_shared',
  DASHBOARD_VIEWED: 'dashboard_viewed',
} as const;
