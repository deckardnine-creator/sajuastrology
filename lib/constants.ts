// Shared constants — single source of truth
// Used by: auth-context.tsx, dashboard-content.tsx, reading components

import { ELEMENTS, HEAVENLY_STEMS, EARTHLY_BRANCHES, TEN_GODS, type Element } from "./saju-calculator";

/* ─── Day Master Chinese Characters ─── */
export const DAY_MASTER_ZH: Record<string, string> = {
  "wood-yang": "甲", "wood-yin": "乙",
  "fire-yang": "丙", "fire-yin": "丁",
  "earth-yang": "戊", "earth-yin": "己",
  "metal-yang": "庚", "metal-yin": "辛",
  "water-yang": "壬", "water-yin": "癸",
};

/* ─── Element Display Colors ─── */
export const ELEMENT_COLORS: Record<string, string> = {
  wood: "#59DE9B",
  fire: "#EF4444",
  earth: "#F59E0B",
  metal: "#94A3B8",
  water: "#3B82F6",
};

/* ─── Reconstruct SajuChart from DB reading row ─── */
export function reconstructChartFromReading(r: {
  name: string;
  gender: string;
  birth_date: string;
  birth_city: string;
  day_master_element: string;
  day_master_yinyang: string;
  year_stem: string; year_branch: string;
  month_stem: string; month_branch: string;
  day_stem: string; day_branch: string;
  hour_stem: string; hour_branch: string;
  archetype: string;
  ten_god: string;
  harmony_score: number;
  dominant_element: string;
  weakest_element: string;
  elements_wood: number;
  elements_fire: number;
  elements_earth: number;
  elements_metal: number;
  elements_water: number;
}) {
  const dmKey = `${r.day_master_element}-${r.day_master_yinyang}`;
  const dmLabel = r.day_master_yinyang === "yang" ? "Yang" : "Yin";
  const elCapitalized = r.day_master_element.charAt(0).toUpperCase() + r.day_master_element.slice(1);

  // Find full stem/branch objects from the static arrays
  const findStem = (zh: string) =>
    HEAVENLY_STEMS.find((s) => s.zh === zh) ?? { zh, ko: "", en: "", element: "", yinYang: "" };
  const findBranch = (zh: string) =>
    EARTHLY_BRANCHES.find((b) => b.zh === zh) ?? { zh, ko: "", en: "", element: "", yinYang: "", hours: [0, 0] };

  return {
    name: r.name,
    gender: r.gender as "male" | "female",
    birthDate: new Date(r.birth_date),
    birthCity: r.birth_city,
    dayMaster: {
      zh: DAY_MASTER_ZH[dmKey] || "?",
      en: `${dmLabel} ${elCapitalized}`,
      element: r.day_master_element,
      yinYang: r.day_master_yinyang,
    },
    pillars: {
      year:  { stem: findStem(r.year_stem),  branch: findBranch(r.year_branch),  pillarName: "year" as const },
      month: { stem: findStem(r.month_stem), branch: findBranch(r.month_branch), pillarName: "month" as const },
      day:   { stem: findStem(r.day_stem),   branch: findBranch(r.day_branch),   pillarName: "day" as const },
      hour:  { stem: findStem(r.hour_stem),  branch: findBranch(r.hour_branch),  pillarName: "hour" as const },
    },
    archetype: r.archetype,
    tenGod: r.ten_god,
    harmonyScore: r.harmony_score,
    dominantElement: r.dominant_element,
    weakestElement: r.weakest_element,
    elements: {
      wood: r.elements_wood,
      fire: r.elements_fire,
      earth: r.elements_earth,
      metal: r.elements_metal,
      water: r.elements_water,
    },
  };
}

/* ─── Get element color safely ─── */
export function getElementColor(element: string | undefined): string {
  if (!element) return "#F2CA50";
  return ELEMENTS[element as Element]?.color || "#F2CA50";
}
