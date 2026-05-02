"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { useNativeApp } from "@/lib/native-app"

const footerLinks = [
  { label: { en: "What is Saju?", ko: "사주란?", ja: "四柱とは？" }, href: "/what-is-saju" },
  { label: { en: "Pricing", ko: "요금제", ja: "料金" }, href: "/pricing" },
  { label: { en: "Compatibility", ko: "궁합", ja: "相性" }, href: "/compatibility" },
  { label: { en: "Consultation", ko: "상담", ja: "鑑定相談" }, href: "/consultation" },
  { label: { en: "Privacy", ko: "개인정보처리방침", ja: "プライバシー" }, href: "/privacy" },
  { label: { en: "Terms", ko: "이용약관", ja: "利用規約" }, href: "/terms" },
]

export function Footer() {
  const { locale } = useLanguage()
  const isNative = useNativeApp()

  // v6.17.25 — re-add native hide (chandler: "앱 푸터 가려라, 심사 통과 못한다").
  // /daily 페이지의 web Footer. /daily는 native에선 평범한 페이지지만
  // App Store/Play 정책상 외부 web link 노출은 reject 사유. v6.17.24에서
  // 잠시 revert했었지만 chandler 정정으로 다시 hide. CSS hide는 .web-footer
  // 클래스 + globals.css 의 .native-app .web-footer { display:none }으로
  // 보강 (SSR 첫 paint flash 방지).
  if (isNative) return null

  return (
    <footer className="web-footer bg-card py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="font-serif text-xl font-bold text-primary">
              SajuAstrology
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex flex-wrap justify-center gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label[locale] || link.label.en}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <div className="text-sm text-muted-foreground">
            <span>&copy; 2026 SajuAstrology.com</span>
          </div>

          {/* Business Registration Info */}
          <div className="border-t border-border w-full pt-6 flex flex-col items-center gap-1 text-xs text-muted-foreground/60">
            <p className="font-medium text-muted-foreground/80">Rimfactory</p>
            <p>Business Registration No.: 402-44-01247 &nbsp;|&nbsp; CEO: Yun Choyeon</p>
            <p>Email: info@rimfactory.io &nbsp;|&nbsp; Phone: +82-10-4648-6793</p>
            <p>243, 1F, Sindorim Technomart, 97 Saemal-ro, Guro-gu, Seoul 08288, Republic of Korea</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
