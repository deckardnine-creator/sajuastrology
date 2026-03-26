// Saju (Four Pillars of Destiny) Calculator
// Based on traditional Korean/Chinese astrology calculations

// Heavenly Stems (천간/天干)
export const HEAVENLY_STEMS = [
  { ko: "갑", zh: "甲", en: "Yang Wood", element: "wood", yinYang: "yang" },
  { ko: "을", zh: "乙", en: "Yin Wood", element: "wood", yinYang: "yin" },
  { ko: "병", zh: "丙", en: "Yang Fire", element: "fire", yinYang: "yang" },
  { ko: "정", zh: "丁", en: "Yin Fire", element: "fire", yinYang: "yin" },
  { ko: "무", zh: "戊", en: "Yang Earth", element: "earth", yinYang: "yang" },
  { ko: "기", zh: "己", en: "Yin Earth", element: "earth", yinYang: "yin" },
  { ko: "경", zh: "庚", en: "Yang Metal", element: "metal", yinYang: "yang" },
  { ko: "신", zh: "辛", en: "Yin Metal", element: "metal", yinYang: "yin" },
  { ko: "임", zh: "壬", en: "Yang Water", element: "water", yinYang: "yang" },
  { ko: "계", zh: "癸", en: "Yin Water", element: "water", yinYang: "yin" },
] as const;

// Earthly Branches (지지/地支)
export const EARTHLY_BRANCHES = [
  { ko: "자", zh: "子", en: "Rat", element: "water", yinYang: "yang", hours: [23, 0] },
  { ko: "축", zh: "丑", en: "Ox", element: "earth", yinYang: "yin", hours: [1, 2] },
  { ko: "인", zh: "寅", en: "Tiger", element: "wood", yinYang: "yang", hours: [3, 4] },
  { ko: "묘", zh: "卯", en: "Rabbit", element: "wood", yinYang: "yin", hours: [5, 6] },
  { ko: "진", zh: "辰", en: "Dragon", element: "earth", yinYang: "yang", hours: [7, 8] },
  { ko: "사", zh: "巳", en: "Snake", element: "fire", yinYang: "yin", hours: [9, 10] },
  { ko: "오", zh: "午", en: "Horse", element: "fire", yinYang: "yang", hours: [11, 12] },
  { ko: "미", zh: "未", en: "Goat", element: "earth", yinYang: "yin", hours: [13, 14] },
  { ko: "신", zh: "申", en: "Monkey", element: "metal", yinYang: "yang", hours: [15, 16] },
  { ko: "유", zh: "酉", en: "Rooster", element: "metal", yinYang: "yin", hours: [17, 18] },
  { ko: "술", zh: "戌", en: "Dog", element: "earth", yinYang: "yang", hours: [19, 20] },
  { ko: "해", zh: "亥", en: "Pig", element: "water", yinYang: "yin", hours: [21, 22] },
] as const;

// Ten Gods (십신/十神) - relationships between Day Master and other stems
export const TEN_GODS = {
  companion: { ko: "비견", zh: "比肩", en: "Companion", archetype: "The Ally" },
  robWealth: { ko: "겁재", zh: "劫財", en: "Rob Wealth", archetype: "The Maverick" },
  eatingGod: { ko: "식신", zh: "食神", en: "Eating God", archetype: "The Creator" },
  hurtingOfficer: { ko: "상관", zh: "傷官", en: "Hurting Officer", archetype: "The Rebel" },
  indirectWealth: { ko: "편재", zh: "偏財", en: "Indirect Wealth", archetype: "The Adventurer" },
  directWealth: { ko: "정재", zh: "正財", en: "Direct Wealth", archetype: "The Builder" },
  sevenKillings: { ko: "편관", zh: "七殺", en: "Seven Killings", archetype: "The Commander" },
  directOfficer: { ko: "정관", zh: "正官", en: "Direct Officer", archetype: "The Leader" },
  indirectResource: { ko: "편인", zh: "偏印", en: "Indirect Resource", archetype: "The Visionary" },
  directResource: { ko: "정인", zh: "正印", en: "Direct Resource", archetype: "The Mentor" },
} as const;

// Element relationships
export const ELEMENTS = {
  wood: { color: "#59DE9B", produces: "fire", controls: "earth", weakens: "water", controlledBy: "metal" },
  fire: { color: "#EF4444", produces: "earth", controls: "metal", weakens: "wood", controlledBy: "water" },
  earth: { color: "#F59E0B", produces: "metal", controls: "water", weakens: "fire", controlledBy: "wood" },
  metal: { color: "#94A3B8", produces: "water", controls: "wood", weakens: "earth", controlledBy: "fire" },
  water: { color: "#3B82F6", produces: "wood", controls: "fire", weakens: "metal", controlledBy: "earth" },
} as const;

export type Element = keyof typeof ELEMENTS;
export type HeavenlyStem = (typeof HEAVENLY_STEMS)[number];
export type EarthlyBranch = (typeof EARTHLY_BRANCHES)[number];

export interface Pillar {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  pillarName: "year" | "month" | "day" | "hour";
}

export interface SajuChart {
  name: string;
  gender: "male" | "female";
  birthDate: Date;
  birthCity: string;
  pillars: {
    year: Pillar;
    month: Pillar;
    day: Pillar;
    hour: Pillar;
  };
  dayMaster: HeavenlyStem;
  elements: Record<Element, number>;
  dominantElement: Element;
  weakestElement: Element;
  tenGod: keyof typeof TEN_GODS;
  archetype: string;
  harmonyScore: number;
}

// Calculate Year Pillar
function getYearPillar(year: number): Pillar {
  // The 60-year cycle starts from 4 CE (Year of Jiazi)
  const stemIndex = (year - 4) % 10;
  const branchIndex = (year - 4) % 12;
  
  return {
    stem: HEAVENLY_STEMS[stemIndex >= 0 ? stemIndex : stemIndex + 10],
    branch: EARTHLY_BRANCHES[branchIndex >= 0 ? branchIndex : branchIndex + 12],
    pillarName: "year",
  };
}

// Calculate Month Pillar (based on year stem and lunar month)
function getMonthPillar(year: number, month: number): Pillar {
  // Month stem follows the Five Tiger Method (五虎遁月)
  // 甲己年→丙寅始, 乙庚年→戊寅始, 丙辛年→庚寅始, 丁壬年→壬寅始, 戊癸年→甲寅始
  const yearStemIndex = ((year - 4) % 10 + 10) % 10;
  const stemIndex = ((yearStemIndex % 5) * 2 + 2 + (month - 1)) % 10;
  
  // Month branch: month 1 (around Feb) = Tiger (寅, index 2)
  const branchIndex = (month + 1) % 12;
  
  return {
    stem: HEAVENLY_STEMS[stemIndex >= 0 ? stemIndex : stemIndex + 10],
    branch: EARTHLY_BRANCHES[branchIndex >= 0 ? branchIndex : branchIndex + 12],
    pillarName: "month",
  };
}

// Calculate Day Pillar — timezone-safe using numeric year/month/day
function getDayPillar(year: number, month: number, day: number): Pillar {
  // Use Date.UTC to avoid timezone drift between client and server
  // Reference: January 1, 1900 = 甲戌 (Jia-Xu) — stem index 0 (甲), branch index 10 (戌)
  const target = Date.UTC(year, month - 1, day);
  const ref = Date.UTC(1900, 0, 1);
  const diffDays = Math.round((target - ref) / 86400000);
  
  const stemIndex = ((diffDays % 10) + 10) % 10;
  // Branch offset +10: Jan 1, 1900 is 戌 (index 10), not 子 (index 0)
  const branchIndex = (((diffDays + 10) % 12) + 12) % 12;
  
  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[branchIndex],
    pillarName: "day",
  };
}

// Calculate Hour Pillar (based on day stem and birth hour)
function getHourPillar(dayStem: HeavenlyStem, hour: number): Pillar {
  // Convert hour to traditional Chinese hour (2-hour blocks)
  // 23:00-01:00 = Zi (Rat), 01:00-03:00 = Chou (Ox), etc.
  let branchIndex: number;
  if (hour >= 23 || hour < 1) branchIndex = 0;      // Zi
  else if (hour < 3) branchIndex = 1;               // Chou
  else if (hour < 5) branchIndex = 2;               // Yin
  else if (hour < 7) branchIndex = 3;               // Mao
  else if (hour < 9) branchIndex = 4;               // Chen
  else if (hour < 11) branchIndex = 5;              // Si
  else if (hour < 13) branchIndex = 6;              // Wu
  else if (hour < 15) branchIndex = 7;              // Wei
  else if (hour < 17) branchIndex = 8;              // Shen
  else if (hour < 19) branchIndex = 9;              // You
  else if (hour < 21) branchIndex = 10;             // Xu
  else branchIndex = 11;                            // Hai
  
  // Hour stem is determined by day stem
  const dayStemIndex = HEAVENLY_STEMS.indexOf(dayStem);
  const stemIndex = ((dayStemIndex % 5) * 2 + branchIndex) % 10;
  
  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[branchIndex],
    pillarName: "hour",
  };
}

// Count elements across all pillars
function countElements(pillars: SajuChart["pillars"]): Record<Element, number> {
  const counts: Record<Element, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };
  
  Object.values(pillars).forEach((pillar) => {
    counts[pillar.stem.element as Element]++;
    counts[pillar.branch.element as Element]++;
  });
  
  return counts;
}

// Determine dominant Ten God based on chart analysis
function getDominantTenGod(dayMaster: HeavenlyStem, pillars: SajuChart["pillars"]): keyof typeof TEN_GODS {
  const dayMasterElement = dayMaster.element;
  const dayMasterYinYang = dayMaster.yinYang;
  
  // Count relationships
  const relationships: Record<string, number> = {};
  
  Object.values(pillars).forEach((pillar) => {
    if (pillar.pillarName === "day") return; // Skip day pillar stem (that's the day master itself)
    
    const stemElement = pillar.stem.element;
    const stemYinYang = pillar.stem.yinYang;
    const samePolarity = stemYinYang === dayMasterYinYang;
    
    // Determine relationship based on Five Element interactions
    if (stemElement === dayMasterElement) {
      // Same element
      relationships[samePolarity ? "companion" : "robWealth"] = 
        (relationships[samePolarity ? "companion" : "robWealth"] || 0) + 1;
    } else if (ELEMENTS[dayMasterElement as Element].produces === stemElement) {
      // Day master produces this element (output)
      relationships[samePolarity ? "eatingGod" : "hurtingOfficer"] = 
        (relationships[samePolarity ? "eatingGod" : "hurtingOfficer"] || 0) + 1;
    } else if (ELEMENTS[dayMasterElement as Element].controls === stemElement) {
      // Day master controls this element (wealth)
      relationships[samePolarity ? "directWealth" : "indirectWealth"] = 
        (relationships[samePolarity ? "directWealth" : "indirectWealth"] || 0) + 1;
    } else if (ELEMENTS[stemElement as Element].controls === dayMasterElement) {
      // This element controls day master (power/authority)
      relationships[samePolarity ? "directOfficer" : "sevenKillings"] = 
        (relationships[samePolarity ? "directOfficer" : "sevenKillings"] || 0) + 1;
    } else if (ELEMENTS[stemElement as Element].produces === dayMasterElement) {
      // This element produces day master (resource)
      relationships[samePolarity ? "directResource" : "indirectResource"] = 
        (relationships[samePolarity ? "directResource" : "indirectResource"] || 0) + 1;
    }
  });
  
  // Find dominant relationship
  let maxCount = 0;
  let dominant: keyof typeof TEN_GODS = "eatingGod"; // Default
  
  Object.entries(relationships).forEach(([key, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominant = key as keyof typeof TEN_GODS;
    }
  });
  
  return dominant;
}

// Calculate harmony score based on elemental balance
function calculateHarmonyScore(elements: Record<Element, number>, dayMaster: HeavenlyStem): number {
  const dayMasterElement = dayMaster.element as Element;
  
  // Check balance
  const values = Object.values(elements);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const spread = max - min;
  
  // Start with base score
  let score = 70;
  
  // Penalize imbalance
  score -= spread * 5;
  
  // Bonus for strong day master support
  const supportingElement = Object.keys(ELEMENTS).find(
    (el) => ELEMENTS[el as Element].produces === dayMasterElement
  ) as Element;
  if (elements[supportingElement] >= 2) score += 10;
  
  // Bonus for controlled opposition
  const controlledElement = ELEMENTS[dayMasterElement].controls as Element;
  if (elements[controlledElement] >= 1 && elements[controlledElement] <= 2) score += 5;
  
  // Add some variation based on day master
  score += (HEAVENLY_STEMS.indexOf(dayMaster) % 5) * 2;
  
  return Math.max(40, Math.min(98, score));
}

// Main calculation function
export function calculateSaju(
  name: string,
  gender: "male" | "female",
  birthDate: Date,
  birthHour: number,
  birthCity: string
): SajuChart {
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1; // 1-12
  const day = birthDate.getDate();
  
  // Calculate pillars
  const yearPillar = getYearPillar(year);
  const monthPillar = getMonthPillar(year, month);
  const dayPillar = getDayPillar(year, month, day);
  const hourPillar = getHourPillar(dayPillar.stem, birthHour);
  
  const pillars = {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
  };
  
  // Day Master is the heavenly stem of the day pillar
  const dayMaster = dayPillar.stem;
  
  // Count elements
  const elements = countElements(pillars);
  
  // Find dominant and weakest elements
  const elementEntries = Object.entries(elements) as [Element, number][];
  const sortedElements = elementEntries.sort((a, b) => b[1] - a[1]);
  const dominantElement = sortedElements[0][0];
  const weakestElement = sortedElements[sortedElements.length - 1][0];
  
  // Determine Ten God and archetype
  const tenGod = getDominantTenGod(dayMaster, pillars);
  const archetype = TEN_GODS[tenGod].archetype;
  
  // Calculate harmony score
  const harmonyScore = calculateHarmonyScore(elements, dayMaster);
  
  return {
    name,
    gender,
    birthDate,
    birthCity,
    pillars,
    dayMaster,
    elements,
    dominantElement,
    weakestElement,
    tenGod,
    archetype,
    harmonyScore,
  };
}

// Get daily pillar for any date (useful for daily readings)
export function getDailyPillar(date: Date): Pillar {
  return getDayPillar(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

// Calculate compatibility between day master and a specific date
export function calculateDailyEnergy(userChart: SajuChart, date: Date): number {
  const dailyPillar = getDailyPillar(date);
  const userElement = userChart.dayMaster.element as Element;
  const dailyElement = dailyPillar.stem.element as Element;
  
  let score = 65; // Base score
  
  // Check element relationship
  if (ELEMENTS[dailyElement as Element].produces === userElement) {
    score += 20; // Daily element supports user
  } else if (dailyElement === userElement) {
    score += 15; // Same element - harmony
  } else if (ELEMENTS[userElement].produces === dailyElement) {
    score += 5; // User outputs energy today
  } else if (ELEMENTS[dailyElement as Element].controls === userElement) {
    score -= 15; // Challenging day
  } else if (ELEMENTS[userElement].controls === dailyElement) {
    score += 10; // User has control
  }
  
  // Add variation based on branch compatibility
  const userBranch = userChart.pillars.day.branch;
  const dailyBranch = dailyPillar.branch;
  
  // Check for harmony branches (3 harmony groups)
  const harmonyGroups = [
    [0, 4, 8],   // Rat, Dragon, Monkey (Water frame)
    [1, 5, 9],   // Ox, Snake, Rooster (Metal frame)
    [2, 6, 10],  // Tiger, Horse, Dog (Fire frame)
    [3, 7, 11],  // Rabbit, Goat, Pig (Wood frame)
  ];
  
  const userBranchIndex = EARTHLY_BRANCHES.indexOf(userBranch);
  const dailyBranchIndex = EARTHLY_BRANCHES.indexOf(dailyBranch);
  
  for (const group of harmonyGroups) {
    if (group.includes(userBranchIndex) && group.includes(dailyBranchIndex)) {
      score += 10;
      break;
    }
  }
  
  return Math.max(30, Math.min(98, score));
}


// ═══════════════════════════════════════════════════════════════════════
// ADVANCED SAJU ENGINE — 대운, 합충형파해, 지장간, 신살
// These are NEW functions only. Nothing above this line is modified.
// ═══════════════════════════════════════════════════════════════════════

// ── Types ──────────────────────────────────────────────────────────────

export interface DaeunPillar {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  startAge: number;
  endAge: number;
  element: Element;
  tenGodRelation: string; // relationship to Day Master
}

export interface BranchInteraction {
  type: "삼합" | "육합" | "방합" | "충" | "형" | "파" | "해";
  typeEn: "Three Harmony" | "Six Combination" | "Directional" | "Clash" | "Punishment" | "Break" | "Harm";
  branches: string[]; // zh characters involved
  pillars: string[]; // which pillars (year/month/day/hour)
  resultElement?: string; // resulting element for 합
  description: string;
}

export interface HiddenStem {
  branch: string; // zh
  pillarName: string;
  stems: { zh: string; en: string; element: string; strength: "main" | "middle" | "residual" }[];
}

export interface SpecialStar {
  name: string;
  ko: string;
  zh: string;
  description: string;
  pillar: string; // which pillar it appears in
}

export interface AdvancedSajuData {
  daeun: DaeunPillar[];
  currentDaeun: DaeunPillar | null;
  nextDaeun: DaeunPillar | null;
  interactions: BranchInteraction[];
  hiddenStems: HiddenStem[];
  specialStars: SpecialStar[];
  dayMasterStrength: "strong" | "neutral" | "weak";
}

// ── Hidden Stems (지장간/藏干) ──────────────────────────────────────────

const HIDDEN_STEMS_MAP: Record<string, { zh: string; en: string; element: string; strength: "main" | "middle" | "residual" }[]> = {
  "子": [{ zh: "壬", en: "Yang Water", element: "water", strength: "main" }, { zh: "癸", en: "Yin Water", element: "water", strength: "middle" }],
  "丑": [{ zh: "己", en: "Yin Earth", element: "earth", strength: "main" }, { zh: "辛", en: "Yin Metal", element: "metal", strength: "middle" }, { zh: "癸", en: "Yin Water", element: "water", strength: "residual" }],
  "寅": [{ zh: "甲", en: "Yang Wood", element: "wood", strength: "main" }, { zh: "丙", en: "Yang Fire", element: "fire", strength: "middle" }, { zh: "戊", en: "Yang Earth", element: "earth", strength: "residual" }],
  "卯": [{ zh: "乙", en: "Yin Wood", element: "wood", strength: "main" }],
  "辰": [{ zh: "戊", en: "Yang Earth", element: "earth", strength: "main" }, { zh: "乙", en: "Yin Wood", element: "wood", strength: "middle" }, { zh: "癸", en: "Yin Water", element: "water", strength: "residual" }],
  "巳": [{ zh: "丙", en: "Yang Fire", element: "fire", strength: "main" }, { zh: "戊", en: "Yang Earth", element: "earth", strength: "middle" }, { zh: "庚", en: "Yang Metal", element: "metal", strength: "residual" }],
  "午": [{ zh: "丁", en: "Yin Fire", element: "fire", strength: "main" }, { zh: "己", en: "Yin Earth", element: "earth", strength: "middle" }],
  "未": [{ zh: "己", en: "Yin Earth", element: "earth", strength: "main" }, { zh: "丁", en: "Yin Fire", element: "fire", strength: "middle" }, { zh: "乙", en: "Yin Wood", element: "wood", strength: "residual" }],
  "申": [{ zh: "庚", en: "Yang Metal", element: "metal", strength: "main" }, { zh: "壬", en: "Yang Water", element: "water", strength: "middle" }, { zh: "戊", en: "Yang Earth", element: "earth", strength: "residual" }],
  "酉": [{ zh: "辛", en: "Yin Metal", element: "metal", strength: "main" }],
  "戌": [{ zh: "戊", en: "Yang Earth", element: "earth", strength: "main" }, { zh: "辛", en: "Yin Metal", element: "metal", strength: "middle" }, { zh: "丁", en: "Yin Fire", element: "fire", strength: "residual" }],
  "亥": [{ zh: "壬", en: "Yang Water", element: "water", strength: "main" }, { zh: "甲", en: "Yang Wood", element: "wood", strength: "middle" }],
};

function getHiddenStems(chart: SajuChart): HiddenStem[] {
  const result: HiddenStem[] = [];
  for (const pillarName of ["year", "month", "day", "hour"] as const) {
    const branch = chart.pillars[pillarName].branch;
    const hidden = HIDDEN_STEMS_MAP[branch.zh];
    if (hidden) {
      result.push({ branch: branch.zh, pillarName, stems: hidden });
    }
  }
  return result;
}

// ── Day Master Strength (일주 강약) ─────────────────────────────────────

function calculateDayMasterStrength(chart: SajuChart): "strong" | "neutral" | "weak" {
  const dmElement = chart.dayMaster.element as Element;
  let support = 0;
  let opposition = 0;

  // Count support from visible stems and branches
  for (const pillarName of ["year", "month", "day", "hour"] as const) {
    const p = chart.pillars[pillarName];
    // Stem support
    if (p.stem.element === dmElement) support += 1.5;
    else if (ELEMENTS[p.stem.element as Element]?.produces === dmElement) support += 1;
    else if (ELEMENTS[dmElement]?.produces === p.stem.element) opposition += 0.5;
    else if (ELEMENTS[p.stem.element as Element]?.controls === dmElement) opposition += 1.5;
    else if (ELEMENTS[dmElement]?.controls === p.stem.element) opposition += 0.3;

    // Branch hidden stems support
    const hidden = HIDDEN_STEMS_MAP[p.branch.zh] || [];
    for (const hs of hidden) {
      const weight = hs.strength === "main" ? 1 : hs.strength === "middle" ? 0.6 : 0.3;
      if (hs.element === dmElement) support += weight;
      else if (ELEMENTS[hs.element as Element]?.produces === dmElement) support += weight * 0.7;
      else if (ELEMENTS[hs.element as Element]?.controls === dmElement) opposition += weight;
    }
  }

  // Month branch has seasonal power — extra weight
  const monthBranchEl = chart.pillars.month.branch.element as Element;
  if (monthBranchEl === dmElement) support += 1.5;
  else if (ELEMENTS[monthBranchEl]?.produces === dmElement) support += 1;
  else if (ELEMENTS[monthBranchEl]?.controls === dmElement) opposition += 1;

  const ratio = support / (support + opposition);
  if (ratio >= 0.55) return "strong";
  if (ratio <= 0.40) return "weak";
  return "neutral";
}

// ── 대운 (Major Luck Cycles / 大運) ─────────────────────────────────────

function getTenGodLabel(stemElement: string, stemYinYang: string, dayMasterElement: string, dayMasterYinYang: string): string {
  const samePolarity = stemYinYang === dayMasterYinYang;
  const dmEl = dayMasterElement as Element;

  if (stemElement === dayMasterElement) {
    return samePolarity ? TEN_GODS.companion.en : TEN_GODS.robWealth.en;
  } else if (ELEMENTS[dmEl].produces === stemElement) {
    return samePolarity ? TEN_GODS.eatingGod.en : TEN_GODS.hurtingOfficer.en;
  } else if (ELEMENTS[dmEl].controls === stemElement) {
    return samePolarity ? TEN_GODS.directWealth.en : TEN_GODS.indirectWealth.en;
  } else if (ELEMENTS[stemElement as Element]?.controls === dayMasterElement) {
    return samePolarity ? TEN_GODS.directOfficer.en : TEN_GODS.sevenKillings.en;
  } else if (ELEMENTS[stemElement as Element]?.produces === dayMasterElement) {
    return samePolarity ? TEN_GODS.directResource.en : TEN_GODS.indirectResource.en;
  }
  return "Unknown";
}

export function calculateDaeun(chart: SajuChart): DaeunPillar[] {
  const yearStemYinYang = chart.pillars.year.stem.yinYang;
  const gender = chart.gender;

  // Direction: male+yang OR female+yin = forward (순행), else backward (역행)
  const isForward =
    (gender === "male" && yearStemYinYang === "yang") ||
    (gender === "female" && yearStemYinYang === "yin");

  // Month pillar is the starting point
  const monthStemIdx = HEAVENLY_STEMS.findIndex(s => s.zh === chart.pillars.month.stem.zh);
  const monthBranchIdx = EARTHLY_BRANCHES.findIndex(b => b.zh === chart.pillars.month.branch.zh);

  // Starting age approximation based on birth month
  // Traditional: count days from birth to nearest seasonal node, divide by 3
  // Simplified: use (month position / 3) as approximation
  const bd = typeof chart.birthDate === "string" ? new Date(chart.birthDate) : chart.birthDate;
  const birthMonth = bd.getMonth() + 1;
  const birthDay = bd.getDate();

  // Approximate start age (1-9 range is normal)
  let startAge: number;
  if (isForward) {
    // Days until next seasonal node / 3
    const daysToNode = Math.max(1, 30 - birthDay);
    startAge = Math.round(daysToNode / 3);
  } else {
    // Days since last seasonal node / 3
    startAge = Math.round(Math.max(1, birthDay) / 3);
  }
  startAge = Math.max(1, Math.min(9, startAge));

  const pillars: DaeunPillar[] = [];

  for (let i = 0; i < 8; i++) {
    const step = i + 1;
    const stemIdx = isForward
      ? (monthStemIdx + step) % 10
      : ((monthStemIdx - step) % 10 + 10) % 10;
    const branchIdx = isForward
      ? (monthBranchIdx + step) % 12
      : ((monthBranchIdx - step) % 12 + 12) % 12;

    const stem = HEAVENLY_STEMS[stemIdx];
    const branch = EARTHLY_BRANCHES[branchIdx];
    const age = startAge + (i * 10);

    pillars.push({
      stem,
      branch,
      startAge: age,
      endAge: age + 9,
      element: stem.element as Element,
      tenGodRelation: getTenGodLabel(
        stem.element, stem.yinYang,
        chart.dayMaster.element, chart.dayMaster.yinYang
      ),
    });
  }

  return pillars;
}

// ── 합충형파해 (Branch Interactions) ────────────────────────────────────

// 삼합 (Three Harmony): three branches → one element
const THREE_HARMONIES: { branches: number[]; resultElement: string; name: string }[] = [
  { branches: [2, 6, 10], resultElement: "fire", name: "寅午戌 → Fire" },    // Tiger-Horse-Dog
  { branches: [5, 9, 1], resultElement: "metal", name: "巳酉丑 → Metal" },   // Snake-Rooster-Ox
  { branches: [8, 0, 4], resultElement: "water", name: "申子辰 → Water" },    // Monkey-Rat-Dragon
  { branches: [11, 3, 7], resultElement: "wood", name: "亥卯未 → Wood" },     // Pig-Rabbit-Goat
];

// 육합 (Six Combinations): two branches combine
const SIX_COMBINATIONS: { pair: [number, number]; resultElement: string }[] = [
  { pair: [0, 1], resultElement: "earth" },   // 子丑 → Earth
  { pair: [2, 11], resultElement: "wood" },    // 寅亥 → Wood
  { pair: [3, 10], resultElement: "fire" },    // 卯戌 → Fire
  { pair: [4, 9], resultElement: "metal" },    // 辰酉 → Metal
  { pair: [5, 8], resultElement: "water" },    // 巳申 → Water
  { pair: [6, 7], resultElement: "fire" },     // 午未 → Fire
];

// 방합 (Directional Combination): three adjacent branches
const DIRECTIONAL: { branches: number[]; resultElement: string; direction: string }[] = [
  { branches: [2, 3, 4], resultElement: "wood", direction: "East" },     // 寅卯辰
  { branches: [5, 6, 7], resultElement: "fire", direction: "South" },    // 巳午未
  { branches: [8, 9, 10], resultElement: "metal", direction: "West" },   // 申酉戌
  { branches: [11, 0, 1], resultElement: "water", direction: "North" },  // 亥子丑
];

// 충 (Clash): directly opposing branches (6 apart)
const CLASHES: [number, number][] = [
  [0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11],
];

// 형 (Punishment)
const PUNISHMENTS: { branches: number[]; name: string }[] = [
  { branches: [2, 5, 8], name: "삼형살(三刑殺) — Restless ambition" },           // 寅巳申
  { branches: [1, 10, 7], name: "삼형살(三刑殺) — Stubborn friction" },          // 丑戌未
  { branches: [0, 3], name: "무례지형(無禮之刑) — Boundary issues" },              // 子卯
  { branches: [4, 4], name: "자형(自刑) — Self-sabotage" },                       // 辰辰
  { branches: [6, 6], name: "자형(自刑) — Self-sabotage" },                       // 午午
  { branches: [9, 9], name: "자형(自刑) — Self-sabotage" },                       // 酉酉
  { branches: [11, 11], name: "자형(自刑) — Self-sabotage" },                     // 亥亥
];

// 파 (Break)
const BREAKS: [number, number][] = [
  [0, 9], [1, 4], [2, 11], [3, 6], [5, 8], [7, 10],
];

// 해 (Harm)
const HARMS: [number, number][] = [
  [0, 7], [1, 6], [2, 5], [3, 4], [8, 11], [9, 10],
];

function getBranchIndex(branch: EarthlyBranch): number {
  return EARTHLY_BRANCHES.findIndex(b => b.zh === branch.zh);
}

export function calculateInteractions(chart: SajuChart): BranchInteraction[] {
  const interactions: BranchInteraction[] = [];
  const pillarNames = ["year", "month", "day", "hour"] as const;
  const branchIndices = pillarNames.map(pn => ({
    name: pn,
    idx: getBranchIndex(chart.pillars[pn].branch),
    zh: chart.pillars[pn].branch.zh,
  }));

  // Check 삼합 (Three Harmony)
  for (const th of THREE_HARMONIES) {
    const matches = branchIndices.filter(bi => th.branches.includes(bi.idx));
    if (matches.length >= 2) {
      interactions.push({
        type: "삼합",
        typeEn: "Three Harmony",
        branches: matches.map(m => m.zh),
        pillars: matches.map(m => m.name),
        resultElement: th.resultElement,
        description: matches.length === 3
          ? `Full Three Harmony (${th.name}) — powerful ${th.resultElement} energy`
          : `Partial Three Harmony toward ${th.resultElement}`,
      });
    }
  }

  // Check 육합 (Six Combination)
  for (const sc of SIX_COMBINATIONS) {
    const a = branchIndices.filter(bi => bi.idx === sc.pair[0]);
    const b = branchIndices.filter(bi => bi.idx === sc.pair[1]);
    for (const aa of a) {
      for (const bb of b) {
        interactions.push({
          type: "육합",
          typeEn: "Six Combination",
          branches: [aa.zh, bb.zh],
          pillars: [aa.name, bb.name],
          resultElement: sc.resultElement,
          description: `${aa.zh}${bb.zh} combine to produce ${sc.resultElement} energy`,
        });
      }
    }
  }

  // Check 방합 (Directional)
  for (const dir of DIRECTIONAL) {
    const matches = branchIndices.filter(bi => dir.branches.includes(bi.idx));
    if (matches.length >= 2) {
      interactions.push({
        type: "방합",
        typeEn: "Directional",
        branches: matches.map(m => m.zh),
        pillars: matches.map(m => m.name),
        resultElement: dir.resultElement,
        description: `${dir.direction} directional energy (${dir.resultElement})`,
      });
    }
  }

  // Check 충 (Clash)
  for (const [a, b] of CLASHES) {
    const matchA = branchIndices.filter(bi => bi.idx === a);
    const matchB = branchIndices.filter(bi => bi.idx === b);
    for (const aa of matchA) {
      for (const bb of matchB) {
        interactions.push({
          type: "충",
          typeEn: "Clash",
          branches: [aa.zh, bb.zh],
          pillars: [aa.name, bb.name],
          description: `${aa.zh}${bb.zh} clash between ${aa.name} and ${bb.name} pillar — tension and transformation`,
        });
      }
    }
  }

  // Check 형 (Punishment)
  for (const p of PUNISHMENTS) {
    if (p.branches.length === 2 && p.branches[0] === p.branches[1]) {
      // Self-punishment: same branch appears twice
      const matches = branchIndices.filter(bi => bi.idx === p.branches[0]);
      if (matches.length >= 2) {
        interactions.push({
          type: "형",
          typeEn: "Punishment",
          branches: matches.map(m => m.zh),
          pillars: matches.map(m => m.name),
          description: p.name,
        });
      }
    } else if (p.branches.length === 2) {
      const a = branchIndices.filter(bi => bi.idx === p.branches[0]);
      const b = branchIndices.filter(bi => bi.idx === p.branches[1]);
      for (const aa of a) {
        for (const bb of b) {
          interactions.push({
            type: "형",
            typeEn: "Punishment",
            branches: [aa.zh, bb.zh],
            pillars: [aa.name, bb.name],
            description: p.name,
          });
        }
      }
    } else if (p.branches.length === 3) {
      const matches = branchIndices.filter(bi => p.branches.includes(bi.idx));
      if (matches.length >= 2) {
        interactions.push({
          type: "형",
          typeEn: "Punishment",
          branches: matches.map(m => m.zh),
          pillars: matches.map(m => m.name),
          description: p.name,
        });
      }
    }
  }

  // Check 파 (Break)
  for (const [a, b] of BREAKS) {
    const matchA = branchIndices.filter(bi => bi.idx === a);
    const matchB = branchIndices.filter(bi => bi.idx === b);
    for (const aa of matchA) {
      for (const bb of matchB) {
        interactions.push({
          type: "파",
          typeEn: "Break",
          branches: [aa.zh, bb.zh],
          pillars: [aa.name, bb.name],
          description: `${aa.zh}${bb.zh} break — disruption in ${aa.name}/${bb.name} area`,
        });
      }
    }
  }

  // Check 해 (Harm)
  for (const [a, b] of HARMS) {
    const matchA = branchIndices.filter(bi => bi.idx === a);
    const matchB = branchIndices.filter(bi => bi.idx === b);
    for (const aa of matchA) {
      for (const bb of matchB) {
        interactions.push({
          type: "해",
          typeEn: "Harm",
          branches: [aa.zh, bb.zh],
          pillars: [aa.name, bb.name],
          description: `${aa.zh}${bb.zh} harm — hidden friction between ${aa.name} and ${bb.name}`,
        });
      }
    }
  }

  return interactions;
}

// ── 신살 (Special Stars / 神殺) ─────────────────────────────────────────

export function calculateSpecialStars(chart: SajuChart): SpecialStar[] {
  const stars: SpecialStar[] = [];
  const dayBranchIdx = getBranchIndex(chart.pillars.day.branch);
  const yearBranchIdx = getBranchIndex(chart.pillars.year.branch);

  // 역마살 (驛馬殺) — Travel/Movement star
  // Based on day branch: 寅午戌→申, 巳酉丑→亥, 申子辰→寅, 亥卯未→巳
  const yeokmaMap: Record<number, number> = {
    2: 8, 6: 8, 10: 8,  // 寅午戌 → 申
    5: 11, 9: 11, 1: 11, // 巳酉丑 → 亥
    8: 2, 0: 2, 4: 2,    // 申子辰 → 寅
    11: 5, 3: 5, 7: 5,   // 亥卯未 → 巳
  };
  const yeokmaTarget = yeokmaMap[dayBranchIdx];
  if (yeokmaTarget !== undefined) {
    for (const pn of ["year", "month", "hour"] as const) {
      if (getBranchIndex(chart.pillars[pn].branch) === yeokmaTarget) {
        stars.push({
          name: "Travel Star",
          ko: "역마살",
          zh: "驛馬殺",
          description: "Strong drive for movement, travel, and change. Career benefits from mobility and international connections.",
          pillar: pn,
        });
      }
    }
  }

  // 도화살 (桃花殺) — Romance/Charisma star
  // 寅午戌→卯, 巳酉丑→午, 申子辰→酉, 亥卯未→子
  const dohwaMap: Record<number, number> = {
    2: 3, 6: 3, 10: 3,
    5: 6, 9: 6, 1: 6,
    8: 9, 0: 9, 4: 9,
    11: 0, 3: 0, 7: 0,
  };
  const dohwaTarget = dohwaMap[dayBranchIdx];
  if (dohwaTarget !== undefined) {
    for (const pn of ["year", "month", "hour"] as const) {
      if (getBranchIndex(chart.pillars[pn].branch) === dohwaTarget) {
        stars.push({
          name: "Charisma Star",
          ko: "도화살",
          zh: "桃花殺",
          description: "Natural magnetism and attractiveness. Strong social influence and romantic appeal. Can indicate artistic talent.",
          pillar: pn,
        });
      }
    }
  }

  // 천을귀인 (天乙貴人) — Noble Helper star
  // Based on day stem: 甲戊→丑未, 乙己→子申, 丙丁→亥酉, 壬癸→巳卯, 庚辛→午寅
  const guirenMap: Record<string, number[]> = {
    "甲": [1, 7], "戊": [1, 7],
    "乙": [0, 8], "己": [0, 8],
    "丙": [11, 9], "丁": [11, 9],
    "壬": [5, 3], "癸": [5, 3],
    "庚": [6, 2], "辛": [6, 2],
  };
  const guirenTargets = guirenMap[chart.dayMaster.zh] || [];
  for (const target of guirenTargets) {
    for (const pn of ["year", "month", "hour"] as const) {
      if (getBranchIndex(chart.pillars[pn].branch) === target) {
        stars.push({
          name: "Noble Helper",
          ko: "천을귀인",
          zh: "天乙貴人",
          description: "Attracts help from benefactors at critical moments. Problems tend to resolve through unexpected assistance.",
          pillar: pn,
        });
      }
    }
  }

  // 화개살 (華蓋殺) — Canopy/Scholarship star
  // 寅午戌→戌, 巳酉丑→丑, 申子辰→辰, 亥卯未→未
  const hwagaeMap: Record<number, number> = {
    2: 10, 6: 10, 10: 10,
    5: 1, 9: 1, 1: 1,
    8: 4, 0: 4, 4: 4,
    11: 7, 3: 7, 7: 7,
  };
  const hwagaeTarget = hwagaeMap[yearBranchIdx];
  if (hwagaeTarget !== undefined) {
    for (const pn of ["year", "month", "day", "hour"] as const) {
      if (getBranchIndex(chart.pillars[pn].branch) === hwagaeTarget) {
        stars.push({
          name: "Scholar's Canopy",
          ko: "화개살",
          zh: "華蓋殺",
          description: "Deep intellectual curiosity and spiritual inclination. Drawn to philosophy, religion, or solitary creative work.",
          pillar: pn,
        });
      }
    }
  }

  return stars;
}

// ── Master Function: Calculate All Advanced Data ────────────────────────

export function calculateAdvancedSaju(chart: SajuChart): AdvancedSajuData {
  const daeun = calculateDaeun(chart);
  const interactions = calculateInteractions(chart);
  const hiddenStems = getHiddenStems(chart);
  const specialStars = calculateSpecialStars(chart);
  const dayMasterStrength = calculateDayMasterStrength(chart);

  // Find current and next daeun based on age
  const bd = typeof chart.birthDate === "string" ? new Date(chart.birthDate) : chart.birthDate;
  const age = new Date().getFullYear() - bd.getFullYear();
  const currentDaeun = daeun.find(d => age >= d.startAge && age <= d.endAge) || null;
  const currentIdx = currentDaeun ? daeun.indexOf(currentDaeun) : -1;
  const nextDaeun = currentIdx >= 0 && currentIdx < daeun.length - 1 ? daeun[currentIdx + 1] : null;

  return {
    daeun,
    currentDaeun,
    nextDaeun,
    interactions,
    hiddenStems,
    specialStars,
    dayMasterStrength,
  };
}

// ── Format for AI Prompt ────────────────────────────────────────────────

export function formatAdvancedDataForPrompt(data: AdvancedSajuData): string {
  const lines: string[] = [];

  // Day Master Strength
  lines.push(`\nDay Master Strength: ${data.dayMasterStrength.toUpperCase()}`);
  lines.push(`(A ${data.dayMasterStrength} Day Master means the self-element is ${data.dayMasterStrength === "strong" ? "well-supported — person has strong will and independence" : data.dayMasterStrength === "weak" ? "under-supported — person benefits from external resources and allies" : "balanced — adaptable and flexible"})`);

  // Daeun
  lines.push(`\nMajor Luck Cycles (大運/대운):`);
  for (const d of data.daeun) {
    lines.push(`  Age ${d.startAge}-${d.endAge}: ${d.stem.zh}${d.branch.zh} (${d.stem.en} / ${d.branch.en}) — ${d.tenGodRelation} energy — ${d.element} dominant`);
  }
  if (data.currentDaeun) {
    lines.push(`  ★ CURRENT DAEUN: ${data.currentDaeun.stem.zh}${data.currentDaeun.branch.zh} (${data.currentDaeun.tenGodRelation}) — this shapes the current life period`);
  }
  if (data.nextDaeun) {
    lines.push(`  → NEXT DAEUN: ${data.nextDaeun.stem.zh}${data.nextDaeun.branch.zh} (${data.nextDaeun.tenGodRelation}) — the upcoming shift`);
  }

  // Interactions
  if (data.interactions.length > 0) {
    lines.push(`\nBranch Interactions (합충형파해):`);
    for (const int of data.interactions) {
      lines.push(`  ${int.type} (${int.typeEn}): ${int.branches.join("")} [${int.pillars.join("-")}] — ${int.description}`);
    }
  }

  // Hidden Stems
  lines.push(`\nHidden Stems (지장간/藏干):`);
  for (const hs of data.hiddenStems) {
    const stemStr = hs.stems.map(s => `${s.zh}(${s.en}, ${s.strength})`).join(", ");
    lines.push(`  ${hs.pillarName} branch ${hs.branch}: ${stemStr}`);
  }

  // Special Stars
  if (data.specialStars.length > 0) {
    lines.push(`\nSpecial Stars (신살/神殺):`);
    for (const star of data.specialStars) {
      lines.push(`  ${star.zh} ${star.ko} (${star.name}) in ${star.pillar} pillar: ${star.description}`);
    }
  }

  return lines.join("\n");
}
