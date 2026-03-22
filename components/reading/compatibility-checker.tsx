"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Users, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import type { Element } from "@/lib/saju-calculator";

interface CompatibilityCheckerProps {
  userElement: Element;
  userName: string;
}

// Day Master calculation simplified for quick check
function calculatePartnerElement(year: number, month: number, day: number): Element {
  // Simplified calculation based on stem cycle
  const stemCycle = ["Wood", "Wood", "Fire", "Fire", "Earth", "Earth", "Metal", "Metal", "Water", "Water"];
  const index = (year + month + day) % 10;
  return stemCycle[index].toLowerCase() as Element;
}

// Element relationship checker
function getElementRelationship(
  userElement: Element,
  partnerElement: Element
): { type: string; score: number; label: string; emoji: string; description: string; description2: string } {
  const creationCycle: Record<Element, Element> = {
    wood: "fire",
    fire: "earth",
    earth: "metal",
    metal: "water",
    water: "wood",
  };

  const destructionCycle: Record<Element, Element> = {
    wood: "earth",
    fire: "metal",
    earth: "water",
    metal: "wood",
    water: "fire",
  };

  // Same element
  if (userElement === partnerElement) {
    return {
      type: "same",
      score: 75,
      label: "Mirror Bond",
      emoji: "mirror",
      description: `Your ${userElement} energy reflects their ${partnerElement} essence — you understand each other intuitively.`,
      description2: "This pairing suggests deep understanding but watch for amplified weaknesses."
    };
  }

  // User creates partner (supporting relationship)
  if (creationCycle[userElement] === partnerElement) {
    return {
      type: "creates",
      score: 90,
      label: "Natural Harmony",
      emoji: "star",
      description: `Your ${userElement} energy nurtures their ${partnerElement} essence — a naturally supportive bond.`,
      description2: "This pairing suggests one of the most harmonious connections in element theory."
    };
  }

  // Partner creates user (being supported)
  if (creationCycle[partnerElement] === userElement) {
    return {
      type: "created-by",
      score: 85,
      label: "Receiving Support",
      emoji: "heart",
      description: `Their ${partnerElement} energy nourishes your ${userElement} essence — they naturally uplift you.`,
      description2: "This pairing suggests a supportive dynamic where you flourish from their presence."
    };
  }

  // User controls partner
  if (destructionCycle[userElement] === partnerElement) {
    return {
      type: "controls",
      score: 55,
      label: "Dynamic Tension",
      emoji: "zap",
      description: `Your ${userElement} energy challenges their ${partnerElement} essence — expect friction but also passion.`,
      description2: "This pairing suggests transformation through conflict — not easy, but growth-oriented."
    };
  }

  // Partner controls user
  if (destructionCycle[partnerElement] === userElement) {
    return {
      type: "controlled-by",
      score: 50,
      label: "Growth Challenge",
      emoji: "zap",
      description: `Their ${partnerElement} energy challenges your ${userElement} essence — you'll be pushed to evolve.`,
      description2: "This pairing suggests personal growth through navigating differences."
    };
  }

  // Neutral
  return {
    type: "neutral",
    score: 70,
    label: "Balanced Connection",
    emoji: "scale",
    description: `Your ${userElement} energy exists in balance with their ${partnerElement} essence — neither supporting nor challenging.`,
    description2: "This pairing suggests stability and mutual respect without extreme highs or lows."
  };
}

const elementColors: Record<Element, string> = {
  wood: "#59DE9B",
  fire: "#FF6B6B",
  earth: "#F2CA50",
  metal: "#B8C5D6",
  water: "#4A90D9",
};

export function CompatibilityChecker({ userElement, userName }: CompatibilityCheckerProps) {
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("female");
  const [result, setResult] = useState<{
    partnerElement: Element;
    relationship: ReturnType<typeof getElementRelationship>;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = () => {
    if (!birthDate) return;

    setIsChecking(true);

    // Simulate calculation delay
    setTimeout(() => {
      const date = new Date(birthDate);
      const partnerElement = calculatePartnerElement(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
      );
      const relationship = getElementRelationship(userElement, partnerElement);

      setResult({ partnerElement, relationship });
      setIsChecking(false);
    }, 800);
  };

  const handleReset = () => {
    setBirthDate("");
    setGender("female");
    setResult(null);
  };

  return (
    <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
          <Heart className="w-5 h-5 text-pink-500" />
        </div>
        <div>
          <h3 className="text-lg font-serif text-foreground">Check Your Compatibility</h3>
          <p className="text-sm text-muted-foreground">Enter someone's birth date to see your elemental harmony</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Birth Date</label>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Gender</label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleCheck}
              disabled={!birthDate || isChecking}
              className="w-full"
              variant="outline"
            >
              {isChecking ? (
                <Heart className="w-4 h-4 mr-2 text-pink-500 animate-pulse" />
              ) : (
                <Users className="w-4 h-4 mr-2" />
              )}
              {isChecking ? "Analyzing..." : "Check Compatibility"}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Score Ring */}
            <div className="flex justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={result.relationship.score >= 80 ? "#59DE9B" : result.relationship.score >= 60 ? "#F2CA50" : "#FF6B6B"}
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 283" }}
                    animate={{ strokeDasharray: `${(result.relationship.score / 100) * 283} 283` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-foreground">{result.relationship.score}%</span>
                </div>
              </div>
            </div>

            {/* Relationship Label */}
            <div className="text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                {result.relationship.label}
              </span>
            </div>

            {/* Elements Display */}
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div
                  className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-1"
                  style={{ backgroundColor: elementColors[userElement] + "20" }}
                >
                  <span
                    className="text-lg font-bold capitalize"
                    style={{ color: elementColors[userElement] }}
                  >
                    {userElement.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground capitalize">{userElement}</span>
              </div>
              <div className="flex flex-col items-center">
                <div className={`text-lg ${
                  result.relationship.type === "creates" || result.relationship.type === "created-by" 
                    ? "text-green-500" 
                    : result.relationship.type === "controls" || result.relationship.type === "controlled-by"
                    ? "text-orange-500"
                    : "text-muted-foreground"
                }`}>
                  {result.relationship.type === "creates" ? "→" :
                   result.relationship.type === "created-by" ? "←" :
                   result.relationship.type === "controls" ? "⚔" :
                   result.relationship.type === "controlled-by" ? "⚔" :
                   result.relationship.type === "same" ? "=" : "~"}
                </div>
                <Heart className="w-4 h-4 text-pink-500" />
              </div>
              <div className="text-center">
                <div
                  className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-1"
                  style={{ backgroundColor: elementColors[result.partnerElement] + "20" }}
                >
                  <span
                    className="text-lg font-bold capitalize"
                    style={{ color: elementColors[result.partnerElement] }}
                  >
                    {result.partnerElement.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground capitalize">{result.partnerElement}</span>
              </div>
            </div>

            {/* Description */}
            <div className="text-sm text-muted-foreground text-center leading-relaxed space-y-1">
              <p>{result.relationship.description}</p>
              <p className="text-foreground/70">{result.relationship.description2}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleReset} className="flex-1">
                Try Another
              </Button>
              <Link href="/pricing" className="flex-1">
                <Button className="w-full gold-gradient text-primary-foreground text-sm">
                  Full Compatibility Report
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
