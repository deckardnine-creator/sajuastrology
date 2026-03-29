"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import type { Locale } from "@/lib/translations"

const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ja", label: "JA" },
  { code: "ko", label: "KO" },
]

const aboutLabel: Record<Locale, string> = {
  en: "About",
  ko: "회사소개",
  ja: "会社概要",
}

export function Footer() {
  const { t, locale, setLocale } = useLanguage()

  const mainLinks = [
    { label: t("nav.whatIsSaju"), href: "/what-is-saju" },
    { label: t("nav.pricing"),    href: "/pricing" },
    { label: t("nav.compatibility"), href: "/compatibility" },
    { label: t("nav.consultation"), href: "/consultation" },
  ]
  const legalLinks = [
    { label: aboutLabel[locale], href: "/about" },
    { label: t("footer.privacy"), href: "/privacy" },
    { label: t("footer.terms"),   href: "/terms" },
  ]

  return (
    <footer className="bg-card py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:gap-8">

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="font-serif text-xl font-bold text-primary">SajuAstrology</span>
          </Link>

          {/* Nav — main links */}
          <nav className="flex flex-col items-center gap-3">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
              {mainLinks.map(link => (
                <Link key={link.href} href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
            {/* Legal links — separate row */}
            <div className="flex items-center gap-4">
              {legalLinks.map(link => (
                <Link key={link.href} href={link.href}
                  className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Copyright + Language switcher */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap justify-center">
            <span>&copy; 2026 SajuAstrology.com</span>
            <div className="flex items-center bg-muted/30 rounded-lg p-0.5 gap-0.5">
              {LOCALES.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => setLocale(code)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    locale === code
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Business info */}
          <div className="border-t border-border w-full pt-6">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <p className="text-xs font-medium text-muted-foreground/80">Rimfactory</p>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground/55">
                <span>Reg. No.: 402-44-01247</span>
                <span className="hidden sm:inline">|</span>
                <span>CEO: Chandler Yun</span>
              </div>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground/55">
                <span>info@rimfactory.co.kr</span>
                <span className="hidden sm:inline">|</span>
                <span>+82-10-4648-6793</span>
              </div>
              <p className="text-xs text-muted-foreground/55 max-w-xs text-center leading-relaxed">
                243, 1F, Sindorim Technomart, 97 Saemallo, Guro-gu, Seoul, Korea
              </p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  )
}
