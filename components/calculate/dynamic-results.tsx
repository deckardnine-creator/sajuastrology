"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Share2, Download, Sparkles, Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ELEMENTS, TEN_GODS, type SajuChart, type Element } from "@/lib/saju-calculator";
import { ARCHETYPE_CONTENT, ELEMENT_DESCRIPTIONS } from "@/lib/archetype-content";

interface DynamicResultsProps {
  chart: SajuChart;
  onReset: () => void;
}

export function DynamicResults({ chart, onReset }: DynamicResultsProps) {
  const archetypeContent = ARCHETYPE_CONTENT[chart.archetype as keyof typeof ARCHETYPE_CONTENT];
  const tenGodInfo = TEN_GODS[chart.tenGod];

  return (
    <div className="min-h-screen bg-background py-8 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            New Reading
          </button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </motion.div>

        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-serif text-primary mb-2">
            {chart.name}&apos;s Cosmic Blueprint
          </h1>
          <p className="text-muted-foreground">
            Born {chart.birthDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} in {chart.birthCity}
          </p>
        </motion.div>

        {/* Four Pillars */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-sm tracking-wider text-muted-foreground uppercase mb-4 text-center">
            The Four Pillars of Destiny
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(["hour", "day", "month", "year"] as const).map((pillarName, index) => {
              const pillar = chart.pillars[pillarName];
              const isDay = pillarName === "day";
              const stemElement = pillar.stem.element as Element;
              const branchElement = pillar.branch.element as Element;

              return (
                <motion.div
                  key={pillarName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`bg-card/50 backdrop-blur border rounded-xl p-4 text-center relative ${
                    isDay ? "border-primary ring-2 ring-primary/20" : "border-border"
                  }`}
                >
                  {isDay && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                      Day Master
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 capitalize">
                    {pillarName} Pillar
                  </p>
                  
                  {/* Heavenly Stem */}
                  <div className="mb-3">
                    <div
                      className="text-4xl font-serif mb-1"
                      style={{ color: ELEMENTS[stemElement].color }}
                    >
                      {pillar.stem.zh}
                    </div>
                    <p className="text-sm text-muted-foreground">{pillar.stem.en}</p>
                  </div>

                  {/* Earthly Branch */}
                  <div className="pt-3 border-t border-border">
                    <div
                      className="text-3xl font-serif mb-1"
                      style={{ color: ELEMENTS[branchElement].color }}
                    >
                      {pillar.branch.zh}
                    </div>
                    <p className="text-sm text-muted-foreground">{pillar.branch.en}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Archetype Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30 rounded-2xl p-6 md:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground tracking-wider uppercase">
                  {tenGodInfo.ko} ({tenGodInfo.en})
                </p>
                <h2 className="text-3xl font-serif text-primary">{chart.archetype}</h2>
                <p className="text-muted-foreground italic">{archetypeContent?.subtitle}</p>
              </div>
            </div>
            <p className="text-foreground leading-relaxed mb-6">
              {archetypeContent?.personality}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-background/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-accent mb-2">Core Strengths</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {archetypeContent?.strengths.map((s, i) => (
                    <li key={i}>+ {s}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-background/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-destructive mb-2">Growth Areas</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {archetypeContent?.challenges.map((c, i) => (
                    <li key={i}>- {c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Five Elements Balance */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-sm tracking-wider text-muted-foreground uppercase mb-4 text-center">
            Elemental Balance
          </h2>
          <div className="bg-card/50 backdrop-blur border border-border rounded-xl p-6">
            <div className="space-y-4 mb-6">
              {(Object.keys(chart.elements) as Element[]).map((element, index) => {
                const count = chart.elements[element];
                const maxCount = Math.max(...Object.values(chart.elements));
                const percentage = (count / 8) * 100;
                const isDominant = element === chart.dominantElement;
                const isWeakest = element === chart.weakestElement;

                return (
                  <motion.div
                    key={element}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: ELEMENTS[element].color }}
                        />
                        <span className="capitalize text-sm font-medium">
                          {element}
                          {isDominant && (
                            <span className="ml-2 text-xs text-primary">(Dominant)</span>
                          )}
                          {isWeakest && count === 0 && (
                            <span className="ml-2 text-xs text-destructive">(Missing)</span>
                          )}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">{count}/8</span>
                    </div>
                    <div className="h-3 bg-background rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: ELEMENTS[element].color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Element interpretation */}
            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your chart shows a strong presence of{" "}
                <span style={{ color: ELEMENTS[chart.dominantElement].color }} className="font-semibold">
                  {chart.dominantElement}
                </span>{" "}
                energy. {ELEMENT_DESCRIPTIONS[chart.dominantElement].description.split(".")[0]}.
                {chart.weakestElement && chart.elements[chart.weakestElement] === 0 && (
                  <span>
                    {" "}The absence of{" "}
                    <span style={{ color: ELEMENTS[chart.weakestElement].color }} className="font-semibold">
                      {chart.weakestElement}
                    </span>{" "}
                    suggests an area for conscious development.
                  </span>
                )}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Elemental Interaction Diagram (Wu Xing) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          <h2 className="text-sm tracking-wider text-muted-foreground uppercase mb-4 text-center">
            Wu Xing - Five Element Cycle
          </h2>
          <div className="bg-card/50 backdrop-blur border border-border rounded-xl p-6">
            <div className="flex justify-center">
              <svg viewBox="-120 -120 240 240" className="w-64 h-64 md:w-80 md:h-80">
                {/* Pentagon outline */}
                <polygon
                  points={["wood", "fire", "earth", "metal", "water"].map((_, i) => {
                    const angle = (i * 72 - 90) * (Math.PI / 180);
                    return `${Math.cos(angle) * 80},${Math.sin(angle) * 80}`;
                  }).join(" ")}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-border"
                />

                {/* Creation cycle arrows (outer) */}
                {["wood", "fire", "earth", "metal", "water"].map((element, i) => {
                  const angle1 = (i * 72 - 90) * (Math.PI / 180);
                  const angle2 = ((i + 1) * 72 - 90) * (Math.PI / 180);
                  const x1 = Math.cos(angle1) * 80;
                  const y1 = Math.sin(angle1) * 80;
                  const x2 = Math.cos(angle2) * 80;
                  const y2 = Math.sin(angle2) * 80;
                  const midX = (x1 + x2) / 2;
                  const midY = (y1 + y2) / 2;

                  return (
                    <line
                      key={`create-${element}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#59DE9B"
                      strokeWidth="2"
                      opacity="0.3"
                      markerEnd="url(#arrowCreate)"
                    />
                  );
                })}

                {/* Element nodes */}
                {(["wood", "fire", "earth", "metal", "water"] as Element[]).map((element, i) => {
                  const angle = (i * 72 - 90) * (Math.PI / 180);
                  const x = Math.cos(angle) * 80;
                  const y = Math.sin(angle) * 80;
                  const count = chart.elements[element];
                  const isStrong = count >= 2;

                  return (
                    <g key={element}>
                      {/* Glow for strong elements */}
                      {isStrong && (
                        <circle
                          cx={x}
                          cy={y}
                          r="24"
                          fill={ELEMENTS[element].color}
                          opacity="0.2"
                        />
                      )}
                      <circle
                        cx={x}
                        cy={y}
                        r="18"
                        fill={isStrong ? ELEMENTS[element].color : "transparent"}
                        stroke={ELEMENTS[element].color}
                        strokeWidth="2"
                      />
                      <text
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={isStrong ? "#0A0E1A" : ELEMENTS[element].color}
                        fontSize="10"
                        fontWeight="bold"
                      >
                        {element.charAt(0).toUpperCase()}
                      </text>
                      {/* Element name */}
                      <text
                        x={x}
                        y={y + 32}
                        textAnchor="middle"
                        fill="currentColor"
                        fontSize="8"
                        className="text-muted-foreground"
                      >
                        {element}
                      </text>
                    </g>
                  );
                })}

                {/* Arrow markers */}
                <defs>
                  <marker
                    id="arrowCreate"
                    markerWidth="6"
                    markerHeight="6"
                    refX="5"
                    refY="3"
                    orient="auto"
                  >
                    <path d="M0,0 L6,3 L0,6 Z" fill="#59DE9B" opacity="0.5" />
                  </marker>
                </defs>
              </svg>
            </div>
            <p className="text-sm text-muted-foreground text-center mt-4">
              The outer arrows show the creation cycle: Wood feeds Fire, Fire creates Earth, Earth yields Metal, Metal collects Water, Water nourishes Wood.
            </p>
          </div>
        </motion.section>

        {/* Key Insights Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mb-8"
        >
          <h2 className="text-sm tracking-wider text-muted-foreground uppercase mb-4 text-center">
            Key Life Insights
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-card/50 backdrop-blur border border-border rounded-xl p-5">
              <h3 className="text-primary font-semibold mb-2">Career Path</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {archetypeContent?.career}
              </p>
            </div>
            <div className="bg-card/50 backdrop-blur border border-border rounded-xl p-5">
              <h3 className="text-primary font-semibold mb-2">Relationships</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {archetypeContent?.relationships}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Harmony Score */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-xl p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Cosmic Harmony Score</p>
            <div className="text-5xl font-serif text-primary mb-2">{chart.harmonyScore}</div>
            <p className="text-sm text-muted-foreground">
              {chart.harmonyScore >= 80
                ? "Exceptionally balanced chart with strong cosmic alignment"
                : chart.harmonyScore >= 60
                ? "Well-balanced chart with good elemental distribution"
                : "Chart with distinct character - focus on strengthening weaker elements"}
            </p>
          </div>
        </motion.section>

        {/* Premium Upgrade CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mb-8"
        >
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 text-center">
            <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-serif text-foreground mb-2">
              Unlock Your Full Cosmic Potential
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Get daily personalized readings, consult the Oracle AI, explore your 10-year forecast, and discover compatibility insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/pricing">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
              </Link>
              <Link href="/daily">
                <Button variant="outline">
                  View Daily Reading
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" /> 10-Year Forecast
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" /> Oracle Chat
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" /> Compatibility
              </span>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
