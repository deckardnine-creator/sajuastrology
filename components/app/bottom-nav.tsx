"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Sparkles, Heart, MessageCircle, User } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";

const NAV_ITEMS = [
  { key: "bnav.home" as const, href: "/", icon: Home },
  { key: "bnav.reading" as const, href: "/calculate", icon: Sparkles },
  { key: "bnav.compatibility" as const, href: "/compatibility", icon: Heart },
  { key: "bnav.consultation" as const, href: "/consultation", icon: MessageCircle },
  { key: "bnav.my" as const, href: "/dashboard", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const { locale } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Top border glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8a97e]/40 to-transparent" />

      <div
        className="flex items-center justify-around bg-[#0a0e1a] border-t border-white/5"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {NAV_ITEMS.map(({ key, href, icon: Icon }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`
                flex flex-col items-center justify-center
                min-w-0 flex-1
                pt-2 pb-1.5
                transition-colors duration-200
                ${isActive
                  ? "text-[#c8a97e]"
                  : "text-gray-500 active:text-gray-300"
                }
              `}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.2 : 1.6}
                className="shrink-0"
              />
              <span
                className={`
                  mt-0.5 text-[10px] leading-tight truncate max-w-full px-1
                  ${isActive ? "font-semibold" : "font-normal"}
                `}
              >
                {t(key, locale)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
