"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Plus, Crown } from "lucide-react";

export function MobileDashboardNav() {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const navItems = [
    { href: "/dashboard", label: t("dash.dashboard", locale), icon: LayoutDashboard },
    { href: "/calculate", label: t("dash.newReading", locale), icon: Plus },
    { href: "/consultation", label: t("dash.consultation", locale), icon: Crown },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border z-40 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const isConsultation = item.href === "/consultation";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[44px] px-3 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? isConsultation
                    ? "text-purple-400"
                    : "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
