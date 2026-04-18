"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage, type Locale } from "@/lib/language-context";
import { LOCALE_LABELS, LOCALE_SHORT_LABELS, SUPPORTED_LOCALES } from "@/lib/translations";

// ═══════════════════════════════════════════════════════════════════
// Standalone language switcher. Not currently used by the main navbar
// (navbar has its own LangDropdown) but kept available for other
// surfaces that import this component. Expanded from 3 → 11 locales
// to match the rest of the site.
// ═══════════════════════════════════════════════════════════════════
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Also close on Escape for keyboard users
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`} dir="ltr">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors min-h-[36px]"
        aria-label="Change language"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-[11px] font-bold tracking-wider">{LOCALE_SHORT_LABELS[locale]}</span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50 min-w-[180px] max-h-[70vh] overflow-y-auto"
        >
          {SUPPORTED_LOCALES.map((l: Locale) => (
            <button
              key={l}
              role="option"
              aria-selected={locale === l}
              onClick={() => { setLocale(l); setOpen(false); }}
              className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center justify-between ${
                locale === l
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
              }`}
            >
              <span>{LOCALE_LABELS[l]}</span>
              <span className="text-[10px] font-bold tracking-wider opacity-50 ml-2">{LOCALE_SHORT_LABELS[l]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
