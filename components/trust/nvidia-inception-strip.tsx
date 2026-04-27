"use client"

// ═══════════════════════════════════════════════════════════════════
// NVIDIA Inception Trust Strip — v5 (with explainer modal)
// ─────────────────────────────────────────────────────────────────
// Two-row card:
//   Row 1: Official NVIDIA Inception badge — sized to fill ~80% of
//          the card width with minimal horizontal padding so the
//          badge owns the visual space (chandler's spec: less
//          whitespace around the badge).
//   Row 2: Title + subtitle on the left, arrow on the right.
//
// Click behavior: opens a small modal that explains what the NVIDIA
// Inception program is, in the user's locale. Closes via X button
// or backdrop click. The external link to nvidia.com/startups
// lives inside the modal as a "Learn more" link, not as the card's
// primary action — chandler explicitly asked NOT to navigate away
// from the site directly on tap.
//
// HIDDEN in the native app via the parent hero gating.
//
// Brand compliance (NVIDIA Inception Brand Guidelines):
//   • Official Inception member badge SVG, never recolored/distorted
//   • Native aspect ratio preserved via h-* + w-auto
//   • Clear space respected — badge has its own white background,
//     and the surrounding card pad gives breathing room without
//     wrapping the badge in another shape
//   • Rimfactory navbar logo remains visually larger than this badge
//   • Explainer text describes the program accurately (no
//     misleading endorsement claims)
// ═══════════════════════════════════════════════════════════════════

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { ArrowRight, X } from "lucide-react"

// Program explainer text — fairly stable across markets so we keep
// it inline rather than adding 10 more translation keys for a
// secondary surface. Falls back to English when locale not present.
const EXPLAINER: Record<string, { title: string; body: string; learnMore: string; close: string }> = {
  en: {
    title: "What is NVIDIA Inception?",
    body: "NVIDIA Inception is a global program supporting tech-driven startups in artificial intelligence, data science, and high-performance computing. Members get access to NVIDIA's technology, expertise, and partner network across product development, prototyping, and go-to-market.",
    learnMore: "Learn more on NVIDIA's site →",
    close: "Close",
  },
  ko: {
    title: "NVIDIA Inception이란?",
    body: "NVIDIA Inception은 인공지능(AI), 데이터 과학, 고성능 컴퓨팅(HPC) 분야의 기술 기반 스타트업을 육성하고 성장을 지원하는 글로벌 프로그램입니다. 제품 개발, 프로토타이핑, 시장 진출 등 핵심 성장 단계에서 NVIDIA의 기술력과 파트너 네트워크를 제공합니다.",
    learnMore: "NVIDIA 공식 사이트에서 더 보기 →",
    close: "닫기",
  },
  ja: {
    title: "NVIDIA Inception とは？",
    body: "NVIDIA Inception は、AI、データサイエンス、ハイパフォーマンスコンピューティング分野のテック系スタートアップを育成・支援するグローバルプログラムです。メンバーは製品開発、プロトタイピング、市場参入のあらゆる段階で NVIDIA の技術力とパートナーネットワークを活用できます。",
    learnMore: "NVIDIA 公式サイトで詳しく見る →",
    close: "閉じる",
  },
  es: {
    title: "¿Qué es NVIDIA Inception?",
    body: "NVIDIA Inception es un programa global que apoya a startups tecnológicas en inteligencia artificial, ciencia de datos y computación de alto rendimiento. Los miembros acceden a la tecnología, experiencia y red de socios de NVIDIA durante el desarrollo, prototipado y lanzamiento al mercado.",
    learnMore: "Más información en NVIDIA →",
    close: "Cerrar",
  },
  fr: {
    title: "Qu'est-ce que NVIDIA Inception ?",
    body: "NVIDIA Inception est un programme mondial qui soutient les startups technologiques dans l'intelligence artificielle, la science des données et le calcul haute performance. Les membres accèdent à la technologie, à l'expertise et au réseau de partenaires de NVIDIA pour le développement, le prototypage et la mise sur le marché.",
    learnMore: "En savoir plus sur NVIDIA →",
    close: "Fermer",
  },
  pt: {
    title: "O que é o NVIDIA Inception?",
    body: "O NVIDIA Inception é um programa global que apoia startups de tecnologia em inteligência artificial, ciência de dados e computação de alto desempenho. Os membros têm acesso à tecnologia, expertise e rede de parceiros da NVIDIA em desenvolvimento de produto, prototipagem e go-to-market.",
    learnMore: "Saiba mais no site da NVIDIA →",
    close: "Fechar",
  },
  "zh-TW": {
    title: "什麼是 NVIDIA Inception？",
    body: "NVIDIA Inception 是支持人工智慧、數據科學與高效能運算領域的科技新創全球計畫。成員可在產品開發、原型製作及市場推廣各階段獲得 NVIDIA 的技術、專業與合作夥伴網絡。",
    learnMore: "前往 NVIDIA 官方網站了解更多 →",
    close: "關閉",
  },
  ru: {
    title: "Что такое NVIDIA Inception?",
    body: "NVIDIA Inception — глобальная программа поддержки технологических стартапов в области искусственного интеллекта, науки о данных и высокопроизводительных вычислений. Участники получают доступ к технологиям, экспертизе и партнёрской сети NVIDIA на этапах разработки, прототипирования и выхода на рынок.",
    learnMore: "Подробнее на сайте NVIDIA →",
    close: "Закрыть",
  },
  hi: {
    title: "NVIDIA Inception क्या है?",
    body: "NVIDIA Inception आर्टिफिशियल इंटेलिजेंस, डेटा साइंस और हाई-परफ़ॉर्मेंस कंप्यूटिंग के क्षेत्र में टेक्नोलॉजी आधारित स्टार्टअप्स को सहायता देने वाला वैश्विक कार्यक्रम है। सदस्यों को उत्पाद विकास, प्रोटोटाइपिंग और बाज़ार में उतरने तक हर चरण में NVIDIA की तकनीक, विशेषज्ञता और पार्टनर नेटवर्क मिलता है।",
    learnMore: "NVIDIA की वेबसाइट पर और जानें →",
    close: "बंद करें",
  },
  id: {
    title: "Apa itu NVIDIA Inception?",
    body: "NVIDIA Inception adalah program global yang mendukung startup teknologi di bidang kecerdasan buatan, ilmu data, dan komputasi performa tinggi. Anggota mendapat akses ke teknologi, keahlian, dan jaringan mitra NVIDIA dalam pengembangan produk, prototipe, hingga peluncuran ke pasar.",
    learnMore: "Pelajari lebih lanjut di situs NVIDIA →",
    close: "Tutup",
  },
}

export function NvidiaInceptionStrip() {
  const { t, locale } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const explainer = EXPLAINER[locale] ?? EXPLAINER.en

  // Close on Esc
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    window.addEventListener("keydown", onKey)
    // Lock body scroll when modal open
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
        className="block text-left w-[280px] lg:w-auto group"
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

          {/* ─── Row 1: NVIDIA badge — fills the card horizontally ─── */}
          <div className="flex justify-center mb-2.5">
            <img
              src="/badges/nvidia/inception.svg"
              alt="NVIDIA Inception Program Member"
              className="h-16 sm:h-20 w-full max-w-[240px] lg:max-w-[260px]"
              width="240"
              height="80"
              style={{ objectFit: "contain" }}
            />
          </div>

          {/* ─── Row 2: Title + subtitle (left) + arrow (right) ─── */}
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sky-100 leading-tight">
                {t("trust.nvidiaInception")}
              </p>
              <p className="text-[10px] text-sky-200/70 leading-snug mt-0.5 truncate">
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

            {/* Badge */}
            <div className="flex justify-center mb-4">
              <img
                src="/badges/nvidia/inception.svg"
                alt="NVIDIA Inception Program"
                className="h-12 w-auto"
              />
            </div>

            {/* Title */}
            <h3
              id="nvidia-modal-title"
              className="text-base sm:text-lg font-semibold text-sky-100 text-center mb-3"
            >
              {explainer.title}
            </h3>

            {/* Body */}
            <p className="text-[13px] sm:text-sm text-sky-100/80 leading-relaxed mb-4">
              {explainer.body}
            </p>

            {/* Learn more link (subtle, text only) */}
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
