"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Globe, Check, ChevronDown } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/auth/user-menu"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import { useNativeApp } from "@/lib/native-app"
import {
  type Locale,
  LOCALE_LABELS,
  LOCALE_SHORT_LABELS,
  SUPPORTED_LOCALES,
} from "@/lib/translations"
import Image from "next/image"

// ═══════════════════════════════════════════════════════════════════
// Shared dropdown — used by both desktop and mobile switchers.
// Closes on: outside click, ESC key, and language selection.
// Keeps the existing useLanguage() contract: read locale, call setLocale.
// ═══════════════════════════════════════════════════════════════════
function LangDropdown({ compact = false }: { compact?: boolean }) {
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

  const handleSelect = (code: Locale) => {
    setLocale(code)
    setOpen(false)
  }

  const triggerPad = compact
    ? "px-2 py-1 text-[10px] min-h-[28px] gap-1"
    : "px-2.5 py-1.5 text-xs min-h-[32px] gap-1.5"

  const iconSize = compact ? "h-3 w-3" : "h-3.5 w-3.5"

  return (
    <div
      ref={wrapRef}
      className="relative"
      // Ensure menu text is LTR even if wrapping context is RTL (ar)
      dir="ltr"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${LOCALE_LABELS[locale]}`}
        className={`flex items-center bg-card/50 border border-border rounded-lg font-semibold tracking-wider text-foreground hover:border-primary/40 transition-colors ${triggerPad}`}
      >
        <Globe className={`${iconSize} text-muted-foreground`} aria-hidden="true" />
        <span>{LOCALE_SHORT_LABELS[locale]}</span>
        <ChevronDown
          className={`${iconSize} text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Select language"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 mt-2 w-44 max-h-[70vh] overflow-y-auto bg-card border border-border rounded-lg shadow-xl py-1 z-[60]"
          >
            {SUPPORTED_LOCALES.map((code) => {
              const active = code === locale
              return (
                <li key={code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => handleSelect(code)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-card/80 hover:text-foreground"
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
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

// Footer link labels — inline 11-locale map so the mobile menu stays
// readable without reaching into translations.ts for three short strings.
const FOOTER_LABELS: Record<Locale, { privacy: string; terms: string; contact: string }> = {
  en: { privacy: "Privacy", terms: "Terms", contact: "Contact" },
  ko: { privacy: "개인정보", terms: "이용약관", contact: "문의" },
  ja: { privacy: "プライバシー", terms: "利用規約", contact: "お問い合わせ" },
  "zh-TW": { privacy: "隱私", terms: "條款", contact: "聯絡" },
  hi: { privacy: "गोपनीयता", terms: "शर्तें", contact: "संपर्क" },
  es: { privacy: "Privacidad", terms: "Términos", contact: "Contacto" },
  ar: { privacy: "الخصوصية", terms: "الشروط", contact: "اتصال" },
  fr: { privacy: "Confidentialité", terms: "Conditions", contact: "Contact" },
  pt: { privacy: "Privacidade", terms: "Termos", contact: "Contato" },
  ru: { privacy: "Конфиденциальность", terms: "Условия", contact: "Контакт" },
  id: { privacy: "Privasi", terms: "Ketentuan", contact: "Kontak" },
}

const LETTER_LABELS: Record<Locale, string> = {
  en: "Letter",
  ko: "편지",
  ja: "手紙",
  "zh-TW": "信",
  hi: "पत्र",
  es: "Carta",
  ar: "رسالة",
  fr: "Lettre",
  pt: "Carta",
  ru: "Письмо",
  id: "Surat",
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isLoading, isSigningOut, openSignInModal, signOut } = useAuth()
  const { t, locale } = useLanguage()
  const router = useRouter()
  const isNative = useNativeApp()

  const homeHref = "/"
  const footerLabel = FOOTER_LABELS[locale] ?? FOOTER_LABELS.en
  const letterLabel = LETTER_LABELS[locale] ?? LETTER_LABELS.en

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  // ═══ Hide web navbar inside native app — Flutter renders its own TopBar ═══
  if (isNative) return null

  const closeMenu = () => setIsOpen(false)

  const handleSignOut = async () => {
    closeMenu()
    try {
      await signOut()
    } catch {}
    // signOut() already handles window.location.href redirect
  }

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30 navbar-wrapper"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 md:h-20 items-center justify-between">
            <Link href={homeHref} className="flex items-center">
              <Image src="/logo1.png" alt="SajuAstrology" width={150} height={44}
                className="h-10 md:h-12 w-auto object-contain" priority />
            </Link>

            <div className="hidden md:flex md:items-center md:gap-8">
              <Link href="/what-is-saju" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{t("nav.whatIsSaju")}</Link>
              <Link href="/pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{t("nav.pricing")}</Link>
              <Link href="/compatibility" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{t("nav.compatibility")}</Link>
              <Link href="/consultation" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{t("nav.consultation")}</Link>
              <Link href="/letter" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{letterLabel}</Link>
            </div>

            <div className="hidden md:flex md:items-center md:gap-3">
              <LangDropdown />
              {(isLoading || isSigningOut) ? (
                <div className="h-10 w-24 bg-muted/30 rounded-lg animate-pulse" />
              ) : user ? (
                <UserMenu />
              ) : (
                <button
                  onClick={openSignInModal}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("nav.signIn")}
                </button>
              )}
            </div>

            <div className="flex md:hidden items-center gap-1">
              <LangDropdown compact />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-foreground z-50"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[45] bg-background/98 backdrop-blur-sm md:hidden"
          >
            <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6 overflow-y-auto py-20">
              <Link href={homeHref} className="text-lg text-foreground font-medium min-h-[44px] flex items-center" onClick={closeMenu}>{t("nav.home")}</Link>
              <Link href="/what-is-saju" className="text-lg text-foreground font-medium min-h-[44px] flex items-center" onClick={closeMenu}>{t("nav.whatIsSaju")}</Link>
              <Link href="/pricing" className="text-lg text-foreground font-medium min-h-[44px] flex items-center" onClick={closeMenu}>{t("nav.pricing")}</Link>
              <Link href="/compatibility" className="text-lg text-foreground font-medium min-h-[44px] flex items-center" onClick={closeMenu}>{t("nav.compatibility")}</Link>
              <Link href="/consultation" className="text-lg text-foreground font-medium min-h-[44px] flex items-center" onClick={closeMenu}>{t("nav.consultation")}</Link>
              <Link href="/letter" className="text-lg text-foreground font-medium min-h-[44px] flex items-center" onClick={closeMenu}>{letterLabel}</Link>

              <div className="w-16 h-px bg-border/50" />

              {(isLoading || isSigningOut) ? (
                <div className="h-[44px] w-24 bg-muted/30 rounded-lg animate-pulse" />
              ) : user ? (
                <>
                  <Link href="/dashboard" className="text-lg text-primary font-medium min-h-[44px] flex items-center" onClick={closeMenu}>{t("nav.dashboard")}</Link>
                  <button onClick={handleSignOut} className="text-lg text-muted-foreground font-medium min-h-[44px]">{t("nav.signOut")}</button>
                </>
              ) : (
                <button onClick={() => { closeMenu(); openSignInModal() }} className="text-lg text-muted-foreground font-medium min-h-[44px]">{t("nav.signIn")}</button>
              )}

              <Link href="/calculate" onClick={closeMenu} className="mt-2 w-full max-w-xs">
                <Button className="w-full h-12 gold-gradient text-primary-foreground font-semibold text-base">{t("nav.getReading")}</Button>
              </Link>

              {/* Footer links — Privacy, Terms, Contact */}
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-auto pt-8 pb-6 text-[11px] text-muted-foreground/60">
                <Link href="/privacy" onClick={closeMenu} className="hover:text-muted-foreground transition-colors">
                  {footerLabel.privacy}
                </Link>
                <span>·</span>
                <Link href="/terms" onClick={closeMenu} className="hover:text-muted-foreground transition-colors">
                  {footerLabel.terms}
                </Link>
                <span>·</span>
                <a href="mailto:info@rimfactory.io" onClick={closeMenu} className="hover:text-muted-foreground transition-colors">
                  {footerLabel.contact}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
