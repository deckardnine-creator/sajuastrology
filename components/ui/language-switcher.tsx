"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage, type Locale } from "@/lib/language-context";
import { LOCALE_LABELS } from "@/lib/translations";

const FLAGS: Record<Locale, string> = {
  en: "EN",
  ko: "KO",
  ja: "JA",
};

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

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors min-h-[36px]"
        aria-label="Change language"
      >
        <span className="text-[11px] font-bold tracking-wider">{FLAGS[locale]}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50 min-w-[120px]">
          {(["en", "ko", "ja"] as Locale[]).map((l) => (
            <button
              key={l}
              onClick={() => { setLocale(l); setOpen(false); }}
              className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center justify-between ${
                locale === l
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
              }`}
            >
              <span>{LOCALE_LABELS[l]}</span>
              <span className="text-[10px] font-bold tracking-wider opacity-50">{FLAGS[l]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
