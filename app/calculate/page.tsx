"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BirthDataForm } from "@/components/calculate/birth-data-form";
import { CalculationAnimation } from "@/components/calculate/calculation-animation";
import type { SajuChart } from "@/lib/saju-calculator";

type Phase = "input" | "calculating" | "waiting" | "error";

// Element colors for visual effects
const ELEMENT_COLORS: Record<string, string> = {
  wood: "#59DE9B",
  fire: "#EF4444",
  earth: "#F59E0B",
  metal: "#94A3B8",
  water: "#3B82F6",
};

// Reading generation steps — each shown progressively while waiting
const READING_STEPS = [
  { icon: "🏛", label: "Decoding your Four Pillars", sub: "Year · Month · Day · Hour" },
  { icon: "🌊", label: "Mapping the Five Elements", sub: "Wood · Fire · Earth · Metal · Water" },
  { icon: "✦", label: "Identifying your Day Master", sub: "The core of who you are" },
  { icon: "⚖", label: "Calculating elemental harmony", sub: "Strengths, tensions, and balance" },
  { icon: "🔮", label: "Consulting the Ten Gods", sub: "Your archetype is emerging…" },
  { icon: "📜", label: "Weaving your personal narrative", sub: "Almost there…" },
];

function ReadingLoader({ chart }: { chart: SajuChart | null }) {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Step progression: advance every 3.5s
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => Math.min(prev + 1, READING_STEPS.length - 1));
    }, 3500);

    // Smooth progress bar: 0→92% over ~22s (never reaches 100 until actually done)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return 92;
        // Fast start, slow finish (logarithmic feel)
        const increment = prev < 40 ? 2.5 : prev < 70 ? 1.2 : 0.4;
        return Math.min(prev + increment, 92);
      });
    }, 300);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const dayMasterElement = chart?.dayMaster?.element || "water";
  const accentColor = ELEMENT_COLORS[dayMasterElement] || ELEMENT_COLORS.water;

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        {/* Ambient glow based on user's element */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[120px] opacity-20 pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />

        {/* Pillar visualization */}
        <div className="flex justify-center gap-3 mb-8">
          {chart && ["year", "month", "day", "hour"].map((pillarName, i) => {
            const pillar = chart.pillars[pillarName as keyof typeof chart.pillars];
            const isRevealed = activeStep >= i;
            return (
              <div
                key={pillarName}
                className="text-center transition-all duration-700"
                style={{
                  opacity: isRevealed ? 1 : 0.2,
                  transform: isRevealed ? "translateY(0)" : "translateY(8px)",
                }}
              >
                <div className="text-2xl font-serif tracking-wide mb-1" style={{ color: accentColor }}>
                  {pillar.stem.zh}{pillar.branch.zh}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {pillarName}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="relative h-1 bg-white/5 rounded-full mb-8 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${accentColor}66, ${accentColor})`,
            }}
          />
          {/* Shimmer effect */}
          <div
            className="absolute inset-y-0 w-20 rounded-full animate-shimmer"
            style={{
              background: `linear-gradient(90deg, transparent, ${accentColor}40, transparent)`,
              animationDuration: "2s",
            }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {READING_STEPS.map((step, i) => {
            const isActive = i === activeStep;
            const isDone = i < activeStep;
            const isFuture = i > activeStep;

            return (
              <div
                key={i}
                className="flex items-center gap-3 transition-all duration-500"
                style={{
                  opacity: isFuture ? 0.15 : isDone ? 0.5 : 1,
                  transform: isActive ? "translateX(4px)" : "translateX(0)",
                }}
              >
                <span className="text-lg w-7 text-center flex-shrink-0">
                  {isDone ? "✓" : step.icon}
                </span>
                <div className="min-w-0">
                  <p className={`text-sm font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {step.label}
                  </p>
                  {isActive && (
                    <p className="text-xs text-muted-foreground/70 mt-0.5 animate-fadeIn">
                      {step.sub}
                    </p>
                  )}
                </div>
                {isActive && (
                  <div className="ml-auto flex-shrink-0">
                    <div
                      className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: `${accentColor} transparent ${accentColor} ${accentColor}` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom message */}
        <p className="text-center text-xs text-muted-foreground/50 mt-8">
          Your reading is crafted uniquely — this takes a moment
        </p>
      </div>

      {/* Shimmer animation keyframe */}
      <style jsx>{`
        @keyframes shimmer {
          0% { left: -20%; }
          100% { left: 120%; }
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

export default function CalculatePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("input");
  const [sajuChart, setSajuChart] = useState<SajuChart | null>(null);
  const [birthCity, setBirthCity] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const shareSlugRef = useRef<string | null>(null);
  const apiDoneRef = useRef(false);
  const apiErrorRef = useRef<string | null>(null);
  const animDoneRef = useRef(false);

  const tryNavigate = useCallback(() => {
    if (shareSlugRef.current && (animDoneRef.current || apiDoneRef.current)) {
      router.push(`/reading/${shareSlugRef.current}`);
    }
  }, [router]);

  const handleCalculate = async (chart: SajuChart, city: string) => {
    setSajuChart(chart);
    setBirthCity(city);
    setPhase("calculating");
    setErrorMessage("");
    shareSlugRef.current = null;
    apiDoneRef.current = false;
    apiErrorRef.current = null;
    animDoneRef.current = false;

    try {
      const res = await fetch("/api/reading/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chart }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: `Server error (${res.status})` }));
        const errMsg = errData.error || `Request failed with status ${res.status}`;
        console.error("API error:", errMsg);
        apiErrorRef.current = errMsg;
        apiDoneRef.current = true;

        if (animDoneRef.current) {
          setErrorMessage(errMsg);
          setPhase("error");
        }
        return;
      }

      const data = await res.json();
      if (!data.shareSlug) {
        const errMsg = "Invalid response: missing reading link";
        apiErrorRef.current = errMsg;
        apiDoneRef.current = true;
        if (animDoneRef.current) {
          setErrorMessage(errMsg);
          setPhase("error");
        }
        return;
      }

      shareSlugRef.current = data.shareSlug;
      apiDoneRef.current = true;
      tryNavigate();
    } catch (err: any) {
      const errMsg = err?.message || "Network error — please check your connection";
      console.error("API call failed:", err);
      apiErrorRef.current = errMsg;
      apiDoneRef.current = true;

      if (animDoneRef.current) {
        setErrorMessage(errMsg);
        setPhase("error");
      }
    }
  };

  const handleAnimationComplete = () => {
    animDoneRef.current = true;

    if (shareSlugRef.current) {
      router.push(`/reading/${shareSlugRef.current}`);
      return;
    }

    if (apiErrorRef.current) {
      setErrorMessage(apiErrorRef.current);
      setPhase("error");
      return;
    }

    // API still loading → show immersive waiting state
    setPhase("waiting");

    const checkInterval = setInterval(() => {
      if (shareSlugRef.current) {
        clearInterval(checkInterval);
        router.push(`/reading/${shareSlugRef.current}`);
      } else if (apiErrorRef.current) {
        clearInterval(checkInterval);
        setErrorMessage(apiErrorRef.current);
        setPhase("error");
      }
    }, 300);

    setTimeout(() => {
      clearInterval(checkInterval);
      if (!shareSlugRef.current && !apiErrorRef.current) {
        setErrorMessage("Reading generation timed out. Please try again.");
        setPhase("error");
      }
    }, 25000);
  };

  const handleRetry = () => {
    setErrorMessage("");
    setPhase("input");
  };

  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-10 -left-10 w-[450px] h-[450px] rounded-full bg-green-700/18 blur-[130px]" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-orange-600/15 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-blue-700/18 blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-cyan-500/12 blur-[130px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-yellow-500/10 blur-[140px]" />
      </div>

      {phase === "input" && (
        <>
          <div className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl flex h-16 items-center">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Back
              </button>
            </div>
          </div>
          <BirthDataForm onCalculate={handleCalculate} />
        </>
      )}
      {phase === "calculating" && sajuChart && (
        <CalculationAnimation
          chart={sajuChart}
          birthCity={birthCity}
          onComplete={handleAnimationComplete}
        />
      )}
      {phase === "waiting" && (
        <ReadingLoader chart={sajuChart} />
      )}
      {phase === "error" && (
        <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
          <div className="text-center px-6 max-w-md">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <p className="text-xl font-serif text-primary mb-3">Something went wrong</p>
            <p className="text-sm text-muted-foreground mb-6">
              {errorMessage || "We couldn't generate your reading. Please try again."}
            </p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
              </svg>
              Try Again
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
