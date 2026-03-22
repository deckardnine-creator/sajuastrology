"use client"

import Link from "next/link"
import { Globe } from "lucide-react"

const footerLinks = [
  { label: "What is Saju?", href: "/what-is-saju" },
  { label: "Features",      href: "/#features" },
  { label: "Pricing",       href: "/pricing" },
  { label: "Reviews",       href: "/reviews" },
  { label: "Privacy",       href: "/privacy" },
  { label: "Terms",         href: "/terms" },
]

export function Footer() {
  return (
    <footer className="bg-card py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8">

          <Link href="/" className="flex items-center">
            <span className="font-serif text-xl font-bold text-primary">SajuAstrology</span>
          </Link>

          <nav className="flex flex-wrap justify-center gap-6">
            {footerLinks.map(link => (
              <Link key={link.label} href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
            <button className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Globe className="w-4 h-4" />EN
            </button>
            <span className="hidden sm:block">|</span>
            <span>&copy; 2026 SajuAstrology.com</span>
          </div>

          <div className="border-t border-border w-full pt-6 flex flex-col items-center gap-1 text-xs text-muted-foreground/60">
            <p className="font-medium text-muted-foreground/80">Rimfactory</p>
            <p>Business Registration No.: 402-44-01247 &nbsp;|&nbsp; CEO: Chandler Yun</p>
            <p>Email: info@rimfactory.co.kr &nbsp;|&nbsp; Phone: +82-10-4648-6793</p>
            <p>243, 1F, Sindorim Technomart, 97 Saemallo, Guro-gu, Seoul, Korea</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
