"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/auth/user-menu"
import Image from "next/image"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">

          <Link href="/" className="flex items-center">
            <Image src="/logo1.png" alt="SajuAstrology" width={180} height={52}
              className="h-12 w-auto object-contain" priority />
          </Link>

          <div className="hidden md:flex md:items-center md:gap-8">
            <Link href="/what-is-saju" className="text-sm text-muted-foreground transition-colors hover:text-foreground">What is Saju?</Link>
            <Link href="/#features"    className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</Link>
            <Link href="/pricing"      className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pricing</Link>
            <Link href="/reviews"      className="text-sm text-muted-foreground transition-colors hover:text-foreground">Reviews</Link>
          </div>

          <div className="hidden md:block"><UserMenu /></div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-foreground" aria-label="Toggle menu">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }} className="md:hidden glass">
          <div className="space-y-4 px-4 py-6">
            <Link href="/what-is-saju" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>What is Saju?</Link>
            <Link href="/#features"    className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>Features</Link>
            <Link href="/pricing"      className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>Pricing</Link>
            <Link href="/reviews"      className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>Reviews</Link>
            <Link href="/calculate" onClick={() => setIsOpen(false)}>
              <Button className="w-full gold-gradient text-primary-foreground font-medium">Get Your Reading — Free</Button>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}
