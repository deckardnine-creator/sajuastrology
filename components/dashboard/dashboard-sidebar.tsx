"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  Crown,
  Plus,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import { ELEMENTS, type Element } from "@/lib/saju-calculator";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase-client";

// ════════════════════════════════════════════════════════════════════
// v6.17.14 — sidebar enhancement (desktop only, md+)
// ────────────────────────────────────────────────────────────────────
// Per chandler: "PC용 화면이지만 허접해 보이잖아."
// Mobile menu (hamburger in <Navbar/> + global <MobileBottomNav/>) is
// untouched — this file is mounted only inside the `hidden md:flex`
// block of app/dashboard/page.tsx.
//
// Changes versus v6.16:
//   • Hero card replaces the empty area when sajuData.chart is null
//     (prominent gradient + CTA → /calculate). When the user has a
//     chart, the existing Day-Master + Archetype badges render here.
//   • New "Explore" quick-links group (Pricing, FAQ, Blog) sits
//     between primary nav and the consultation CTA so the user has
//     somewhere to wander on a fresh dashboard.
//   • Footer row (Privacy / Terms) under everything, plus a one-line
//     "사주 변경은 고객센터로" reminder in muted text. Uses existing
//     dash.changeViaSupportHint key (already 10-language complete).
//
// Stability: every existing chart-state branch is preserved verbatim
// (Day Master Badge, Archetype, isPremium pill, Consultation CTA with
// credits). New regions only render in addition; nothing existing was
// removed.
// ════════════════════════════════════════════════════════════════════

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, sajuData, isPremium } = useAuth();
  const { locale } = useLanguage();

  const navItems = [
    { href: "/dashboard", label: t("dash.dashboard", locale), icon: LayoutDashboard },
    { href: "/calculate", label: t("dash.newReading", locale), icon: Plus },
    { href: "/consultation", label: t("dash.consultation", locale), icon: Crown, master: true },
  ];

  // v6.17.15 — exploreItems removed per chandler. Pricing/FAQ/Blog
  // links cluttered the sidebar without driving real engagement;
  // primary-nav + consultation CTA are enough on a fresh dashboard.

  const [credits, setCredits] = useState(0);

  const dayMasterElement = sajuData.chart?.dayMaster.element as Element | undefined;
  const dayMasterColor = dayMasterElement ? ELEMENTS[dayMasterElement]?.color : "#F2CA50";

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("consultation_credits")
        .select("total_credits, used_credits")
        .eq("user_id", user.id);
      const remaining = (data || []).reduce((sum, c) => sum + (c.total_credits - c.used_credits), 0);
      setCredits(remaining);
    })();
  }, [user]);

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card/50 backdrop-blur-xl border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/" className="font-serif text-xl font-bold text-primary">
          SajuAstrology
        </Link>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name}
                width={48}
                height={48}
                className="w-full h-full object-cover rounded-full"
                unoptimized
              />
            ) : (
              <span className="text-primary text-lg font-serif">
                {user?.name?.charAt(0) || "?"}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{user?.name}</p>
            {isPremium && (
              <span className="inline-flex items-center gap-1 text-xs text-primary">
                <Crown className="w-3 h-3" />
                Premium
              </span>
            )}
          </div>
        </div>

        {/* Day Master Badge — present when user has a chart */}
        {sajuData.chart ? (
          <div className="space-y-2">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ backgroundColor: `${dayMasterColor}20` }}
            >
              <span
                className="text-2xl font-serif"
                style={{ color: dayMasterColor }}
              >
                {sajuData.chart.dayMaster.zh}
              </span>
              <span className="text-sm text-foreground">
                {sajuData.chart.dayMaster.en}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary">{sajuData.chart.archetype}</span>
            </div>
          </div>
        ) : (
          /* v6.17.14 → v6.17.15: hero card simplified per chandler.
              Removed redundant "Enter my saju →" line at the bottom —
              the whole card is already a Link (entire surface clickable),
              and the gold border + amber gradient signal "click me"
              clearly without the arrow. Title + subtitle alone read
              cleaner. */
          <Link
            href="/calculate"
            className="block group relative overflow-hidden rounded-xl border border-amber-400/40 bg-gradient-to-br from-amber-500/15 via-amber-400/8 to-transparent px-3.5 py-3 transition-all hover:border-amber-400/60 hover:from-amber-500/20"
          >
            <span aria-hidden="true" className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full bg-gradient-to-b from-amber-300 to-amber-500" />
            <p className="text-sm font-semibold text-amber-100 leading-snug pr-1">
              {t("sidebar.heroTitle", locale)}
            </p>
            <p className="text-[11px] text-amber-200/75 leading-relaxed mt-1.5">
              {t("sidebar.heroSub", locale)}
            </p>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const isMaster = "master" in item && item.master;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors min-h-[44px] ${
                    isActive
                      ? isMaster
                        ? "bg-purple-500/20 text-purple-300"
                        : "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  {isMaster && (
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full">
                      MASTER
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Consultation CTA */}
      <div className="px-4 pt-4 border-t border-border">
        <Link href="/consultation">
          <Button
            className="w-full text-white font-medium"
            style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)" }}
          >
            <Crown className="w-4 h-4 mr-2" />
            {credits > 0
              ? t("dash.askCredits", locale).replace("{n}", String(credits))
              : t("dash.getConsultation", locale)}
          </Button>
        </Link>
      </div>

      {/* v6.17.14 — Footer: legal links + change-saju reminder */}
      <div className="px-4 py-3 border-t border-border/50">
        {/* Saju change reminder — only when chart exists; new users
            don't need it yet, the hero card already drives them. */}
        {sajuData.chart && (
          <p className="text-[10px] text-muted-foreground/50 leading-relaxed mb-2 px-1">
            {t("dash.changeViaSupportHint", locale)}{" "}
            <a
              href="mailto:info@rimfactory.io"
              className="text-muted-foreground/70 hover:text-primary transition-colors"
            >
              info@rimfactory.io
            </a>
          </p>
        )}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground/60">
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            {t("footer.privacy", locale)}
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            {t("footer.terms", locale)}
          </Link>
        </div>
      </div>
    </aside>
  );
}
