"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sun,
  Wallet,
  Heart,
  Briefcase,
  CalendarDays,
  Settings,
  Sparkles,
} from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Sun },
  { label: "Daily Energy", href: "/daily", icon: Sun },
  { label: "Wealth Path", href: "/wealth", icon: Wallet },
  { label: "Love Synergy", href: "/love", icon: Heart },
  { label: "Career Blueprint", href: "/career", icon: Briefcase },
  { label: "Yearly Forecast", href: "/yearly", icon: CalendarDays },
  { label: "Settings", href: "/settings", icon: Settings },
]

export function DailySidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 bg-card">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6">
          <Link href="/" className="flex items-center">
            <span className="font-serif text-xl font-bold text-primary">
              SajuAstrology
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Oracle CTA */}
        <div className="p-4">
          <Link href="/oracle">
            <Button className="w-full gold-gradient text-primary-foreground font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              Consult Oracle
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  )
}
