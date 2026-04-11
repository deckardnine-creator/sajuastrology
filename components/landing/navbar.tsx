"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/auth/user-menu"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import { useNativeApp } from "@/lib/native-app"
import type { Locale } from "@/lib/translations"
import Image from "next/image"

const LOCALES: { code: Locale; label: string; name: string }[] = [
  { code: "en", label: "EN", name: "English" },
  { code: "ja", label: "JA", name: "日本語" },
  { code: "ko", label: "KO", name: "한국어" },
]

function DesktopLangSwitcher() {
  const { locale, setLocale } = useLanguage()
  return (
    <div className="flex items-center bg-card/50 border border-border rounded-lg p-0.5 gap-0.5">
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLocale(code)}
          className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all min-h-[32px] tracking-wider ${
            locale === code
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-card"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function MobileInlineSwitcher() {
  const { locale, setLocale } = useLanguage()
  return (
    <div className="flex items-center bg-card/50 border border-border rounded-lg p-0.5 gap-0.5 mr-1">
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLocale(code)}
          className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all min-h-[28px] tracking-wider ${
            locale === code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isLoading, isSigningOut, openSignInModal, signOut } = useAuth()
  const { t, locale } = useLanguage()
  const router = useRouter()
  const isNative = useNativeApp()

  const homeHref = "/"

  // Letter link label — inline locale map (same pattern as footer.tsx `aboutLabel`)
  const letterLabel: Record<Locale, string> =
    { en: "Letter", ko: "편지", ja: "手紙" }

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
    window.location.href = "/"
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
              <Link href="/letter" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{letterLabel[locale]}</Link>
            </div>

            <div className="hidden md:flex md:items-center md:gap-3">
              <DesktopLangSwitcher />
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
              <MobileInlineSwitcher />
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
            <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6">
              <Link href={homeHref} className="text-lg text-foreground font-medium min-h-[44px] flex items-center" onClick={closeMenu}>{t("nav.home")}</Link>
              <Link href="/what-is-saju" className="text-lg text-foreground font-medium min-h-[44px] flex items-center" onClick={closeMenu}>{t("nav.whatIsSaju")}</Link>
              <Link href="/pricing" className="text-lg text-foreground font-medium min-h-[44px] flex items-center" onClick={closeMenu}>{t("nav.pricing")}</Link>
              <Link href="/compatibility" className="text-lg text-foreground font-medium min-h-[44px] flex items-center" onClick={closeMenu}>{t("nav.compatibility")}</Link>
              <Link href="/consultation" className="text-lg text-foreground font-medium min-h-[44px] flex items-center" onClick={closeMenu}>{t("nav.consultation")}</Link>
              <Link href="/letter" className="text-lg text-foreground font-medium min-h-[44px] flex items-center" onClick={closeMenu}>{letterLabel[locale]}</Link>

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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
