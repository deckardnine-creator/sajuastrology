"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BirthDataForm } from "@/components/calculate/birth-data-form";
import { CalculationAnimation } from "@/components/calculate/calculation-animation";
import { useAuth } from "@/lib/auth-context";
import type { SajuChart } from "@/lib/saju-calculator";

type Phase = "input" | "calculating";

export default function CalculatePage() {
  const router = useRouter();
  const { saveSajuChart } = useAuth();
  const [phase, setPhase] = useState<Phase>("input");
  const [sajuChart, setSajuChart] = useState<SajuChart | null>(null);
  const [birthCity, setBirthCity] = useState<string>("");

  const handleCalculate = (chart: SajuChart, city: string) => {
    setSajuChart(chart);
    setBirthCity(city);
    setPhase("calculating");
  };

  const handleAnimationComplete = () => {
    if (sajuChart) {
      saveSajuChart(sajuChart);
      router.push("/reading");
    }
  };

  return (
    <main className="relative min-h-screen bg-background overflow-hidden">

      {/* Birth moment — four pillars elemental glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        {/* Wood — green top-left */}
        <div className="absolute -top-10 -left-10 w-[450px] h-[450px] rounded-full bg-green-700/18 blur-[130px]" />
        {/* Fire — orange top-right */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-orange-600/15 blur-[120px]" />
        {/* Water — blue bottom-left */}
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-blue-700/18 blur-[140px]" />
        {/* Metal — cyan bottom-right */}
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-cyan-500/12 blur-[130px]" />
        {/* Earth — gold center */}
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
