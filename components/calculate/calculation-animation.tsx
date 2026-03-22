"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ELEMENTS, type SajuChart } from "@/lib/saju-calculator";

interface CalculationAnimationProps {
  chart: SajuChart;
  birthCity: string;
  onComplete: () => void;
}

const PHASES = [
  { text: "Aligning celestial coordinates...", duration: 1000 },
  { text: "Mapping your Four Pillars...", duration: 1200 },
  { text: "Calculating elemental balance...", duration: 1000 },
  { text: "Decoding your archetype...", duration: 1000 },
  { text: "Your cosmic blueprint is ready.", duration: 800 },
];

export function CalculationAnimation({ chart, birthCity, onComplete }: CalculationAnimationProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [pillarsRevealed, setPillarsRevealed] = useState(0);
  const [elementsLit, setElementsLit] = useState<string[]>([]);

  useEffect(() => {
    let totalDelay = 0;

    PHASES.forEach((phase, index) => {
      setTimeout(() => {
        setCurrentPhase(index);

        // Reveal pillars during phase 1
        if (index === 1) {
          [0, 1, 2, 3].forEach((pillarIndex, i) => {
            setTimeout(() => setPillarsRevealed(pillarIndex + 1), i * 250);
          });
        }

        // Light up elements during phase 2
        if (index === 2) {
          const elementOrder = ["wood", "fire", "earth", "metal", "water"];
          elementOrder.forEach((element, i) => {
            setTimeout(() => setElementsLit((prev) => [...prev, element]), i * 200);
          });
        }
      }, totalDelay);

      totalDelay += phase.duration;
    });

    // Complete after all phases
    setTimeout(onComplete, totalDelay + 500);
  }, [onComplete]);

  const pillars = [
    { name: "Year", pillar: chart.pillars.year },
    { name: "Month", pillar: chart.pillars.month },
    { name: "Day", pillar: chart.pillars.day },
    { name: "Hour", pillar: chart.pillars.hour },
  ];

  const elements = ["wood", "fire", "earth", "metal", "water"] as const;

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        {/* Radial gradient pulse */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(242,202,80,0.1) 0%, transparent 50%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* Phase Text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={currentPhase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-xl md:text-2xl font-serif text-primary mb-12"
          >
            {PHASES[currentPhase].text}
          </motion.p>
        </AnimatePresence>

        {/* Phase 0: City zoom visualization */}
        {currentPhase === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-48 flex items-center justify-center"
          >
            {/* Globe/Map representation */}
            <div className="relative">
              <motion.div
                className="w-32 h-32 rounded-full border-2 border-primary/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                {/* Longitude line */}
                <motion.div
                  className="absolute top-0 left-1/2 w-0.5 h-full bg-gradient-to-b from-primary via-primary to-primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
                {/* Latitude lines */}
                {[20, 40, 60, 80].map((top, i) => (
                  <div
                    key={i}
                    className="absolute w-full border-t border-primary/20"
                    style={{ top: `${top}%` }}
                  />
                ))}
              </motion.div>
              {/* City marker */}
              <motion.div
                className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-primary"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 1] }}
                transition={{ duration: 0.5, delay: 0.3 }}
              />
              <motion.p
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm text-muted-foreground whitespace-nowrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {birthCity}
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* Phase 1: Four Pillars reveal */}
        {currentPhase === 1 && (
          <div className="flex justify-center gap-4 md:gap-6">
            {pillars.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: i < pillarsRevealed ? 1 : 0.3,
                  y: i < pillarsRevealed ? 0 : 20,
                }}
                className={`bg-card/50 backdrop-blur border rounded-lg p-4 w-20 md:w-24 ${
                  p.name === "Day" ? "border-primary" : "border-border"
                }`}
              >
                <p className="text-xs text-muted-foreground mb-2">{p.name}</p>
                <motion.div
                  className="text-2xl md:text-3xl font-serif text-primary"
                  animate={i < pillarsRevealed ? {
                    textShadow: ["0 0 10px rgba(242,202,80,0)", "0 0 20px rgba(242,202,80,0.5)", "0 0 10px rgba(242,202,80,0)"],
                  } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {i < pillarsRevealed ? p.pillar.stem.zh : "?"}
                </motion.div>
                <div className="text-lg text-muted-foreground">
                  {i < pillarsRevealed ? p.pillar.branch.zh : "?"}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Phase 2: Elements orbit */}
        {currentPhase === 2 && (
          <div className="relative h-48 flex items-center justify-center">
            <div className="relative w-48 h-48">
              {elements.map((element, i) => {
                const angle = (i * 72 - 90) * (Math.PI / 180);
                const radius = 80;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const isLit = elementsLit.includes(element);

                return (
                  <motion.div
                    key={element}
                    className={`absolute w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                      isLit ? "scale-110" : "scale-100"
                    }`}
                    style={{
                      left: `calc(50% + ${x}px - 24px)`,
                      top: `calc(50% + ${y}px - 24px)`,
                      backgroundColor: isLit ? ELEMENTS[element].color : "transparent",
                      border: `2px solid ${ELEMENTS[element].color}`,
                      color: isLit ? "#0A0E1A" : ELEMENTS[element].color,
                      boxShadow: isLit ? `0 0 20px ${ELEMENTS[element].color}` : "none",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {element.charAt(0).toUpperCase()}
                  </motion.div>
                );
              })}
              {/* Center pentagon connecting lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="-100 -100 200 200">
                <motion.polygon
                  points={elements.map((_, i) => {
                    const angle = (i * 72 - 90) * (Math.PI / 180);
                    return `${Math.cos(angle) * 55},${Math.sin(angle) * 55}`;
                  }).join(" ")}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-primary/30"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1 }}
                />
              </svg>
            </div>
          </div>
        )}

        {/* Phase 3: Archetype reveal */}
        {currentPhase === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8"
          >
            <motion.h2
              className="text-4xl md:text-5xl font-serif text-primary"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                backgroundImage: "linear-gradient(90deg, #F2CA50, #59DE9B, #F2CA50)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {chart.archetype}
            </motion.h2>
          </motion.div>
        )}

        {/* Phase 4: Ready */}
        {currentPhase === 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8"
          >
            <motion.div
              className="w-16 h-16 mx-auto rounded-full bg-accent/20 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <motion.div
                className="w-8 h-8 rounded-full bg-accent"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-12">
          {PHASES.map((_, i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i <= currentPhase ? "bg-primary" : "bg-muted"
              }`}
              animate={i === currentPhase ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.5 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
