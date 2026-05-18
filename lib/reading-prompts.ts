// AI Reading Generation Prompt System
// This is the HEART of the product. Every reading must feel uniquely personal.

import type { SajuChart, Element } from "./saju-calculator";
import { calculateAdvancedSaju } from "./saju-advanced";
import { getLanguageInstruction, getLanguageHeader, getLanguageFooter } from "./prompt-locale";

// Day Master personality seeds - unique metaphors per element+polarity
const DAY_MASTER_SEEDS: Record<string, { metaphor: string; energy: string; shadow: string }> = {
  "Yang Wood": {
    metaphor: "a great tree in an ancient forest \u2014 tall, upright, reaching ceaselessly toward the sky",
    energy: "Your spirit is one of growth and ambition. You stand firm in your principles, always pushing upward, always expanding. Like a mighty oak, you provide shelter and inspiration to those around you.",
    shadow: "But even the tallest tree can become rigid. When storms come, it is the tree that bends that survives.",
  },
  "Yin Wood": {
    metaphor: "a flowering vine \u2014 graceful, adaptive, finding its way through any wall or fence",
    energy: "Your strength is in your flexibility and quiet persistence. Where others force their way, you find the cracks, the openings, the paths of least resistance \u2014 and you bloom there beautifully.",
    shadow: "Yet a vine without its own structure can become dependent, wrapping itself too tightly around others.",
  },
  "Yang Fire": {
    metaphor: "the sun itself \u2014 impossible to ignore, radiating warmth and light in every direction",
    energy: "You are a natural center of attention, not because you seek it, but because your warmth draws people in. Your enthusiasm is contagious, your optimism a beacon.",
    shadow: "But the sun cannot choose who it shines on, and sometimes your fire burns without discrimination \u2014 exhausting yourself for those who offer nothing in return.",
  },
  "Yin Fire": {
    metaphor: "a candle flame in a quiet room \u2014 intimate, focused, illuminating what matters most",
    energy: "Your light is subtle but penetrating. Where the sun lights up everything, you illuminate the hidden corners \u2014 the truths others miss, the details that change everything.",
    shadow: "A candle, though, can flicker in the slightest wind. Your sensitivity is your gift and your vulnerability.",
  },
  "Yang Earth": {
    metaphor: "a mountain \u2014 vast, immovable, a landmark that others navigate by",
    energy: "You are the person people come to when the ground shakes. Your stability isn't passive \u2014 it's a force. You hold space for others simply by being unshakeable yourself.",
    shadow: "Mountains, however, cannot chase what they want. Your steadfastness can become stubbornness, your reliability a prison of others' expectations.",
  },
  "Yin Earth": {
    metaphor: "fertile garden soil \u2014 nurturing, patient, transforming everything it touches into something alive",
    energy: "You have an extraordinary gift for cultivation. Ideas, people, projects \u2014 whatever you tend to grows. Your patience is not weakness; it is the quiet confidence that seeds take time.",
    shadow: "But soil that gives endlessly without replenishment becomes barren. You must learn to receive as generously as you give.",
  },
  "Yang Metal": {
    metaphor: "a sword forged in fire \u2014 sharp, decisive, cutting through confusion with a single stroke",
    energy: "You see the world with uncommon clarity. Where others equivocate, you decide. Where others see gray, you see the clean line between what works and what doesn't.",
    shadow: "A blade that never rests in its sheath, though, eventually cuts the hand that wields it. Not every situation calls for your edge.",
  },
  "Yin Metal": {
    metaphor: "a jewel buried in stone \u2014 precious, refined, revealing its brilliance only to those who look closely",
    energy: "Your value isn't loud \u2014 it's deep. You possess a refined sensibility, an eye for quality and beauty that most people lack. You notice what others overlook.",
    shadow: "Jewels kept hidden serve no one. Your tendency toward privacy can become isolation if you forget that being seen is not the same as being exposed.",
  },
  "Yang Water": {
    metaphor: "a great river \u2014 powerful, unstoppable, carving canyons through solid rock over time",
    energy: "You are a force of nature in motion. Your mind is vast and restless, always flowing toward new knowledge, new connections, new horizons. You cannot be contained.",
    shadow: "But a river without banks is a flood. Your endless motion can become chaos if you don't choose your channels deliberately.",
  },
  "Yin Water": {
    metaphor: "morning dew \u2014 quiet, essential, appearing exactly where life needs it most",
    energy: "You work through subtlety and intuition. Your influence seeps into situations silently, nourishing from below where no one sees. People often don't realize how much they depend on you until you're gone.",
    shadow: "Dew evaporates in strong sunlight. You must protect your energy from those who would consume your quiet gifts without acknowledging them.",
  },
};

// Element interaction descriptions for personalized insights
function getElementDynamic(dominant: Element, weakest: Element, dayMasterElement: Element): string {
  const dynamics: Record<string, string> = {
    "wood-metal": "Your creative impulse is constantly being refined by an inner critic. This tension, while uncomfortable, produces work of exceptional precision.",
    "wood-fire": "Your ideas ignite quickly \u2014 sometimes too quickly. Learning to let concepts simmer before acting will transform good instincts into great outcomes.",
    "wood-water": "Your growth is deeply rooted in wisdom. You learn from everything, and this makes your trajectory unusual \u2014 slow at first, then suddenly explosive.",
    "wood-earth": "You are torn between expansion and stability. This isn't a flaw \u2014 it's a dynamic engine that, when balanced, builds empires.",
    "fire-water": "Your passion and your depth are in constant dialogue. This inner tension gives you a complexity that others find magnetic but sometimes confusing.",
    "fire-metal": "Your warmth melts resistance. You have a rare ability to transform rigid situations through sheer force of enthusiasm and sincerity.",
    "fire-wood": "Your energy is self-sustaining \u2014 passion feeds creativity which feeds more passion. The challenge is knowing when to let the fire rest.",
    "fire-earth": "Your fire forges lasting things. Unlike those who burn bright and fade, your passion leaves permanent marks on the world.",
    "earth-wood": "Your stability is being constantly challenged by a need to grow. Embrace this restlessness \u2014 it prevents stagnation.",
    "earth-water": "You absorb everything \u2014 emotions, information, experiences. This makes you wise but heavy. Regular release is essential for your wellbeing.",
    "earth-fire": "You are the keeper of the flame. Others may spark inspiration, but you're the one who sustains it long enough to matter.",
    "earth-metal": "Your practical nature is sharpened by discernment. You don't just build \u2014 you build precisely, eliminating waste with surgical efficiency.",
    "metal-fire": "Your precision is tempered by warmth. This rare combination makes you both exacting and approachable \u2014 a leader people actually want to follow.",
    "metal-wood": "Your analytical mind sometimes clashes with your creative instincts. The resolution of this conflict is where your greatest innovations live.",
    "metal-water": "Your clarity flows into depth. You don't just see the surface \u2014 you cut through it and explore what lies beneath with fearless honesty.",
    "metal-earth": "You refine what exists rather than chasing what doesn't. This grounded precision makes you invaluable in any endeavor.",
    "water-fire": "Your depth and your passion create steam \u2014 transformative energy that can power extraordinary change when channeled deliberately.",
    "water-earth": "Your intuition is grounded in practicality. You dream, but your dreams have blueprints. This is exceptionally rare.",
    "water-wood": "Your wisdom feeds growth \u2014 in yourself and everyone around you. You are a natural mentor, whether you realize it or not.",
    "water-metal": "Your flowing nature is guided by precision. You don't wander \u2014 you navigate. Every detour has purpose, even when it doesn't feel that way.",
  };

  const key = `${dominant}-${weakest}`;
  return dynamics[key] || dynamics[`${dayMasterElement}-${weakest}`] || 
    "Your elemental composition creates a unique energetic signature that defies simple categorization.";
}

// Build the master prompt for AI reading generation
export function buildFreeReadingPrompt(chart: SajuChart, locale?: string): string {
  const dm = chart.dayMaster;
  const dmSeed = DAY_MASTER_SEEDS[dm.en] || DAY_MASTER_SEEDS["Yang Wood"];
  const archetype = chart.archetype;
  const tenGodKey = chart.tenGod;
  const dominant = chart.dominantElement;
  const weakest = chart.weakestElement;
  const elementDynamic = getElementDynamic(dominant, weakest, dm.element as Element);
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  // From November, forecast targets the upcoming year
  const forecastYear = currentMonth >= 11 ? currentYear + 1 : currentYear;
  const bd = typeof chart.birthDate === "string" ? new Date(chart.birthDate) : chart.birthDate;
  const birthYear = bd.getFullYear();
  const age = currentYear - birthYear;

  // Build element distribution description
  const elementStr = `Wood: ${chart.elements.wood}, Fire: ${chart.elements.fire}, Earth: ${chart.elements.earth}, Metal: ${chart.elements.metal}, Water: ${chart.elements.water}`;

  return `${getLanguageHeader(locale)}You are a master of Saju (\uC0AC\uC8FC, Four Pillars of Destiny) with 40 years of experience. You speak with warmth, directness, and sharp insight. Your readings feel like a conversation with someone who has known the seeker their entire life.

CRITICAL WRITING RULES:
- ${getLanguageInstruction(locale)}
- Use SHORT sentences. Maximum 20 words per sentence. Simple, direct language.
- NO literary or poetic language. NO flowery metaphors. Write like you are TALKING to a friend.
- NEVER use generic phrases. Every sentence must connect to THIS person's specific chart data.
- Write as if speaking directly to ${chart.name}, using "you" throughout.
- The reader should think "how does it know this about me?" \u2014 not "this is pretty writing."
- NEVER mention AI or that this is generated.
- Do NOT use bullet points or lists. Write in short, punchy paragraphs.
- Tone: like a sharp, warm friend who sees right through you. Not a fortune cookie. Not a professor.

CRITICAL STRUCTURE RULES:
- The "personality" section must contain a SPECIFIC TENSION POINT from the chart (a clash/\uCDA9, harmony/\uD569, punishment/\uD615, or extreme element imbalance). This is the HOOK. Explain it halfway \u2014 name it, show its pattern in the person's life, but do NOT fully resolve it. The reader must feel "I need to know more."
- The "year_forecast" section must connect this year's energy DIRECTLY to the tension point. Give a time hint (e.g., "second half of the year") but do NOT give the specific months or strategy. End with a clear statement that the full timing and strategy are in the Full Reading.
- The "element_guidance" section should be MINIMAL practical advice (3-4 sentences) and then a PREVIEW of what deeper analysis covers: career direction, relationship compatibility, and monthly energy map. This section's job is to make the reader want the Full Reading.

THE SEEKER'S CHART:
- Name: ${chart.name}
- Gender: ${chart.gender}
- Age: approximately ${age} years old
- Day Master: ${dm.zh} ${dm.en} (${dm.element}, ${dm.yinYang})
- Day Master Metaphor: ${dmSeed.metaphor}
- Day Master Energy: ${dmSeed.energy}
- Day Master Shadow: ${dmSeed.shadow}
- Archetype: ${archetype} (${tenGodKey})
- Dominant Element: ${dominant}
- Weakest Element: ${weakest}
- Element Distribution: ${elementStr}
- Element Dynamic: ${elementDynamic}
- Harmony Score: ${chart.harmonyScore}/100
- Four Pillars:
  Year: ${chart.pillars.year.stem.zh}${chart.pillars.year.branch.zh} (${chart.pillars.year.stem.en} / ${chart.pillars.year.branch.en})
  Month: ${chart.pillars.month.stem.zh}${chart.pillars.month.branch.zh} (${chart.pillars.month.stem.en} / ${chart.pillars.month.branch.en})
  Day: ${chart.pillars.day.stem.zh}${chart.pillars.day.branch.zh} (${chart.pillars.day.stem.en} / ${chart.pillars.day.branch.en})
  Hour: ${chart.pillars.hour.stem.zh}${chart.pillars.hour.branch.zh} (${chart.pillars.hour.stem.en} / ${chart.pillars.hour.branch.en})
${(() => { try {
  const adv = calculateAdvancedSaju(chart);
  const lines = [];
  lines.push(\`- Day Master Strength: \${adv.dayMasterStrength}\`);
  if (adv.currentDaeun) lines.push(\`- Current Major Luck (\uB300\uC6B4): \${adv.currentDaeun.stem.en}/\${adv.currentDaeun.branch.en} (\${adv.currentDaeun.tenGodRelation}) age \${adv.currentDaeun.startAge}-\${adv.currentDaeun.endAge}\`);
  if (adv.nextDaeun) lines.push(\`- Next Major Luck: \${adv.nextDaeun.stem.en}/\${adv.nextDaeun.branch.en} (\${adv.nextDaeun.tenGodRelation}) age \${adv.nextDaeun.startAge}-\${adv.nextDaeun.endAge}\`);
  const clashes = adv.interactions.filter(i => i.type === "\uCDA9" || i.type === "\uC0BC\uD569" || i.type === "\uC721\uD569");
  if (clashes.length > 0) lines.push(\`- Key Interactions: \${clashes.map(c => \`\${c.typeEn}(\${c.branches.join("")})\`).join(", ")}\`);
  if (adv.specialStars.length > 0) lines.push(\`- Special Stars: \${adv.specialStars.map(s => s.name).join(", ")}\`);
  return lines.join("\\n");
} catch { return ""; } })()}

IMPORTANT \u2014 IDENTIFYING THE TENSION POINT:
Look at the chart data above. Find the STRONGEST tension in this order of priority:
1. Any clash (\uCDA9) between pillars \u2014 this is the #1 hook. Name the specific branches involved.
2. Any punishment (\uD615) between pillars.
3. If no clash or punishment: the most EXTREME element imbalance (e.g., an element at 0, or one element dominating at 4-5).
4. If elements are balanced: the tension between Day Master element and Dominant element.
Use the ACTUAL interaction data provided above. Do NOT invent clashes that don't exist in the chart.

GENERATE THREE SECTIONS in this exact JSON format:
{
  "personality": "3-4 short paragraphs. START with who this person is \u2014 their Day Master identity in 2-3 direct sentences. Then immediately introduce the TENSION POINT: name the specific clash/punishment/imbalance using the original Chinese characters, then explain what it means in plain language. Show how this tension plays out in their actual life \u2014 career decisions, relationships, recurring patterns. Use a question like 'Does this sound familiar?' or 'Have you noticed this pattern?' to create recognition. The tension should feel UNRESOLVED \u2014 you've named it and shown its pattern, but you haven't explained how to work with it or what happens next. Approximately 200-250 words.",

  "year_forecast": "2-3 short paragraphs. Connect ${forecastYear}'s energy (${forecastYear} is a \u4E19\u5348 year \u2014 Yang Fire over Horse) DIRECTLY to the tension point from the personality section. Show how this year's energy activates or challenges their specific tension. Give a TIME HINT \u2014 mention which half of the year or which season is critical, but do NOT give specific months. End with something like: 'The specific timing of this shift \u2014 which months to act and which to wait \u2014 and the strategy that fits your chart are covered in your Full Destiny Reading.' TODAY IS ${currentYear}-${String(currentMonth).padStart(2, '0')} so do NOT use future-tense framing for this year. Approximately 150-200 words.",

  "element_guidance": "1-2 short paragraphs. Give 2-3 quick, practical tips based on their weakest element (colors, environments, habits). Then add a PREVIEW paragraph: 'Your chart has more to reveal. Your Full Destiny Reading includes: your career and money direction for the next 10 years, a month-by-month energy map for ${forecastYear}, relationship compatibility patterns, and a hidden talent that most readings miss.' This section should make the Full Reading feel like essential next step, not an upsell. Approximately 100-150 words."
}

RESPOND WITH ONLY THE JSON. No markdown, no backticks, no explanation.${getLanguageFooter(locale)}`;
}

// Generate a unique share slug
export function generateShareSlug(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let slug = "";
  for (let i = 0; i < 8; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}
