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
import { useLanguage } from "@/lib/language-context";
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
  partnerElement: Element,
  locale: string = "en"
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

  const elName: Record<string, Record<Element, string>> = {
    en: { wood: "Wood", fire: "Fire", earth: "Earth", metal: "Metal", water: "Water" },
    ko: { wood: "목", fire: "화", earth: "토", metal: "금", water: "수" },
    ja: { wood: "木", fire: "火", earth: "土", metal: "金", water: "水" },
  };
  const el = (e: Element) => (elName[locale] || elName.en)[e];

  const labels: Record<string, Record<string, { label: string; desc: string; desc2: string }>> = {
    en: {
      same: { label: "Mirror Bond", desc: `Your ${el(userElement)} energy reflects their ${el(partnerElement)} essence — you understand each other intuitively.`, desc2: "This pairing suggests deep understanding but watch for amplified weaknesses." },
      creates: { label: "Natural Harmony", desc: `Your ${el(userElement)} energy nurtures their ${el(partnerElement)} essence — a naturally supportive bond.`, desc2: "This pairing suggests one of the most harmonious connections in element theory." },
      "created-by": { label: "Receiving Support", desc: `Their ${el(partnerElement)} energy nourishes your ${el(userElement)} essence — they naturally uplift you.`, desc2: "This pairing suggests a supportive dynamic where you flourish from their presence." },
      controls: { label: "Dynamic Tension", desc: `Your ${el(userElement)} energy challenges their ${el(partnerElement)} essence — expect friction but also passion.`, desc2: "This pairing suggests transformation through conflict — not easy, but growth-oriented." },
      "controlled-by": { label: "Growth Challenge", desc: `Their ${el(partnerElement)} energy challenges your ${el(userElement)} essence — you'll be pushed to evolve.`, desc2: "This pairing suggests personal growth through navigating differences." },
      neutral: { label: "Balanced Connection", desc: `Your ${el(userElement)} energy exists in balance with their ${el(partnerElement)} essence — neither supporting nor challenging.`, desc2: "This pairing suggests stability and mutual respect without extreme highs or lows." },
    },
    ko: {
      same: { label: "거울 인연", desc: `당신의 ${el(userElement)} 에너지가 상대의 ${el(partnerElement)} 본질을 비춥니다 — 서로를 직관적으로 이해합니다.`, desc2: "깊은 이해가 가능하지만 약점도 증폭될 수 있습니다." },
      creates: { label: "자연스러운 조화", desc: `당신의 ${el(userElement)} 에너지가 상대의 ${el(partnerElement)} 본질을 키워줍니다 — 자연스러운 지지 관계.`, desc2: "오행 이론에서 가장 조화로운 관계 중 하나입니다." },
      "created-by": { label: "지지 받는 관계", desc: `상대의 ${el(partnerElement)} 에너지가 당신의 ${el(userElement)} 본질을 성장시킵니다 — 자연스럽게 당신을 올려줍니다.`, desc2: "상대의 존재로 당신이 빛나는 관계입니다." },
      controls: { label: "역동적 긴장", desc: `당신의 ${el(userElement)} 에너지가 상대의 ${el(partnerElement)} 본질에 도전합니다 — 마찰이 있지만 열정도 함께.`, desc2: "갈등을 통한 변화 — 쉽지는 않지만 성장 지향적인 관계." },
      "controlled-by": { label: "성장의 도전", desc: `상대의 ${el(partnerElement)} 에너지가 당신의 ${el(userElement)} 본질에 도전합니다 — 진화를 향해 밀어줍니다.`, desc2: "차이를 극복하며 개인적 성장을 이루는 관계입니다." },
      neutral: { label: "균형 잡힌 관계", desc: `당신의 ${el(userElement)} 에너지와 상대의 ${el(partnerElement)} 본질이 균형을 이룹니다 — 지지도 도전도 없는 안정적 관계.`, desc2: "극단적 기복 없이 안정과 상호 존중을 나타냅니다." },
    },
    ja: {
      same: { label: "鏡の絆", desc: `あなたの${el(userElement)}のエネルギーが相手の${el(partnerElement)}の本質を映し出します — 直感的に理解し合えます。`, desc2: "深い理解が可能ですが、弱点も増幅されることがあります。" },
      creates: { label: "自然な調和", desc: `あなたの${el(userElement)}のエネルギーが相手の${el(partnerElement)}の本質を育てます — 自然な支え合いの関係。`, desc2: "五行理論で最も調和的な関係の一つです。" },
      "created-by": { label: "支えを受ける関係", desc: `相手の${el(partnerElement)}のエネルギーがあなたの${el(userElement)}の本質を成長させます — 自然とあなたを高めてくれます。`, desc2: "相手の存在であなたが輝く関係です。" },
      controls: { label: "ダイナミックな緊張", desc: `あなたの${el(userElement)}のエネルギーが相手の${el(partnerElement)}の本質に挑戦します — 摩擦もあれば情熱も。`, desc2: "葛藤を通じた変化 — 簡単ではないが成長志向の関係。" },
      "controlled-by": { label: "成長の挑戦", desc: `相手の${el(partnerElement)}のエネルギーがあなたの${el(userElement)}の本質に挑戦します — 進化へと導かれます。`, desc2: "違いを乗り越え、個人的成長を遂げる関係です。" },
      neutral: { label: "バランスの取れた関係", desc: `あなたの${el(userElement)}と相手の${el(partnerElement)}が均衡を保ちます — 支えも挑戦もない安定した関係。`, desc2: "極端な起伏なく、安定と相互尊重を示します。" },
    },
  };

  const emojiMap: Record<string, string> = { same: "mirror", creates: "star", "created-by": "heart", controls: "zap", "controlled-by": "zap", neutral: "scale" };
  const scoreMap: Record<string, number> = { same: 75, creates: 90, "created-by": 85, controls: 55, "controlled-by": 50, neutral: 70 };

  let relType = "neutral";
  if (userElement === partnerElement) relType = "same";
  else if (creationCycle[userElement] === partnerElement) relType = "creates";
  else if (creationCycle[partnerElement] === userElement) relType = "created-by";
  else if (destructionCycle[userElement] === partnerElement) relType = "controls";
  else if (destructionCycle[partnerElement] === userElement) relType = "controlled-by";

  const l = (labels[locale] || labels.en)[relType];
  return {
    type: relType,
    score: scoreMap[relType],
    label: l.label,
    emoji: emojiMap[relType],
    description: l.desc,
    description2: l.desc2,
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
  const { t, locale } = useLanguage();
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
      const relationship = getElementRelationship(userElement, partnerElement, locale);

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
          <h3 className="text-lg font-serif text-foreground">{t("qc.title")}</h3>
          <p className="text-sm text-muted-foreground">{t("qc.subtitle")}</p>
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
                <label className="text-sm text-muted-foreground mb-2 block">{t("qc.birthDate")}</label>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">{t("qc.gender")}</label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">{t("qc.female")}</SelectItem>
                    <SelectItem value="male">{t("qc.male")}</SelectItem>
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
              {isChecking ? t("qc.analyzing") : t("qc.checkBtn")}
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
                {t("qc.tryAnother")}
              </Button>
              <Link href="/pricing" className="flex-1">
                <Button className="w-full gold-gradient text-primary-foreground text-sm">
                  {t("qc.fullReport")}
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
