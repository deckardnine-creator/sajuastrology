"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/lib/language-context"

const content = {
  badge: { en: "WHY IT WORKS", ko: "왜 정확한가", ja: "なぜ正確なのか" },
  title: {
    en: "Built Different from Day One",
    ko: "처음부터 다르게 만들었습니다",
    ja: "最初から、違う。",
  },
  items: [
    {
      icon: "🔬",
      num: { en: "518,400", ko: "518,400", ja: "518,400" },
      title: {
        en: "Unique Birth Profiles",
        ko: "고유 출생 프로필",
        ja: "固有出生プロフィール",
      },
      desc: {
        en: "Western astrology sorts you into 1 of 12 types. Saju maps your exact birth moment across 518,400 unique cosmic combinations — 43,200× more precise.",
        ko: "서양 별자리는 12개 유형 중 하나. 사주는 518,400가지 우주적 조합으로 당신의 정확한 출생 순간을 분석합니다 — 43,200배 더 정밀.",
        ja: "西洋占星術は12タイプの1つ。四柱推命は518,400通りの宇宙的組み合わせで正確な誕生の瞬間を分析 — 43,200倍精密。",
      },
    },
    {
      icon: "🤖",
      num: { en: "562", ko: "562", ja: "562" },
      title: {
        en: "Classical Passages, Vector-Matched",
        ko: "고전 패시지, 벡터 매칭",
        ja: "古典パッセージ、ベクトル照合",
      },
      desc: {
        en: "Every reading searches 562 passages from five foundational texts — matched to your birth chart via 1,536-dimensional vector similarity. Then verified by multiple AI engines.",
        ko: "5대 원전에서 추출한 562개 패시지를 1,536차원 벡터 유사도로 당신의 사주에 매칭. 멀티 AI 교차 검증까지.",
        ja: "5大原典から562パッセージを1,536次元ベクトル類似度であなたの四柱に照合。マルチAI交差検証付き。",
      },
    },
    {
      icon: "📜",
      num: { en: "2,000+", ko: "2,000+", ja: "2,000+" },
      title: {
        en: "Years of Theory, Vectorized",
        ko: "년 이론, 벡터화 완료",
        ja: "年の理論、ベクトル化済",
      },
      desc: {
        en: "滴天髓, 穷通宝鉴, 子平真诠, 渊海子平, 格局论命 — five classical texts transformed into a real-time retrieval-augmented generation (RAG) pipeline. Every claim is traceable to its source.",
        ko: "적천수·궁통보감·자평진전·연해자평·격국론명 — 5대 고전 원전을 실시간 RAG 파이프라인으로 구축. 모든 해석에 원전 근거가 명시됩니다.",
        ja: "滴天髓・穹通宝鑑・子平真詮・淵海子平・格局論命 — 5大古典をリアルタイムRAGパイプラインに構築。すべての解釈に原典根拠を明示。",
      },
    },
    {
      icon: "💎",
      num: { en: "$0", ko: "$0", ja: "$0" },
      title: {
        en: "To Start. No Subscription.",
        ko: "시작 비용. 구독 없음.",
        ja: "で始める。サブスクなし。",
      },
      desc: {
        en: "Your free reading is genuinely free — no credit card, no trial, no catch. When you want more depth, pay once and keep it forever. No monthly fees.",
        ko: "무료 리딩은 진짜 무료 — 카드 불필요, 체험판 아님. 더 깊은 분석이 필요하면 1회 결제, 영원히 소유. 월정액 없음.",
        ja: "無料鑑定は本当に無料 — カード不要、体験版ではありません。より深い分析が必要なら一回払い、永久保存。月額なし。",
      },
    },
  ],
} as const

function tx(obj: Record<string, string>, locale: string): string {
  return obj[locale] || obj.en
}

export function WhyItWorks() {
  const { locale } = useLanguage()
  const l = locale as "en" | "ko" | "ja"

  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[160px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary tracking-wider uppercase mb-4">
            {tx(content.badge, l)}
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold">
            {tx(content.title, l)}
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {content.items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-card/80 border border-border rounded-2xl p-6 sm:p-8 hover:border-primary/20 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <span className="font-serif text-2xl sm:text-3xl font-bold gold-gradient-text">
                    {tx(item.num, l)}
                  </span>
                  <span className="text-sm sm:text-base text-muted-foreground ml-2">
                    {tx(item.title, l)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tx(item.desc, l)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
