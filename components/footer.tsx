"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"

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

  return (
    <footer className="bg-card py-12">
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
            <p>Business Registration No.: 402-44-01247 &nbsp;|&nbsp; CEO: Chandler Yun</p>
            <p>Email: info@rimfactory.io &nbsp;|&nbsp; Phone: +82-10-4648-6793</p>
            <p>243, 1F, Sindorim Technomart, 97 Saemallo, Guro-gu, Seoul, Korea</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
