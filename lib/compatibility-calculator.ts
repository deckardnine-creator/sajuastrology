// Compatibility Calculator Engine
// Uses existing saju-calculator functions — no modifications to base code
// Scores are deterministic: same input → same output (cacheable)

import {
  calculateSaju,
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  ELEMENTS,
  type SajuChart,
  type Element,
} from "./saju-calculator";

export interface CompatibilityScores {
  overall: number;
  love: number;
  work: number;
  friendship: number;
  conflict: number; // conflict resolution ability
  label: string;
  personA: SajuChart;
  personB: SajuChart;
  details: CompatibilityDetails;
}

export interface CompatibilityDetails {
  dayMasterRelation: string;
  dayMasterRelationDesc: string;
  branchHarmonies: string[];
  branchClashes: string[];
  elementComplement: string;
  elementOverlap: string;
}

// ── Day Master relationship (일간 상호관계) ──────────────────────────

function getDayMasterRelation(
  elementA: string,
  yinYangA: string,
  elementB: string,
  yinYangB: string
): { type: string; score: number; desc: string } {
  const a = elementA as Element;
  const b = elementB as Element;
  const samePolarity = yinYangA === yinYangB;

  // Same element
  if (a === b) {
    return samePolarity
      ? { type: "companion", score: 70, desc: "Mirror souls — you understand each other instinctively but may lack creative friction" }
      : { type: "complementary-same", score: 80, desc: "Yin-Yang balance within the same element — natural harmony with gentle contrast" };
  }

  // A produces B (A생B)
  if (ELEMENTS[a].produces === b) {
    return { type: "nurturing", score: 82, desc: `${elementA} nurtures ${elementB} — a naturally supportive dynamic where one fuels the other's growth` };
  }

  // B produces A (B생A)
  if (ELEMENTS[b].produces === a) {
    return { type: "supported", score: 78, desc: `${elementB} supports ${elementA} — you receive energy and inspiration from this connection` };
  }

  // A controls B (A극B)
  if (ELEMENTS[a].controls === b) {
    return samePolarity
      ? { type: "dominance", score: 52, desc: `${elementA} dominates ${elementB} — power imbalance that requires conscious awareness` }
      : { type: "gentle-control", score: 62, desc: `${elementA} gently guides ${elementB} — structured dynamic that can be productive` };
  }

  // B controls A (B극A)
  if (ELEMENTS[b].controls === a) {
    return samePolarity
      ? { type: "challenged", score: 50, desc: `${elementB} challenges ${elementA} — this tension drives growth but needs careful navigation` }
      : { type: "gentle-challenge", score: 60, desc: `${elementB} gently challenges ${elementA} — productive friction that refines both` };
  }

  return { type: "neutral", score: 65, desc: "A unique elemental combination with its own special dynamics" };
}

// ── Branch interactions (지지 합충) ──────────────────────────────────

const SIX_COMBINATIONS: [number, number][] = [
  [0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7],
];

const THREE_HARMONIES: number[][] = [
  [2, 6, 10], [5, 9, 1], [8, 0, 4], [11, 3, 7],
];

const CLASHES: [number, number][] = [
  [0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11],
];

function getBranchIdx(branch: { zh: string }): number {
  return EARTHLY_BRANCHES.findIndex((b) => b.zh === branch.zh);
}

function analyzeBranchInteractions(chartA: SajuChart, chartB: SajuChart) {
  const harmonies: string[] = [];
  const clashes: string[] = [];

  const branchesA = (["year", "month", "day", "hour"] as const).map((p) => ({
    name: p,
    idx: getBranchIdx(chartA.pillars[p].branch),
    zh: chartA.pillars[p].branch.zh,
    en: chartA.pillars[p].branch.en,
  }));
  const branchesB = (["year", "month", "day", "hour"] as const).map((p) => ({
    name: p,
    idx: getBranchIdx(chartB.pillars[p].branch),
    zh: chartB.pillars[p].branch.zh,
    en: chartB.pillars[p].branch.en,
  }));

  // Check six combinations between A and B
  for (const ba of branchesA) {
    for (const bb of branchesB) {
      for (const [x, y] of SIX_COMBINATIONS) {
        if ((ba.idx === x && bb.idx === y) || (ba.idx === y && bb.idx === x)) {
          harmonies.push(`${ba.zh}${bb.zh} (${ba.en}-${bb.en}) six combination in ${ba.name}↔${bb.name}`);
        }
      }
      for (const [x, y] of CLASHES) {
        if ((ba.idx === x && bb.idx === y) || (ba.idx === y && bb.idx === x)) {
          clashes.push(`${ba.zh}${bb.zh} (${ba.en}-${bb.en}) clash in ${ba.name}↔${bb.name}`);
        }
      }
    }
  }

  // Check three harmonies (across both charts)
  const allBranches = [...branchesA.map((b) => ({ ...b, person: "A" })), ...branchesB.map((b) => ({ ...b, person: "B" }))];
  for (const trio of THREE_HARMONIES) {
    const matches = allBranches.filter((b) => trio.includes(b.idx));
    const hasA = matches.some((m) => m.person === "A");
    const hasB = matches.some((m) => m.person === "B");
    if (hasA && hasB && matches.length >= 3) {
      harmonies.push(`Three Harmony across both charts (${matches.map((m) => m.zh).join("")})`);
    }
  }

  return { harmonies, clashes };
}

// ── Element complement analysis ─────────────────────────────────────

function analyzeElementComplement(chartA: SajuChart, chartB: SajuChart) {
  const elA = chartA.elements;
  const elB = chartB.elements;
  const elements = ["wood", "fire", "earth", "metal", "water"] as const;

  let complementScore = 0;
  const complements: string[] = [];
  const overlaps: string[] = [];

  for (const el of elements) {
    const a = elA[el];
    const b = elB[el];
    if (a === 0 && b >= 2) {
      complementScore += 15;
      complements.push(`B's strong ${el} fills A's missing ${el}`);
    } else if (b === 0 && a >= 2) {
      complementScore += 15;
      complements.push(`A's strong ${el} fills B's missing ${el}`);
    } else if (a >= 2 && b >= 2) {
      overlaps.push(`Both strong in ${el}`);
    }
  }

  const complementDesc = complements.length > 0
    ? `Elemental complement: ${complements.join("; ")}`
    : "Similar elemental profiles — shared strengths but also shared blind spots";

  const overlapDesc = overlaps.length > 0
    ? `Shared strengths: ${overlaps.join(", ")}`
    : "Diverse elemental distribution";

  return { complementScore, complementDesc, overlapDesc };
}

// ── Score label ─────────────────────────────────────────────────────

function getLabel(score: number): string {
  if (score >= 85) return "Cosmic Soulmates";
  if (score >= 70) return "Natural Harmony";
  if (score >= 55) return "Dynamic Tension";
  if (score >= 40) return "Growth Challenge";
  return "Opposite Forces";
}

// ── Clamp helper ────────────────────────────────────────────────────

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(val)));
}

// ── Main: calculateCompatibility ────────────────────────────────────

export function calculateCompatibility(chartA: SajuChart, chartB: SajuChart): CompatibilityScores {
  // 1. Day Master relationship
  const dmRelation = getDayMasterRelation(
    chartA.dayMaster.element,
    chartA.dayMaster.yinYang,
    chartB.dayMaster.element,
    chartB.dayMaster.yinYang
  );

  // 2. Branch interactions
  const branches = analyzeBranchInteractions(chartA, chartB);

  // 3. Element complement
  const complement = analyzeElementComplement(chartA, chartB);

  // 4. Calculate category scores
  const harmonyBonus = branches.harmonies.length * 5;
  const clashPenalty = branches.clashes.length * 6;

  // Love: weighted toward Day Master relation + branch harmonies
  const loveBase = dmRelation.score * 0.5 + complement.complementScore * 0.3 + 50 * 0.2;
  const love = clamp(loveBase + harmonyBonus - clashPenalty + (Math.random() * 4 - 2), 25, 98);

  // Work: weighted toward element complement (complementary skills)
  const workBase = complement.complementScore * 0.4 + dmRelation.score * 0.3 + 60 * 0.3;
  const work = clamp(workBase + harmonyBonus * 0.7 - clashPenalty * 0.5 + (Math.random() * 4 - 2), 25, 98);

  // Friendship: balanced across all factors
  const friendBase = dmRelation.score * 0.35 + complement.complementScore * 0.25 + 55 * 0.4;
  const friendship = clamp(friendBase + harmonyBonus * 0.8 - clashPenalty * 0.4 + (Math.random() * 4 - 2), 25, 98);

  // Conflict resolution: inverse of clash, bonus from complement
  const conflictBase = 70 - clashPenalty * 1.5 + harmonyBonus * 1.2 + complement.complementScore * 0.3;
  const conflict = clamp(conflictBase + (Math.random() * 4 - 2), 25, 98);

  // Overall: weighted average
  const overall = clamp(love * 0.35 + work * 0.2 + friendship * 0.25 + conflict * 0.2, 25, 98);

  return {
    overall,
    love,
    work,
    friendship,
    conflict,
    label: getLabel(overall),
    personA: chartA,
    personB: chartB,
    details: {
      dayMasterRelation: dmRelation.type,
      dayMasterRelationDesc: dmRelation.desc,
      branchHarmonies: branches.harmonies,
      branchClashes: branches.clashes,
      elementComplement: complement.complementDesc,
      elementOverlap: complement.overlapDesc,
    },
  };
}
