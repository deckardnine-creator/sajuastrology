"use client"

import { motion } from "framer-motion"

interface Pillar {
  label: string
  stem: { chinese: string; english: string; element: string }
  branch: { chinese: string; animal: string; element: string }
  isHighlighted?: boolean
}

interface FourPillarsProps {
  pillars: Pillar[]
}

const elementColors: Record<string, string> = {
  wood: "text-secondary",
  fire: "text-fire",
  earth: "text-primary",
  metal: "text-metal",
  water: "text-water",
}

const elementGlows: Record<string, string> = {
  wood: "glow-wood",
  fire: "glow-fire",
  earth: "glow-earth",
  metal: "glow-metal",
  water: "glow-water",
}

export function FourPillars({ pillars }: FourPillarsProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mb-12"
    >
      <h2 className="font-serif text-2xl font-bold mb-6 text-center">
        Your Four Pillars
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {pillars.map((pillar, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            className={`pillar-card rounded-2xl p-6 flex flex-col items-center ${
              pillar.isHighlighted
                ? "glow-gold ring-1 ring-primary/30"
                : ""
            }`}
          >
            {/* Label */}
            <span
              className={`text-xs uppercase tracking-wider mb-4 ${
                pillar.isHighlighted
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              {pillar.label}
            </span>

            {/* Heavenly Stem */}
            <div className="flex flex-col items-center mb-4">
              <span
                className={`text-4xl sm:text-5xl font-serif ${
                  elementColors[pillar.stem.element]
                } ${elementGlows[pillar.stem.element]}`}
              >
                {pillar.stem.chinese}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                {pillar.stem.english}
              </span>
            </div>

            {/* Divider */}
            <div className="w-8 h-px bg-border my-2" />

            {/* Earthly Branch */}
            <div className="flex flex-col items-center mt-2">
              <span
                className={`text-3xl sm:text-4xl font-serif ${
                  elementColors[pillar.branch.element]
                }`}
              >
                {pillar.branch.chinese}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                {pillar.branch.animal}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
