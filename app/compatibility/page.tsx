"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, Heart, Loader2, Users } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import { searchCities, type City } from "@/lib/cities-data";
import { safeGet, safeSet } from "@/lib/safe-storage";

type Step = "personA" | "personB" | "loading";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => CURRENT_YEAR - i);

const HOUR_LABELS: Record<number, string> = {
  0: "12 AM (Midnight)", 1: "1 AM", 2: "2 AM", 3: "3 AM", 4: "4 AM", 5: "5 AM",
  6: "6 AM", 7: "7 AM", 8: "8 AM", 9: "9 AM", 10: "10 AM", 11: "11 AM",
  12: "12 PM (Noon)", 13: "1 PM", 14: "2 PM", 15: "3 PM", 16: "4 PM", 17: "5 PM",
  18: "6 PM", 19: "7 PM", 20: "8 PM", 21: "9 PM", 22: "10 PM", 23: "11 PM",
};

const getLoadingSteps = (locale: "en" | "ko" | "ja") => [
  { icon: "☯", label: t("compat.load1.label", locale), sub: t("compat.load1.sub", locale) },
  { icon: "🔥", label: t("compat.load2.label", locale), sub: t("compat.load2.sub", locale) },
  { icon: "💫", label: t("compat.load3.label", locale), sub: t("compat.load3.sub", locale) },
  { icon: "⚡", label: t("compat.load4.label", locale), sub: t("compat.load4.sub", locale) },
  { icon: "📜", label: t("compat.load5.label", locale), sub: t("compat.load5.sub", locale) },
];

interface PersonData {
  name: string;
  gender: "male" | "female" | "";
  year: number;
  month: number;
  day: number;
  hour: number;
  cityQuery: string;
  selectedCity: City | null;
}

const emptyPerson = (): PersonData => ({
  name: "",
  gender: "",
  year: CURRENT_YEAR - 25,
  month: 1,
  day: 1,
  hour: 12,
  cityQuery: "",
  selectedCity: null,
});

export default function CompatibilityPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <CompatibilityContent />
    </Suspense>
  );
}

function CompatibilityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, sajuData } = useAuth();
  const { locale } = useLanguage();

  const [step, setStep] = useState<Step>("personA");
  const [personA, setPersonA] = useState<PersonData>(emptyPerson());
  const [personB, setPersonB] = useState<PersonData>(emptyPerson());
  const [error, setError] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [autoFilled, setAutoFilled] = useState(false);

  // Auto-fill Person A from existing chart
  useEffect(() => {
    if (autoFilled) return;
    const mySlug = searchParams.get("my");

    // Try from sajuData (auth context)
    if (sajuData.chart) {
      const bd = typeof sajuData.chart.birthDate === "string"
        ? new Date(sajuData.chart.birthDate)
        : sajuData.chart.birthDate;
      setPersonA({
        name: sajuData.chart.name,
        gender: sajuData.chart.gender,
        year: bd.getFullYear(),
        month: bd.getMonth() + 1,
        day: bd.getDate(),
        hour: 12,
        cityQuery: sajuData.chart.birthCity,
        selectedCity: { name: sajuData.chart.birthCity, country: "", lat: 0, lng: 0 } as City,
      });
      setAutoFilled(true);
      // If came from reading page, skip to Person B
      if (mySlug) setStep("personB");
      return;
    }

    // Try from localStorage
    try {
      const raw = safeGet("saju-data");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.chart) {
          const bd = new Date(parsed.chart.birthDate);
          setPersonA({
            name: parsed.chart.name,
            gender: parsed.chart.gender,
            year: bd.getFullYear(),
            month: bd.getMonth() + 1,
            day: bd.getDate(),
            hour: 12,
            cityQuery: parsed.chart.birthCity,
            selectedCity: { name: parsed.chart.birthCity, country: "", lat: 0, lng: 0 } as City,
          });
          setAutoFilled(true);
          if (mySlug) setStep("personB");
        }
      }
    } catch {}
  }, [sajuData.chart, searchParams, autoFilled]);

  // Warn before leaving during generation
  useEffect(() => {
    if (step !== "loading") return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Your compatibility reading is being generated. Please stay on this page.";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [step]);

  const handleSubmit = async () => {
    if (!personA.name || !personA.gender || !personA.selectedCity) return;
    if (!personB.name || !personB.gender || !personB.selectedCity) return;

    // Self-compatibility check
    if (
      personA.name.trim().toLowerCase() === personB.name.trim().toLowerCase() &&
      personA.year === personB.year &&
      personA.month === personB.month &&
      personA.day === personB.day
    ) {
      setError(t("compat.samePerson", locale));
      return;
    }

    setStep("loading");
    setLoadingStep(0);
    setProgress(0);
    setError("");

    // Start loading animation
    const stepTimer = setInterval(() => {
      setLoadingStep((prev) => Math.min(prev + 1, getLoadingSteps(locale).length - 1));
    }, 3500);
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return 92;
        return Math.min(prev + (prev < 40 ? 2.5 : prev < 70 ? 1.2 : 0.4), 92);
      });
    }, 300);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 55000); // 55s timeout

      const res = await fetch("/api/compatibility/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          personA: {
            name: personA.name,
            gender: personA.gender,
            birthDate: `${personA.year}-${String(personA.month).padStart(2, "0")}-${String(personA.day).padStart(2, "0")}`,
            birthHour: personA.hour,
            birthCity: personA.selectedCity.name,
          },
          personB: {
            name: personB.name,
            gender: personB.gender,
            birthDate: `${personB.year}-${String(personB.month).padStart(2, "0")}-${String(personB.day).padStart(2, "0")}`,
            birthHour: personB.hour,
            birthCity: personB.selectedCity.name,
          },
          userId: user?.id || null,
          locale,
        }),
      });

      clearInterval(stepTimer);
      clearInterval(progressTimer);
      clearTimeout(timeout);

      const data = await res.json();
      if (!res.ok || !data.shareSlug) {
        setError(data.error || t("common.error", locale));
        setStep("personB");
        return;
      }

      // Save slug for dashboard claiming (if user logs in later)
      try {
        const pending = JSON.parse(safeGet("pending-compat-slugs") || "[]");
        pending.push(data.shareSlug);
        safeSet("pending-compat-slugs", JSON.stringify(pending.slice(-10)));
      } catch {}

      router.push(`/compatibility/result/${data.shareSlug}`);
    } catch (err: any) {
      clearInterval(stepTimer);
      clearInterval(progressTimer);
      setError(err?.name === "AbortError" ? t("common.error", locale) : t("common.error", locale));
      setStep("personB");
    }
  };

  const isAValid = personA.name && personA.gender && personA.selectedCity;
  const isBValid = personB.name && personB.gender && personB.selectedCity;

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-lg px-4 sm:px-6">

          {/* Back button */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <button
              onClick={() => step === "personB" ? setStep("personA") : router.back()}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {step === "personB" ? t("compat.backToYour", locale) : t("common.back", locale)}
            </button>
          </motion.div>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 text-sm mb-4">
              <Heart className="w-4 h-4" />
              {t("compat.badge", locale)}
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2">
              {t("compat.title1", locale)} <span className="gold-gradient-text">{t("compat.title2", locale)}</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("compat.desc", locale)}
            </p>
          </motion.div>

          {/* Step indicator */}
          {step !== "loading" && (
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${step === "personA" ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary/60"}`}>
                <span className="w-5 h-5 rounded-full bg-primary/30 flex items-center justify-center text-[10px]">1</span>
                {t("compat.you", locale)}
              </div>
              <div className="w-8 h-px bg-border" />
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${step === "personB" ? "bg-pink-500/20 text-pink-300" : "bg-muted/30 text-muted-foreground/50"}`}>
                <span className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center text-[10px]">2</span>
                {t("compat.partner", locale)}
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* ─── Person A ─── */}
            {step === "personA" && (
              <motion.div key="personA" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {autoFilled && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 mb-6 text-center">
                    <p className="text-sm text-primary">
                      ✦ {t("compat.autoFilled", locale)}
                    </p>
                    <button
                      className="text-xs text-muted-foreground hover:text-foreground mt-1"
                      onClick={() => { setPersonA(emptyPerson()); setAutoFilled(false); }}
                    >
                      {t("compat.enterDifferent", locale)}
                    </button>
                  </div>
                )}

                <PersonForm
                  label={t("compat.yourInfo", locale)}
                  data={personA}
                  onChange={setPersonA}
                  locale={locale}
                />

                <Button
                  onClick={() => setStep("personB")}
                  disabled={!isAValid}
                  className="w-full h-12 gold-gradient text-primary-foreground font-semibold mt-6"
                >
                  {t("compat.next", locale)}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {/* ─── Person B ─── */}
            {step === "personB" && (
              <motion.div key="personB" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <PersonForm
                  label={t("compat.partnerInfo", locale)}
                  data={personB}
                  onChange={setPersonB}
                  locale={locale}
                />

                {error && (
                  <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={!isBValid}
                  className="w-full h-12 mt-6 font-semibold"
                  style={{ background: "linear-gradient(135deg, #ec4899, #a855f7)", color: "white" }}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {t("compat.check", locale)}
                </Button>

                <p className="text-center text-xs text-muted-foreground/50 mt-3">
                  {t("compat.freeNoCard", locale)}
                </p>
              </motion.div>
            )}

            {/* ─── Loading ─── */}
            {step === "loading" && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <CompatibilityLoader activeStep={loadingStep} progress={progress} nameA={personA.name} nameB={personB.name} locale={locale} />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
      {step !== "loading" && <Footer />}
    </main>
  );
}

/* ─── Person Form Component ─── */

function PersonForm({ label, data, onChange, locale }: {
  label: string;
  data: PersonData;
  onChange: (data: PersonData) => void;
  locale: "en" | "ko" | "ja";
}) {
  const [cityResults, setCityResults] = useState<City[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  useEffect(() => {
    if (data.cityQuery.length < 2 || data.selectedCity) {
      setCityResults([]);
      setShowCityDropdown(false);
      return;
    }
    const results = searchCities(data.cityQuery);
    setCityResults(results);
    setShowCityDropdown(results.length > 0);
  }, [data.cityQuery, data.selectedCity]);

  const daysInMonth = new Date(data.year, data.month, 0).getDate();

  return (
    <div className="bg-card/50 border border-border rounded-2xl p-5 sm:p-6">
      <h2 className="font-serif text-lg font-semibold mb-5 flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        {label}
      </h2>

      {/* Name */}
      <div className="mb-4">
        <label className="block text-sm text-muted-foreground mb-1.5">{t("form.name", locale)}</label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder={t("form.namePlaceholder", locale)}
          className="w-full h-11 rounded-xl bg-background/50 border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
        />
      </div>

      {/* Gender */}
      <div className="mb-4">
        <label className="block text-sm text-muted-foreground mb-1.5">{t("form.gender", locale)}</label>
        <div className="grid grid-cols-2 gap-3">
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              onClick={() => onChange({ ...data, gender: g })}
              className={`h-11 rounded-xl border text-sm font-medium transition-all ${
                data.gender === g
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card/50 text-muted-foreground hover:border-muted-foreground/30"
              }`}
            >
              {g === "male" ? t("form.male", locale) : t("form.female", locale)}
            </button>
          ))}
        </div>
      </div>

      {/* Birth Date */}
      <div className="mb-4">
        <label className="block text-sm text-muted-foreground mb-1.5">{t("form.birthDate", locale)}</label>
        <div className="grid grid-cols-3 gap-2">
          <select
            value={data.year}
            onChange={(e) => onChange({ ...data, year: Number(e.target.value) })}
            className="h-11 rounded-xl bg-background/50 border border-border px-2 text-sm text-foreground focus:border-primary transition-colors appearance-none text-center"
          >
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            value={data.month}
            onChange={(e) => onChange({ ...data, month: Number(e.target.value), day: Math.min(data.day, new Date(data.year, Number(e.target.value), 0).getDate()) })}
            className="h-11 rounded-xl bg-background/50 border border-border px-2 text-sm text-foreground focus:border-primary transition-colors appearance-none text-center"
          >
            {MONTHS.map((m) => <option key={m} value={m}>{String(m).padStart(2, "0")}</option>)}
          </select>
          <select
            value={data.day}
            onChange={(e) => onChange({ ...data, day: Number(e.target.value) })}
            className="h-11 rounded-xl bg-background/50 border border-border px-2 text-sm text-foreground focus:border-primary transition-colors appearance-none text-center"
          >
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>{String(d).padStart(2, "0")}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Birth Hour */}
      <div className="mb-4">
        <label className="block text-sm text-muted-foreground mb-1.5">{t("form.birthHour", locale)} <span className="text-muted-foreground/50">({t("form.birthHourNote", locale).replace(/[()]/g, "")})</span></label>
        <select
          value={data.hour}
          onChange={(e) => onChange({ ...data, hour: Number(e.target.value) })}
          className="w-full h-11 rounded-xl bg-background/50 border border-border px-3 text-sm text-foreground focus:border-primary transition-colors"
        >
          {HOURS.map((h) => <option key={h} value={h}>{HOUR_LABELS[h]}</option>)}
        </select>
      </div>

      {/* Birth City */}
      <div className="relative">
        <label className="block text-sm text-muted-foreground mb-1.5">{t("form.birthCity", locale)}</label>
        <input
          type="text"
          value={data.cityQuery}
          onChange={(e) => onChange({ ...data, cityQuery: e.target.value, selectedCity: null })}
          placeholder={t("form.cityPlaceholder", locale)}
          className="w-full h-11 rounded-xl bg-background/50 border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
        />
        {data.selectedCity && (
          <p className="text-xs text-primary mt-1">✓ {data.selectedCity.name}</p>
        )}
        {showCityDropdown && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
            {cityResults.map((city) => (
              <button
                key={`${city.name}-${city.lat}`}
                onClick={() => {
                  onChange({ ...data, cityQuery: city.name, selectedCity: city });
                  setShowCityDropdown(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/10 transition-colors"
              >
                <span className="text-foreground">{city.name}</span>
                <span className="text-muted-foreground/60 ml-2">{city.country}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Loading Animation ─── */

function CompatibilityLoader({ activeStep, progress, nameA, nameB, locale }: {
  activeStep: number;
  progress: number;
  nameA: string;
  nameB: string;
  locale: "en" | "ko" | "ja";
}) {
  const loadingSteps = getLoadingSteps(locale);
  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh]">
      <div className="w-full max-w-md">
        {/* Orbiting circles */}
        <div className="flex justify-center mb-10">
          <div className="relative w-40 h-40">
            {/* Outer ring */}
            <motion.div
              className="absolute inset-0 rounded-full border border-pink-500/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            {/* Person A orbiting */}
            <motion.div
              className="absolute w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center"
              animate={{
                left: ["10%", "60%", "60%", "10%", "10%"],
                top: ["20%", "10%", "60%", "70%", "20%"],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-xs font-bold text-primary truncate max-w-[3rem]">{nameA.split(" ")[0]}</span>
            </motion.div>
            {/* Person B orbiting */}
            <motion.div
              className="absolute w-14 h-14 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center"
              animate={{
                left: ["60%", "10%", "10%", "60%", "60%"],
                top: ["60%", "70%", "20%", "10%", "60%"],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-xs font-bold text-pink-300 truncate max-w-[3rem]">{nameB.split(" ")[0]}</span>
            </motion.div>
            {/* Center pulse */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center"
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="w-4 h-4 text-pink-400" />
            </motion.div>
          </div>
        </div>

        <h3 className="font-serif text-xl text-center mb-1">{t("compat.readingStars", locale)}</h3>
        <p className="text-xs text-center text-muted-foreground/60 mb-6">
          {nameA.split(" ")[0]} & {nameB.split(" ")[0]} — {t("compat.analyzingPair", locale)}
        </p>

        {/* Progress bar */}
        <div className="relative h-1.5 bg-white/5 rounded-full mb-6 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, #F2CA50, #EC4899, #A855F7)" }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Do not leave warning */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2 mb-6">
          <p className="text-[11px] text-amber-400/80 text-center">
            ⚠️ {t("compat.stayOnPage", locale)}
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {loadingSteps.map((s, i) => {
            const isActive = i === activeStep;
            const isDone = i < activeStep;
            const isFuture = i > activeStep;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isFuture ? 0.15 : isDone ? 0.45 : 1, x: isActive ? 4 : 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <span className="text-lg w-7 text-center flex-shrink-0">{isDone ? "✓" : s.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${isActive ? "text-pink-300" : isDone ? "text-muted-foreground/80" : "text-muted-foreground"}`}>{s.label}</p>
                  {isActive && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-muted-foreground/70 mt-0.5">{s.sub}</motion.p>
                  )}
                </div>
                {isActive && (
                  <div className="w-4 h-4 rounded-full border-2 border-pink-400 border-t-transparent animate-spin" />
                )}
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-[11px] text-muted-foreground/40 mt-8">
          {t("compat.craftingPair", locale)}
        </p>
      </div>
    </div>
  );
}
