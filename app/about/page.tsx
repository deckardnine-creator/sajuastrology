"use client"

import { motion } from "framer-motion"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { useLanguage } from "@/lib/language-context"
import Link from "next/link"
import { ArrowRight, Brain, Shield, TrendingUp, Globe, Zap, Database } from "lucide-react"

const content = {
  badge: { en: "About Rimfactory", ko: "Rimfactory 소개", ja: "Rimfactoryについて" },
  headline: {
    en: "Astrology Meets Science.",
    ko: "점성술, 과학을 만나다.",
    ja: "占星術、科学と出会う。",
  },
  subhead: {
    en: "Rimfactory is an astrology-technology company that digitizes the world's oldest divination systems with modern AI — starting with Korean Four Pillars (사주).",
    ko: "Rimfactory는 세계에서 가장 오래된 점술 체계를 최첨단 AI로 디지털화하는 점성술 테크 기업입니다. 한국 사주(四柱)에서 시작합니다.",
    ja: "Rimfactoryは、世界最古の占術体系を最先端AIでデジタル化する占星術テック企業です。韓国の四柱推命から始めます。",
  },

  // Vision
  visionBadge: { en: "OUR VISION", ko: "비전", ja: "ビジョン" },
  visionTitle: {
    en: "Scientifying Global Astrology",
    ko: "전 세계 점성술의 과학화",
    ja: "世界の占星術を科学する",
  },
  visionDesc: {
    en: "In an age of uncertainty, billions seek guidance from astrology. But most services offer surface-level readings based on crude categorizations. We believe ancient wisdom deserves modern precision. Rimfactory bridges millennia of Eastern philosophy with cutting-edge AI to deliver deeply personalized, trustworthy insights.",
    ko: "불안한 시대, 수십억 명이 점성술에서 답을 찾습니다. 그러나 대부분의 서비스는 조잡한 분류에 기반한 피상적 결과를 제공합니다. 수천 년의 지혜는 현대적 정밀함을 만날 자격이 있습니다. Rimfactory는 동양 철학과 최첨단 AI를 결합해 깊이 있는 맞춤 분석을 제공합니다.",
    ja: "不安な時代、数十億の人々が占星術に答えを求めています。しかし多くのサービスは粗い分類に基づく表面的な結果です。数千年の知恵は現代の精度で語られるべきです。Rimfactoryは東洋哲学と最先端AIを融合し、深くパーソナライズされた分析を提供します。",
  },

  // Products
  productsBadge: { en: "PRODUCTS", ko: "서비스", ja: "サービス" },
  productsTitle: {
    en: "Our Products",
    ko: "서비스 라인업",
    ja: "サービスラインナップ",
  },
  product1Title: { en: "SajuAstrology.com", ko: "SajuAstrology.com", ja: "SajuAstrology.com" },
  product1Badge: { en: "LIVE", ko: "서비스 중", ja: "サービス中" },
  product1Desc: {
    en: "AI-powered Korean Four Pillars reading service. 518,400 unique cosmic profiles, dual AI verification, three-tier pricing (Free / $9.99 / $29.99), and full EN/KO/JA localization. Targeting English-speaking Western users, Japanese users, and K-culture fans globally.",
    ko: "AI 기반 한국 사주 리딩 서비스. 518,400가지 고유 프로필, 이중 AI 검증, 3단계 요금제 (무료/$9.99/$29.99), EN/KO/JA 완전 현지화. 영어권 서양 사용자, 일본 사용자, K-컬처 팬 글로벌 타겟.",
    ja: "AI搭載韓国四柱推命サービス。518,400通りの固有プロフィール、デュアルAI検証、3段階料金（無料/$9.99/$29.99）、EN/KO/JA完全ローカライズ。英語圏・日本・K-cultureファンをグローバルにターゲット。",
  },
  product2Title: { en: "ggmate.me", ko: "ggmate.me", ja: "ggmate.me" },
  product2Badge: { en: "IN DEVELOPMENT", ko: "개발 중", ja: "開発中" },
  product2Desc: {
    en: "Saju-based gaming companion matching for Riot Games titles. Finding your ideal teammates through birth chart compatibility analysis.",
    ko: "사주 기반 라이엇 게임즈 게임 친구 매칭 서비스. 사주 궁합으로 이상적인 팀메이트를 찾아줍니다.",
    ja: "四柱推命ベースのRiot Gamesゲーム仲間マッチングサービス。相性分析で理想のチームメイトを見つけます。",
  },

  // Tech Moat
  moatBadge: { en: "TECHNICAL MOAT", ko: "기술적 해자", ja: "技術的モート" },
  moatTitle: {
    en: "Why We Can't Be Replicated",
    ko: "왜 따라잡을 수 없는가",
    ja: "なぜ追いつけないのか",
  },

  moat1Title: { en: "Classical Theory Corpus", ko: "사주 이론 코퍼스", ja: "古典理論コーパス" },
  moat1Desc: {
    en: "Thousands of years of Eastern metaphysics, structured and vectorized into our LLM pipeline. Not a simple API wrapper — a domain-specialized AI architecture.",
    ko: "수천 년간 축적된 동양 명리학 원전을 구조화·벡터화하여 LLM 파이프라인에 주입. 단순 API 래퍼가 아닌 도메인 특화 AI 아키텍처.",
    ja: "数千年の東洋命理学をLLMパイプラインに構造化・ベクトル化。単なるAPIラッパーではないドメイン特化AIアーキテクチャ。",
  },
  moat2Title: { en: "Multi-LLM Pipeline", ko: "멀티 LLM 파이프라인", ja: "マルチLLMパイプライン" },
  moat2Desc: {
    en: "Gemini (interpretation) + Claude (verification), 5-stage fallback chain achieving 99.9% response reliability. Cross-model validation ensures accuracy no single AI can match.",
    ko: "Gemini(해석) + Claude(검증) 이중 엔진, 5단계 폴백으로 99.9% 응답 안정성. 교차 검증으로 단일 AI가 도달할 수 없는 정확도.",
    ja: "Gemini（解釈）+ Claude（検証）デュアルエンジン、5段階フォールバックで99.9%の応答安定性。クロス検証で単一AIでは到達できない精度。",
  },
  moat3Title: { en: "Prompt Engineering", ko: "프롬프트 엔지니어링", ja: "プロンプトエンジニアリング" },
  moat3Desc: {
    en: "6 months and thousands of iterations refining saju-specialized prompt chains. The result is not reproducible by simply calling an API.",
    ko: "6개월간 수만 회 최적화한 사주 전문 프롬프트 체인. API 콜만으로는 재현 불가.",
    ja: "6ヶ月、数千回の反復で最適化した四柱専門プロンプトチェーン。API呼び出しだけでは再現不可。",
  },
  moat4Title: { en: "Data Compound Effect", ko: "데이터 복리 효과", ja: "データ複利効果" },
  moat4Desc: {
    en: "More users → better AI quality → more users. Time compounds our advantage into an ever-widening gap.",
    ko: "사용자↑ → AI 품질↑ → 사용자↑. 시간이 갈수록 격차가 벌어지는 플라이휠.",
    ja: "ユーザー↑ → AI品質↑ → ユーザー↑。時間とともに差が広がるフライホイール。",
  },

  // Market
  marketBadge: { en: "MARKET", ko: "시장", ja: "市場" },
  marketTitle: {
    en: "A $14B+ Market, Ripe for Disruption",
    ko: "$140억 이상 시장, 파괴적 혁신의 적기",
    ja: "140億ドル以上の市場、破壊的イノベーションの好機",
  },
  marketDesc: {
    en: "The global astrology market exceeds $14 billion and is accelerating online. Japan alone is a ¥1 trillion market transitioning from offline to digital. Existing services are limited: Western astrology offers only 12 types, Korean saju apps are Korean-only with dated UIs, and subscription fatigue is driving users away from monthly-fee models. Rimfactory enters with a one-time payment model, multilingual support, and AI precision that no incumbent offers.",
    ko: "글로벌 점성술 시장은 $140억 이상, 온라인 전환 가속 중. 일본만 1조 엔 시장이 오프라인→온라인 전환 중. 기존 서비스의 한계: 서양 점성술은 12개 유형뿐, 한국 사주 앱은 한국어 only·구식 UI, 구독 모델은 유저 이탈 초래. Rimfactory는 원타임 결제, 다국어 지원, AI 정밀도로 기존 플레이어가 제공하지 못하는 가치를 제공합니다.",
    ja: "グローバル占星術市場は140億ドル以上、オンライン移行が加速。日本だけで1兆円市場がオフライン→オンラインへ移行中。既存サービスの限界：西洋占星術は12タイプのみ、韓国四柱アプリは韓国語のみ・古いUI、サブスクモデルはユーザー離脱を招く。Rimfactoryはワンタイム課金、多言語対応、AI精度で既存プレイヤーにない価値を提供します。",
  },

  // Contact
  contactBadge: { en: "CONTACT", ko: "연락처", ja: "お問い合わせ" },
  contactTitle: {
    en: "Get in Touch",
    ko: "연락하기",
    ja: "お問い合わせ",
  },

  // CTA
  tryCta: {
    en: "Try SajuAstrology — Free",
    ko: "SajuAstrology 무료 체험",
    ja: "SajuAstrology を無料で体験",
  },
} as const

type LKey = "en" | "ko" | "ja"

function tx(obj: Record<string, string>, locale: string): string {
  return obj[locale] || obj.en
}

const moatIcons = [Database, Brain, Zap, TrendingUp]

export default function AboutPage() {
  const { locale } = useLanguage()
  const l = locale as LKey

  const moats = [
    { title: tx(content.moat1Title, l), desc: tx(content.moat1Desc, l) },
    { title: tx(content.moat2Title, l), desc: tx(content.moat2Desc, l) },
    { title: tx(content.moat3Title, l), desc: tx(content.moat3Desc, l) },
    { title: tx(content.moat4Title, l), desc: tx(content.moat4Desc, l) },
  ]

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 sm:pt-36 pb-16 overflow-hidden">
        <motion.div
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-purple-700/20 blur-[160px] pointer-events-none"
        />
        <motion.div
          animate={{ y: [0, 25, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute top-1/4 -right-24 w-[400px] h-[400px] rounded-full bg-yellow-500/15 blur-[140px] pointer-events-none"
        />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary tracking-wider uppercase mb-6">
              {tx(content.badge, l)}
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {tx(content.headline, l)}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {tx(content.subhead, l)}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-xs font-semibold text-secondary tracking-wider uppercase mb-4">
              {tx(content.visionBadge, l)}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold mb-6">
              {tx(content.visionTitle, l)}
            </h2>
            <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
              {tx(content.visionDesc, l)}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Products */}
      <section className="py-16 sm:py-24 bg-card/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary tracking-wider uppercase mb-4">
              {tx(content.productsBadge, l)}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold mb-10">
              {tx(content.productsTitle, l)}
            </h2>
          </motion.div>

          <div className="space-y-6">
            {/* SajuAstrology */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-card border border-border rounded-2xl p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <h3 className="font-serif text-xl sm:text-2xl font-bold">{tx(content.product1Title, l)}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary/20 text-secondary text-xs font-bold tracking-wider">
                  {tx(content.product1Badge, l)}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-5">{tx(content.product1Desc, l)}</p>
              <Link href="/calculate" className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:underline">
                {tx(content.tryCta, l)} <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* ggmate */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <h3 className="font-serif text-xl sm:text-2xl font-bold">{tx(content.product2Title, l)}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-bold tracking-wider">
                  {tx(content.product2Badge, l)}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">{tx(content.product2Desc, l)}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Technical Moat */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary tracking-wider uppercase mb-4">
              {tx(content.moatBadge, l)}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold mb-10">
              {tx(content.moatTitle, l)}
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {moats.map((moat, i) => {
              const Icon = moatIcons[i]
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{moat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{moat.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Market */}
      <section className="py-16 sm:py-24 bg-card/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-xs font-semibold text-secondary tracking-wider uppercase mb-4">
              {tx(content.marketBadge, l)}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold mb-6">
              {tx(content.marketTitle, l)}
            </h2>
            <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
              {tx(content.marketDesc, l)}
            </p>
          </motion.div>

          {/* Key numbers */}
          <div className="grid grid-cols-3 gap-4 mt-10">
            {[
              { num: "$14B+", label: { en: "Global Astrology Market", ko: "글로벌 점성술 시장", ja: "グローバル占星術市場" } },
              { num: "518,400", label: { en: "Unique Saju Profiles", ko: "고유 사주 프로필", ja: "固有四柱プロフィール" } },
              { num: "3", label: { en: "Languages Supported", ko: "지원 언어", ja: "対応言語" } },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-4"
              >
                <p className="font-serif text-2xl sm:text-3xl font-bold gold-gradient-text">{stat.num}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{tx(stat.label, l)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary tracking-wider uppercase mb-4">
              {tx(content.contactBadge, l)}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold mb-6">
              {tx(content.contactTitle, l)}
            </h2>
            <div className="space-y-2 text-muted-foreground">
              <p className="font-medium text-foreground">Rimfactory</p>
              <p>CEO: Chandler Yun</p>
              <p>info@rimfactory.co.kr</p>
              <p>243, 1F, Sindorim Technomart, 97 Saemallo, Guro-gu, Seoul, Korea</p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
