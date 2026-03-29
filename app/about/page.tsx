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

export default function AboutPage() {
  return <AboutClient />
}
