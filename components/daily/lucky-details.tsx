"use client"

import { motion } from "framer-motion"
import { Calendar, Palette, Compass } from "lucide-react"

interface LuckyDetailsProps {
  days: string
  color: string
  direction: string
}

export function LuckyDetails({ days, color, direction }: LuckyDetailsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="glass rounded-xl p-4"
    >
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            Lucky Days:{" "}
            <span className="text-foreground font-medium">{days}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            Lucky Color:{" "}
            <span className="text-secondary font-medium">{color}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            Lucky Direction:{" "}
            <span className="text-foreground font-medium">{direction}</span>
          </span>
        </div>
      </div>
    </motion.div>
  )
}
