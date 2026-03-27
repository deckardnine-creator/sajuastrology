"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { type Locale, type TranslationKey, DEFAULT_LOCALE, t as translate } from "./translations";
import { safeGet, safeSet } from "./safe-storage";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function detectLocale(): Locale {
  // 1. Saved preference
  const saved = safeGet("locale") as Locale | null;
  if (saved && ["en", "ko", "ja"].includes(saved)) return saved;

  // 2. Browser language
  if (typeof navigator !== "undefined") {
    const lang = navigator.language.toLowerCase();
    if (lang.startsWith("ko")) return "ko";
    if (lang.startsWith("ja")) return "ja";
  }

  return DEFAULT_LOCALE;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(detectLocale());
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    safeSet("locale", newLocale);
    // Update html lang attribute
    if (typeof document !== "undefined") {
      document.documentElement.lang = newLocale;
    }
  }, []);

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
