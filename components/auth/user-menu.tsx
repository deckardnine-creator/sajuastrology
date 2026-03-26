"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  LayoutDashboard,
  Sparkles,
  LogOut,
  Crown,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export function UserMenu() {
  const { user, signOut, openSignInModal, isPremium, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-16 h-4 bg-muted animate-pulse rounded" />
        <div className="w-36 h-10 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={openSignInModal}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign In
        </button>
        <Link href="/calculate">
          <Button className="gold-gradient text-primary-foreground font-medium">
            Get Your Reading — Free
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-muted/50 transition-colors"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name}
              width={36}
              height={36}
              className="w-full h-full object-cover rounded-full"
              unoptimized
            />
          ) : (
            <User className="w-5 h-5 text-primary" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50"
              role="menu"
            >
              {/* User Info */}
              <div className="p-4 border-b border-border">
                <p className="font-medium text-foreground">{user.name}</p>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                <div className="flex items-center gap-1 mt-2">
                  {isPremium ? (
                    <span className="inline-flex items-center gap-1 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                      <Crown className="w-3 h-3" />
                      Premium
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Free Plan</span>
                  )}
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <MenuItem
                  href="/dashboard"
                  icon={<LayoutDashboard className="w-4 h-4" />}
                  label="My Dashboard"
                  onClick={() => setIsOpen(false)}
                />
                <MenuItem
                  href="/calculate"
                  icon={<Sparkles className="w-4 h-4" />}
                  label="My Saju Chart"
                  onClick={() => setIsOpen(false)}
                />
                <MenuItem
                  href="/consultation"
                  icon={<Crown className="w-4 h-4" />}
                  label="Consultation"
                  onClick={() => setIsOpen(false)}
                />
              </div>

              {/* Sign Out */}
              <div className="border-t border-border p-2">
                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors min-h-[44px]"
                  role="menuitem"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({
  href,
  icon,
  label,
  badge,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors min-h-[44px]"
      role="menuitem"
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">
          {badge}
        </span>
      )}
    </Link>
  );
}
