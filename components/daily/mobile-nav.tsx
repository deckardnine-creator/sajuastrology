"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Sun, Wallet, Heart, Briefcase, MoreHorizontal } from "lucide-react"

const navItems = [
  { label: "Daily", href: "/daily", icon: Sun },
  { label: "Wealth", href: "/wealth", icon: Wallet },
  { label: "Love", href: "/love", icon: Heart },
  { label: "Career", href: "/career", icon: Briefcase },
  { label: "More", href: "/settings", icon: MoreHorizontal },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 text-xs",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
