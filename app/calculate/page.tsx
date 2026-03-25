"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BirthDataForm } from "@/components/calculate/birth-data-form";
import { CalculationAnimation } from "@/components/calculate/calculation-animation";
import type { SajuChart } from "@/lib/saju-calculator";

type Phase = "input" | "calculating" | "waiting";

export default function CalculatePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("input");
  const [sajuChart, setSajuChart] = useState<SajuChart | null>(null);
  const [birthCity, setBirthCity] = useState<string>("");
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
    shareSlugRef.current = null;
    apiDoneRef.current = false;
    apiErrorRef.current = null;
    animDoneRef.current = false;

    // Call AI API in background while animation plays
    try {
      const res = await fetch("/api/reading/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chart }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Unknown error" }));
        console.error("API error:", errData);
        apiErrorRef.current = errData.error || "Failed";
        apiDoneRef.current = true;
        return;
      }

      const data = await res.json();
      shareSlugRef.current = data.shareSlug;
      apiDoneRef.current = true;
      tryNavigate();
    } catch (err) {
      console.error("API call failed:", err);
      apiErrorRef.current = "Network error";
      apiDoneRef.current = true;
    }
  };

  const handleAnimationComplete = () => {
    animDoneRef.current = true;

    if (shareSlugRef.current) {
      // API already done → navigate immediately
      router.push(`/reading/${shareSlugRef.current}`);
      return;
    }

    if (apiErrorRef.current) {
      setPhase("input");
      return;
    }

    // API still loading → show waiting state
    setPhase("waiting");

    // Poll for completion
    const checkInterval = setInterval(() => {
      if (shareSlugRef.current) {
        clearInterval(checkInterval);
        router.push(`/reading/${shareSlugRef.current}`);
      } else if (apiErrorRef.current) {
        clearInterval(checkInterval);
        setPhase("input");
      }
    }, 300);

    // Give up after 25 more seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      if (!shareSlugRef.current) {
        setPhase("input");
      }
    }, 25000);
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
        <BirthDataForm onCalculate={handleCalculate} />
      )}
      {phase === "calculating" && sajuChart && (
        <CalculationAnimation
          chart={sajuChart}
          birthCity={birthCity}
          onComplete={handleAnimationComplete}
        />
      )}
      {phase === "waiting" && (
        <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
          <div className="text-center px-6">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-xl font-serif text-primary mb-2">Reading the stars for you...</p>
            <p className="text-sm text-muted-foreground">Your personalized reading is being crafted. Just a few more seconds.</p>
          </div>
        </div>
      )}
    </main>
  );
}
