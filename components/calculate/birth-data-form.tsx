"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Calendar, User, Sparkles, Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { calculateSaju, type SajuChart } from "@/lib/saju-calculator";
import { searchCities, formatLongitude, calculateSolarVariance, type City } from "@/lib/cities-data";

interface BirthDataFormProps {
  onCalculate: (chart: SajuChart, city: string) => void;
}

export function BirthDataForm({ onCalculate }: BirthDataFormProps) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [unknownTime, setUnknownTime] = useState(false);
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
    if (!name || !gender || !birthDate || !selectedCity) return;

    const date = new Date(birthDate);
    let hour = 12; // Default to noon
    if (birthTime && !unknownTime) {
      const [h] = birthTime.split(":").map(Number);
      hour = h;
    }

    const chart = calculateSaju(
      name,
      gender,
      date,
      hour,
      selectedCity.name
    );

    onCalculate(chart, selectedCity.name);
  };

  const isFormValid = name && gender && birthDate && selectedCity;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Coordinate Display */}
      <div className="lg:w-[40%] bg-[#060810] relative overflow-hidden p-6 lg:p-12 flex flex-col justify-center">
        {/* World Map Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 400 300">
            {/* Latitude lines */}
            {[...Array(7)].map((_, i) => (
              <line
                key={`lat-${i}`}
                x1="0"
                y1={i * 50}
                x2="400"
                y2={i * 50}
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-muted-foreground/30"
              />
            ))}
            {/* Longitude lines */}
            {[...Array(9)].map((_, i) => (
              <line
                key={`lon-${i}`}
                x1={i * 50}
                y1="0"
                x2={i * 50}
                y2="300"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-muted-foreground/30"
              />
            ))}
            {/* Curved latitude lines */}
            <path
              d="M0,150 Q200,100 400,150"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-muted-foreground/20"
            />
            <path
              d="M0,150 Q200,200 400,150"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-muted-foreground/20"
            />
          </svg>
        </div>

        {/* Animated dots */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-serif text-3xl lg:text-5xl text-primary mb-2">
              Consult the Oracle
            </h1>
            <p className="text-muted-foreground text-sm tracking-[0.2em] uppercase mb-12">
              Input Birth Chronology
            </p>
          </motion.div>

          {/* Coordinate Display */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground tracking-wider">LONGITUDE</p>
                <p className="text-xl font-mono text-foreground">
                  {selectedCity ? formatLongitude(selectedCity.longitude) : "----.----° -"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-accent" />
              <div>
                <p className="text-xs text-muted-foreground tracking-wider">SOLAR VARIANCE</p>
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
                <p className="text-xs text-muted-foreground tracking-wider">SOLAR NOON SYNC</p>
                <p className={`text-sm ${selectedCity ? "text-accent" : "text-muted-foreground"}`}>
                  {selectedCity ? "Calibrated" : "Awaiting coordinates"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="lg:w-[60%] p-6 lg:p-12 flex items-center justify-center">
        <motion.div
          className="w-full max-w-lg"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-xs tracking-wider text-muted-foreground uppercase">
                  Seeker&apos;s Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter your name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-background/50 border-border focus:border-primary"
                  />
                </div>
              </div>

              {/* Gender Selection */}
              <div className="space-y-2">
                <label className="text-xs tracking-wider text-muted-foreground uppercase">
                  Biological Polarity
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setGender("male")}
                    className={`flex-1 py-3 px-4 rounded-lg border transition-all ${
                      gender === "male"
                        ? "bg-primary/20 border-primary text-primary"
                        : "bg-background/50 border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <span className="mr-2">&#9791;</span> YANG / MALE
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("female")}
                    className={`flex-1 py-3 px-4 rounded-lg border transition-all ${
                      gender === "female"
                        ? "bg-primary/20 border-primary text-primary"
                        : "bg-background/50 border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <span className="mr-2">&#9792;</span> YIN / FEMALE
                  </button>
                </div>
              </div>

              {/* Birth Date */}
              <div className="space-y-2">
                <label className="text-xs tracking-wider text-muted-foreground uppercase">
                  Solar Cycle (Date)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="pl-10 bg-background/50 border-border focus:border-primary"
                  />
                </div>
              </div>

              {/* Birth Time */}
              <div className="space-y-2">
                <label className="text-xs tracking-wider text-muted-foreground uppercase">
                  Moment (Time)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    disabled={unknownTime}
                    className="pl-10 bg-background/50 border-border focus:border-primary disabled:opacity-50"
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox
                    id="unknown-time"
                    checked={unknownTime}
                    onCheckedChange={(checked) => {
                      setUnknownTime(checked as boolean);
                      if (checked) setBirthTime("");
                    }}
                  />
                  <label htmlFor="unknown-time" className="text-sm text-muted-foreground cursor-pointer">
                    I don&apos;t know my birth time (defaults to noon, reduced accuracy)
                  </label>
                </div>
              </div>

              {/* City Search */}
              <div className="space-y-2">
                <label className="text-xs tracking-wider text-muted-foreground uppercase">
                  Origin Coordinates
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="City of birth..."
                    value={cityQuery}
                    onChange={(e) => {
                      setCityQuery(e.target.value);
                      setSelectedCity(null);
                    }}
                    onFocus={() => cityResults.length > 0 && setShowCityDropdown(true)}
                    className="pl-10 bg-background/50 border-border focus:border-primary"
                  />
                  
                  {/* City Dropdown */}
                  {showCityDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden"
                    >
                      {cityResults.map((city, index) => (
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

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isFormValid}
                className="w-full h-14 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                CALCULATE DESTINY
              </Button>

              <p className="text-center text-xs text-muted-foreground/60 tracking-wider">
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
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
