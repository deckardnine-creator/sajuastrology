"use client"

import { motion } from "framer-motion"

interface CosmicArchetypeCardProps {
  archetype: string
  element: string
  elementChinese: string
  elementYinYang: string
  tags: string[]
  variant?: "story" | "square"
}

const elementStyles: Record<
  string,
  { color: string; bgPattern: string; glow: string }
> = {
  Wood: {
    color: "text-secondary",
    bgPattern: "from-secondary/20 via-secondary/5 to-transparent",
    glow: "shadow-secondary/30",
  },
  Fire: {
    color: "text-fire",
    bgPattern: "from-fire/20 via-fire/5 to-transparent",
    glow: "shadow-fire/30",
  },
  Earth: {
    color: "text-primary",
    bgPattern: "from-primary/20 via-primary/5 to-transparent",
    glow: "shadow-primary/30",
  },
  Metal: {
    color: "text-metal",
    bgPattern: "from-metal/20 via-metal/5 to-transparent",
    glow: "shadow-metal/30",
  },
  Water: {
    color: "text-water",
    bgPattern: "from-water/20 via-water/5 to-transparent",
    glow: "shadow-water/30",
  },
}

export function CosmicArchetypeCard({
  archetype,
  element,
  elementChinese,
  elementYinYang,
  tags,
  variant = "story",
}: CosmicArchetypeCardProps) {
  const styles = elementStyles[element] || elementStyles.Earth
  const isStory = variant === "story"

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl bg-background ${
        isStory ? "aspect-[9/16] w-full max-w-[280px]" : "aspect-square w-full max-w-[320px]"
      }`}
    >
      {/* Background pattern */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${styles.bgPattern}`}
      />

      {/* Decorative circles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${styles.color} opacity-10`}
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-6">
        {/* Logo */}
        <div className="text-center">
          <span className="font-serif text-sm text-primary">
            SajuAstrology.com
          </span>
        </div>

        {/* Main content */}
        <div className="text-center flex-1 flex flex-col items-center justify-center">
          {/* Element icon */}
          <div
            className={`text-6xl sm:text-7xl font-serif mb-4 ${styles.color}`}
          >
            {elementChinese}
          </div>

          {/* Archetype name */}
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary mb-2">
            {archetype}
          </h2>

          {/* Element label */}
          <p className={`text-sm ${styles.color} mb-6`}>
            {elementYinYang} {element}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap justify-center gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-xs bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-foreground text-sm font-medium mb-1">
            What&apos;s YOUR cosmic archetype?
          </p>
          <p className="text-xs text-muted-foreground">
            sajuastrology.com/discover
          </p>
        </div>
      </div>
    </motion.div>
  )
}
