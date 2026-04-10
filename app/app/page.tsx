"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Heart, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import type { Locale } from "@/lib/translations";

const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ja", label: "JA" },
  { code: "ko", label: "KO" },
];

const content = {
  title1: { en: "Your Birth Date Holds a", ko: "당신의 생년월일에는", ja: "あなたの生年月日には" },
  title2: { en: "5,000-Year-Old Code.", ko: "5,000년의 비밀이 있습니다.", ja: "5,000年の秘密が隠されています。" },
  desc: {
    en: "518,400 unique cosmic profiles based on Korean Four Pillars. Get your free reading in 30 seconds.",
    ko: "518,400가지 고유한 우주적 프로필. 30초 만에 무료 사주를 받으세요.",
    ja: "518,400通りの固有プロフィール。30秒で無料鑑定をお受け取りください。",
  },
  cta: { en: "See My Reading — Free", ko: "무료 사주 보기", ja: "無料で鑑定する" },
  compat: { en: "Check Compatibility", ko: "궁합 확인하기", ja: "相性をチェック" },
  learn: { en: "What is Saju?", ko: "사주란?", ja: "四柱とは？" },
  disclaimer: {
    en: "For entertainment and self-reflection only.",
    ko: "오락 및 자기 성찰 목적입니다.",
    ja: "エンターテインメントおよび自己理解の目的です。",
  },
  techLine: {
    en: "562 classical passages from 5 ancient texts — vector-matched in real time",
    ko: "5대 고전 원전 562개 패시지 실시간 벡터 분석",
    ja: "5大古典原典562パッセージをリアルタイムベクトル分析",
  },
};

function tx(obj: Record<string, string>, locale: string): string {
  return obj[locale] || obj.en;
}

export default function AppHome() {
  const { locale, setLocale } = useLanguage();

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full bg-purple-700/20 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-[300px] h-[300px] rounded-full bg-yellow-500/15 blur-[130px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
        <Image src="/logo1.png" alt="SajuAstrology" width={120} height={36} className="h-9 w-auto" />
        <div className="flex items-center bg-card/50 border border-border rounded-lg p-0.5 gap-0.5">
          {LOCALES.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setLocale(code)}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all min-h-[28px] tracking-wider ${
                locale === code
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 px-5 pt-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-5"
        >
          {/* Title */}
          <h1 className="font-serif text-[1.75rem] leading-[1.25] font-bold">
            {tx(content.title1, locale)}
            <br />
            <span className="gold-gradient-text">{tx(content.title2, locale)}</span>
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {tx(content.desc, locale)}
          </p>

          {/* Tech line */}
          <p className="text-[11px] text-muted-foreground/60 flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
            {tx(content.techLine, locale)}
          </p>

          {/* Main CTA */}
          <Link href="/calculate" className="w-full">
            <Button
              size="lg"
              className="gold-gradient text-primary-foreground font-semibold text-base w-full h-14 group"
            >
              {tx(content.cta, locale)}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>

          {/* Secondary actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/compatibility">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                <Heart className="w-4 h-4 text-pink-400" />
                <span className="text-sm text-white/90 font-medium">{tx(content.compat, locale)}</span>
              </button>
            </Link>
            <Link href="/what-is-saju">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-white/90 font-medium">{tx(content.learn, locale)}</span>
              </button>
            </Link>
          </div>

          {/* Four Pillars visual */}
          <div className="flex justify-center gap-3 pt-4">
            {[
              { zh: "甲", en: "WOOD", color: "text-secondary" },
              { zh: "丙", en: "FIRE", color: "text-fire" },
              { zh: "戊", en: "EARTH", color: "text-primary" },
              { zh: "庚", en: "METAL", color: "text-metal" },
            ].map((p, i) => (
              <motion.div
                key={p.zh}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="pillar-card rounded-xl p-3 flex flex-col items-center gap-1.5"
              >
                <span className={`text-2xl font-serif ${p.color}`}>{p.zh}</span>
                <span className="text-[8px] text-muted-foreground uppercase tracking-wider">{p.en}</span>
              </motion.div>
            ))}
          </div>

          {/* Disclaimer */}
          <p className="text-[10px] text-muted-foreground/40 text-center pt-4">
            {tx(content.disclaimer, locale)}
          </p>
        </motion.div>
      </div>
    </main>
  );
}
