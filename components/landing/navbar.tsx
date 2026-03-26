"use client"

import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/auth/user-menu"
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, openSignInModal } = useAuth()

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("menu-open")
    } else {
      document.body.classList.remove("menu-open")
    }
    return () => {
      document.body.classList.remove("menu-open")
    }
  }, [isOpen])

  const closeMenu = () => setIsOpen(false)

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

            <Link href="/" className="flex items-center" onClick={closeMenu}>
              <Image src="/logo1.png" alt="SajuAstrology" width={150} height={44}
                className="h-10 md:h-12 w-auto object-contain" priority />
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex md:items-center md:gap-8">
              <Link href="/what-is-saju" className="text-sm text-muted-foreground transition-colors hover:text-foreground">What is Saju?</Link>
              <Link href="/pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pricing</Link>
              <Link href="/consultation" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Consultation</Link>
            </div>

            <div className="hidden md:block"><UserMenu /></div>

            {/* Mobile hamburger — min 44px touch target */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2.5 text-foreground z-50 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile fullscreen menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background md:hidden"
          >
            <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6">
              <Link href="/what-is-saju"
                className="text-lg text-foreground font-medium min-h-[44px] flex items-center"
                onClick={closeMenu}>
                What is Saju?
              </Link>
              <Link href="/pricing"
                className="text-lg text-foreground font-medium min-h-[44px] flex items-center"
                onClick={closeMenu}>
                Pricing
              </Link>
              <Link href="/consultation"
                className="text-lg text-foreground font-medium min-h-[44px] flex items-center"
                onClick={closeMenu}>
                Consultation
              </Link>

              {user ? (
                <Link href="/dashboard"
                  className="text-lg text-primary font-medium min-h-[44px] flex items-center"
                  onClick={closeMenu}>
                  My Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => { closeMenu(); openSignInModal(); }}
                  className="text-lg text-muted-foreground font-medium min-h-[44px]">
                  Sign In
                </button>
              )}

              <Link href="/calculate" onClick={closeMenu} className="mt-4 w-full max-w-xs">
                <Button className="w-full h-12 gold-gradient text-primary-foreground font-semibold text-base">
                  Get Your Reading — Free
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
