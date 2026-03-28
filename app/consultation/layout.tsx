import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personal Saju Consultation — Ask Any Life Question",
  description: "Get in-depth answers to your career, love, timing, and life questions through personalized Korean Four Pillars (Saju) analysis. 2,000-4,000 word reports from expert AI analysis.",
  keywords: ["saju consultation", "astrology consultation", "personal reading", "four pillars advisor", "life guidance astrology"],
  openGraph: {
    title: "Personal Saju Consultation — Your Cosmic Advisor",
    description: "Ask any life question. Get a detailed Saju analysis grounded in your birth chart.",
    url: "https://sajuastrology.com/consultation",
  },
  alternates: { canonical: "https://sajuastrology.com/consultation" },
};

export default function ConsultationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
