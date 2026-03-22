"use client";

import { Compass, Briefcase, Target, Award } from "lucide-react";
import { PremiumPreviewLayout } from "@/components/premium/premium-preview-layout";

export default function CareerPage() {
  const blurredCards = [
    {
      title: "Ten Gods Career Analysis",
      height: "280px",
      content: (
        <div className="flex items-center justify-center h-full">
          {/* Fake radar chart */}
          <div className="relative w-56 h-56">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Pentagon grid */}
              {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
                <polygon
                  key={i}
                  points={[0, 1, 2, 3, 4]
                    .map((j) => {
                      const angle = (j * 72 - 90) * (Math.PI / 180);
                      const x = 100 + Math.cos(angle) * 80 * scale;
                      const y = 100 + Math.sin(angle) * 80 * scale;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-muted/30"
                />
              ))}
              {/* Data polygon */}
              <polygon
                points="100,30 175,75 155,160 45,160 25,75"
                fill="currentColor"
                fillOpacity="0.2"
                stroke="currentColor"
                strokeWidth="2"
                className="text-primary"
              />
            </svg>
            {/* Labels */}
            <span className="absolute top-0 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">Leadership</span>
            <span className="absolute top-1/4 right-0 text-xs text-muted-foreground">Innovation</span>
            <span className="absolute bottom-4 right-4 text-xs text-muted-foreground">Execution</span>
            <span className="absolute bottom-4 left-4 text-xs text-muted-foreground">Strategy</span>
            <span className="absolute top-1/4 left-0 text-xs text-muted-foreground">Collaboration</span>
          </div>
        </div>
      ),
    },
    {
      title: "Career Indicators",
      height: "160px",
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-cyan-500/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-5 h-5 text-cyan-400" />
              <span className="text-sm text-cyan-400">Ideal Industries</span>
            </div>
            <p className="text-lg font-serif text-foreground">Tech, Finance</p>
          </div>
          <div className="bg-amber-500/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-sm text-amber-400">Leadership Style</span>
            </div>
            <p className="text-lg font-serif text-foreground">Visionary</p>
          </div>
        </div>
      ),
    },
  ];

  const unlockBullets = [
    "Ten Gods (십성) based career archetype analysis",
    "Industry and role recommendations",
    "5-year career timing and promotion windows",
  ];

  return (
    <PremiumPreviewLayout
      title="Career Blueprint"
      icon={<Compass className="w-6 h-6" />}
      blurredCards={blurredCards}
      unlockBullets={unlockBullets}
      featureName="Career Blueprint"
    />
  );
}
