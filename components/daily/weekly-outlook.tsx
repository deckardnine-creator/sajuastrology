"use client"

import { motion } from "framer-motion"
import { Moon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface WeekDay {
  dateRange: string
  title: string
  forecast: string
  tag: string
  element: string
}

interface WeeklyOutlookProps {
  days: WeekDay[]
}

const elementBorders = {
  wood: "border-l-secondary",
  fire: "border-l-fire",
  earth: "border-l-primary",
  metal: "border-l-metal",
  water: "border-l-water",
}

export function WeeklyOutlook({ days }: WeeklyOutlookProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <Moon className="w-5 h-5 text-primary" />
        <h2 className="font-serif text-xl font-semibold">
          Lunar Cycle &middot; Weekly Outlook
        </h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        {days.map((day, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
            className={`glass rounded-xl p-5 min-w-[260px] border-l-4 ${
              elementBorders[day.element as keyof typeof elementBorders]
            }`}
          >
            <span className="text-xs text-muted-foreground">{day.dateRange}</span>
            <h3 className="font-serif text-lg font-semibold mt-1 mb-2">
              {day.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {day.forecast}
            </p>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-0 text-xs"
            >
              {day.tag}
            </Badge>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
