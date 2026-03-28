import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What Is Saju? — Korean Four Pillars of Destiny Explained",
  description: "Learn how Saju (사주) works: Four Pillars, Eight Characters, Five Elements, Day Master, and the Ten Archetypes. The 1,000-year-old Korean system that maps your destiny from birth.",
  keywords: ["what is saju", "four pillars of destiny", "korean astrology explained", "saju meaning", "bazi explained", "how saju works", "사주란"],
  openGraph: {
    title: "What Is Saju? — Korean Four Pillars Explained",
    description: "The 1,000-year-old system that maps your entire life from the moment you were born.",
    url: "https://sajuastrology.com/what-is-saju",
  },
  alternates: { canonical: "https://sajuastrology.com/what-is-saju" },
};

export default function WhatIsSajuLayout({ children }: { children: React.ReactNode }) {
  return children;
}
