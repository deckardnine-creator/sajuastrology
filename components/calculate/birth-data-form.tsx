"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, animate, AnimatePresence } from "framer-motion";
import { MapPin, User, Sparkles, Check, Globe, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calculateSaju, type SajuChart } from "@/lib/saju-calculator";
import { searchCities, formatLongitude, calculateSolarVariance, type City } from "@/lib/cities-data";

// ── Value arrays ──────────────────────────────────────────────
const CUR_YEAR = new Date().getFullYear();
const YEARS   = Array.from({ length: CUR_YEAR - 1919 }, (_, i) => String(1920 + i));
const MONTHS  = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const DAYS    = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
const HOURS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

// ── Star positions (golden-angle distribution — deterministic, no hydration issue) ──
const STARS = Array.from({ length: 70 }, (_, i) => {
  const angle = i * 2.399963;
  const r = Math.sqrt((i + 0.5) / 70);
  return {
    x: 50 + r * 48 * Math.cos(angle),
    y: 50 + r * 48 * Math.sin(angle),
    size: i % 7 === 0 ? 2.2 : i % 3 === 0 ? 1.5 : 0.9,
    delay: (i * 0.17) % 4,
    dur: 2.5 + (i % 6) * 0.4,
    baseOpacity: 0.2 + (i % 5) * 0.1,
  };
});

// ── Constellation pairs (index into STARS) ──
const CONST_LINES = [
  [2, 9], [9, 18], [18, 28], [28, 2],
  [5, 14], [14, 23], [23, 5],
  [1, 8], [8, 20],
];

// ── Drum Roller ───────────────────────────────────────────────
const ITEM_H = 52;
const VISIBLE = 5;

interface DrumRollerProps {
  values: string[];
  selectedIndex: number;
  onChange: (i: number) => void;
  label: string;
  width?: number;
}

function DrumRoller({ values, selectedIndex, onChange, label, width = 72 }: DrumRollerProps) {
  const containerH = ITEM_H * VISIBLE;
  const y = useMotionValue((-selectedIndex + 2) * ITEM_H);
  const isDragging = useRef(false);

  // Sync external selectedIndex → animate y
  useEffect(() => {
    if (!isDragging.current) {
      animate(y, (-selectedIndex + 2) * ITEM_H, {
        type: "spring", stiffness: 320, damping: 32,
      });
    }
  }, [selectedIndex, y]);

  const snapToNearest = () => {
    const curr = y.get();
    const rawIdx = 2 - curr / ITEM_H;
    const idx = Math.max(0, Math.min(values.length - 1, Math.round(rawIdx)));
    onChange(idx);
    animate(y, (-idx + 2) * ITEM_H, {
      type: "spring", stiffness: 320, damping: 32,
    });
  };

  return (
    <div className="flex flex-col items-center gap-2.5">
      <span className="text-[10px] tracking-[0.18em] uppercase" style={{ color: "rgba(242,202,80,0.5)" }}>
        {label}
      </span>

      <div
        style={{ height: containerH, width, overflow: "hidden", position: "relative", borderRadius: 14 }}
        className="border border-primary/20 bg-black/40 backdrop-blur-sm"
      >
        {/* Top gradient fade */}
        <div
          className="absolute inset-x-0 top-0 z-20 pointer-events-none"
          style={{ height: ITEM_H * 2.2, background: "linear-gradient(to bottom, #060810 0%, #060810 20%, transparent 100%)" }}
        />
        {/* Bottom gradient fade */}
        <div
          className="absolute inset-x-0 bottom-0 z-20 pointer-events-none"
          style={{ height: ITEM_H * 2.2, background: "linear-gradient(to top, #060810 0%, #060810 20%, transparent 100%)" }}
        />
        {/* Selection ring */}
        <div
          className="absolute inset-x-0 z-10 pointer-events-none"
          style={{
            top: ITEM_H * 2,
            height: ITEM_H,
            borderTop: "1px solid rgba(242,202,80,0.35)",
            borderBottom: "1px solid rgba(242,202,80,0.35)",
            background: "linear-gradient(90deg, transparent, rgba(242,202,80,0.06), transparent)",
          }}
        />
        {/* Gold ambient glow at center */}
        <div
          className="absolute inset-x-0 z-0 pointer-events-none"
          style={{
            top: ITEM_H * 1.5,
            height: ITEM_H * 2,
            background: "radial-gradient(ellipse at center, rgba(242,202,80,0.08) 0%, transparent 70%)",
          }}
        />

        <motion.div
          style={{ y }}
          drag="y"
          dragConstraints={{ top: (-(values.length - 1) + 2) * ITEM_H, bottom: 2 * ITEM_H }}
          dragElastic={0.08}
          onDragStart={() => { isDragging.current = true; }}
          onDragEnd={() => { isDragging.current = false; snapToNearest(); }}
          className="cursor-grab active:cursor-grabbing"
        >
          {values.map((val, i) => {
            const dist = Math.abs(i - selectedIndex);
            return (
              <motion.div
                key={val}
                style={{ height: ITEM_H }}
                className="flex items-center justify-center"
                onClick={() => onChange(i)}
              >
                <motion.span
                  animate={{
                    opacity: dist === 0 ? 1 : dist === 1 ? 0.38 : dist === 2 ? 0.14 : 0.05,
                    scale: dist === 0 ? 1.18 : dist === 1 ? 0.92 : 0.8,
                    color: dist === 0 ? "#F2CA50" : "#888780",
                  }}
                  transition={{ duration: 0.18 }}
                  style={{
                    fontSize: dist === 0 ? 22 : 16,
                    fontWeight: dist === 0 ? 600 : 400,
                    fontFamily: "var(--font-mono, monospace)",
                    userSelect: "none",
                    letterSpacing: "0.05em",
                    textShadow: dist === 0 ? "0 0 16px rgba(242,202,80,0.6)" : "none",
                  }}
                >
                  {val}
                </motion.span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
interface BirthDataFormProps {
  onCalculate: (chart: SajuChart, city: string) => void;
}

export function BirthDataForm({ onCalculate }: BirthDataFormProps) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | null>(null);

  // Date state
  const [yearIdx,  setYearIdx]  = useState(() => YEARS.indexOf("1990"));
  const [monthIdx, setMonthIdx] = useState(0);
  const [dayIdx,   setDayIdx]   = useState(0);

  // Time state
  const [hourIdx,   setHourIdx]   = useState(12);
  const [minuteIdx, setMinuteIdx] = useState(0);
  const [unknownTime, setUnknownTime] = useState(false);

  // City
  const [cityQuery, setCityQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [cityResults, setCityResults] = useState<City[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  useEffect(() => {
    const results = searchCities(cityQuery);
    setCityResults(results);
    setShowCityDropdown(results.length > 0 && !selectedCity);
  }, [cityQuery, selectedCity]);

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setCityQuery(city.name);
    setShowCityDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !gender || !selectedCity) return;

    const year  = parseInt(YEARS[yearIdx]);
    const month = parseInt(MONTHS[monthIdx]);
    const maxDay = new Date(year, month, 0).getDate();
    const day   = Math.min(parseInt(DAYS[dayIdx]) , maxDay);
    const date  = new Date(year, month - 1, day);
    const hour  = unknownTime ? 12 : parseInt(HOURS[hourIdx]);

    const chart = calculateSaju(name, gender, date, hour, selectedCity.name);
    onCalculate(chart, selectedCity.name);
  };

  const isFormValid = name && gender && selectedCity;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Left Panel: Cosmic Map ─────────────────────────── */}
      <div className="lg:w-[42%] bg-[#060810] relative overflow-hidden p-6 lg:p-12 flex flex-col justify-center min-h-[40vh] lg:min-h-screen">

        {/* Nebula glows */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.18, 0.3, 0.18] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(93,60,180,0.35) 0%, transparent 70%)", filter: "blur(40px)" }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(242,202,80,0.2) 0%, transparent 70%)", filter: "blur(50px)" }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute top-3/4 left-1/4 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(29,158,117,0.25) 0%, transparent 70%)", filter: "blur(40px)" }}
        />

        {/* Slow-rotating geometric ring (5 elements pentagon) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: 0.07 }}
        >
          <svg width="500" height="500" viewBox="0 0 500 500">
            <polygon
              points="250,30 462,183 378,430 122,430 38,183"
              fill="none" stroke="#F2CA50" strokeWidth="0.8"
            />
          </svg>
        </motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 140, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: 0.05 }}
        >
          <svg width="700" height="700" viewBox="0 0 700 700">
            <polygon
              points="350,20 660,230 545,610 155,610 40,230"
              fill="none" stroke="#a78bfa" strokeWidth="0.6"
            />
            <circle cx="350" cy="350" r="280" fill="none" stroke="#a78bfa" strokeWidth="0.4" />
          </svg>
        </motion.div>

        {/* Star field */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
            {/* Constellation lines */}
            {CONST_LINES.map(([a, b], i) => (
              <line
                key={i}
                x1={`${STARS[a].x}%`} y1={`${STARS[a].y}%`}
                x2={`${STARS[b].x}%`} y2={`${STARS[b].y}%`}
                stroke="rgba(242,202,80,0.08)" strokeWidth="0.5"
              />
            ))}
          </svg>
          {STARS.map((s, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${s.x}%`, top: `${s.y}%`,
                width: s.size, height: s.size,
                background: i % 4 === 0 ? "#F2CA50" : i % 4 === 1 ? "#a78bfa" : "#ffffff",
                transform: "translate(-50%, -50%)",
              }}
              animate={{ opacity: [s.baseOpacity, s.baseOpacity * 2.5, s.baseOpacity] }}
              transition={{ duration: s.dur, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
            />
          ))}
          {/* Shooting star (occasional) */}
          <motion.div
            className="absolute h-px"
            style={{ top: "20%", left: 0, width: 80, background: "linear-gradient(90deg, transparent, rgba(242,202,80,0.8), transparent)", borderRadius: 2 }}
            animate={{ x: ["0%", "120vw"], opacity: [0, 1, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 9, ease: "easeIn" }}
          />
          <motion.div
            className="absolute h-px"
            style={{ top: "60%", left: 0, width: 60, background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.7), transparent)", borderRadius: 2 }}
            animate={{ x: ["0%", "120vw"], opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 14, delay: 5, ease: "easeIn" }}
          />
        </div>

        {/* Fine grid lines */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.06 }}>
          <svg width="100%" height="100%">
            {Array.from({ length: 8 }, (_, i) => (
              <line key={`h${i}`} x1="0" y1={`${(i + 1) * 12.5}%`} x2="100%" y2={`${(i + 1) * 12.5}%`} stroke="currentColor" strokeWidth="0.5" />
            ))}
            {Array.from({ length: 8 }, (_, i) => (
              <line key={`v${i}`} x1={`${(i + 1) * 12.5}%`} y1="0" x2={`${(i + 1) * 12.5}%`} y2="100%" stroke="currentColor" strokeWidth="0.5" />
            ))}
            <path d="M0,50% Q50%,20% 100%,50%" fill="none" stroke="currentColor" strokeWidth="0.4" />
            <path d="M0,50% Q50%,80% 100%,50%" fill="none" stroke="currentColor" strokeWidth="0.4" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="font-serif text-3xl lg:text-5xl text-primary mb-2">Consult the Oracle</h1>
            <p className="text-muted-foreground text-sm tracking-[0.22em] uppercase mb-10">Input Birth Chronology</p>
          </motion.div>

          <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.7 }}>
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary" />
              <div>
                <p className="text-[10px] text-muted-foreground tracking-[0.15em] uppercase">Longitude</p>
                <p className="text-xl font-mono text-foreground">
                  {selectedCity ? formatLongitude(selectedCity.longitude) : "----.----° -"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-accent" />
              <div>
                <p className="text-[10px] text-muted-foreground tracking-[0.15em] uppercase">Solar Variance</p>
                <p className="text-xl font-mono text-foreground">
                  {selectedCity ? calculateSolarVariance(selectedCity.longitude) : "--m --s"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {selectedCity ? (
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-accent" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border border-muted-foreground/30" />
              )}
              <div>
                <p className="text-[10px] text-muted-foreground tracking-[0.15em] uppercase">Solar Noon Sync</p>
                <p className={`text-sm ${selectedCity ? "text-accent" : "text-muted-foreground"}`}>
                  {selectedCity ? "Calibrated" : "Awaiting coordinates"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Right Panel: Form ──────────────────────────────── */}
      <div className="lg:w-[58%] p-6 lg:p-12 flex items-center justify-center relative">
        {/* Subtle star particles in right panel */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-primary/20"
              style={{
                width: 1, height: 1,
                left: `${((i * 47.3) % 100)}%`,
                top: `${((i * 61.8) % 100)}%`,
              }}
              animate={{ opacity: [0.1, 0.4, 0.1] }}
              transition={{ duration: 3 + i % 4, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </div>

        <motion.div
          className="w-full max-w-lg relative z-10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Name */}
              <div className="space-y-2">
                <label className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">Seeker's Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text" placeholder="Enter your name..."
                    value={name} onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-background/50 border-border focus:border-primary"
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">Biological Polarity</label>
                <div className="flex gap-3">
                  {(["male", "female"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`flex-1 py-3 px-4 rounded-lg border text-sm transition-all duration-200 ${
                        gender === g
                          ? "bg-primary/15 border-primary text-primary shadow-[0_0_16px_rgba(242,202,80,0.15)]"
                          : "bg-background/50 border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {g === "male" ? "♂ YANG / MALE" : "♀ YIN / FEMALE"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date — Drum Rollers */}
              <div className="space-y-3">
                <label className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">Solar Cycle (Date)</label>
                <div className="flex gap-3 justify-center items-end">
                  <DrumRoller values={YEARS}  selectedIndex={yearIdx}  onChange={setYearIdx}  label="Year"  width={88} />
                  <div className="pb-4 text-primary/30 text-2xl font-light select-none">·</div>
                  <DrumRoller values={MONTHS} selectedIndex={monthIdx} onChange={setMonthIdx} label="Month" width={64} />
                  <div className="pb-4 text-primary/30 text-2xl font-light select-none">·</div>
                  <DrumRoller values={DAYS}   selectedIndex={dayIdx}   onChange={setDayIdx}   label="Day"   width={64} />
                </div>
              </div>

              {/* Time — Drum Rollers */}
              <div className="space-y-3">
                <label className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">Moment (Time)</label>
                <AnimatePresence>
                  {!unknownTime && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-2 justify-center items-end overflow-hidden"
                    >
                      <DrumRoller values={HOURS}   selectedIndex={hourIdx}   onChange={setHourIdx}   label="Hour"   width={64} />
                      <div className="pb-4 text-primary/50 text-2xl font-light select-none">:</div>
                      <DrumRoller values={MINUTES} selectedIndex={minuteIdx} onChange={setMinuteIdx} label="Min"    width={64} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    onClick={() => setUnknownTime((v) => !v)}
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                      unknownTime ? "bg-primary border-primary" : "border-muted-foreground/40 group-hover:border-primary/50"
                    }`}
                  >
                    {unknownTime && <Check className="w-2.5 h-2.5 text-background" />}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    I don't know my birth time (defaults to noon, reduced accuracy)
                  </span>
                </label>
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">Origin Coordinates</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text" placeholder="City of birth..."
                    value={cityQuery}
                    onChange={(e) => { setCityQuery(e.target.value); setSelectedCity(null); }}
                    onFocus={() => cityResults.length > 0 && setShowCityDropdown(true)}
                    className="pl-10 bg-background/50 border-border focus:border-primary"
                  />
                  {showCityDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden"
                    >
                      {cityResults.map((city) => (
                        <button
                          key={`${city.name}-${city.country}`}
                          type="button"
                          onClick={() => handleCitySelect(city)}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-primary/10 transition-colors text-left"
                        >
                          <span className="text-lg">{getFlagEmoji(city.countryCode)}</span>
                          <div>
                            <p className="text-sm font-medium">{city.name}</p>
                            <p className="text-xs text-muted-foreground">{city.country}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={!isFormValid}
                className="w-full h-14 gold-gradient text-primary-foreground font-semibold text-base tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ letterSpacing: "0.12em" }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                CALCULATE DESTINY
              </Button>

              <p className="text-center text-[10px] text-muted-foreground/40 tracking-[0.18em]">
                ENCRYPTION GRADE: HIGH-SEC METAPHYSICAL
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode.toUpperCase().split("").map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
