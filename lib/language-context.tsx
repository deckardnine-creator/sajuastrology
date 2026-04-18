"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import {
  type Locale,
  type TranslationKey,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  isRTL,
  t as translate,
} from "./translations";
import { safeGet, safeSet } from "./safe-storage";
import { track, setUserProperties, Events } from "./analytics";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Type guard: checks whether an arbitrary string is a supported locale
function isSupportedLocale(value: string | null | undefined): value is Locale {
  if (!value) return false;
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

// Map a raw navigator.language value (e.g. "zh-TW", "pt-BR", "es-419")
// to one of our 11 supported locales. Returns null if nothing matches.
function mapBrowserLang(raw: string): Locale | null {
  const lang = raw.toLowerCase();

  // Traditional Chinese — Taiwan, Hong Kong, Macau
  if (lang.startsWith("zh-tw") || lang.startsWith("zh-hk") || lang.startsWith("zh-mo") || lang === "zh-hant") {
    return "zh-TW";
  }

  // Simplified Chinese falls back to Traditional for now (closest cultural match for saju)
  if (lang.startsWith("zh")) return "zh-TW";

  // Exact or prefix matches for other locales
  if (lang.startsWith("ko")) return "ko";
  if (lang.startsWith("ja")) return "ja";
  if (lang.startsWith("hi")) return "hi";
  if (lang.startsWith("es")) return "es";
  if (lang.startsWith("ar")) return "ar";
  if (lang.startsWith("fr")) return "fr";
  if (lang.startsWith("pt")) return "pt";
  if (lang.startsWith("ru")) return "ru";
  if (lang.startsWith("id") || lang.startsWith("ms")) return "id"; // Malay users get Indonesian

  return null;
}

function detectLocale(): Locale {
  // 0. URL lang parameter — Flutter WebView passes lang in URL on tab loads.
  //    When found, ALSO sync to localStorage so subsequent client-side
  //    navigations (form submit → /reading/{slug}) that strip the query
  //    string still read the correct value from localStorage.
  if (typeof window !== "undefined") {
    const urlLang = new URLSearchParams(window.location.search).get("lang");
    if (isSupportedLocale(urlLang)) {
      try { localStorage.setItem("locale", urlLang); } catch {}
      return urlLang;
    }
  }

  // 1. Saved preference (set either by previous URL detection above
  //    or by an explicit setLocale() call from a language switcher)
  const saved = safeGet("locale");
  if (isSupportedLocale(saved)) return saved;

  // 2. Browser language
  if (typeof navigator !== "undefined") {
    const mapped = mapBrowserLang(navigator.language);
    if (mapped) return mapped;
  }

  return DEFAULT_LOCALE;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const detected = detectLocale();
    setLocaleState(detected);
    // Sync html lang + dir attributes on initial load
    document.documentElement.lang = detected;
    document.documentElement.dir = isRTL(detected) ? "rtl" : "ltr";
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    // Capture the previous locale BEFORE state update so we can attribute
    // the change direction (e.g. en → ko) in analytics.
    const prevLocale = locale;
    setLocaleState(newLocale);
    safeSet("locale", newLocale);
    // Update html lang + dir attributes
    if (typeof document !== "undefined") {
      document.documentElement.lang = newLocale;
      document.documentElement.dir = isRTL(newLocale) ? "rtl" : "ltr";
    }
    // ── Mixpanel: locale change is a key segmentation dimension ──
    // Also persist as a user property so all future events are bucketed
    // by the user's current language without needing to attach it each time.
    try {
      if (prevLocale !== newLocale) {
        track(Events.locale_changed, { from: prevLocale, to: newLocale });
      }
      setUserProperties({ locale: newLocale });
    } catch {}
  }, [locale]);

  const tFn = useCallback(
    (key: TranslationKey) => translate(key, locale),
    [locale]
  );

  // Don't render until mounted to avoid hydration mismatch
  // (server renders "en", client might detect "ko")
  // Instead, always render with default, then update on client
  return (
    <LanguageContext.Provider value={{ locale: mounted ? locale : DEFAULT_LOCALE, setLocale, t: tFn }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

export type { Locale };
