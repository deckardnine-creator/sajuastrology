import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Birth Chart Reading — Saju Four Pillars Calculator",
  description: "Enter your birth date, time, and city to get a free Saju (Four Pillars) birth chart reading in 30 seconds. Day Master, Five Elements balance, fortune forecast — no sign-up required.",
  keywords: ["free birth chart", "saju calculator", "four pillars calculator", "bazi calculator", "birth chart reading free", "korean astrology calculator"],
  openGraph: {
    title: "Free Birth Chart Reading — Saju Calculator",
    description: "Get your personalized Four Pillars reading in 30 seconds. 518,400 unique profiles.",
    url: "https://sajuastrology.com/calculate",
  },
  alternates: { canonical: "https://sajuastrology.com/calculate" },
};

export default function CalculateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
