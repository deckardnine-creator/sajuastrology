"use client"

// ═══════════════════════════════════════════════════════════════════
// NVIDIA Inception Trust Strip — v6
// ─────────────────────────────────────────────────────────────────
// Changes from v5:
//   • The "(26.4)" date is no longer inline with the title — it has
//     been promoted to a green "NEW · Apr 2026" pill that sits to
//     the right of the title row. This keeps the title clean
//     ("Selected by NVIDIA Inception") while making the recency
//     signal louder, since chandler called it the most important bit.
//   • The modal now repeats the "won/selected" header at the top
//     (badge + title + NEW pill) BEFORE the explainer body, so users
//     who tap don't lose context of what they just clicked.
//
// Click behavior unchanged — opens explainer modal in user's locale,
// closes via X / backdrop / ESC.
//
// HIDDEN in the native app via the parent hero gating.
//
// Brand compliance (NVIDIA Inception Brand Guidelines):
//   • Official Inception member badge SVG, never recolored/distorted
//   • Native aspect ratio preserved
//   • Clear space respected
//   • Rimfactory navbar logo remains visually larger than this badge
// ═══════════════════════════════════════════════════════════════════

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { ArrowRight, X } from "lucide-react"

// Per-locale strings used inside the modal. Title/date come from the
// shared translations.ts so the card and modal header stay in sync.
const EXPLAINER: Record<string, { title: string; body: string; learnMore: string; close: string; newLabel: string }> = {
  en: {
    title: "What is NVIDIA Inception?",
    body: "NVIDIA Inception is NVIDIA's global program for startups building what's next in AI. It selects technology-driven startups across artificial intelligence, data science, and high-performance computing (HPC), and provides NVIDIA's latest technology, preferred pricing, a global partner network, and exposure to the venture capital ecosystem — accelerating critical growth stages from product development through prototyping to go-to-market.",
    learnMore: "Learn more on nvidia.com →",
    close: "Close",
    newLabel: "NEW",
  },
  ko: {
    title: "NVIDIA Inception이란?",
    body: "NVIDIA Inception은 AI의 미래를 만드는 스타트업을 위한 NVIDIA의 글로벌 프로그램입니다. 인공지능(AI), 데이터 과학, 고성능 컴퓨팅(HPC) 분야의 기술 기반 스타트업을 선발하여, 제품 개발에서 프로토타이핑, 시장 진출까지 핵심 성장 단계에서 NVIDIA의 최신 기술, 우대 가격, 글로벌 파트너 네트워크, 그리고 벤처 캐피털 생태계로의 노출을 제공합니다.",
    learnMore: "NVIDIA 공식 사이트에서 더 보기 →",
    close: "닫기",
    newLabel: "신규",
  },
  ja: {
    title: "NVIDIA Inception とは？",
    body: "NVIDIA Inception は、AI の未来を切り拓くスタートアップのための NVIDIA グローバルプログラムです。人工知能（AI）、データサイエンス、ハイパフォーマンスコンピューティング（HPC）分野のテクノロジー主導型スタートアップを選抜し、製品開発からプロトタイピング、市場参入に至る重要な成長段階において、NVIDIA の最新技術、優待価格、グローバルパートナーネットワーク、そしてベンチャーキャピタル・エコシステムへの露出を提供します。",
    learnMore: "NVIDIA 公式サイトで詳しく見る →",
    close: "閉じる",
    newLabel: "新規",
  },
  es: {
    title: "¿Qué es NVIDIA Inception?",
    body: "NVIDIA Inception es el programa global de NVIDIA para startups que construyen el futuro de la IA. Selecciona startups impulsadas por la tecnología en inteligencia artificial, ciencia de datos y computación de alto rendimiento (HPC), y ofrece la tecnología más reciente de NVIDIA, precios preferentes, una red global de socios y exposición al ecosistema de capital de riesgo, acelerando las etapas críticas de crecimiento desde el desarrollo de producto hasta la salida al mercado.",
    learnMore: "Más información en nvidia.com →",
    close: "Cerrar",
    newLabel: "NUEVO",
  },
  fr: {
    title: "Qu'est-ce que NVIDIA Inception ?",
    body: "NVIDIA Inception est le programme mondial de NVIDIA dédié aux startups qui construisent l'avenir de l'IA. Il sélectionne des startups axées sur la technologie dans les domaines de l'intelligence artificielle, de la science des données et du calcul haute performance (HPC), et leur fournit les dernières technologies NVIDIA, des tarifs préférentiels, un réseau mondial de partenaires, ainsi qu'une exposition à l'écosystème du capital-risque — accélérant les étapes clés de croissance, du développement produit au prototypage et à la mise sur le marché.",
    learnMore: "En savoir plus sur nvidia.com →",
    close: "Fermer",
    newLabel: "NOUVEAU",
  },
  pt: {
    title: "O que é o NVIDIA Inception?",
    body: "O NVIDIA Inception é o programa global da NVIDIA para startups que constroem o futuro da IA. Seleciona startups orientadas à tecnologia em inteligência artificial, ciência de dados e computação de alto desempenho (HPC), oferecendo a tecnologia mais recente da NVIDIA, preços preferenciais, uma rede global de parceiros e exposição ao ecossistema de capital de risco — acelerando etapas críticas de crescimento, do desenvolvimento de produto à prototipagem e ao go-to-market.",
    learnMore: "Saiba mais em nvidia.com →",
    close: "Fechar",
    newLabel: "NOVO",
  },
  "zh-TW": {
    title: "什麼是 NVIDIA Inception？",
    body: "NVIDIA Inception 是 NVIDIA 為打造 AI 未來的新創企業而設的全球計畫。計畫嚴選人工智慧（AI）、數據科學及高效能運算（HPC）領域的技術主導型新創公司，提供 NVIDIA 最新技術、優惠價格、全球合作夥伴網絡，以及進入創投生態系的曝光機會 — 加速從產品開發、原型製作到市場推廣的關鍵成長階段。",
    learnMore: "前往 nvidia.com 了解更多 →",
    close: "關閉",
    newLabel: "最新",
  },
  ru: {
    title: "Что такое NVIDIA Inception?",
    body: "NVIDIA Inception — глобальная программа NVIDIA для стартапов, создающих будущее ИИ. Программа отбирает технологически ориентированные стартапы в области искусственного интеллекта, науки о данных и высокопроизводительных вычислений (HPC) и предоставляет новейшие технологии NVIDIA, льготные цены, глобальную партнёрскую сеть и доступ к экосистеме венчурного капитала — ускоряя ключевые этапы роста от разработки продукта до прототипирования и выхода на рынок.",
    learnMore: "Подробнее на nvidia.com →",
    close: "Закрыть",
    newLabel: "НОВОЕ",
  },
  hi: {
    title: "NVIDIA Inception क्या है?",
    body: "NVIDIA Inception, AI का भविष्य बनाने वाले स्टार्टअप्स के लिए NVIDIA का वैश्विक कार्यक्रम है। यह आर्टिफिशियल इंटेलिजेंस (AI), डेटा साइंस और हाई-परफ़ॉर्मेंस कंप्यूटिंग (HPC) के क्षेत्र में टेक्नोलॉजी-संचालित स्टार्टअप्स का चयन करता है, और उत्पाद विकास से लेकर प्रोटोटाइपिंग और बाज़ार में उतरने तक के प्रमुख विकास चरणों में NVIDIA की नवीनतम तकनीक, पसंदीदा मूल्य, वैश्विक पार्टनर नेटवर्क और वेंचर कैपिटल इकोसिस्टम तक पहुँच प्रदान करता है।",
    learnMore: "nvidia.com पर और जानें →",
    close: "बंद करें",
    newLabel: "नया",
  },
  id: {
    title: "Apa itu NVIDIA Inception?",
    body: "NVIDIA Inception adalah program global NVIDIA untuk startup yang membangun masa depan AI. Program ini menyeleksi startup berbasis teknologi di bidang kecerdasan buatan (AI), ilmu data, dan komputasi performa tinggi (HPC), dan menyediakan teknologi terbaru NVIDIA, harga preferensial, jaringan mitra global, serta paparan ke ekosistem modal ventura — mempercepat tahapan pertumbuhan kritis dari pengembangan produk hingga prototipe dan peluncuran ke pasar.",
    learnMore: "Pelajari lebih lanjut di nvidia.com →",
    close: "Tutup",
    newLabel: "BARU",
  },
}

// Date pill text (compact recency stamp). Kept short on purpose.
const DATE_PILL: Record<string, string> = {
  en: "Apr 2026",
  ko: "2026.4",
  ja: "2026.4",
  es: "Abr 2026",
  fr: "Avr 2026",
  pt: "Abr 2026",
  "zh-TW": "2026.4",
  ru: "Апр 2026",
  hi: "अप्रैल 2026",
  id: "Apr 2026",
}

export function NvidiaInceptionStrip() {
  const { t, locale } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const explainer = EXPLAINER[locale] ?? EXPLAINER.en
  const datePill = DATE_PILL[locale] ?? DATE_PILL.en

  // Close on Esc + scroll lock
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    window.addEventListener("keydown", onKey)
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = original
    }
  }, [isOpen])

  return (
    <>
      {/* ═══ Trust card (button — opens explainer modal) ═══ */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={explainer.title}
        className="block text-left w-[280px] lg:w-[320px] mx-auto sm:mx-0 group"
      >
        <div
          className="
            relative overflow-hidden rounded-xl
            border border-sky-400/40
            bg-gradient-to-br from-sky-500/10 via-cyan-400/5 to-transparent
            backdrop-blur-sm
            pl-3 pr-3 py-3
            transition-all duration-200
            hover:border-sky-300/70
            hover:shadow-[0_8px_24px_rgba(56,189,248,0.25)]
            active:scale-[0.99]
          "
        >
          {/* Cyan/sky left accent bar */}
          <span
            aria-hidden="true"
            className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-gradient-to-b from-sky-300 to-cyan-500"
          />

          {/* ─── Row 1: NVIDIA badge — fills card horizontally ─── */}
          <div className="flex justify-center mb-1.5">
            <img
              src="/badges/nvidia/inception.svg"
              alt="NVIDIA Inception Program Member"
              className="h-16 sm:h-20 w-full max-w-[240px] lg:max-w-[260px]"
              width="240"
              height="80"
              style={{ objectFit: "contain" }}
            />
          </div>

          {/* ─── Row 2: Title (left) + arrow (right) ─── */}
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              {/* v6.17.59 — Title now includes date inline as "(2026.4)" 
                  to keep it on a single line on mobile (280px width).
                  The pulsing green dot remains as the "NEW" signal. */}
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <p className="text-[13px] sm:text-sm font-semibold text-sky-100 leading-tight truncate">
                  {t("trust.nvidiaInception")} ({datePill})
                </p>
              </div>
              <p className="text-[10px] text-sky-200/70 leading-snug mt-1 truncate">
                {t("trust.nvidiaInceptionDate")}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-sky-300/80 shrink-0 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </button>

      {/* ═══ Explainer modal ═══ */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="nvidia-modal-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Modal panel */}
          <div
            className="
              relative z-10 w-full max-w-md
              max-h-[85vh] overflow-y-auto
              rounded-2xl
              bg-gradient-to-br from-slate-900 via-sky-950/40 to-slate-900
              border border-sky-400/30
              shadow-2xl shadow-sky-900/50
              p-5 sm:p-6
            "
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={explainer.close}
              className="
                absolute top-3 right-3
                w-8 h-8 rounded-full
                flex items-center justify-center
                text-sky-200/70 hover:text-white
                hover:bg-white/10
                transition-colors
              "
            >
              <X className="w-4 h-4" />
            </button>

            {/* ─── HEADER: repeats the "what user just clicked" context ─── */}
            <div className="mb-5 pb-5 border-b border-sky-400/15">
              {/* Badge */}
              <div className="flex justify-center mb-3">
                <img
                  src="/badges/nvidia/inception.svg"
                  alt="NVIDIA Inception Program Member"
                  className="h-14 w-auto"
                />
              </div>

              {/* Title + NEW pill */}
              <div className="flex items-center justify-center gap-2 flex-wrap mb-1">
                <p className="text-sm sm:text-base font-semibold text-sky-100 text-center">
                  {t("trust.nvidiaInception")}
                </p>
                <span
                  className="
                    inline-flex items-center gap-1
                    px-2 py-0.5 rounded-md
                    bg-emerald-500/20
                    border border-emerald-400/40
                    text-[10px] font-bold tracking-wide
                    text-emerald-300
                    leading-none
                  "
                >
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  {explainer.newLabel} · {datePill}
                </span>
              </div>

              {/* Subtitle (Astrotech AI Startup) */}
              <p className="text-xs text-sky-200/70 text-center">
                {t("trust.nvidiaInceptionDate")}
              </p>
            </div>

            {/* ─── EXPLAINER BODY ─── */}
            <h3
              id="nvidia-modal-title"
              className="text-base font-semibold text-sky-100 mb-3"
            >
              {explainer.title}
            </h3>

            <p className="text-[13px] sm:text-sm text-sky-100/80 leading-relaxed mb-5">
              {explainer.body}
            </p>

            {/* Learn more link */}
            <a
              href="https://www.nvidia.com/en-us/startups/"
              target="_blank"
              rel="noopener noreferrer"
              className="
                block text-center
                text-xs sm:text-sm text-sky-300/80 hover:text-sky-200
                transition-colors
              "
            >
              {explainer.learnMore}
            </a>
          </div>
        </div>
      )}
    </>
  )
}
