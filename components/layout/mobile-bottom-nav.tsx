"use client";

// ════════════════════════════════════════════════════════════════════
// MobileBottomNav — Global 5-tab bottom navigation for mobile web.
// ════════════════════════════════════════════════════════════════════
// Renders on mobile (md:hidden) only.  Hidden inside the Flutter native
// app because Flutter renders its own BottomNav — same pattern that the
// previous MobileDashboardNav used. We deliberately match that pattern
// so we never double-render bottom chrome.
//
// Tabs (5):
//   1. Home          → /
//   2. Reading       → /calculate
//   3. Soram  ⭐    → /soram      (center, larger, gold accent)
//   4. Match         → /compatibility
//   5. My            → /dashboard
//
// Hidden routes (no bar):
//   - /blog and /blog/*  (blog is a standalone SEO funnel — minimal chrome)
//   - /reading/[slug]    (full-screen reading detail — focus mode)
//   - /compatibility/result/[slug]  (full-screen result — focus mode)
//   - /auth/callback     (transient OAuth redirect page)
//
// Padding: pages that include this bar should add `pb-20 md:pb-0` to
// their main content. The bar is `h-16` plus `safe-area-bottom`.
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

  // ═══ Hide inside native app — Flutter renders its own BottomNav ═══
  if (isNative) return null;

  // ═══ Hide on routes that should be focus-mode / minimal-chrome ═══
  const hideOn =
    pathname === "/blog" ||
    pathname.startsWith("/blog/") ||
    pathname.startsWith("/reading/") ||
    pathname.startsWith("/compatibility/result/") ||
    pathname.startsWith("/auth/") ||
    // /soram has its own sticky chat-input bar at z-20 — overlapping
    // a fixed z-40 bottom nav on top of it would cover the send button.
    // The chat page also has its own header back button, so navigation
    // off the page is already handled. Hide the global bar here.
    pathname === "/soram" ||
    // Sign-in / setup flows — keep them distraction-free
    pathname === "/setup-primary-chart";
  if (hideOn) return null;

  // ═══ Active state matching ═══
  // Each tab matches its exact route OR its descendants where appropriate.
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  // The middle Soram tab is visually emphasized (per v1.3 product direction:
  // "Soram is the new core" — the sleeve note CTA from chandler).
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border z-40 md:hidden safe-area-bottom"
      aria-label="Bottom navigation"
    >
      <div className="flex items-end justify-around h-16">
        {/* 1. Home */}
        <BarTab
          href="/"
          label={t("bnav.home", locale)}
          active={isActive("/")}
          icon={<Home className="w-5 h-5" />}
        />

        {/* 2. Reading */}
        <BarTab
          href="/calculate"
          label={t("bnav.reading", locale)}
          active={isActive("/calculate")}
          icon={<Sparkles className="w-5 h-5" />}
        />

        {/* 3. Soram — center, gold-accented, slightly raised */}
        <SoramTab
          href="/soram"
          label={t("bnav.soram", locale)}
          active={isActive("/soram")}
        />

        {/* 4. Match (Compatibility) */}
        <BarTab
          href="/compatibility"
          label={t("bnav.compatibility", locale)}
          active={isActive("/compatibility")}
          icon={<Heart className="w-5 h-5" />}
        />

        {/* 5. My (Dashboard) */}
        <BarTab
          href="/dashboard"
          label={t("bnav.my", locale)}
          active={isActive("/dashboard")}
          icon={<User className="w-5 h-5" />}
        />
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
      className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] px-2 py-1.5 rounded-lg transition-colors ${
        active ? "text-primary" : "text-muted-foreground"
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium leading-tight">{label}</span>
    </Link>
  );
}

// ════════════════════════════════════════════════════════════════════
// Soram tab — gold gradient circle with moon glyph, slightly raised
// above the bar to signal "primary product surface". Matches the chat
// page's visual language (gold-on-navy from /soram/page.tsx).
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
      className="flex flex-col items-center justify-end min-w-[64px] min-h-[44px] px-2 -mt-3"
      aria-label={label}
    >
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center text-base shadow-lg transition-transform ${
          active
            ? "bg-gradient-to-br from-amber-300 to-amber-500 shadow-amber-500/40 scale-105"
            : "bg-gradient-to-br from-amber-300/90 to-amber-500/90 shadow-amber-500/20"
        }`}
      >
        <span aria-hidden="true">🌙</span>
      </div>
      <span
        className={`text-[10px] font-semibold leading-tight mt-0.5 ${
          active ? "text-primary" : "text-amber-300/90"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}
