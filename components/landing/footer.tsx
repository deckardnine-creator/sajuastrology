"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { useNativeApp } from "@/lib/native-app"
import {
  type Locale,
  LOCALE_LABELS,
  LOCALE_SHORT_LABELS,
  SUPPORTED_LOCALES,
} from "@/lib/translations"
import { Globe, Check, ChevronDown } from "lucide-react"
import { useRef } from "react"

// ═══════════════════════════════════════════════════════════════════
// Inline label maps. `en` is required (fallback); other locales are
// optional. At render time we resolve with `?? en` so unexpanded
// locales (es/ar/fr/...) fall through to English copy without crashing.
// ═══════════════════════════════════════════════════════════════════

const letterLabel: Partial<Record<Locale, string>> & { en: string } = {
  en: "Letter",
  ko: "편지",
  ja: "手紙",
}

type BugBountyCopy = { badge: string; title: string; desc: string }

const bugBounty: Partial<Record<Locale, BugBountyCopy>> & { en: BugBountyCopy } = {
  en: {
    badge: "Early Access",
    title: "Found a bug? Get a free Master Consultation credit ($29.99 — 5 AI analysis sessions)",
    desc: "We're in early launch — your feedback makes us better. Report any bug with your Google account email to the address below and receive a free Master Consultation credit (5 AI analysis rounds) when your report leads to a fix.",
  },
  ko: {
    badge: "얼리 액세스",
    title: "버그를 발견하셨나요? 마스터 상담($29.99)을 무료로 드립니다",
    desc: "초기 서비스 기간입니다. 구글 계정 이메일과 함께 아래 주소로 버그를 알려주시면, 감사의 의미로 마스터 상담 이용권(AI 분석 5회)을 드립니다. (버그 수정 반영 시)",
  },
  ja: {
    badge: "アーリーアクセス",
    title: "バグを発見しましたか？マスター鑑定（$29.99）を無料で差し上げます",
    desc: "サービス初期段階です。Googleアカウントのメールアドレスと共に、下記アドレスへバグをご報告いただければ、マスター鑑定（AI分析5回分）を無料で提供いたします。（バグ修正反映時）",
  },
}

// ═══════════════════════════════════════════════════════════════════
// Footer language dropdown — mirror of navbar's LangDropdown but
// styled for the footer's muted palette and sized compactly. Lives
// here so footer stays a single self-contained file.
// ═══════════════════════════════════════════════════════════════════
function FooterLangDropdown() {
  const { locale, setLocale } = useLanguage()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("touchstart", onDown, { passive: true })
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("touchstart", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={wrapRef} className="relative" dir="ltr">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${LOCALE_LABELS[locale]}`}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wider text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/40 transition-colors min-h-[32px]"
      >
        <Globe className="h-3 w-3" aria-hidden="true" />
        <span>{LOCALE_SHORT_LABELS[locale]}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Select language"
          className="absolute right-0 bottom-full mb-2 w-44 max-h-[70vh] overflow-y-auto bg-card border border-border rounded-lg shadow-xl py-1 z-[60]"
        >
          {SUPPORTED_LOCALES.map((code) => {
            const active = code === locale
            return (
              <li key={code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => { setLocale(code); setOpen(false) }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-7 text-[10px] font-bold tracking-wider text-muted-foreground/70">
                      {LOCALE_SHORT_LABELS[code]}
                    </span>
                    <span>{LOCALE_LABELS[code]}</span>
                  </span>
                  {active && (
                    <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export function Footer() {
  const { t, locale } = useLanguage()
  const isNative = useNativeApp()
  const pathname = usePathname()

  // ═══ Minimal footer mode — ALL blog pages (/blog and /blog/*) ═══
  // Matches the minimal Navbar across the entire blog section. Blog is a
  // standalone SEO funnel from Google: uniform minimal chrome on both the
  // list page and individual articles. Visitors focus on the article
  // content and the single CTA path (article CTAs → home, logo → home).
  const isBlogListPage = pathname === "/blog"
  const isBlogArticlePage = pathname?.startsWith("/blog/") ?? false
  const isBlogPage = isBlogListPage || isBlogArticlePage

  // Defense in depth: if useNativeApp() somehow returns false in the iOS app
  // (hydration timing, deployment cache, etc), this direct check covers it.
  // We hide the bug-bounty banner and business info if ANY native indicator
  // is present.
  const [directNative, setDirectNative] = useState(false)
  useEffect(() => {
    if (typeof window === "undefined") return
    const ua = navigator.userAgent.includes("SajuApp")
    const url = new URLSearchParams(window.location.search).get("app") === "true"
    const bridge = typeof (window as { FlutterBridge?: unknown }).FlutterBridge !== "undefined"
    let stored = false
    try { stored = sessionStorage.getItem("native-app") === "1" } catch {}
    if (ua || url || bridge || stored) setDirectNative(true)
  }, [])

  const hideWebOnly = isNative || directNative

  // ═══ All blog pages (/blog and /blog/*): copyright-only minimal footer ═══
  // Logo + © line only. No nav links, no bug bounty banner, no business info.
  // Mirrors the minimal Navbar across the blog section.
  if (isBlogPage) {
    return (
      <footer className="bg-card py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4">
            <Link href="/" className="flex items-center">
              <span className="font-serif text-xl font-bold text-primary">SajuAstrology</span>
            </Link>
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <span>&copy; 2026 SajuAstrology.com</span>
            </div>
          </div>
        </div>
      </footer>
    )
  }

  // Safe locale lookups with English fallback for locales not yet translated.
  const letter = letterLabel[locale] ?? letterLabel.en
  const bb = bugBounty[locale] ?? bugBounty.en

  const mainLinks = [
    { label: t("nav.whatIsSaju"), href: "/what-is-saju" },
    { label: t("nav.pricing"),    href: "/pricing" },
    { label: t("nav.compatibility"), href: "/compatibility" },
    { label: t("nav.consultation"), href: "/consultation" },
  ]
  const legalLinks = [
    { label: letter, href: "/letter" },
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

          {/* Bug Bounty Banner — hidden in native app */}
          {!hideWebOnly && (
          <div className="w-full max-w-lg rounded-xl border border-primary/20 bg-primary/[0.04] px-4 py-4 sm:px-5 sm:py-5 text-center">
            <span className="inline-block px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider bg-primary/15 text-primary rounded-full mb-2.5">
              {bb.badge}
            </span>
            <p className="text-xs sm:text-sm font-semibold text-foreground leading-snug mb-1.5">
              {bb.title}
            </p>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed mb-3">
              {bb.desc}
            </p>
            <p className="text-primary font-semibold text-sm sm:text-base select-all">
              info@rimfactory.io
            </p>
          </div>
          )}

          {/* Copyright — centered */}
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <span>&copy; 2026 SajuAstrology.com</span>
          </div>

          {/* Business info — hidden in native app */}
          {!hideWebOnly && (
          <div className="border-t border-border w-full pt-6">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <p className="text-xs font-medium text-muted-foreground/80">Rimfactory</p>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground/55">
                <span>Reg. No.: 402-44-01247</span>
                <span className="hidden sm:inline">|</span>
                <span>CEO: Cho Yeon Yun</span>
              </div>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground/55">
                <span>info@rimfactory.io</span>
                <span className="hidden sm:inline">|</span>
                <span>+82-10-4648-6793</span>
              </div>
              <p className="text-xs text-muted-foreground/55 max-w-xs text-center leading-relaxed">
                243, 1F, Sindorim Technomart, 97 Saemallo, Guro-gu, Seoul, Korea
              </p>
            </div>
          </div>
          )}

        </div>
      </div>
    </footer>
  )
}
