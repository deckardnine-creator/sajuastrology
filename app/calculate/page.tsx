"use client";

import { useState, useEffect } from "react";
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
      // Save the chart to localStorage via auth context
      saveSajuChart(sajuChart);
      // Navigate to the reading page
      router.push("/reading");
    }
  };

  return (
    <main className="min-h-screen bg-background">
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
