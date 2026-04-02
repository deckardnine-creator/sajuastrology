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
    en: "Ancient Wisdom. Modern Intelligence.",
    ko: "고전의 지혜. 현대의 지능.",
    ja: "古典の知恵。現代の知能。",
  },
  subhead: {
    en: "Rimfactory is a cultural intelligence company that applies vector search, retrieval-augmented generation, and multi-model AI validation to classical Eastern wisdom systems — starting with Korean Four Pillars (사주).",
    ko: "Rimfactory는 벡터 검색, 검색 증강 생성(RAG), 멀티 모델 AI 교차 검증을 고전 동양 명리 체계에 적용하는 문화 분석 테크 기업입니다. 한국 사주(四柱)에서 시작합니다.",
    ja: "Rimfactoryは、ベクトル検索、RAG（検索拡張生成）、マルチモデルAI交差検証を古典東洋命理体系に適用する文化分析テック企業です。韓国の四柱推命から始めます。",
  },

  // Vision
  visionBadge: { en: "OUR VISION", ko: "비전", ja: "ビジョン" },
  visionTitle: {
    en: "Computational Astrology at Scale",
    ko: "전 세계 점성술의 과학화",
    ja: "世界の占星術をコンピュテーショナルに",
  },
  visionDesc: {
    en: "In an age of uncertainty, billions seek guidance from astrology. But most services offer surface-level readings based on crude categorizations. We believe millennia of accumulated pattern recognition deserves rigorous computational analysis. Rimfactory bridges 2,000+ years of Eastern metaphysical theory with retrieval-augmented AI — every reading grounded in classical source texts, every claim verifiable.",
    ko: "불안한 시대, 수십억 명이 점성술에서 답을 찾습니다. 그러나 대부분의 서비스는 조잡한 분류에 기반한 피상적 결과를 제공합니다. 수천 년간 축적된 패턴 인식은 엄밀한 연산 분석을 받을 자격이 있습니다. Rimfactory는 2,000년 이상의 동양 명리학을 검색 증강 AI와 결합 — 모든 리딩은 고전 원전에 근거하고, 모든 판단은 검증 가능합니다.",
    ja: "不安な時代、数十億の人々が占星術に答えを求めています。しかし多くのサービスは粗い分類に基づく表面的な結果です。数千年蓄積されたパターン認識は厳密な計算分析に値します。Rimfactoryは2,000年以上の東洋命理学を検索拡張AIと融合 — すべての鑑定は古典原典に根拠を持ち、すべての判断は検証可能です。",
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
    en: "AI-powered Korean Four Pillars reading service. 518,400 unique cosmic profiles, RAG engine analyzing 562 classical passages per reading, multi-LLM verification, three-tier pricing (Free / $9.99 / $29.99), full EN/KO/JA localization.",
    ko: "AI 기반 한국 사주 리딩 서비스. 518,400가지 고유 프로필, 562개 고전 패시지 실시간 RAG 분석, 멀티 LLM 교차 검증, 3단계 요금제 (무료/$9.99/$29.99), EN/KO/JA 완전 현지화.",
    ja: "AI搭載韓国四柱推命サービス。518,400通りの固有プロフィール、562古典パッセージのリアルタイムRAG分析、マルチLLMクロス検証、3段階料金（無料/$9.99/$29.99）、EN/KO/JA完全ローカライズ。",
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

  moat1Title: { en: "Classical Theory RAG Engine", ko: "고전 이론 RAG 엔진", ja: "古典理論RAGエンジン" },
  moat1Desc: {
    en: "562 passages from 5 foundational texts (滴天髓, 穷通宝鉴, 子平真诠, 渊海子平, 格局论命) — vectorized into 1,536-dimensional embeddings and matched to each user's birth chart in real time via cosine similarity search. Not a lookup table — a live retrieval-augmented generation pipeline.",
    ko: "적천수·궁통보감·자평진전·연해자평·격국론명 5대 원전에서 추출한 562개 패시지를 1,536차원 벡터로 임베딩, 사용자의 사주에 실시간 코사인 유사도 매칭. 단순 검색이 아닌 RAG(검색 증강 생성) 파이프라인.",
    ja: "滴天髓・穹通宝鑑・子平真詮・淵海子平・格局論命の5大原典から562パッセージを1,536次元ベクトルに埋め込み、ユーザーの四柱にリアルタイムでコサイン類似度マッチング。単なる検索ではないRAGパイプライン。",
  },
  moat2Title: { en: "RAG + Multi-LLM Pipeline", ko: "RAG + 멀티 LLM 파이프라인", ja: "RAG + マルチLLMパイプライン" },
  moat2Desc: {
    en: "Classical passages injected into prompts via vector search → Gemini (interpretation) + Claude (verification), 5-stage fallback achieving 99.9% uptime. Each reading cites specific classical sources with similarity scores — verifiable, not hallucinated.",
    ko: "벡터 검색으로 고전 구절을 프롬프트에 주입 → Gemini(해석) + Claude(검증) 5단계 폴백으로 99.9% 가동률. 모든 리딩에 고전 원전명과 유사도 점수가 명시 — 검증 가능한 근거 기반.",
    ja: "ベクトル検索で古典をプロンプトに注入 → Gemini（解釈）+ Claude（検証）5段階フォールバックで99.9%稼働率。各鑑定に原典名と類似度スコアを明示 — 検証可能な根拠ベース。",
  },
  moat3Title: { en: "Domain-Specialized Architecture", ko: "도메인 특화 아키텍처", ja: "ドメイン特化アーキテクチャ" },
  moat3Desc: {
    en: "Purpose-built saju calculation engine (만세력 calendar + solar time correction), custom embedding pipeline, and 6 months of prompt optimization across 3 languages. The stack is not reproducible by calling a generic API.",
    ko: "만세력 기반 사주 계산 엔진(진태양시 보정), 맞춤 임베딩 파이프라인, 3개 언어 6개월 프롬프트 최적화. 범용 API 호출로는 재현 불가능한 기술 스택.",
    ja: "万年暦ベース四柱計算エンジン（真太陽時補正）、カスタム埋め込みパイプライン、3言語6ヶ月のプロンプト最適化。汎用APIでは再現不可能な技術スタック。",
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

export default function AboutClient() {
  const { locale } = useLanguage()
  const l = locale as LKey

  const moats = [
    { title: tx(content.moat1Title, l), desc: tx(content.moat1Desc, l) },
    { title: tx(content.moat2Title, l), desc: tx(content.moat2Desc, l) },
    { title: tx(content.moat3Title, l), desc: tx(content.moat3Desc, l) },
    { title: tx(content.moat4Title, l), desc: tx(content.moat4Desc, l) },
  ]

  return (
    <main className="min-h-screen relative">
      <Navbar />

      {/* Scientific dot-line network background — mobile optimized */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <svg className="w-full h-full" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="0.8" fill="rgba(242, 202, 80, 0.12)" />
            </pattern>
            <pattern id="dotGridLarge" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <circle cx="60" cy="60" r="1.5" fill="rgba(242, 202, 80, 0.08)" />
            </pattern>
          </defs>
          {/* Dot grids — visible on all screens */}
          <rect width="100%" height="100%" fill="url(#dotGrid)" />
          <rect width="100%" height="100%" fill="url(#dotGridLarge)" />
        </svg>
        {/* Lines + nodes + hexagons — desktop only (hidden on mobile for performance) */}
        <svg className="hidden md:block absolute inset-0 w-full h-full" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
          {/* Connecting lines */}
          <g stroke="rgba(242, 202, 80, 0.04)" strokeWidth="0.5" fill="none">
            <line x1="120" y1="135" x2="300" y2="72" />
            <line x1="300" y1="72" x2="480" y2="162" />
            <line x1="480" y1="162" x2="420" y2="270" />
            <line x1="420" y1="270" x2="120" y2="135" />
            <line x1="720" y1="45" x2="900" y2="108" />
            <line x1="900" y1="108" x2="1020" y2="225" />
            <line x1="1020" y1="225" x2="840" y2="315" />
            <line x1="840" y1="315" x2="720" y2="45" />
            <line x1="180" y1="405" x2="360" y2="495" />
            <line x1="360" y1="495" x2="240" y2="630" />
            <line x1="240" y1="630" x2="60" y2="540" />
            <line x1="60" y1="540" x2="180" y2="405" />
            <line x1="660" y1="450" x2="840" y2="405" />
            <line x1="840" y1="405" x2="960" y2="540" />
            <line x1="960" y1="540" x2="780" y2="630" />
            <line x1="780" y1="630" x2="660" y2="450" />
            <line x1="300" y1="720" x2="540" y2="765" />
            <line x1="540" y1="765" x2="480" y2="855" />
            <line x1="480" y1="855" x2="240" y2="810" />
            <line x1="240" y1="810" x2="300" y2="720" />
            <line x1="900" y1="675" x2="1080" y2="720" />
            <line x1="1080" y1="720" x2="1020" y2="855" />
            <line x1="1020" y1="855" x2="900" y2="675" />
          </g>
          {/* Node highlights */}
          <g fill="rgba(242, 202, 80, 0.06)">
            <circle cx="120" cy="135" r="3" />
            <circle cx="300" cy="72" r="2.5" />
            <circle cx="480" cy="162" r="3.5" />
            <circle cx="900" cy="108" r="3" />
            <circle cx="1020" cy="225" r="2.5" />
            <circle cx="360" cy="495" r="3" />
            <circle cx="840" cy="405" r="3.5" />
            <circle cx="660" cy="450" r="2.5" />
            <circle cx="540" cy="765" r="3" />
            <circle cx="1080" cy="720" r="2.5" />
          </g>
          {/* Hexagons (면) */}
          <g stroke="rgba(89, 222, 155, 0.03)" strokeWidth="0.5" fill="rgba(89, 222, 155, 0.01)">
            <polygon points="200,100 230,85 260,100 260,130 230,145 200,130" />
            <polygon points="700,300 730,285 760,300 760,330 730,345 700,330" />
            <polygon points="400,500 430,485 460,500 460,530 430,545 400,530" />
            <polygon points="100,700 130,685 160,700 160,730 130,745 100,730" />
            <polygon points="950,550 980,535 1010,550 1010,580 980,595 950,580" />
          </g>
        </svg>
      </div>

      {/* Hero */}
      <section className="relative z-10 pt-28 sm:pt-36 pb-16 overflow-hidden">
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
      <section className="relative z-10 py-16 sm:py-24">
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
      <section className="relative z-10 py-16 sm:py-24 bg-card/50">
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
      <section className="relative z-10 py-16 sm:py-24">
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
      <section className="relative z-10 py-16 sm:py-24 bg-card/50">
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
            {[
              { num: "$14B+", label: { en: "Global Astrology Market", ko: "글로벌 점성술 시장", ja: "グローバル占星術市場" } },
              { num: "518K+", label: { en: "Unique Saju Profiles", ko: "고유 사주 프로필", ja: "固有四柱プロフィール" } },
              { num: "562", label: { en: "Classical Passages Indexed", ko: "고전 원전 패시지", ja: "古典パッセージ" } },
              { num: "3", label: { en: "Languages Supported", ko: "지원 언어", ja: "対応言語" } },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-3 sm:p-4"
              >
                <p className="font-serif text-xl sm:text-3xl font-bold gold-gradient-text whitespace-nowrap">{stat.num}</p>
                <p className="text-[11px] sm:text-sm text-muted-foreground mt-1 leading-tight">{tx(stat.label, l)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="relative z-10 py-16 sm:py-24">
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
              <p>CEO: Cho Yeon Yun</p>
              <p>info@rimfactory.io</p>
              <p>243, 1F, Sindorim Technomart, 97 Saemallo, Guro-gu, Seoul, Korea</p>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  )
}
