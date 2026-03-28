import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Love Compatibility Check — Free Saju Match Analysis",
  description: "Check your love compatibility using Korean Four Pillars (Saju) astrology. Enter two birth dates for a free detailed analysis — elemental harmony, relationship dynamics, and yearly forecast.",
  keywords: ["love compatibility", "birth chart compatibility", "saju compatibility", "궁합", "korean astrology match", "relationship compatibility free"],
  openGraph: {
    title: "Free Love Compatibility Check — Saju Match",
    description: "See how your Four Pillars align with a partner, friend, or colleague. 100% free.",
    url: "https://sajuastrology.com/compatibility",
  },
  alternates: { canonical: "https://sajuastrology.com/compatibility" },
};

export default function CompatibilityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
