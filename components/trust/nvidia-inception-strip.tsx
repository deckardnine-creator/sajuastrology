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
    body: "NVIDIA Inception is a global program for startups building what's next in AI. Members access NVIDIA's latest technology, preferred pricing, partner offers, and exposure to a global ecosystem of investors — supporting product development, prototyping, and go-to-market across more than 22,000 AI startups worldwide.",
    learnMore: "Learn more on nvidia.com →",
    close: "Close",
    newLabel: "NEW",
  },
  ko: {
    title: "NVIDIA Inception이란?",
    body: "NVIDIA Inception은 AI의 미래를 만드는 스타트업을 위한 글로벌 프로그램입니다. 전 세계 22,000개 이상의 AI 스타트업이 참여하며, 멤버는 NVIDIA의 최신 기술, 우대 가격, 파트너 혜택, 그리고 글로벌 투자자 생태계 노출의 혜택을 받아 제품 개발·프로토타이핑·시장 진출 단계에서 성장을 가속합니다.",
    learnMore: "NVIDIA 공식 사이트에서 더 보기 →",
    close: "닫기",
    newLabel: "신규",
  },
  ja: {
    title: "NVIDIA Inception とは？",
    body: "NVIDIA Inception は、AI の次世代を切り拓くスタートアップを支援するグローバルプログラムです。世界中の22,000社以上の AI スタートアップが参加し、メンバーは NVIDIA の最新技術、優待価格、パートナー特典、そしてグローバルな投資家エコシステムへの露出といった支援を、製品開発・プロトタイピング・市場参入の各段階で受けることができます。",
    learnMore: "NVIDIA 公式サイトで詳しく見る →",
    close: "閉じる",
    newLabel: "新規",
  },
  es: {
    title: "¿Qué es NVIDIA Inception?",
    body: "NVIDIA Inception es un programa global para startups que están construyendo el futuro de la IA. Más de 22.000 startups acceden a la tecnología más reciente de NVIDIA, precios preferentes, ofertas de socios y exposición a un ecosistema global de inversores en cada etapa del desarrollo de producto y salida al mercado.",
    learnMore: "Más información en nvidia.com →",
    close: "Cerrar",
    newLabel: "NUEVO",
  },
  fr: {
    title: "Qu'est-ce que NVIDIA Inception ?",
    body: "NVIDIA Inception est un programme mondial pour les startups qui construisent l'avenir de l'IA. Plus de 22 000 startups accèdent aux dernières technologies NVIDIA, à des tarifs préférentiels, à des offres de partenaires et à un écosystème mondial d'investisseurs, à chaque étape du développement produit et du go-to-market.",
    learnMore: "En savoir plus sur nvidia.com →",
    close: "Fermer",
    newLabel: "NOUVEAU",
  },
  pt: {
    title: "O que é o NVIDIA Inception?",
    body: "O NVIDIA Inception é um programa global para startups que constroem o futuro da IA. Mais de 22.000 startups acessam a tecnologia mais recente da NVIDIA, preços preferenciais, ofertas de parceiros e exposição a um ecossistema global de investidores em cada etapa do desenvolvimento e go-to-market.",
    learnMore: "Saiba mais em nvidia.com →",
    close: "Fechar",
    newLabel: "NOVO",
  },
  "zh-TW": {
    title: "什麼是 NVIDIA Inception？",
    body: "NVIDIA Inception 是支持打造 AI 未來的新創企業的全球計畫。全球超過 22,000 家 AI 新創公司參與其中，成員可獲得 NVIDIA 最新技術、優惠價格、合作夥伴福利，以及全球投資人生態系統的曝光，加速產品開發、原型製作及市場推廣。",
    learnMore: "前往 nvidia.com 了解更多 →",
    close: "關閉",
    newLabel: "最新",
  },
  ru: {
    title: "Что такое NVIDIA Inception?",
    body: "NVIDIA Inception — глобальная программа для стартапов, создающих будущее ИИ. Более 22 000 стартапов получают доступ к новейшим технологиям NVIDIA, льготным ценам, партнёрским предложениям и глобальной экосистеме инвесторов на каждом этапе разработки продукта и выхода на рынок.",
    learnMore: "Подробнее на nvidia.com →",
    close: "Закрыть",
    newLabel: "НОВОЕ",
  },
  hi: {
    title: "NVIDIA Inception क्या है?",
    body: "NVIDIA Inception AI का भविष्य बनाने वाले स्टार्टअप्स के लिए वैश्विक कार्यक्रम है। दुनिया भर के 22,000 से अधिक AI स्टार्टअप्स को NVIDIA की नवीनतम तकनीक, पसंदीदा मूल्य, साझेदार ऑफ़र और वैश्विक निवेशक नेटवर्क तक पहुँच मिलती है — उत्पाद विकास, प्रोटोटाइपिंग और बाज़ार में उतरने के हर चरण में।",
    learnMore: "nvidia.com पर और जानें →",
    close: "बंद करें",
    newLabel: "नया",
  },
  id: {
    title: "Apa itu NVIDIA Inception?",
    body: "NVIDIA Inception adalah program global untuk startup yang membangun masa depan AI. Lebih dari 22.000 startup di seluruh dunia mengakses teknologi terbaru NVIDIA, harga preferensial, penawaran mitra, dan paparan ke ekosistem investor global di setiap tahap pengembangan produk dan peluncuran ke pasar.",
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

          {/* ─── Row 1: NVIDIA badge — fills card horizontally ─── */}
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

          {/* ─── Row 2: Title (left) + arrow (right) ─── */}
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              {/* Title + NEW pill */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-sm font-semibold text-sky-100 leading-tight">
                  {t("trust.nvidiaInception")}
                </p>
                <span
                  className="
                    inline-flex items-center gap-1
                    px-1.5 py-0.5 rounded-md
                    bg-emerald-500/20
                    border border-emerald-400/40
                    text-[9px] font-bold tracking-wide
                    text-emerald-300
                    leading-none
                    shrink-0
                  "
                >
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                  {explainer.newLabel} · {datePill}
                </span>
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
