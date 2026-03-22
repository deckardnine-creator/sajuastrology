"use client"

import Link from "next/link"
import { Globe, Twitter, Instagram } from "lucide-react"

// Facebook icon as inline SVG
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const footerLinks = [
  { label: "What is Saju?", href: "/what-is-saju" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
]

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com/sajuastrology", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com/sajuastrology", label: "Instagram" },
  { component: FacebookIcon, href: "https://facebook.com/sajuastrology", label: "Facebook" },
]

export function Footer() {
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
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                aria-label={social.label}
              >
                {social.component ? <social.component /> : social.icon && <social.icon className="w-5 h-5" />}
              </a>
            ))}
          </div>

          {/* Language Selector & Copyright */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
            <button className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Globe className="w-4 h-4" />
              EN
            </button>
            <span className="hidden sm:block">|</span>
            <span>&copy; 2026 SajuAstrology.com</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
