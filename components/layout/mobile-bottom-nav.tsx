"use client";

// ════════════════════════════════════════════════════════════════════
// MobileBottomNav v2 — Global 5-tab bottom navigation for mobile web.
// ════════════════════════════════════════════════════════════════════
// v2 redesign rationale:
//   The v1 raised/floating Soram tab had `-mt-3` which on some Android
//   browsers caused the gold circle to clip under the system gesture
//   bar or visually disappear next to the other tabs at certain
//   viewport heights. v2 keeps everything inside the bar's bounding
//   box (no negative margin) and instead emphasises the Soram tab
//   through:
//     - solid gold-gradient circular icon background (vs hollow)
//     - subtle ring on active state
//     - slightly bolder gold label
//   This is robust across every Android/iOS/PWA combo.
//
// Tabs (5):
//   1. Home          → /
//   2. Reading       → /calculate
//   3. Soram   ⭐    → /soram      (center, gold, emphasised)
//   4. Match         → /compatibility
//   5. My            → /dashboard
//
// Hidden routes (no bar):
//   - /blog and /blog/*
//   - /reading/[slug], /compatibility/result/[slug]
//   - /auth/*
//   - /setup-primary-chart  (focus mode)
//   - /soram                (the chat page has its own sticky input)
// ════════════════════════════════════════════════════════════════════

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, Heart, User } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import { useNativeApp } from "@/lib/native-app";

export function MobileBottomNav() {
  const pathname = usePathname() || "";
  const { locale } = useLanguage();
  const isNative = useNativeApp();

  // Hide inside native app — Flutter renders its own BottomNav.
  if (isNative) return null;

  const hideOn =
    pathname === "/blog" ||
    pathname.startsWith("/blog/") ||
    pathname.startsWith("/reading/") ||
    pathname.startsWith("/compatibility/result/") ||
    pathname.startsWith("/auth/") ||
    pathname === "/soram" ||
    pathname === "/setup-primary-chart";
  if (hideOn) return null;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border z-40 md:hidden safe-area-bottom"
      aria-label="Bottom navigation"
    >
      <div className="grid grid-cols-5 items-center h-16">
        <BarTab href="/" label={t("bnav.home", locale)} active={isActive("/")} icon={<Home className="w-5 h-5" />} />
        <BarTab href="/calculate" label={t("bnav.reading", locale)} active={isActive("/calculate")} icon={<Sparkles className="w-5 h-5" />} />
        <SoramTab href="/soram" label={t("bnav.soram", locale)} active={isActive("/soram")} />
        <BarTab href="/compatibility" label={t("bnav.compatibility", locale)} active={isActive("/compatibility")} icon={<Heart className="w-5 h-5" />} />
        <BarTab href="/dashboard" label={t("bnav.my", locale)} active={isActive("/dashboard")} icon={<User className="w-5 h-5" />} />
      </div>
    </nav>
  );
}

function BarTab({
  href,
  label,
  active,
  icon,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-0.5 h-full px-1 transition-colors ${
        active ? "text-primary" : "text-muted-foreground"
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium leading-tight">{label}</span>
    </Link>
  );
}

// ════════════════════════════════════════════════════════════════════
// Soram tab — solid gold-gradient circular icon, with a moon glyph
// and an optional avatar image layered on top. If
// /soram/soram_avatar.webp is deployed, it overlays the moon; if
// missing in production, onError hides the <img> and the gradient
// + moon stays visible. Either way the tab is unmistakable.
// ════════════════════════════════════════════════════════════════════
function SoramTab({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-0.5 h-full px-1"
      aria-label={label}
    >
      <div
        className={`relative w-8 h-8 rounded-full flex items-center justify-center text-base shadow-md overflow-hidden transition-transform ${
          active
            ? "bg-gradient-to-br from-amber-300 to-amber-500 shadow-amber-500/40 scale-110 ring-2 ring-amber-300/50"
            : "bg-gradient-to-br from-amber-300 to-amber-500 shadow-amber-500/25"
        }`}
      >
        <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">🌙</span>
        <img
          src="/soram/soram_avatar.webp"
          alt=""
          aria-hidden="true"
          onError={(ev) => {
            const el = ev.currentTarget;
            el.style.display = "none";
          }}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </div>
      <span
        className={`text-[10px] font-semibold leading-tight ${
          active ? "text-amber-300" : "text-amber-200/85"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}
