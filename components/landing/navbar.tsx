"use client"

import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/auth/user-menu"
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, openSignInModal } = useAuth()

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 glass"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 md:h-20 items-center justify-between">

            <Link href="/" className="flex items-center">
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

            {/* Mobile hamburger */}
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-foreground z-50" aria-label="Toggle menu">
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
            className="fixed inset-0 z-40 bg-background/98 backdrop-blur-sm md:hidden"
          >
            <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6">
              <Link href="/what-is-saju"
                className="text-lg text-foreground font-medium"
                onClick={() => setIsOpen(false)}>
                What is Saju?
              </Link>
              <Link href="/pricing"
                className="text-lg text-foreground font-medium"
                onClick={() => setIsOpen(false)}>
                Pricing
              </Link>
              <Link href="/consultation"
                className="text-lg text-foreground font-medium"
                onClick={() => setIsOpen(false)}>
                Consultation
              </Link>

              {user ? (
                <Link href="/dashboard"
                  className="text-lg text-primary font-medium"
                  onClick={() => setIsOpen(false)}>
                  My Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => { setIsOpen(false); openSignInModal(); }}
                  className="text-lg text-muted-foreground font-medium">
                  Sign In
                </button>
              )}

              <Link href="/calculate" onClick={() => setIsOpen(false)} className="mt-4 w-full max-w-xs">
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
