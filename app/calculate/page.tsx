"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BirthDataForm } from "@/components/calculate/birth-data-form";
import { CalculationAnimation } from "@/components/calculate/calculation-animation";
import type { SajuChart } from "@/lib/saju-calculator";

type Phase = "input" | "calculating" | "waiting" | "error";

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

    // Call AI API in background while animation plays
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

        // If animation already finished, show error immediately
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
      // API already done → navigate immediately
      router.push(`/reading/${shareSlugRef.current}`);
      return;
    }

    if (apiErrorRef.current) {
      // API already failed → show error
      setErrorMessage(apiErrorRef.current);
      setPhase("error");
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
        setErrorMessage(apiErrorRef.current);
        setPhase("error");
      }
    }, 300);

    // Give up after 25 more seconds
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
