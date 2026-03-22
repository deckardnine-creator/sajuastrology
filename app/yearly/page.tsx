"use client";

import { Calendar, Star, TrendingUp, Zap } from "lucide-react";
import { PremiumPreviewLayout } from "@/components/premium/premium-preview-layout";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function YearlyPage() {
  const blurredCards = [
    {
      title: "2026 Monthly Energy Timeline",
      height: "240px",
      content: (
        <div className="space-y-4">
          {/* Monthly timeline */}
          <div className="flex items-end justify-between gap-1 h-24">
            {[60, 45, 70, 85, 55, 90, 75, 80, 65, 95, 70, 85].map((energy, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-full"
                  style={{
                    height: `${energy}%`,
                    background: energy > 80 ? "linear-gradient(to top, #F2CA50, #D4A84B)" : 
                               energy > 60 ? "rgba(242, 202, 80, 0.5)" : "rgba(242, 202, 80, 0.2)",
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            {MONTHS.map((month) => (
              <span key={month} className="flex-1 text-center">{month}</span>
            ))}
          </div>
          {/* Key months indicators */}
          <div className="flex gap-4 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">Peak Energy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/50" />
              <span className="text-xs text-muted-foreground">Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/20" />
              <span className="text-xs text-muted-foreground">Rest Period</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "2026 Highlights",
      height: "160px",
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-primary" />
              <span className="text-sm text-primary">Key Months</span>
            </div>
            <p className="text-lg font-serif text-foreground">Apr, Oct, Nov</p>
          </div>
          <div className="bg-indigo-500/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-indigo-400" />
              <span className="text-sm text-indigo-400">Annual Theme</span>
            </div>
            <p className="text-lg font-serif text-foreground">Expansion</p>
          </div>
        </div>
      ),
    },
  ];

  const unlockBullets = [
    "Month-by-month detailed forecast for 2026",
    "Key turning points and opportunities",
    "Seasonal energy patterns and optimal timing",
  ];

  return (
    <PremiumPreviewLayout
      title="Yearly Forecast 2026"
      icon={<Calendar className="w-6 h-6" />}
      blurredCards={blurredCards}
      unlockBullets={unlockBullets}
      featureName="Yearly Forecast"
    />
  );
}
