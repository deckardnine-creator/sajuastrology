import type { Metadata } from "next"
import LetterClient from "@/components/letter/letter-client"

export const metadata: Metadata = {
  title: "A Letter from Rimfactory — SajuAstrology",
  description: "A message from Rimfactory, the team behind SajuAstrology. How our engine works, where v2 is going, and our commitment to open benchmarks and peer-reviewed research.",
  openGraph: {
    title: "A Letter from Rimfactory — SajuAstrology",
    description: "Not another fortune-telling app. A message from the team building SajuAstrology — classical texts, vector search, multi-LLM verification, and the open roadmap to v2.",
    url: "https://sajuastrology.com/letter",
    siteName: "SajuAstrology",
    type: "article",
    images: [{
      url: "https://sajuastrology.com/letter/letter-01-hero.webp",
      width: 1920,
      height: 1071,
      alt: "A Letter from Rimfactory — The oldest wisdom, in the most rigorous language",
      type: "image/webp",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "A Letter from Rimfactory — SajuAstrology",
    description: "How SajuAstrology's engine works, and where v2 is going. Classical texts, vector search, and an open-source benchmark plan.",
    images: ["https://sajuastrology.com/letter/letter-01-hero.webp"],
  },
  alternates: {
    canonical: "https://sajuastrology.com/letter",
    languages: {
      "x-default": "https://sajuastrology.com/letter",
      en: "https://sajuastrology.com/letter",
      ko: "https://sajuastrology.com/letter",
      ja: "https://sajuastrology.com/letter",
    },
  },
}

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "A Letter from Rimfactory",
  description: "A message from Rimfactory, the team behind SajuAstrology. Our approach, technology, and roadmap toward v2 with open benchmarks.",
  author: {
    "@type": "Organization",
    name: "Rimfactory",
    url: "https://sajuastrology.com/about",
  },
  publisher: {
    "@type": "Organization",
    name: "Rimfactory",
    logo: {
      "@type": "ImageObject",
      url: "https://sajuastrology.com/logo1.png",
    },
  },
  datePublished: "2026-04-11",
  inLanguage: ["en", "ko", "ja"],
  mainEntityOfPage: "https://sajuastrology.com/letter",
}

export default function LetterPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <LetterClient />
    </>
  )
}
