"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"

const content = {
  title: {
    en: "This is your free overview.",
    ko: "여기까지가 무료 분석입니다.",
    ja: "ここまでが無料分析です。",
  },
  desc: {
    en: "Unlock your full 10-year forecast, career & love deep-dive, and hidden talent analysis.",
    ko: "10년 대운, 직업·연애 심층 분석, 숨겨진 재능 분석을 확인하세요.",
    ja: "10年大運、職業・恋愛の深層分析、隠れた才能分析をご覧ください。",
  },
  cta: {
    en: "Unlock Premium — $9.99 one-time",
    ko: "프리미엄 잠금 해제 — $9.99 일회 결제",
    ja: "プレミアム解放 — $9.99 一回払い",
  },
  free: {
    en: "Or continue with free daily readings",
    ko: "또는 무료 일일 리딩 계속하기",
    ja: "または無料デイリー鑑定を続ける",
  },
} as const

function tx(obj: Record<string, string>, locale: string): string {
  return obj[locale] || obj.en
}

export function UpgradeCTA() {
  const { locale } = useLanguage()

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
          {tx(content.title, locale)}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          {tx(content.desc, locale)}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/pricing">
            <Button
              size="lg"
              className="gold-gradient text-primary-foreground font-semibold"
            >
              {tx(content.cta, locale)}
            </Button>
          </Link>
          <Link
            href="/daily"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {tx(content.free, locale)}
          </Link>
        </div>
      </div>
    </motion.section>
  )
}
