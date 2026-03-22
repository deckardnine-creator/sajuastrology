"use client"

import { motion } from "framer-motion"

interface DestinyScoreProps {
  score: number
  element: string
}

export function DestinyScore({ score, element }: DestinyScoreProps) {
  const circumference = 2 * Math.PI * 90
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="glass-gold rounded-2xl p-8 flex flex-col items-center"
    >
      <h2 className="text-sm text-muted-foreground uppercase tracking-wider mb-6">
        Daily Destiny Score
      </h2>

      {/* Circular Gauge */}
      <div className="relative w-52 h-52">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className="text-muted"
          />
          {/* Progress circle */}
          <motion.circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#59DE9B" />
              <stop offset="100%" stopColor="#F2CA50" />
            </linearGradient>
          </defs>
        </svg>

        {/* Score in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-5xl font-bold text-primary"
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
            Harmonic Index
          </span>
        </div>
      </div>

      {/* Element indicator */}
      <div className="mt-6 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-secondary" />
        <span className="text-sm text-muted-foreground">
          Dominant Element: <span className="text-secondary font-medium">{element}</span>
        </span>
      </div>
    </motion.div>
  )
}
