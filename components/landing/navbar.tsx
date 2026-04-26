"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
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
  const pathname = usePathname()
  const isNative = useNativeApp()

  // ═══ Minimal navbar mode — ALL blog pages (/blog and /blog/*) ═══
  // Blog is a standalone SEO funnel from Google: same minimal chrome on
  // both the list page and individual articles. Strips menu, language
  // toggle, sign-in, and hamburger so visitors focus on the content and
  // the single CTA path (article CTAs → home, logo → home).
  //
  // Why not keep full navbar on article pages:
  //   - Language toggle misleads: toggling UI language doesn't translate
  //     the article itself (each article is written in one language).
  //   - Menu items like Pricing/Compatibility/Consultation belong to the
  //     main product experience — blog readers should reach those via the
  //     home page, not by sideloading into mid-funnel pages.
  //   - Uniform minimal chrome across /blog and /blog/[slug] creates a
  //     consistent "this is the blog section" feel.
  const isBlogListPage = pathname === "/blog"
  const isBlogArticlePage = pathname?.startsWith("/blog/") ?? false
  const isBlogPage = isBlogListPage || isBlogArticlePage

  const homeHref = "/"
  const footerLabel = FOOTER_LABELS[locale] ?? FOOTER_LABELS.en
  const letterLabel = LETTER_LABELS[locale] ?? LETTER_LABELS.en

  // ════════════════════════════════════════════════════════════════
  // v6.17.16 — body-lock cleanup hardened
  // ────────────────────────────────────────────────────────────────
  // chandler bug: "모바일 웹에서 햄버거 버튼이 안먹어"
  // Reason traced: when SignInModal / ReadingLoader / UnlockLoader
  // unmount with the user already navigated away (e.g. signed in →
  // dashboard), the unmount cleanup runs against a stale tree and
  // sometimes fails to clear `pointer-events: none` on body. The next
  // page (this dashboard) inherits a body that swallows all touches,
  // and the hamburger button — which lives on top — receives the
  // tap event but the button itself is a child of body and is
  // pointer-events:none. Tapping does nothing.
  //
  // Fix: clear pointer-events alongside overflow/position/top, and
  // run a one-shot cleanup on every Navbar mount (not just isOpen
  // changes) so any stale lock from the previous route is cleared
  // before the user even reaches for the hamburger.
  // ════════════════════════════════════════════════════════════════
  useEffect(() => {
    // One-shot cleanup on mount — clears any stale lock left by a
    // modal that closed while we were navigating away.
    document.body.style.overflow = ""
    document.body.style.position = ""
    document.body.style.top = ""
    document.body.style.pointerEvents = ""
    document.documentElement.style.overflow = ""
    document.documentElement.style.pointerEvents = ""
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.pointerEvents = ""
      document.documentElement.style.overflow = ""
      document.documentElement.style.pointerEvents = ""
    }
    return () => {
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.pointerEvents = ""
      document.documentElement.style.overflow = ""
      document.documentElement.style.pointerEvents = ""
    }
  }, [isOpen])

  // ════════════════════════════════════════════════════════════════
  // v6.17.18 — auto-close hamburger ONLY on auth transition (not
  // on every render where the user happens to be signed in).
  // ────────────────────────────────────────────────────────────────
  // chandler bug (visible 0.3s flash on hamburger tap when signed in):
  //   The previous effect listed both `user` and `isOpen` in its deps:
  //     useEffect(() => {
  //       if (user && isOpen) setIsOpen(false)
  //     }, [user, isOpen])
  //   This fires every time `isOpen` flips. So tapping the hamburger
  //   while signed in → setIsOpen(true) → effect runs → both truthy
  //   → setIsOpen(false). The menu mounted for one frame, then
  //   unmounted. Visually: a brief flicker, no usable menu.
  //
  //   The original v6.12 intent was different: when the user signs
  //   in WHILE the menu is open, close it. That's an auth-state
  //   transition, not an "is signed in" check. We track the
  //   previous user with a ref and only close when user goes from
  //   null → truthy.
  // ════════════════════════════════════════════════════════════════
  const prevUserRef = useRef<typeof user>(null)
  useEffect(() => {
    const justSignedIn = !prevUserRef.current && !!user
    prevUserRef.current = user
    if (justSignedIn && isOpen) setIsOpen(false)
  }, [user, isOpen])

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

  // ═══ All blog pages (/blog and /blog/*): logo-only minimal header ═══
  // No menu, no language toggle, no sign in, no hamburger.
  // Logo clicks through to home — where the full brand experience lives
  // (hero, Soram, app install badges) and where UI language auto-syncs.
  if (isBlogPage) {
    return (
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30 navbar-wrapper"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 md:h-20 items-center justify-center">
            <Link href={homeHref} className="flex items-center">
              <Image src="/logo1.png" alt="SajuAstrology" width={150} height={44}
                className="h-10 md:h-12 w-auto object-contain" priority />
            </Link>
          </div>
        </div>
      </motion.nav>
    )
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
            {/* v6.17.17 — constrain logo Link to its image width.
                Symptom: hamburger taps registered nothing in mobile
                viewports. The logo's <Link> wrapper had no max-width
                and `flex items-center` stretches as wide as the
                parent allows; on a 380px viewport the link was
                covering the hamburger button area, intercepting
                taps. Adding `flex-none` (don't grow) plus an
                explicit max-w on the image forces the link to size
                to its content. The hamburger group also gets
                `shrink-0` and `relative z-[60]` so it sits above
                any sibling that might still extend. */}
            <Link href={homeHref} className="flex items-center flex-none">
              <Image src="/logo1.png" alt="SajuAstrology" width={150} height={44}
                className="h-10 md:h-12 w-auto max-w-[180px] object-contain" priority />
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

            <div className="flex md:hidden items-center gap-1 shrink-0 relative z-[60]">
              <LangDropdown compact />
              <button
                onClick={() => {
                  // v6.17.16: defensive cleanup BEFORE toggling — clears
                  // any stale body lock (overflow / pointer-events) left
                  // by a closed modal/loader so the menu can render and
                  // future clicks register.
                  document.body.style.overflow = ""
                  document.body.style.position = ""
                  document.body.style.top = ""
                  document.body.style.pointerEvents = ""
                  document.documentElement.style.overflow = ""
                  document.documentElement.style.pointerEvents = ""
                  setIsOpen(!isOpen)
                }}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-foreground z-[60] relative"
                style={{ pointerEvents: "auto" }}
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
            // ════════════════════════════════════════════════════════
            // v6.17.20 — overlay sits BETWEEN the navbar (top) and the
            // global MobileBottomNav (bottom), not over them.
            // ────────────────────────────────────────────────────────
            // Why: chandler caught that the prior "fixed inset-0
            // z-[55]" recipe covered the entire viewport — including
            // the bottom Home/Reading/Soram/Match/My tab bar — so
            // tapping anywhere outside a menu item gave no fallback
            // navigation. It also covered the navbar bar itself, so
            // the X button only stayed visible because of an
            // explicit z-[60] on the hamburger button; one stray
            // backdrop-blur or another sibling could break that.
            //
            // Layout:
            //   • top-16    → starts beneath the navbar (h-16 = 64px,
            //                 same height the navbar uses on mobile),
            //                 so the X stays inside the navbar bar
            //                 in its natural slot, not floating.
            //   • bottom-16 → ends above the BottomNav (h-16 = 64px
            //                 in mobile-bottom-nav.tsx). On pages
            //                 where BottomNav is hidden (blog,
            //                 reading, soram, setup-primary-chart,
            //                 etc.) this leaves a small empty strip
            //                 — harmless, the menu list is top-
            //                 aligned and never reaches it.
            //   • z-[45]    → above BottomNav (z-40) so menu items
            //                 paint on top of any peek-through, but
            //                 below navbar (z-50) so the X button
            //                 keeps its existing stacking context.
            // ════════════════════════════════════════════════════════
            className="fixed top-16 right-0 left-0 bottom-16 z-[45] bg-background/98 backdrop-blur-sm md:hidden overflow-y-auto"
          >
            {/* v6.17.21 — tighter spacing per chandler ("글자행
                간격 더 좁히고 스크롤 내려서 밑에까지 나오지 않게"):
                  • text-lg → text-base    (18px → 16px)
                  • min-h-[44px] → 40px    (still meets touch target)
                  • gap-3 → gap-0.5        (12px → 2px between items)
                  • pt-6 pb-10 → pt-4 pb-4 (less vertical padding)
                  • footer mt-auto removed → flows after CTA, doesn't
                    push to BottomNav-overlap area
                Items now fit comfortably above the BottomNav on
                small viewports without scrolling. If the user is
                signed in (extra dashboard + signOut entries), the
                container scrolls cleanly inside its top-16 / bottom-16
                bounds. */}
            <div className="flex flex-col items-center pt-4 pb-4 px-6 gap-0.5">
              <Link href={homeHref} className="text-base text-foreground font-medium min-h-[40px] flex items-center" onClick={closeMenu}>{t("nav.home")}</Link>
              <Link href="/what-is-saju" className="text-base text-foreground font-medium min-h-[40px] flex items-center" onClick={closeMenu}>{t("nav.whatIsSaju")}</Link>
              <Link href="/pricing" className="text-base text-foreground font-medium min-h-[40px] flex items-center" onClick={closeMenu}>{t("nav.pricing")}</Link>
              <Link href="/compatibility" className="text-base text-foreground font-medium min-h-[40px] flex items-center" onClick={closeMenu}>{t("nav.compatibility")}</Link>
              <Link href="/consultation" className="text-base text-foreground font-medium min-h-[40px] flex items-center" onClick={closeMenu}>{t("nav.consultation")}</Link>
              <Link href="/letter" className="text-base text-foreground font-medium min-h-[40px] flex items-center" onClick={closeMenu}>{letterLabel}</Link>

              <div className="w-12 h-px bg-border/50 my-1.5" />

              {(isLoading || isSigningOut) ? (
                <div className="h-[40px] w-24 bg-muted/30 rounded-lg animate-pulse" />
              ) : user ? (
                <>
                  <Link href="/dashboard" className="text-base text-primary font-medium min-h-[40px] flex items-center" onClick={closeMenu}>{t("nav.dashboard")}</Link>
                  <button onClick={handleSignOut} className="text-base text-muted-foreground font-medium min-h-[40px]">{t("nav.signOut")}</button>
                </>
              ) : (
                <button onClick={() => { closeMenu(); openSignInModal() }} className="text-base text-muted-foreground font-medium min-h-[40px]">{t("nav.signIn")}</button>
              )}

              <Link href="/calculate" onClick={closeMenu} className="mt-2 w-full max-w-xs">
                <Button className="w-full h-11 gold-gradient text-primary-foreground font-semibold text-sm">{t("nav.getReading")}</Button>
              </Link>

              {/* Footer links — Privacy, Terms, Contact.
                  v6.17.21: removed mt-auto (used to push footer to
                  BottomNav-overlap zone). Now flows directly under
                  the CTA so all menu content stays inside the
                  navbar/BottomNav frame. */}
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pt-3 text-[11px] text-muted-foreground/60">
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
