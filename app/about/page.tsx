import type { Metadata } from "next"
import AboutClient from "@/components/about/about-client"

export const metadata: Metadata = {
  title: "About Rimfactory — Cultural Intelligence Company",
  description: "Rimfactory applies retrieval-augmented generation (RAG) and multi-model AI to classical Eastern wisdom systems. 562 classical passages, 518,400 unique profiles, 3 languages.",
  openGraph: {
    title: "Rimfactory — Ancient Wisdom. Modern Intelligence.",
    description: "Cultural intelligence company. RAG-powered Korean Four Pillars personality analytics with 562 classical passages, 518,400 unique profiles, multi-LLM verification.",
    url: "https://sajuastrology.com/about",
    siteName: "SajuAstrology",
    type: "website",
    images: [{
      url: "https://sajuastrology.com/og-image1.png",
      width: 1200,
      height: 630,
      alt: "Rimfactory — Ancient Wisdom Meets Modern AI",
      type: "image/png",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rimfactory — Ancient Wisdom. Modern Intelligence.",
    description: "Cultural intelligence company applying RAG and multi-model AI to classical Eastern wisdom systems.",
    images: ["https://sajuastrology.com/og-image1.png"],
  },
  alternates: {
    canonical: "https://sajuastrology.com/about",
  },
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Rimfactory",
  url: "https://sajuastrology.com",
  logo: "https://sajuastrology.com/logo1.png",
  description: "Cultural intelligence company applying retrieval-augmented generation (RAG) and multi-model AI to classical Eastern wisdom systems.",
  foundingDate: "2025",
  founder: {
    "@type": "Person",
    name: "Cho Yeon Yun",
    jobTitle: "CEO",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "243, 1F, Sindorim Technomart, 97 Saemallo",
    addressLocality: "Guro-gu",
    addressRegion: "Seoul",
    addressCountry: "KR",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "info@rimfactory.io",
    telephone: "+82-10-4648-6793",
    contactType: "customer service",
  },
  sameAs: [],
  knowsAbout: [
    "Korean Four Pillars (Saju)",
    "Retrieval-Augmented Generation (RAG)",
    "Vector Similarity Search",
    "Multi-LLM AI Architecture",
    "Classical Eastern Metaphysics Corpus",
  ],
}

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <AboutClient />
    </>
  )
}
