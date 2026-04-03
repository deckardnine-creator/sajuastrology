"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Gauge, TrendingUp, Heart, Sparkles, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"

function tx(obj: Record<string, string>, locale: string): string {
  return obj[locale] || obj.en
}

const features = [
  {
    id: "daily",
    icon: Gauge,
    title: { en: "Daily Destiny Score", ko: "오늘의 운세 점수", ja: "今日の運勢スコア" },
    tagline: { en: "Know your energy before the day begins.", ko: "하루가 시작되기 전, 오늘의 에너지를 확인하세요.", ja: "一日が始まる前に、今日のエネルギーを確認。" },
    description: {
      en: "Every day carries a different cosmic energy based on the Five Elements. Your Daily Destiny Score shows how today's energy interacts with your unique birth blueprint — giving you an edge in timing.",
      ko: "매일 오행에 따라 다른 우주적 에너지가 흐릅니다. 오늘의 운세 점수는 당신의 사주와 오늘의 에너지 상호작용을 보여줍니다 — 타이밍에 우위를 가지세요.",
      ja: "毎日、五行に基づく異なる宇宙エネルギーが流れます。今日の運勢スコアはあなたの四柱と今日のエネルギーの相互作用を表示 — タイミングの優位性を。",
    },
    bullets: {
      en: ["Personalized score from 0–100 updated daily", "Wealth, Love, and Career sub-scores", "Lucky colors, directions, and power hours"],
      ko: ["매일 업데이트되는 0~100 맞춤 점수", "재물·연애·커리어 세부 점수", "행운의 색상, 방향, 파워 타임"],
      ja: ["毎日更新される0〜100のパーソナルスコア", "財運・恋愛・キャリアのサブスコア", "ラッキーカラー、方角、パワータイム"],
    },
    cta: { label: { en: "See My Daily Score", ko: "오늘의 점수 보기", ja: "今日のスコアを見る" }, href: "/daily" },
    accentColor: "from-amber-500/20 to-yellow-500/10",
    glowColor: "bg-amber-400/30",
    mockup: <DailyMockup />,
  },
  {
    id: "wealth",
    icon: TrendingUp,
    title: { en: "Wealth & Career Blueprint", ko: "재물·직업 운세 블루프린트", ja: "財運・キャリア設計図" },
    tagline: { en: "10 years of fortune cycles, mapped.", ko: "10년간의 운세 사이클, 한눈에.", ja: "10年間の運勢サイクルを一目で。" },
    description: {
      en: "Your financial destiny follows predictable elemental cycles. See which years are your peak wealth periods, when to take risks, and when to consolidate — all derived from your Four Pillars.",
      ko: "당신의 재물운은 예측 가능한 오행 사이클을 따릅니다. 어떤 해가 재물 피크인지, 언제 도전하고 언제 안정을 취할지 — 모두 사주에서 도출합니다.",
      ja: "あなたの財運は予測可能な五行サイクルに従います。ピーク年、挑戦時期、安定期 — すべて四柱から導き出します。",
    },
    bullets: {
      en: ["10-year luck pillar cycle analysis", "Peak wealth years highlighted", "Career move timing recommendations"],
      ko: ["10년 대운 사이클 분석", "재물 피크 연도 하이라이트", "이직·전환 타이밍 추천"],
      ja: ["10年大運サイクル分析", "財運ピーク年をハイライト", "転職・転換タイミング推薦"],
    },
    cta: { label: { en: "Unlock My Blueprint", ko: "내 블루프린트 보기", ja: "設計図を解放" }, href: "/pricing" },
    accentColor: "from-green-500/20 to-teal-500/10",
    glowColor: "bg-green-400/30",
    mockup: <WealthMockup />,
  },
  {
    id: "love",
    icon: Heart,
    title: { en: "Love Synergy", ko: "연애 시너지", ja: "恋愛シナジー" },
    tagline: { en: "Not just signs — full elemental harmony.", ko: "별자리가 아닌 — 완전한 오행 궁합.", ja: "星座ではなく — 完全な五行の相性。" },
    description: {
      en: "True compatibility goes beyond surface-level zodiac matching. Saju maps the elemental interaction between two people's complete birth charts, revealing deep harmony and friction points.",
      ko: "진정한 궁합은 표면적인 별자리 매칭을 넘어섭니다. 사주는 두 사람의 완전한 사주팔자 간 오행 상호작용을 분석하여 깊은 조화와 갈등 포인트를 드러냅니다.",
      ja: "真の相性は表面的な星座マッチングを超えます。四柱推命は二人の完全な四柱八字間の五行相互作用を分析し、深い調和と摩擦ポイントを明らかに。",
    },
    bullets: {
      en: ["Full compatibility score with any birth date", "Element harmony & conflict mapping", "Optimal relationship windows in your cycle"],
      ko: ["모든 생년월일과의 궁합 점수", "오행 조화 & 갈등 매핑", "최적의 인연 시기 분석"],
      ja: ["すべての生年月日との相性スコア", "五行の調和＆衝突マッピング", "最適な縁のタイミング分析"],
    },
    cta: { label: { en: "Check Compatibility", ko: "궁합 확인하기", ja: "相性を確認" }, href: "/compatibility" },
    accentColor: "from-pink-500/20 to-rose-500/10",
    glowColor: "bg-pink-400/30",
    mockup: <LoveMockup />,
  },
  {
    id: "oracle",
    icon: Sparkles,
    title: { en: "Oracle Chat", ko: "오라클 채팅", ja: "オラクルチャット" },
    tagline: { en: "1,000 years of wisdom. Ask anything.", ko: "1,000년의 지혜. 무엇이든 물어보세요.", ja: "1,000年の知恵。何でも聞いてください。" },
    description: {
      en: "Your personal AI oracle trained on classical Saju texts and your unique birth chart. Ask about career moves, relationship timing, or life decisions — and receive guidance rooted in your cosmic blueprint.",
      ko: "고전 사주 원전과 당신의 사주팔자로 훈련된 AI 오라클. 직업, 연애 타이밍, 인생 결정에 대해 물어보세요 — 당신의 우주적 청사진에 근거한 답변을 받습니다.",
      ja: "古典四柱原典とあなたの四柱八字で訓練されたAIオラクル。キャリア、恋愛タイミング、人生の決断について質問 — あなたの宇宙的設計図に基づく回答を。",
    },
    bullets: {
      en: ["Answers grounded in your Four Pillars", "Career, love, and life path questions", "Available 24/7, unlimited questions"],
      ko: ["사주팔자에 근거한 답변", "직업, 연애, 인생 경로 질문", "24시간 무제한 이용"],
      ja: ["四柱八字に基づく回答", "キャリア、恋愛、人生の質問", "24時間無制限利用"],
    },
    cta: { label: { en: "Start Free Reading", ko: "무료 리딩 시작", ja: "無料鑑定を始める" }, href: "/calculate" },
    accentColor: "from-purple-500/20 to-indigo-500/10",
    glowColor: "bg-purple-400/30",
    mockup: <OracleMockup />,
  },
]

export function FeaturesSection() {
  const [activeId, setActiveId] = useState("daily")
  const { locale } = useLanguage()
  const active = features.find((f) => f.id === activeId)!

  const headerTitle = { en: "Powerful Features", ko: "핵심 기능", ja: "主要機能" }
  const headerDesc = { en: "Everything you need to navigate your cosmic journey", ko: "우주적 여정을 항해하는 데 필요한 모든 것", ja: "宇宙的な旅を導くすべての機能" }

  return (
    <section id="features" className="relative py-24 overflow-hidden">

      {/* Five-element themed orbs */}
      <motion.div
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-green-600/20 blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, -25, 0], x: [0, -15, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-0 right-0 w-[350px] h-[350px] rounded-full bg-orange-500/20 blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-yellow-500/10 blur-[130px] pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, -20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute bottom-0 right-0 w-[350px] h-[350px] rounded-full bg-cyan-400/15 blur-[110px] pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 25, 0], x: [0, 15, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-blue-700/20 blur-[110px] pointer-events-none"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
            {tx(headerTitle, locale)}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {tx(headerDesc, locale)}
          </p>
        </motion.div>

        {/* Tab buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {features.map((f) => {
            const Icon = f.icon
            const isActive = f.id === activeId
            return (
              <button
                key={f.id}
                onClick={() => setActiveId(f.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tx(f.title, locale)}
              </button>
            )
          })}
        </div>

        {/* Main content panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="grid lg:grid-cols-2 gap-8 items-center"
          >
            {/* Left: text */}
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-primary text-sm font-medium mb-2">{tx(active.tagline, locale)}</p>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-4">
                  {tx(active.title, locale)}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {tx(active.description, locale)}
                </p>
              </div>

              <ul className="flex flex-col gap-3">
                {(active.bullets[locale as keyof typeof active.bullets] || active.bullets.en).map((b: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground/80">{b}</span>
                  </li>
                ))}
              </ul>

              <Link href={active.cta.href}>
                <Button className="gold-gradient text-primary-foreground font-semibold group w-fit">
                  {tx(active.cta.label, locale)}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            {/* Right: mockup */}
            <div className={`relative rounded-2xl bg-gradient-to-br ${active.accentColor} border border-border/50 p-1 overflow-hidden`}>
              {/* glow behind mockup */}
              <div className={`absolute inset-0 ${active.glowColor} blur-3xl opacity-30 pointer-events-none`} />
              <div className="relative rounded-xl overflow-hidden bg-card/80 backdrop-blur">
                {active.mockup}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

/* ── Mockup components ── */

function DailyMockup() {
  return (
    <div className="p-6 select-none">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground">Today's Energy</p>
          <p className="font-serif text-lg font-bold text-foreground">Sunday, Mar 22</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Day Master</p>
          <p className="text-sm font-medium text-amber-400">Fire 丙</p>
        </div>
      </div>
      {/* Score ring */}
      <div className="flex justify-center mb-4">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#F2CA50" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${78 * 2.51} ${100 * 2.51}`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-serif font-bold text-foreground">78</span>
            <span className="text-xs text-amber-400">Strong</span>
          </div>
        </div>
      </div>
      {/* Sub-scores */}
      <div className="grid grid-cols-3 gap-2">
        {[["Wealth", 85, "#22c55e"], ["Love", 72, "#ec4899"], ["Career", 90, "#3b82f6"]].map(([label, val, color]) => (
          <div key={label as string} className="bg-muted/30 rounded-lg p-2 text-center">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <div className="h-1 rounded-full bg-muted/50 mb-1">
              <div className="h-full rounded-full" style={{ width: `${val}%`, backgroundColor: color as string }} />
            </div>
            <p className="text-xs font-medium" style={{ color: color as string }}>{val}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
        <p className="text-xs text-amber-400/80 italic">"The Blazing Forest — Your ideas catch fire today. Pitch that concept."</p>
      </div>
    </div>
  )
}

function WealthMockup() {
  const bars = [55, 62, 70, 88, 95, 72, 60, 85, 78, 65]
  return (
    <div className="p-6 select-none">
      <p className="text-xs text-muted-foreground mb-1">10-Year Fortune Cycle</p>
      <p className="font-serif text-lg font-bold text-foreground mb-4">2024 — 2034</p>
      <div className="flex items-end gap-1.5 h-28 mb-3">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-sm transition-all"
              style={{
                height: `${h}%`,
                backgroundColor: h >= 85 ? "#F2CA50" : h >= 70 ? "#3b82f6" : "#888780",
                opacity: h >= 85 ? 1 : 0.5,
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mb-4">
        <span>2024</span><span>2029</span><span>2034</span>
      </div>
      <div className="flex gap-2">
        <div className="flex items-center gap-1.5 text-xs"><div className="w-2.5 h-2.5 rounded-sm bg-amber-400" /><span className="text-muted-foreground">Peak years</span></div>
        <div className="flex items-center gap-1.5 text-xs"><div className="w-2.5 h-2.5 rounded-sm bg-blue-500/50" /><span className="text-muted-foreground">Growth</span></div>
        <div className="flex items-center gap-1.5 text-xs"><div className="w-2.5 h-2.5 rounded-sm bg-muted/50" /><span className="text-muted-foreground">Consolidate</span></div>
      </div>
    </div>
  )
}

function LoveMockup() {
  return (
    <div className="p-6 select-none">
      <p className="text-xs text-muted-foreground mb-3">Compatibility Analysis</p>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg">火</div>
          <span className="text-xs text-muted-foreground">You</span>
        </div>
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="relative w-full h-2 bg-muted/30 rounded-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 to-rose-400 rounded-full" style={{ width: "94%" }} />
          </div>
          <span className="text-lg font-serif font-bold text-pink-400">94%</span>
          <span className="text-xs text-muted-foreground">Synergy</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-lg">金</div>
          <span className="text-xs text-muted-foreground">Partner</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[["Fire × Metal", "Creative tension", "#F472B6"], ["Element match", "High harmony", "#a78bfa"]].map(([label, val, color]) => (
          <div key={label as string} className="bg-muted/30 rounded-lg p-2">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: color as string }}>{val}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 p-2.5 bg-pink-500/10 rounded-lg border border-pink-500/20 text-xs text-pink-400/80">
        Best window: 2026 Q3 · Peak connection period
      </div>
    </div>
  )
}

function OracleMockup() {
  return (
    <div className="p-6 select-none">
      <p className="text-xs text-muted-foreground mb-3">Oracle Chat</p>
      <div className="flex flex-col gap-2.5">
        <div className="self-end bg-primary/20 text-foreground text-xs rounded-2xl rounded-br-sm px-3 py-2 max-w-[80%]">
          Should I change careers this year?
        </div>
        <div className="self-start flex gap-2 max-w-[90%]">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-3 h-3 text-primary" />
          </div>
          <div className="bg-muted/40 text-foreground text-xs rounded-2xl rounded-bl-sm px-3 py-2">
            Your Metal Day Master enters a strong Wood luck pillar in 2026. This creates the ideal tension for a career pivot — especially in creative or growth industries...
          </div>
        </div>
        <div className="self-end bg-primary/20 text-foreground text-xs rounded-2xl rounded-br-sm px-3 py-2 max-w-[80%]">
          What about timing?
        </div>
        <div className="self-start flex gap-2 max-w-[90%]">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-3 h-3 text-primary" />
          </div>
          <div className="bg-muted/40 text-muted-foreground text-xs rounded-2xl rounded-bl-sm px-3 py-2 italic">
            Typing...
          </div>
        </div>
      </div>
    </div>
  )
}
