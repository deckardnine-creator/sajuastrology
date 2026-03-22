"use client"

import { motion } from "framer-motion"

interface ReadingHeaderProps {
  name: string
  status: string
  harmony: number
  generatedAt: string
}

export function ReadingHeader({ name, status, harmony, generatedAt }: ReadingHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12"
    >
      <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
        {name}&apos;s{" "}
        <span className="gold-gradient-text">Cosmic Blueprint</span>
      </h1>
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="text-sm text-secondary font-medium">{status}</span>
        </div>
        <div className="glass px-4 py-2 rounded-full">
          <span className="text-sm text-muted-foreground">
            Harmony Score:{" "}
            <span className="text-primary font-semibold">{harmony}/100</span>
          </span>
        </div>
        <div className="glass px-4 py-2 rounded-full">
          <span className="text-sm text-muted-foreground">
            Generated: {generatedAt}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
