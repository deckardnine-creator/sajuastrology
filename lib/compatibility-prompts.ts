// Compatibility AI Prompt System
// Free: 1 Claude call → short engaging summary
// Paid: 3 parallel Claude calls → detailed 4-category analysis

import type { CompatibilityScores } from "./compatibility-calculator";

function buildChartPairSummary(scores: CompatibilityScores): string {
  const a = scores.personA;
  const b = scores.personB;
  const d = scores.details;

  return `COMPATIBILITY ANALYSIS DATA:

Person A: ${a.name} (${a.gender})
  Day Master: ${a.dayMaster.zh} ${a.dayMaster.en} (${a.dayMaster.element}, ${a.dayMaster.yinYang})
  Archetype: ${a.archetype}
  Elements: Wood ${a.elements.wood}, Fire ${a.elements.fire}, Earth ${a.elements.earth}, Metal ${a.elements.metal}, Water ${a.elements.water}
  Dominant: ${a.dominantElement}, Weakest: ${a.weakestElement}
  Pillars: Y${a.pillars.year.stem.zh}${a.pillars.year.branch.zh} M${a.pillars.month.stem.zh}${a.pillars.month.branch.zh} D${a.pillars.day.stem.zh}${a.pillars.day.branch.zh} H${a.pillars.hour.stem.zh}${a.pillars.hour.branch.zh}

Person B: ${b.name} (${b.gender})
  Day Master: ${b.dayMaster.zh} ${b.dayMaster.en} (${b.dayMaster.element}, ${b.dayMaster.yinYang})
  Archetype: ${b.archetype}
  Elements: Wood ${b.elements.wood}, Fire ${b.elements.fire}, Earth ${b.elements.earth}, Metal ${b.elements.metal}, Water ${b.elements.water}
  Dominant: ${b.dominantElement}, Weakest: ${b.weakestElement}
  Pillars: Y${b.pillars.year.stem.zh}${b.pillars.year.branch.zh} M${b.pillars.month.stem.zh}${b.pillars.month.branch.zh} D${b.pillars.day.stem.zh}${b.pillars.day.branch.zh} H${b.pillars.hour.stem.zh}${b.pillars.hour.branch.zh}

CALCULATED SCORES:
  Overall: ${scores.overall}/100 ("${scores.label}")
  Love: ${scores.love}/100
  Work: ${scores.work}/100
  Friendship: ${scores.friendship}/100
  Conflict Resolution: ${scores.conflict}/100

KEY INTERACTIONS:
  Day Master Relation: ${d.dayMasterRelation} — ${d.dayMasterRelationDesc}
  ${d.elementComplement}
  ${d.elementOverlap}
  Branch Harmonies: ${d.branchHarmonies.length > 0 ? d.branchHarmonies.join("; ") : "None found"}
  Branch Clashes: ${d.branchClashes.length > 0 ? d.branchClashes.join("; ") : "None found"}`;
}

// ── Free Summary Prompt ─────────────────────────────────────────────

export function buildFreeCompatibilityPrompt(scores: CompatibilityScores): string {
  const summary = buildChartPairSummary(scores);

  return `You are a master of Saju (사주, Korean Four Pillars of Destiny) compatibility analysis with 40 years of experience reading couples, business partners, and friendships.

${summary}

RULES:
- Write in English. Every sentence must trace to the specific chart data above.
- Warm, engaging tone — like a wise matchmaker who genuinely wants to help.
- NEVER use generic phrases. Be specific about HOW their elements interact.
- The summary should make both people feel seen and make them want to share the result.
- Address both people by name.
- Do NOT be falsely positive — honest insights build trust. Even low scores have value.
- NEVER mention AI or that this is generated.
- No bullet points. Flowing prose only.

GENERATE as JSON:
{
  "summary": "2 paragraphs (180-250 words total). First paragraph: describe the core dynamic between these two people — what makes their connection unique, how their Day Masters interact, what they bring out in each other. Second paragraph: the most important thing they should know about this pairing — one key strength and one area to be mindful of. End with something memorable and shareable. This should feel like insider knowledge about their relationship."
}

RESPOND WITH ONLY VALID JSON. No markdown fences.`;
}

// ── Paid Detailed Prompts (3 parallel calls) ────────────────────────

export function buildPaidCompatPrompt1(scores: CompatibilityScores): string {
  const summary = buildChartPairSummary(scores);
  const currentYear = new Date().getFullYear();

  return `You are a master of Saju (사주) compatibility with 40 years of experience.

${summary}

RULES:
- English only. Every sentence must trace to THIS specific chart pairing.
- Flowing literary prose, no bullets/lists/headers inside the JSON values.
- Warm, honest, specific. Address both people by name.
- NEVER mention AI. Speak as the voice of ancient wisdom.

GENERATE as JSON:
{
  "love": "4-5 paragraphs of deep romantic/relational analysis. How do their Day Masters express love differently? What does Person A need that Person B naturally provides (and vice versa)? Where do their emotional languages clash? Specific dynamics: who tends to lead emotionally, who needs more space, what triggers misunderstanding. Include the 'secret key' to deepening this connection — one specific behavior change that transforms the dynamic. Write approximately 400-500 words.",

  "work": "3-4 paragraphs of professional compatibility analysis. How do their archetypes collaborate? Who is the visionary vs the executor? What kind of projects bring out their best together? Where does friction arise in decision-making? Identify the ideal working arrangement (side by side, complementary roles, or keep work separate). Write approximately 300-400 words."
}

RESPOND WITH ONLY VALID JSON. No markdown fences.`;
}

export function buildPaidCompatPrompt2(scores: CompatibilityScores): string {
  const summary = buildChartPairSummary(scores);

  return `You are a master of Saju (사주) compatibility with 40 years of experience.

${summary}

RULES:
- English only. Every sentence must trace to THIS specific chart pairing.
- Flowing literary prose, no bullets/lists/headers inside the JSON values.
- Warm, honest, specific. Address both people by name.
- NEVER mention AI. Speak as the voice of ancient wisdom.

GENERATE as JSON:
{
  "friendship": "3-4 paragraphs about friendship dynamics. What makes these two click as friends? What activities strengthen their bond? Where do they naturally complement vs frustrate each other? How does their friendship evolve over time — what phase are they likely in now? Write approximately 300-400 words.",

  "conflict": "3-4 paragraphs about conflict resolution patterns. How does each person handle disagreement based on their element? What triggers each person's defensive mode? The specific pattern their arguments likely follow (who escalates, who withdraws, what breaks the cycle). Give concrete advice for resolving their most common friction points. Write approximately 300-400 words."
}

RESPOND WITH ONLY VALID JSON. No markdown fences.`;
}

export function buildPaidCompatPrompt3(scores: CompatibilityScores): string {
  const summary = buildChartPairSummary(scores);
  const currentYear = new Date().getFullYear();

  return `You are a master of Saju (사주) compatibility with 40 years of experience.

${summary}

RULES:
- English only. Every sentence must trace to THIS specific chart pairing.
- Flowing literary prose, no bullets/lists/headers inside the JSON values.
- Warm, honest, specific. Address both people by name.
- NEVER mention AI. Speak as the voice of ancient wisdom.

GENERATE as JSON:
{
  "yearly": "3-4 paragraphs about this pairing's energy in ${currentYear}. How does this year's elemental energy affect their compatibility specifically? Are there months that are especially harmonious or challenging for them together? What should they focus on this year to strengthen their bond? Include one specific timing recommendation (e.g., 'The period between May and July is ideal for...'). Write approximately 300-400 words."
}

RESPOND WITH ONLY VALID JSON. No markdown fences.`;
}
