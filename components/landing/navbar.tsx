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
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import Image from "next/image"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, openSignInModal, signOut } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  const closeMenu = () => setIsOpen(false)

  const handleSignOut = async () => {
    closeMenu()
    await signOut()
    router.push("/")
  }

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 md:h-20 items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image src="/logo1.png" alt="SajuAstrology" width={150} height={44}
                className="h-10 md:h-12 w-auto object-contain" priority />
            </Link>
            <div className="hidden md:flex md:items-center md:gap-8">
              <Link href="/what-is-saju" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{t("nav.whatIsSaju")}</Link>
              <Link href="/pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{t("nav.pricing")}</Link>
              <Link href="/compatibility" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{t("nav.compatibility")}</Link>
              <Link href="/consultation" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{t("nav.consultation")}</Link>
            </div>
            <div className="hidden md:flex md:items-center md:gap-2">
              <LanguageSwitcher />
              <UserMenu />
            </div>
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-foreground z-50" aria-label="Toggle menu">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/98 backdrop-blur-sm md:hidden"
          >
            <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6">
              <LanguageSwitcher className="mb-2" />
              <Link href="/what-is-saju" className="text-lg text-foreground font-medium min-h-[44px] flex items-center" onClick={closeMenu}>{t("nav.whatIsSaju")}</Link>
              <Link href="/pricing" className="text-lg text-foreground font-medium min-h-[44px] flex items-center" onClick={closeMenu}>{t("nav.pricing")}</Link>
              <Link href="/compatibility" className="text-lg text-foreground font-medium min-h-[44px] flex items-center" onClick={closeMenu}>{t("nav.compatibility")}</Link>
              <Link href="/consultation" className="text-lg text-foreground font-medium min-h-[44px] flex items-center" onClick={closeMenu}>{t("nav.consultation")}</Link>

              {user ? (
                <>
                  <Link href="/dashboard" className="text-lg text-primary font-medium min-h-[44px] flex items-center" onClick={closeMenu}>{t("nav.dashboard")}</Link>
                  <button onClick={handleSignOut} className="text-lg text-muted-foreground font-medium min-h-[44px]">{t("nav.signOut")}</button>
                </>
              ) : (
                <button onClick={() => { closeMenu(); openSignInModal(); }} className="text-lg text-muted-foreground font-medium min-h-[44px]">{t("nav.signIn")}</button>
              )}

              <Link href="/calculate" onClick={closeMenu} className="mt-4 w-full max-w-xs">
                <Button className="w-full h-12 gold-gradient text-primary-foreground font-semibold text-base">{t("nav.getReading")}</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
