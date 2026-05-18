// AI Reading Generation Prompt System
// This is the HEART of the product. Every reading must feel uniquely personal.

import type { SajuChart, Element } from "./saju-calculator";
import { calculateAdvancedSaju } from "./saju-advanced";
import { getLanguageInstruction, getLanguageHeader, getLanguageFooter } from "./prompt-locale";

// Day Master personality seeds - unique metaphors per element+polarity
const DAY_MASTER_SEEDS: Record<string, { metaphor: string; energy: string; shadow: string }> = {
  "Yang Wood": {
    metaphor: "a great tree in an ancient forest — tall, upright, reaching ceaselessly toward the sky",
    energy: "Your spirit is one of growth and ambition. You stand firm in your principles, always pushing upward, always expanding. Like a mighty oak, you provide shelter and inspiration to those around you.",
    shadow: "But even the tallest tree can become rigid. When storms come, it is the tree that bends that survives.",
  },
  "Yin Wood": {
    metaphor: "a flowering vine — graceful, adaptive, finding its way through any wall or fence",
    energy: "Your strength is in your flexibility and quiet persistence. Where others force their way, you find the cracks, the openings, the paths of least resistance — and you bloom there beautifully.",
    shadow: "Yet a vine without its own structure can become dependent, wrapping itself too tightly around others.",
  },
  "Yang Fire": {
    metaphor: "the sun itself — impossible to ignore, radiating warmth and light in every direction",
    energy: "You are a natural center of attention, not because you seek it, but because your warmth draws people in. Your enthusiasm is contagious, your optimism a beacon.",
    shadow: "But the sun cannot choose who it shines on, and sometimes your fire burns without discrimination — exhausting yourself for those who offer nothing in return.",
  },
  "Yin Fire": {
    metaphor: "a candle flame in a quiet room — intimate, focused, illuminating what matters most",
    energy: "Your light is subtle but penetrating. Where the sun lights up everything, you illuminate the hidden corners — the truths others miss, the details that change everything.",
    shadow: "A candle, though, can flicker in the slightest wind. Your sensitivity is your gift and your vulnerability.",
  },
  "Yang Earth": {
    metaphor: "a mountain — vast, immovable, a landmark that others navigate by",
    energy: "You are the person people come to when the ground shakes. Your stability isn't passive — it's a force. You hold space for others simply by being unshakeable yourself.",
    shadow: "Mountains, however, cannot chase what they want. Your steadfastness can become stubbornness, your reliability a prison of others' expectations.",
  },
  "Yin Earth": {
    metaphor: "fertile garden soil — nurturing, patient, transforming everything it touches into something alive",
    energy: "You have an extraordinary gift for cultivation. Ideas, people, projects — whatever you tend to grows. Your patience is not weakness; it is the quiet confidence that seeds take time.",
    shadow: "But soil that gives endlessly without replenishment becomes barren. You must learn to receive as generously as you give.",
  },
  "Yang Metal": {
    metaphor: "a sword forged in fire — sharp, decisive, cutting through confusion with a single stroke",
    energy: "You see the world with uncommon clarity. Where others equivocate, you decide. Where others see gray, you see the clean line between what works and what doesn't.",
    shadow: "A blade that never rests in its sheath, though, eventually cuts the hand that wields it. Not every situation calls for your edge.",
  },
  "Yin Metal": {
    metaphor: "a jewel buried in stone — precious, refined, revealing its brilliance only to those who look closely",
    energy: "Your value isn't loud — it's deep. You possess a refined sensibility, an eye for quality and beauty that most people lack. You notice what others overlook.",
    shadow: "Jewels kept hidden serve no one. Your tendency toward privacy can become isolation if you forget that being seen is not the same as being exposed.",
  },
  "Yang Water": {
    metaphor: "a great river — powerful, unstoppable, carving canyons through solid rock over time",
    energy: "You are a force of nature in motion. Your mind is vast and restless, always flowing toward new knowledge, new connections, new horizons. You cannot be contained.",
    shadow: "But a river without banks is a flood. Your endless motion can become chaos if you don't choose your channels deliberately.",
  },
  "Yin Water": {
    metaphor: "morning dew — quiet, essential, appearing exactly where life needs it most",
    energy: "You work through subtlety and intuition. Your influence seeps into situations silently, nourishing from below where no one sees. People often don't realize how much they depend on you until you're gone.",
    shadow: "Dew evaporates in strong sunlight. You must protect your energy from those who would consume your quiet gifts without acknowledging them.",
  },
};

// Element interaction descriptions for personalized insights
function getElementDynamic(dominant: Element, weakest: Element, dayMasterElement: Element): string {
  const dynamics: Record<string, string> = {
    "wood-metal": "Your creative impulse is constantly being refined by an inner critic. This tension, while uncomfortable, produces work of exceptional precision.",
    "wood-fire": "Your ideas ignite quickly — sometimes too quickly. Learning to let concepts simmer before acting will transform good instincts into great outcomes.",
    "wood-water": "Your growth is deeply rooted in wisdom. You learn from everything, and this makes your trajectory unusual — slow at first, then suddenly explosive.",
    "wood-earth": "You are torn between expansion and stability. This isn't a flaw — it's a dynamic engine that, when balanced, builds empires.",
    "fire-water": "Your passion and your depth are in constant dialogue. This inner tension gives you a complexity that others find magnetic but sometimes confusing.",
    "fire-metal": "Your warmth melts resistance. You have a rare ability to transform rigid situations through sheer force of enthusiasm and sincerity.",
    "fire-wood": "Your energy is self-sustaining — passion feeds creativity which feeds more passion. The challenge is knowing when to let the fire rest.",
    "fire-earth": "Your fire forges lasting things. Unlike those who burn bright and fade, your passion leaves permanent marks on the world.",
    "earth-wood": "Your stability is being constantly challenged by a need to grow. Embrace this restlessness — it prevents stagnation.",
    "earth-water": "You absorb everything — emotions, information, experiences. This makes you wise but heavy. Regular release is essential for your wellbeing.",
    "earth-fire": "You are the keeper of the flame. Others may spark inspiration, but you're the one who sustains it long enough to matter.",
    "earth-metal": "Your practical nature is sharpened by discernment. You don't just build — you build precisely, eliminating waste with surgical efficiency.",
    "metal-fire": "Your precision is tempered by warmth. This rare combination makes you both exacting and approachable — a leader people actually want to follow.",
    "metal-wood": "Your analytical mind sometimes clashes with your creative instincts. The resolution of this conflict is where your greatest innovations live.",
    "metal-water": "Your clarity flows into depth. You don't just see the surface — you cut through it and explore what lies beneath with fearless honesty.",
    "metal-earth": "You refine what exists rather than chasing what doesn't. This grounded precision makes you invaluable in any endeavor.",
    "water-fire": "Your depth and your passion create steam — transformative energy that can power extraordinary change when channeled deliberately.",
    "water-earth": "Your intuition is grounded in practicality. You dream, but your dreams have blueprints. This is exceptionally rare.",
    "water-wood": "Your wisdom feeds growth — in yourself and everyone around you. You are a natural mentor, whether you realize it or not.",
    "water-metal": "Your flowing nature is guided by precision. You don't wander — you navigate. Every detour has purpose, even when it doesn't feel that way.",
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

  return `${getLanguageHeader(locale)}You are a master of Saju (사주, Four Pillars of Destiny) with 40 years of experience. You speak with warmth, directness, and sharp insight. Your readings feel like a conversation with someone who sees right through the seeker.

CRITICAL WRITING RULES:
- ${getLanguageInstruction(locale)}
- Use SHORT sentences. Maximum 20 words per sentence. Simple, direct language.
- NO literary or poetic language. NO flowery metaphors. Write like you are TALKING to a friend.
- NEVER use generic phrases like "you are a natural leader" or "you have great potential." Every sentence must connect to THIS person's specific chart data.
- Write as if speaking directly to ${chart.name}, using "you" throughout.
- The reader should think "how does it know this about me?" — not "this is pretty writing."
- NEVER mention that you are an AI or that this is generated.
- Do NOT use bullet points or lists. Write in short, punchy paragraphs.
- Tone: like a sharp, warm friend who sees right through you. Not a fortune cookie. Not a professor.

ABSOLUTE PROHIBITIONS (FREE READING):
1. NEVER give actionable advice. No colors to wear, no directions to face, no habits to adopt, no environments to seek. Zero. The reader must feel "I know my problem now, but I don't know what to do about it" — that answer lives in the Full Reading.
2. NEVER end any section with a comforting or resolved sentence. Every section MUST end on an open question, an unresolved tension, or a "but..." that trails off. If your last sentence feels like a satisfying conclusion, DELETE IT.
3. NEVER give specific timing. No "first half of the year", no "summer", no seasons, no months. Say "there is a critical turning point in ${forecastYear}" but NEVER say when. The timing is in the Full Reading.
4. NEVER praise the reader's strengths without immediately showing the cost. Every positive trait must be followed by "but this same quality also..." — and then leave THAT unresolved too.

CRITICAL STRUCTURE RULES:
- The "personality" section MUST contain a SPECIFIC TENSION POINT from the chart — a clash, harmony, punishment, or extreme element imbalance. This is the HOOK. Name it, show how it creates a REPEATING LIFE PATTERN the reader will recognize. But do NOT explain why it repeats, and do NOT explain how to break it. The reader must think: "Yes, this keeps happening to me — but why?"
- The "year_forecast" section MUST show that ${forecastYear}'s energy COLLIDES with the tension point. Make it feel urgent — something is coming, something will be triggered. But do NOT say what to do about it, and do NOT say when exactly. End with: the strategy and timing are mapped in the Full Destiny Reading.
- The "element_guidance" section must NAME the missing or weak element and explain what its absence COSTS the reader in concrete life terms. But do NOT give remedies. Instead, preview what the Full Reading reveals.

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
- Element Dynamic: ${elementDynamic}
${(() => { try {
  const adv = calculateAdvancedSaju(chart);
  const lines = [];
  lines.push(`- Day Master Strength: ${adv.dayMasterStrength}`);
  if (adv.currentDaeun) lines.push(`- Current Major Luck (대운): ${adv.currentDaeun.stem.en}/${adv.currentDaeun.branch.en} (${adv.currentDaeun.tenGodRelation}) age ${adv.currentDaeun.startAge}-${adv.currentDaeun.endAge}`);
  if (adv.nextDaeun) lines.push(`- Next Major Luck: ${adv.nextDaeun.stem.en}/${adv.nextDaeun.branch.en} (${adv.nextDaeun.tenGodRelation}) age ${adv.nextDaeun.startAge}-${adv.nextDaeun.endAge}`);
  const clashes = adv.interactions.filter(i => i.type === "충" || i.type === "삼합" || i.type === "육합");
  if (clashes.length > 0) lines.push(`- Key Interactions: ${clashes.map(c => `${c.typeEn}(${c.branches.join("")})`).join(", ")}`);
  if (adv.specialStars.length > 0) lines.push(`- Special Stars: ${adv.specialStars.map(s => s.name).join(", ")}`);
  return lines.join("\n");
} catch { return ""; } })()}

IDENTIFYING THE TENSION POINT — use the chart data above:
1. First priority: Any clash between pillar branches (e.g. 卯酉沖, 子午沖). Name the specific branches.
2. Second: Any punishment between branches.
3. Third: An element at 0 (completely missing) or at 4-5 (overwhelming).
4. Fourth: Tension between Day Master element and Dominant element.
Use ONLY interactions that actually exist in the chart data above. Do NOT invent clashes.

GENERATE THREE SECTIONS in this exact JSON format:
{
  "personality": "3-4 short paragraphs. First, who this person is — their Day Master identity in 2-3 direct, simple sentences. Then introduce the TENSION POINT: name the specific clash/imbalance with original Chinese characters, then explain in plain language what it means. Show how this tension creates a REPEATING pattern — career choices, relationship patterns, recurring frustrations. The reader must recognize themselves. But do NOT explain WHY this pattern repeats. Do NOT explain how to break it. End with a question that makes the reader uncomfortable: something like 'You already know this pattern. The question is — do you know what is underneath it?' The tension must feel like an open wound. Approximately 200-250 words.",
  "year_forecast": "2-3 short paragraphs. Connect ${forecastYear}'s energy (${forecastYear} is a \u4e19\u5348 year \u2014 Yang Fire over Horse) DIRECTLY to the tension point you identified. Show how this year's energy ACTIVATES that exact vulnerability. Make it feel urgent \u2014 something is building, pressure is mounting. But do NOT say WHEN in the year it peaks. Do NOT give any strategy or advice. End the section feeling like a warning without a solution: 'The exact timing of this collision \u2014 and the strategy that fits YOUR chart \u2014 is mapped in your Full Destiny Reading.' TODAY IS ${currentYear}-${String(currentMonth).padStart(2, '0')} \u2014 do NOT use future-tense framing for this year. Approximately 150-200 words.",
  "element_guidance": "1 paragraph: Name the weakest or missing element (${weakest}) and describe what its ABSENCE costs the reader \u2014 in relationships, career stability, health patterns, or emotional regulation. Be specific and make it sting. Do NOT give any remedy, color, habit, direction, or practical tip. Then a second paragraph: 'Your chart holds more than what you have seen here. Your Full Destiny Reading maps: the decade ahead \u2014 career, money, relationships. A month-by-month energy forecast for ${forecastYear} with exact turning points. The hidden pattern in your Four Pillars that explains why certain things keep happening. And the specific remedy for the ${weakest} void that changes everything.' This section must make the reader feel that stopping here means leaving the most important answers on the table. Approximately 100-150 words."
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
