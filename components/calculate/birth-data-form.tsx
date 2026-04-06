"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, animate, AnimatePresence } from "framer-motion";
import { MapPin, User, Sparkles, Check, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calculateSaju, type SajuChart } from "@/lib/saju-calculator";
import { searchCities, type City } from "@/lib/cities-data";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";

const CUR_YEAR = new Date().getFullYear();
const YEARS   = Array.from({ length: CUR_YEAR - 1919 }, (_, i) => String(1920 + i));
const MONTHS  = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const DAYS    = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
const HOURS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

const STARS = Array.from({ length: 70 }, (_, i) => {
  const angle = i * 2.399963;
  const r = Math.sqrt((i + 0.5) / 70);
  return {
    x: 50 + r * 48 * Math.cos(angle), y: 50 + r * 48 * Math.sin(angle),
    size: i % 7 === 0 ? 2.2 : i % 3 === 0 ? 1.5 : 0.9,
    delay: (i * 0.17) % 4, dur: 2.5 + (i % 6) * 0.4,
    baseOpacity: 0.2 + (i % 5) * 0.1,
  };
});

const CONST_LINES = [[2,9],[9,18],[18,28],[28,2],[5,14],[14,23],[23,5],[1,8],[8,20]];

// ── Drum Roller ──────────────────────────────────────────────
const ITEM_H = 40;
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
  const longPressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const longPressTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const indexRef = useRef(selectedIndex);

  useEffect(() => { indexRef.current = selectedIndex; }, [selectedIndex]);

  const snapTo = useCallback((idx: number) => {
    let wrapped = idx;
    if (idx < 0) wrapped = values.length - 1;
    else if (idx >= values.length) wrapped = 0;
    animate(y, (-wrapped + 2) * ITEM_H, {
      type: "spring", stiffness: 400, damping: 30,
    });
    onChange(wrapped);
  }, [y, values.length, onChange]);

  useEffect(() => {
    animate(y, (-selectedIndex + 2) * ITEM_H, {
      type: "spring", stiffness: 300, damping: 34,
    });
  }, [selectedIndex, y]);

  const startLongPress = (direction: 1 | -1) => {
    didLongPress.current = false;
    longPressTimeout.current = setTimeout(() => {
      didLongPress.current = true;
      longPressTimer.current = setInterval(() => {
        let next = indexRef.current + direction;
        if (next < 0) next = values.length - 1;
        else if (next >= values.length) next = 0;
        indexRef.current = next;
        onChange(next);
      }, 60);
    }, 400);
  };

  const stopLongPress = () => {
    if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
    if (longPressTimer.current) clearInterval(longPressTimer.current);
    longPressTimeout.current = null;
    longPressTimer.current = null;
  };

  const handleClick = (direction: 1 | -1) => {
    if (didLongPress.current) return;
    snapTo(selectedIndex + direction);
  };

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[10px] tracking-[0.18em] uppercase mb-0.5" style={{ color: "rgba(242,202,80,0.5)" }}>
        {label}
      </span>

      <button
        type="button"
        className="w-full flex justify-center py-1 text-primary/40 hover:text-primary/70 transition-colors active:text-primary active:scale-90"
        style={{ width }}
        onClick={() => handleClick(-1)}
        onMouseDown={() => startLongPress(-1)}
        onMouseUp={stopLongPress}
        onMouseLeave={stopLongPress}
        onTouchStart={() => startLongPress(-1)}
        onTouchEnd={(e) => { e.preventDefault(); stopLongPress(); handleClick(-1); }}
      >
        <ChevronUp className="w-4 h-4" />
      </button>

      <div
        style={{ height: containerH, width, overflow: "hidden", position: "relative", borderRadius: 12 }}
        className="border border-primary/15 bg-black/30 backdrop-blur-sm"
      >
        <div className="absolute inset-x-0 top-0 z-20 pointer-events-none"
          style={{ height: ITEM_H * 2, background: "linear-gradient(to bottom, #060810 0%, #060810 10%, transparent 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 z-20 pointer-events-none"
          style={{ height: ITEM_H * 2, background: "linear-gradient(to top, #060810 0%, #060810 10%, transparent 100%)" }} />

        <div className="absolute inset-x-0 z-10 pointer-events-none"
          style={{
            top: ITEM_H * 2, height: ITEM_H,
            borderTop: "1px solid rgba(242,202,80,0.35)",
            borderBottom: "1px solid rgba(242,202,80,0.35)",
            background: "linear-gradient(90deg, transparent, rgba(242,202,80,0.06), transparent)",
          }}
        />

        <motion.div style={{ y }}>
          {values.map((val, i) => {
            const dist = Math.abs(i - selectedIndex);
            return (
              <div key={val} style={{ height: ITEM_H }} className="flex items-center justify-center">
                <motion.span
                  animate={{
                    opacity: dist === 0 ? 1 : dist === 1 ? 0.35 : dist === 2 ? 0.1 : 0.03,
                    scale: dist === 0 ? 1.15 : dist === 1 ? 0.88 : 0.75,
                    color: dist === 0 ? "#F2CA50" : "#888780",
                  }}
                  transition={{ duration: 0.15 }}
                  style={{
                    fontSize: dist === 0 ? 20 : 14,
                    fontWeight: dist === 0 ? 600 : 400,
                    fontFamily: "var(--font-mono, monospace)",
                    userSelect: "none",
                  }}
                >
                  {val}
                </motion.span>
              </div>
            );
          })}
        </motion.div>
      </div>

      <button
        type="button"
        className="w-full flex justify-center py-1 text-primary/40 hover:text-primary/70 transition-colors active:text-primary active:scale-90"
        style={{ width }}
        onClick={() => handleClick(1)}
        onMouseDown={() => startLongPress(1)}
        onMouseUp={stopLongPress}
        onMouseLeave={stopLongPress}
        onTouchStart={() => startLongPress(1)}
        onTouchEnd={(e) => { e.preventDefault(); stopLongPress(); handleClick(1); }}
      >
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Main Form ──────────────────────────────────────────────

interface BirthDataFormProps {
  onCalculate: (chart: SajuChart, city: string) => void;
}

export function BirthDataForm({ onCalculate }: BirthDataFormProps) {
  const { locale } = useLanguage();
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [yearIdx, setYearIdx] = useState(YEARS.indexOf(String(1990)));
  const [monthIdx, setMonthIdx] = useState(0);
  const [dayIdx, setDayIdx] = useState(0);
  const [hourIdx, setHourIdx] = useState(12);
  const [minuteIdx, setMinuteIdx] = useState(0);
  const [unknownTime, setUnknownTime] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [cityResults, setCityResults] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const year = Number(YEARS[yearIdx]);
  const month = Number(MONTHS[monthIdx]);
  const maxDay = new Date(year, month, 0).getDate();
  const DAYS_FILTERED = DAYS.slice(0, maxDay);

  useEffect(() => {
    if (dayIdx >= maxDay) setDayIdx(maxDay - 1);
  }, [maxDay, dayIdx]);

  useEffect(() => {
    if (!cityQuery || cityQuery.length < 1 || selectedCity) {
      setCityResults([]); setShowCityDropdown(false); return;
    }
    const results = searchCities(cityQuery);
    setCityResults(results);
    setShowCityDropdown(results.length > 0);
  }, [cityQuery, selectedCity]);

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setCityQuery(city.name);
    setShowCityDropdown(false);
  };

  const isFormValid = name.trim().length >= 1 && gender && selectedCity;

  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();
    if (!isFormValid || !selectedCity) return;
    try {
      const day = Number(DAYS_FILTERED[dayIdx]);
      const hour = unknownTime ? 12 : Number(HOURS[hourIdx]);
      const minute = unknownTime ? 0 : Number(MINUTES[minuteIdx]);
      const birthDate = new Date(year, month - 1, day);
      const chart = calculateSaju(name.trim(), gender as "male" | "female", birthDate, hour, selectedCity.name,
        unknownTime ? undefined : { longitude: selectedCity.longitude, birthMinute: minute, timezone: selectedCity.timezone }
      );
      chart.birthHour = hour;
      chart.birthHourUnknown = unknownTime;
      onCalculate(chart, selectedCity.name);
    } catch (err) {
      console.error("Form submit error:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative">
      {/* Left: Cosmic Panel */}
      <div className="lg:w-[42%] p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden">
        {/* Stars */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          {CONST_LINES.map(([a,b],i)=>(
            <line key={`cl${i}`} x1={STARS[a].x} y1={STARS[a].y} x2={STARS[b].x} y2={STARS[b].y}
              stroke="currentColor" strokeWidth="0.15" className="text-primary/5" />
          ))}
          {STARS.map((s,i)=>(
            <motion.circle key={i} cx={s.x} cy={s.y} r={s.size} fill="currentColor" className="text-primary/60"
              animate={{ opacity:[s.baseOpacity, s.baseOpacity+0.25, s.baseOpacity] }}
              transition={{ duration:s.dur, repeat:Infinity, delay:s.delay, ease:"easeInOut" }} />
          ))}
        </svg>

        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.06 }}>
          <svg width="100%" height="100%">
            {Array.from({length:8},(_,i)=>(<line key={`h${i}`} x1="0" y1={`${(i+1)*12.5}%`} x2="100%" y2={`${(i+1)*12.5}%`} stroke="currentColor" strokeWidth="0.5"/>))}
            {Array.from({length:8},(_,i)=>(<line key={`v${i}`} x1={`${(i+1)*12.5}%`} y1="0" x2={`${(i+1)*12.5}%`} y2="100%" stroke="currentColor" strokeWidth="0.5"/>))}
          </svg>
        </div>

        <div className="relative z-10">
          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.7 }}>
            <h1 className="font-serif text-3xl lg:text-5xl text-primary mb-2">{t("calc.discoverDestiny", locale)}</h1>
            <p className="text-muted-foreground text-sm tracking-[0.22em] uppercase mb-10">{t("calc.enterDetails", locale)}</p>
          </motion.div>
          <motion.div className="space-y-6" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3, duration:0.7 }}>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {locale === "ko" ? "서양 별자리는 " : locale === "ja" ? "西洋占星術は" : "Western astrology gives you "}
                <span className="text-foreground font-medium">{locale === "ko" ? "12가지 중 1가지" : locale === "ja" ? "12タイプの1つ" : "1 of 12"}</span>
                {locale === "ko" ? " 유형." : locale === "ja" ? "。" : " types."}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {locale === "ko" ? "사주는 " : locale === "ja" ? "四柱推命は" : "Saju maps "}
                <span className="text-primary font-semibold">518,400</span>
                {locale === "ko" ? "가지 고유한 우주적 프로필을 제공합니다." : locale === "ja" ? "通りの固有プロフィールを提供。" : " unique cosmic profiles from the exact moment and place you were born."}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {locale === "ko" ? "리딩이 " : locale === "ja" ? "鑑定は" : "Your reading will be ready in "}
                <span className="text-foreground font-medium">{locale === "ko" ? "30초 후" : locale === "ja" ? "30秒で" : "30 seconds"}</span>
                {locale === "ko" ? "에 준비됩니다." : locale === "ja" ? "準備完了。" : "."}
              </p>
            </div>
            {selectedCity && (
              <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="flex items-center gap-3 pt-2">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center"><Check className="w-3 h-3 text-accent" /></div>
                <p className="text-sm text-accent">{selectedCity.name} {t("form.coordinatesLocked", locale)}</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="lg:w-[58%] p-6 lg:p-12 flex items-center justify-center relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({length:20},(_,i)=>(
            <motion.div key={i} className="absolute rounded-full bg-primary/8"
              style={{ width:1,height:1, left:`${((i*47.3)%100)}%`, top:`${((i*61.8)%100)}%` }}
              animate={{ opacity:[0.1,0.4,0.1] }} transition={{ duration:3+i%4, repeat:Infinity, delay:i*0.3 }} />
          ))}
        </div>

        <motion.div className="w-full max-w-lg relative z-10" initial={{ opacity:0,x:20 }} animate={{ opacity:1,x:0 }} transition={{ duration:0.6,delay:0.2 }}>
          <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Name */}
              <div className="space-y-2">
                <label className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">{t("form.yourName", locale)}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="text" placeholder={t("form.enterName", locale)} maxLength={50} value={name} onChange={(e)=>setName(e.target.value)} className="pl-10 bg-background/50 border-border focus:border-primary" />
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">{t("form.gender", locale)}</label>
                <div className="flex gap-3">
                  {(["male","female"] as const).map((g)=>(
                    <button key={g} type="button" onClick={()=>setGender(g)}
                      className={`flex-1 py-3 px-4 rounded-lg border text-sm transition-all duration-200 ${gender===g ? "bg-primary/15 border-primary text-primary shadow-[0_0_16px_rgba(242,202,80,0.15)]" : "bg-background/50 border-border text-muted-foreground hover:border-primary/40"}`}>
                      {g==="male" ? t("form.maleShort", locale) : t("form.femaleShort", locale)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date drums */}
              <div className="space-y-2">
                <label className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">{t("form.birthDate", locale)} <span className="normal-case tracking-normal text-muted-foreground/50">{t("form.birthDateNote", locale)} · {locale === "ko" ? "양력" : locale === "ja" ? "新暦" : "Solar Calendar"}</span></label>
                <div className="flex gap-2 justify-center items-center">
                  <DrumRoller values={YEARS}  selectedIndex={yearIdx}  onChange={setYearIdx}  label={t("form.year", locale)}  width={88} />
                  <span className="text-primary/25 text-2xl font-light select-none pb-1">·</span>
                  <DrumRoller values={MONTHS} selectedIndex={monthIdx} onChange={setMonthIdx} label={t("form.month", locale)} width={64} />
                  <span className="text-primary/25 text-2xl font-light select-none pb-1">·</span>
                  <DrumRoller values={DAYS_FILTERED} selectedIndex={dayIdx} onChange={setDayIdx} label={t("form.day", locale)}   width={64} />
                </div>
              </div>

              {/* Time drums */}
              <div className="space-y-2">
                <label className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">{t("form.birthTime", locale)}</label>
                <AnimatePresence>
                  {!unknownTime && (
                    <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
                      className="flex gap-2 justify-center items-center overflow-hidden">
                      <DrumRoller values={HOURS}   selectedIndex={hourIdx}   onChange={setHourIdx}   label={t("form.hour", locale)} width={64} />
                      <span className="text-primary/40 text-2xl font-semibold select-none pb-1">:</span>
                      <DrumRoller values={MINUTES} selectedIndex={minuteIdx} onChange={setMinuteIdx} label={t("form.min", locale)}  width={64} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <label className="flex items-center gap-2.5 cursor-pointer group mt-2">
                  <div onClick={()=>setUnknownTime(v=>!v)}
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${unknownTime?"bg-primary border-primary":"border-muted-foreground/40 group-hover:border-primary/50"}`}>
                    {unknownTime && <Check className="w-2.5 h-2.5 text-background" />}
                  </div>
                  <span className="text-xs text-muted-foreground">{t("form.unknownTime", locale)}</span>
                </label>
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">{t("form.birthCity", locale)}</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="text" placeholder={t("form.cityOfBirth", locale)} value={cityQuery}
                    onChange={(e)=>{
                      const v=e.target.value;
                      setCityQuery(v);
                      if(selectedCity && v!==selectedCity.name) setSelectedCity(null);
                    }}
                    onBlur={()=>setTimeout(()=>setShowCityDropdown(false),200)}
                    onFocus={(e)=>{
                      if(cityResults.length>0) setShowCityDropdown(true);
                      setTimeout(()=>e.target.scrollIntoView({behavior:"smooth",block:"center"}),300);
                    }}
                    className="pl-10 bg-background/50 border-border focus:border-primary" />
                  {showCityDropdown && (
                    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-y-auto max-h-48">
                      {cityResults.map((city)=>(
                        <button key={`${city.name}-${city.country}`} type="button" onClick={()=>handleCitySelect(city)}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-primary/10 transition-colors text-left">
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
              <Button type="button" disabled={!isFormValid}
                onClick={handleSubmit}
                className="w-full h-14 gold-gradient text-primary-foreground font-semibold text-base tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ letterSpacing:"0.12em" }}>
                <Sparkles className="w-4 h-4 mr-2" />
                {t("calc.seeMyReading", locale)}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode.toUpperCase().split("").map((c)=>127397+c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
