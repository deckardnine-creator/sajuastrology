import type { Metadata } from "next"
import WhitepaperClient from "@/components/whitepaper/whitepaper-client"

export const metadata: Metadata = {
  title: "RimSaju 엔진 백서 — 사주명리학의 정보시스템적 표준화 | Rimfactory",
  description:
    "RimSaju v2 백서. 사주명리학을 정보시스템적 방법론으로 표준화하는 4년 빌드 로드맵 — RAG, 임베딩, 평가 프로토콜의 설계 원리. NVIDIA Inception 멤버 Rimfactory 작성.",
  openGraph: {
    title: "RimSaju 엔진 백서 — 사주명리학의 정보시스템적 표준화",
    description:
      "사주명리학의 LLM·RAG 기반 표준화 — v1 (운영 중), v2 (2년 빌드), v3 (추가 2년 확장). 4년 통합 로드맵과 시스템 설계 원리.",
    url: "https://sajuastrology.com/whitepaper",
    siteName: "SajuAstrology",
    type: "article",
    images: [{
      url: "https://sajuastrology.com/letter/letter-01-hero.webp",
      width: 1920,
      height: 1071,
      alt: "RimSaju Whitepaper — Rimfactory",
      type: "image/webp",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RimSaju 엔진 백서 — 사주명리학의 정보시스템적 표준화",
    description:
      "사주명리학의 LLM·RAG 기반 4년 빌드 로드맵. NVIDIA Inception 멤버 Rimfactory 기술 백서.",
    images: ["https://sajuastrology.com/letter/letter-01-hero.webp"],
  },
  alternates: {
    canonical: "https://sajuastrology.com/whitepaper",
    languages: {
      "x-default": "https://sajuastrology.com/whitepaper",
      ko: "https://sajuastrology.com/whitepaper",
      en: "https://sajuastrology.com/whitepaper",
      ja: "https://sajuastrology.com/whitepaper",
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
  },
}

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "RimSaju Whitepaper — Information-Systems Standardization of Saju Astrology",
  description:
    "Technical whitepaper on standardizing Saju (Four Pillars) astrology through LLM and RAG methodologies. v1 in production, v2 in 2-year build, v3 in additional 2-year extension.",
  author: {
    "@type": "Person",
    name: "Chandler",
    affiliation: {
      "@type": "Organization",
      name: "Rimfactory",
      url: "https://rimfactory.io",
    },
  },
  publisher: {
    "@type": "Organization",
    name: "Rimfactory",
    logo: {
      "@type": "ImageObject",
      url: "https://sajuastrology.com/logo1.png",
    },
  },
  datePublished: "2026-05-01",
  inLanguage: ["ko", "en", "ja"],
  mainEntityOfPage: "https://sajuastrology.com/whitepaper",
  about: [
    "Saju astrology",
    "Four Pillars",
    "LLM",
    "Retrieval-Augmented Generation",
    "Astrotech AI",
  ],
}

export default function WhitepaperPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <WhitepaperClient initialLocale="ko" />
    </>
  )
}
