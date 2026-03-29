"use client"

import { Shield, Cpu, BookOpen } from "lucide-react"

const badges = [
  {
    icon: Cpu,
    label: { en: "Dual AI Verified", ko: "AI 이중 검증", ja: "デュアルAI検証" },
  },
  {
    icon: Shield,
    label: { en: "518,400 Unique Profiles", ko: "518,400 고유 프로필", ja: "518,400固有プロフィール" },
  },
  {
    icon: BookOpen,
    label: { en: "Classical Saju Theory", ko: "고전 사주 이론 기반", ja: "古典四柱理論" },
  },
]

export function TechBadge({ locale }: { locale: string }) {
  return (
    <div className="flex flex-wrap justify-center gap-3 sm:gap-4 py-8 mt-8 border-t border-border/30">
      {badges.map((badge, i) => {
        const Icon = badge.icon
        const label = (badge.label as Record<string, string>)[locale] || badge.label.en
        return (
          <div
            key={i}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/60 border border-border/50 text-xs text-muted-foreground"
          >
            <Icon className="w-3 h-3 text-primary/70" />
            <span>{label}</span>
          </div>
        )
      })}
    </div>
  )
}
