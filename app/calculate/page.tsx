"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { BirthDataForm } from "@/components/calculate/birth-data-form";
import { CalculationAnimation } from "@/components/calculate/calculation-animation";
import type { SajuChart } from "@/lib/saju-calculator";

type Phase = "input" | "calculating";

export default function CalculatePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("input");
  const [sajuChart, setSajuChart] = useState<SajuChart | null>(null);
  const [birthCity, setBirthCity] = useState<string>("");
  const apiResultRef = useRef<{ shareSlug: string } | null>(null);
  const apiErrorRef = useRef<string | null>(null);

  const handleCalculate = async (chart: SajuChart, city: string) => {
    setSajuChart(chart);
    setBirthCity(city);
    setPhase("calculating");

    // Call AI API in background while animation plays
    try {
      const res = await fetch("/api/reading/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chart }),
      });

      if (!res.ok) {
        const errData = await res.json();
        apiErrorRef.current = errData.error || "Failed to generate reading";
        return;
      }

      const data = await res.json();
      apiResultRef.current = { shareSlug: data.shareSlug };
    } catch (err) {
      console.error("API call failed:", err);
      apiErrorRef.current = "Network error";
    }
  };

  const handleAnimationComplete = () => {
    if (apiResultRef.current?.shareSlug) {
      // AI reading ready → go to personalized reading page
      router.push(`/reading/${apiResultRef.current.shareSlug}`);
    } else if (apiErrorRef.current) {
      // API failed → still go to reading page with fallback
      alert("Reading generation took longer than expected. Please try again.");
      setPhase("input");
    } else {
      // API still loading → wait a bit more then redirect
      const checkInterval = setInterval(() => {
        if (apiResultRef.current?.shareSlug) {
          clearInterval(checkInterval);
          router.push(`/reading/${apiResultRef.current.shareSlug}`);
        }
      }, 500);
      // Timeout after 30 more seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!apiResultRef.current?.shareSlug) {
          alert("Reading generation is taking longer than usual. Please try again.");
          setPhase("input");
        }
      }, 30000);
    }
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
    </main>
  );
}
