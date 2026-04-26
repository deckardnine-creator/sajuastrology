"use client";

// ════════════════════════════════════════════════════════════════════
// MobileBottomNav v3 — Global 6-tab bottom navigation for mobile web.
// ════════════════════════════════════════════════════════════════════
// v3 changes (chandler 2026-04-27):
//   - Added Consultation as a first-class tab. Previously $29.99
//     consultations had no nav entry; users had to use the hamburger
//     menu, and after completing a consultation got redirected to
//     /dashboard which felt like the consultation flow had ended at
//     the wrong place. With a Consultation tab they can return to
//     their session list with a single tap.
//   - Soram no longer occupies the visual center with a raised gold
//     circle. With 6 items the center is split between Soram and
//     Match anyway, and chandler asked: "소람이가 센터에 없어도 되니까."
//     The Soram tab is still distinguished — it still uses the
//     amber-tinted gradient circle with the chat-header avatar — but
//     it's the same physical size as the other tabs (no scale-110, no
//     -mt offset).
//   - Soram avatar image swapped from `/soram/soram_nav.webp` to
//     `/soram/soram_chat_header_240.webp`. Reason: chandler wants the
//     navbar to use the same expression as the in-chat header avatar
//     (Soram with the dark cosmic background visible behind the cat).
//     The 240 size variant is 17.7KB, well-suited for a small nav icon.
//
// Tabs (6):
//   1. Home          → /
//   2. Reading       → /calculate
//   3. Soram         → /soram
//   4. Match         → /compatibility
//   5. Consult       → /consultation
//   6. My            → /dashboard
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
import { Home, Sparkles, Heart, User, MessageSquare } from "lucide-react";
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
      className="mobile-bottom-nav-web fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border z-40 md:hidden safe-area-bottom"
      aria-label="Bottom navigation"
    >
      {/* v3: grid-cols-6 (was 5). Each tab gets 1/6 width — no longer
          one giant Soram circle in the center. */}
      <div className="grid grid-cols-6 items-center h-16">
        <BarTab href="/" label={t("bnav.home", locale)} active={isActive("/")} icon={<Home className="w-5 h-5" />} />
        <BarTab href="/calculate" label={t("bnav.reading", locale)} active={isActive("/calculate")} icon={<Sparkles className="w-5 h-5" />} />
        <SoramTab href="/soram" label={t("bnav.soram", locale)} active={isActive("/soram")} />
        <BarTab href="/compatibility" label={t("bnav.compatibility", locale)} active={isActive("/compatibility")} icon={<Heart className="w-5 h-5" />} />
        <BarTab href="/consultation" label={t("bnav.consultation", locale)} active={isActive("/consultation")} icon={<MessageSquare className="w-5 h-5" />} />
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
      <span className="text-[10px] font-medium leading-tight truncate max-w-full">{label}</span>
    </Link>
  );
}

// ════════════════════════════════════════════════════════════════════
// Soram tab — same physical size as other tabs (no center elevation).
// Uses /soram/soram_chat_header_240.webp — the same expression as the
// in-chat header (cosmic-background portrait with the gold cap), at
// the small 240-px variant for fast nav rendering.
// Falls back to the moon glyph + amber gradient if the image is
// missing or fails to load.
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
        className={`relative w-7 h-7 rounded-full flex items-center justify-center text-base shadow-md overflow-hidden transition-transform ${
          active
            ? "bg-gradient-to-br from-amber-300/30 to-amber-500/30 ring-2 ring-amber-300/60"
            : "bg-gradient-to-br from-amber-300/20 to-amber-500/20"
        }`}
      >
        {/* Fallback moon glyph — visible only if the avatar image fails */}
        <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-sm">🌙</span>
        <img
          src="/soram/soram_chat_header_240.webp"
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
        className={`text-[10px] font-medium leading-tight truncate max-w-full ${
          active ? "text-amber-300" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}
