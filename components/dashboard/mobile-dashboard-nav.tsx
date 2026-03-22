"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Zap, Heart, Compass, Menu } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardSidebar } from "./dashboard-sidebar";

const navItems = [
  { href: "/daily", label: "Daily", icon: Zap },
  { href: "/wealth", label: "Wealth", icon: LayoutDashboard },
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/love", label: "Love", icon: Heart },
  { href: "/career", label: "Career", icon: Compass },
];

export function MobileDashboardNav() {
  const pathname = usePathname();
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border z-40">
        <div className="flex items-center justify-around h-16">
          {navItems.slice(0, 2).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 p-2 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}

          {/* Center Home */}
          <Link
            href="/dashboard"
            className={`flex flex-col items-center gap-1 p-2 ${
              pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center -mt-6">
              <LayoutDashboard className="w-6 h-6 text-primary" />
            </div>
          </Link>

          {navItems.slice(3, 5).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 p-2 text-muted-foreground"
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={() => setShowSidebar(true)}
            className="flex flex-col items-center gap-1 p-2 text-muted-foreground"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px]">More</span>
          </button>
        </div>
      </nav>

      {/* Sidebar Drawer */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 bg-black/60 z-50"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-64 z-50"
            >
              <DashboardSidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
