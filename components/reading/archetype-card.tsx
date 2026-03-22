"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Archetype {
  name: string
  korean: string
  english: string
  description: string
  tags: string[]
}

interface ArchetypeCardProps {
  archetype: Archetype
}

export function ArchetypeCard({ archetype }: ArchetypeCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="mb-12"
    >
      <div className="glass-gold rounded-2xl p-8 sm:p-10">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm text-muted-foreground">
                Your Dominant Archetype
              </span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-primary mb-2">
              {archetype.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {archetype.english} ({archetype.korean})
            </p>
            <p className="text-foreground leading-relaxed mb-6">
              {archetype.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {archetype.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-primary/10 text-primary border-0"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
