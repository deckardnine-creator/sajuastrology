"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import Link from "next/link"

export function UpgradeCTA() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="mb-12"
    >
      <div className="glass-gold rounded-2xl p-8 sm:p-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-serif text-2xl font-bold mb-3">
          This is your free overview.
        </h3>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          Unlock your full 10-year forecast, daily readings, and Oracle Chat.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/pricing">
            <Button
              size="lg"
              className="gold-gradient text-primary-foreground font-semibold"
            >
              Unlock Premium — $9.99 one-time
            </Button>
          </Link>
          <Link
            href="/daily"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Or continue with free daily readings
          </Link>
        </div>
      </div>
    </motion.section>
  )
}
