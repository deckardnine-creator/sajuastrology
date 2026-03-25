"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  Crown,
  Plus,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ELEMENTS, type Element } from "@/lib/saju-calculator";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase-client";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calculate", label: "New Reading", icon: Plus },
  { href: "/consultation", label: "Consultation", icon: Crown, master: true },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, sajuData, isPremium } = useAuth();
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
              <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary text-lg font-serif">
                {user?.name?.charAt(0) || "?"}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">{user?.name}</p>
            {isPremium && (
              <span className="inline-flex items-center gap-1 text-xs text-primary">
                <Crown className="w-3 h-3" />
                Premium
              </span>
            )}
          </div>
        </div>

        {/* Day Master Badge */}
        {sajuData.chart && (
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
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
      <div className="p-4 border-t border-border">
        <Link href="/consultation">
          <Button
            className="w-full text-white font-medium"
            style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)" }}
          >
            <Crown className="w-4 h-4 mr-2" />
            {credits > 0 ? `Ask (${credits} left)` : "Get Consultation"}
          </Button>
        </Link>
      </div>
    </aside>
  );
}
