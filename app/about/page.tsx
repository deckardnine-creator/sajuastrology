import type { Metadata } from "next"
import AboutClient from "@/components/about/about-client"

export const metadata: Metadata = {
  title: "About Rimfactory — Astrology Technology Company",
  description: "Rimfactory is an astrology-technology company digitizing the world's oldest divination systems with AI. Starting with Korean Four Pillars (사주), expanding globally.",
  openGraph: {
    title: "Rimfactory — Astrology Meets Science",
    description: "Astrology-technology company. AI-powered Korean Four Pillars reading service with 518,400 unique cosmic profiles. Dual AI verification, 3 languages.",
    url: "https://sajuastrology.com/about",
    siteName: "SajuAstrology",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rimfactory — Astrology Meets Science",
    description: "Astrology-technology company digitizing the world's oldest divination systems with AI.",
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
  description: "Astrology-technology company digitizing the world's oldest divination systems with modern AI.",
  foundingDate: "2025",
  founder: {
    "@type": "Person",
    name: "Chandler Yun",
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
    email: "info@rimfactory.co.kr",
    telephone: "+82-10-4648-6793",
    contactType: "customer service",
  },
  sameAs: [],
  knowsAbout: [
    "Korean Four Pillars (Saju)",
    "Astrology Technology",
    "AI-powered divination",
    "Eastern metaphysics",
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
