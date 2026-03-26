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
