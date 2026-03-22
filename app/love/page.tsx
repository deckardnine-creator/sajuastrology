"use client";

import { Heart } from "lucide-react";
import { Sparkles, Calendar } from "lucide-react";
import { PremiumPreviewLayout } from "@/components/premium/premium-preview-layout";

export default function LovePage() {
  const blurredCards = [
    {
      title: "Compatibility Synergy Meter",
      height: "240px",
      content: (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="40"
                fill="none" stroke="currentColor" strokeWidth="8"
                className="text-muted/20"
              />
              <circle
                cx="50" cy="50" r="40"
                fill="none" stroke="url(#heartGradient)" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${94 * 2.51} ${100 * 2.51}`}
              />
              <defs>
                <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F472B6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-serif text-foreground">94%</span>
              <span className="text-sm text-pink-400">Synergy</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Relationship Insights",
      height: "160px",
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-pink-500/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-pink-400" />
              <span className="text-sm text-pink-400">Best Match Elements</span>
            </div>
            <p className="text-lg font-serif text-foreground">Fire & Metal</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-purple-400">Relationship Timeline</span>
            </div>
            <p className="text-lg font-serif text-foreground">2026 Q3</p>
          </div>
        </div>
      ),
    },
  ];

  const unlockBullets = [
    "Deep compatibility analysis with any birth date",
    "Elemental harmony mapping for relationships",
    "Optimal dating windows based on your luck cycle",
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Pink / rose love glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full bg-pink-600/18 blur-[140px]" />
        <div className="absolute bottom-1/4 -left-20 w-[450px] h-[450px] rounded-full bg-rose-700/15 blur-[130px]" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-purple-600/15 blur-[130px]" />
      </div>
      <PremiumPreviewLayout
        title="Love Synergy"
        icon={<Heart className="w-6 h-6" />}
        blurredCards={blurredCards}
        unlockBullets={unlockBullets}
        featureName="Love Synergy"
      />
    </div>
  );
}
