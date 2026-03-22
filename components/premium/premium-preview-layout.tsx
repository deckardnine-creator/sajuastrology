"use client";

import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { MobileDashboardNav } from "@/components/dashboard/mobile-dashboard-nav";
import { useAuth } from "@/lib/auth-context";

interface BlurredCard {
  title: string;
  content: React.ReactNode;
  height?: string;
}

interface PremiumPreviewLayoutProps {
  title: string;
  icon: React.ReactNode;
  blurredCards: BlurredCard[];
  unlockBullets: string[];
  featureName: string;
}

export function PremiumPreviewLayout({
  title,
  icon,
  blurredCards,
  unlockBullets,
  featureName,
}: PremiumPreviewLayoutProps) {
  const { isLoading, sajuData, openSignInModal } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!sajuData.chart) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-serif text-foreground mb-2">Generate Your Reading First</h2>
          <p className="text-muted-foreground mb-6">
            Get your free Saju reading to unlock personalized insights
          </p>
          <Link href="/calculate">
            <Button className="gold-gradient text-primary-foreground">
              Get Your Free Reading
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Layout */}
      <div className="hidden md:flex">
        <DashboardSidebar />
        <main className="flex-1 ml-64 p-8">
          <PremiumContent
            title={title}
            icon={icon}
            blurredCards={blurredCards}
            unlockBullets={unlockBullets}
            featureName={featureName}
          />
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <main className="pb-20 p-4">
          <PremiumContent
            title={title}
            icon={icon}
            blurredCards={blurredCards}
            unlockBullets={unlockBullets}
            featureName={featureName}
          />
        </main>
        <MobileDashboardNav />
      </div>
    </div>
  );
}

function PremiumContent({
  title,
  icon,
  blurredCards,
  unlockBullets,
  featureName,
}: Omit<PremiumPreviewLayoutProps, "children">) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
          {icon}
        </div>
        <h1 className="text-2xl md:text-3xl font-serif text-foreground">{title}</h1>
      </div>

      {/* Blurred Preview Cards */}
      <div className="grid gap-6 mb-8">
        {blurredCards.map((card, index) => (
          <div
            key={index}
            className="relative rounded-2xl overflow-hidden"
            style={{ height: card.height || "200px" }}
          >
            {/* Blurred content */}
            <div className="absolute inset-0 filter blur-[8px] pointer-events-none">
              <div className="h-full bg-card/80 border border-border rounded-2xl p-6">
                <h3 className="text-lg font-medium text-foreground mb-4">{card.title}</h3>
                {card.content}
              </div>
            </div>
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background/80 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Lock Overlay */}
      <div className="relative bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 md:p-12 text-center">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          {/* Lock Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-serif text-foreground mb-2">
            Unlock {featureName}
          </h2>
          <p className="text-muted-foreground mb-8">
            This feature is available with Premium
          </p>

          {/* Bullets */}
          <ul className="text-left max-w-md mx-auto mb-8 space-y-3">
            {unlockBullets.map((bullet, index) => (
              <li key={index} className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground">{bullet}</span>
              </li>
            ))}
          </ul>

          {/* CTA Buttons */}
          <Link href="/pricing">
            <Button className="gold-gradient text-primary-foreground px-8 py-6 text-lg font-medium mb-4">
              Upgrade to Premium — $9.99/mo
            </Button>
          </Link>
          <div>
            <Link
              href="/daily"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Or continue with free features →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
