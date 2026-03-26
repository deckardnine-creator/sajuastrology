"use client"

import Link from "next/link"

const footerLinks = [
  { label: "What is Saju?", href: "/what-is-saju" },
  { label: "Pricing",       href: "/pricing" },
  { label: "Consultation",  href: "/consultation" },
  { label: "Privacy",       href: "/privacy" },
  { label: "Terms",         href: "/terms" },
]

export function Footer() {
  return (
    <footer className="bg-card py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:gap-8">

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="font-serif text-xl font-bold text-primary">SajuAstrology</span>
          </Link>

          {/* Nav */}
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-3">
            {footerLinks.map(link => (
              <Link key={link.label} href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <div className="text-sm text-muted-foreground">
            <span>&copy; 2026 SajuAstrology.com</span>
          </div>

          {/* Business info — mobile friendly */}
          <div className="border-t border-border w-full pt-6">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <p className="text-xs font-medium text-muted-foreground/80">Rimfactory</p>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground/55">
                <span>Reg. No.: 402-44-01247</span>
                <span className="hidden sm:inline">|</span>
                <span>CEO: Chandler Yun</span>
              </div>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground/55">
                <span>info@rimfactory.co.kr</span>
                <span className="hidden sm:inline">|</span>
                <span>+82-10-4648-6793</span>
              </div>
              <p className="text-xs text-muted-foreground/55 max-w-xs sm:max-w-none text-center leading-relaxed">
                243, 1F, Sindorim Technomart, 97 Saemallo, Guro-gu, Seoul, Korea
              </p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  )
}
