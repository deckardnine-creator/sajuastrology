"use client";

// ═══════════════════════════════════════════════════════════════════
// MixpanelBootstrap
// ----------------------------------------------------------------
// Client-only side effect component. Rendered once inside the
// AuthProvider / LanguageProvider tree so it can read both contexts.
//
// Responsibilities:
//   1. Register Mixpanel super properties (platform, locale, login
//      state, app version) — so every subsequent event is segmentable
//      without callers having to attach these manually.
//   2. Fire `landing_viewed` exactly once per tab session, the first
//      time any page renders on the client.
//
// Returns null — no visible output.
// ═══════════════════════════════════════════════════════════════════

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Events,
  track,
  registerSuperProperties,
  getReferrerDomain,
  getOrInitFirstVisit,
  getUserLocaleRegion,
  trackLandingViewedOnce,
} from "@/lib/analytics";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { isNativeApp } from "@/lib/native-app";

// Bumped manually on each release. Keep in sync with package.json if
// that ever becomes the source of truth.
const APP_VERSION = "1.2.0";

export default function MixpanelBootstrap() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { locale } = useLanguage();

  const isLoggedIn = !!user;

  // ─── 1. Super properties ───────────────────────────────────────
  // Re-run when locale or login state changes so every subsequent
  // event carries the current segmentation dimensions.
  useEffect(() => {
    registerSuperProperties({
      platform: isNativeApp() ? "native" : "web",
      language: locale,
      app_version: APP_VERSION,
      is_logged_in: isLoggedIn,
      user_locale_region: getUserLocaleRegion(),
    });
  }, [locale, isLoggedIn]);

  // ─── 2. landing_viewed — once per tab session ──────────────────
  // Fired from a useEffect (not during render) and delayed one tick
  // so the inline Mixpanel loader has time to swap its queue-stub
  // for the real SDK. trackLandingViewedOnce() itself is idempotent
  // via sessionStorage, so a second mount (e.g. Fast Refresh in dev)
  // is a silent no-op.
  useEffect(() => {
    const t = setTimeout(() => {
      if (typeof window === "undefined") return;
      const { is_first_visit } = getOrInitFirstVisit();
      const url = new URL(window.location.href);
      trackLandingViewedOnce({
        is_first_visit,
        entry_page: pathname || "/",
        referrer_domain: getReferrerDomain(),
        utm_source: url.searchParams.get("utm_source") || undefined,
      });
    }, 600);
    return () => clearTimeout(t);
    // Intentionally empty deps — fire exactly once per tab session.
    // The sessionStorage guard inside trackLandingViewedOnce handles
    // the actual dedup; this effect just provides a stable mount hook.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
