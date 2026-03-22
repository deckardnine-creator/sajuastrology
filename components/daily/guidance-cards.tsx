"use client"

import { motion } from "framer-motion"
import { Wallet, Heart, Briefcase } from "lucide-react"

interface Guidance {
  category: string
  status: string
  description: string
}

interface GuidanceCardsProps {
  guidance: Guidance[]
}

const icons = {
  Wealth: Wallet,
  Love: Heart,
  Career: Briefcase,
}

const statusColors = {
  Strong: "text-secondary",
  Neutral: "text-primary",
  Peak: "text-secondary",
  Weak: "text-fire",
}

export function GuidanceCards({ guidance }: GuidanceCardsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="grid gap-4 sm:grid-cols-3"
    >
      {guidance.map((item, index) => {
        const Icon = icons[item.category as keyof typeof icons] || Wallet
        const statusColor =
          statusColors[item.status as keyof typeof statusColors] || "text-muted-foreground"

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            className="glass rounded-xl p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <Icon className="w-5 h-5 text-primary" />
              <span className="font-medium">{item.category}</span>
            </div>
            <div className={`text-sm font-semibold mb-1 ${statusColor}`}>
              {item.status}
            </div>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
