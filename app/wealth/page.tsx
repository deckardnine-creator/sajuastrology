"use client";

import { TrendingUp, DollarSign, BarChart3, Calendar } from "lucide-react";
import { PremiumPreviewLayout } from "@/components/premium/premium-preview-layout";

export default function WealthPage() {
  const blurredCards = [
    {
      title: "10-Year Financial Luck Cycle",
      height: "280px",
      content: (
        <div className="space-y-4">
          {/* Fake chart */}
          <div className="flex items-end gap-2 h-32">
            {[40, 65, 55, 80, 70, 90, 85, 95, 75, 88].map((height, i) => (
              <div
                key={i}
                className="flex-1 bg-primary/30 rounded-t"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>2024</span>
            <span>2026</span>
            <span>2028</span>
            <span>2030</span>
            <span>2033</span>
          </div>
        </div>
      ),
    },
    {
      title: "Financial Indicators",
      height: "160px",
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-500/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-emerald-400">Annual Yield Potential</span>
            </div>
            <p className="text-2xl font-serif text-foreground">18.4%</p>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-blue-400">Career Stability Index</span>
            </div>
            <p className="text-2xl font-serif text-foreground">Stable</p>
          </div>
        </div>
      ),
    },
  ];

  const unlockBullets = [
    "10-year financial luck cycle analysis",
    "Annual yield potential based on elemental balance",
    "Optimal timing for investments and career moves",
  ];

  return (
    <PremiumPreviewLayout
      title="Wealth & Career Blueprint"
      icon={<DollarSign className="w-6 h-6" />}
      blurredCards={blurredCards}
      unlockBullets={unlockBullets}
      featureName="Wealth Insights"
    />
  );
}
