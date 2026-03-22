// Oracle response templates organized by category
// Dynamic variables: {userName}, {dayMaster}, {dayMasterElement}, {archetype}, {dominantElement}, {todayElement}

export type ResponseCategory = "career" | "love" | "money" | "timing" | "general";

interface ResponseTemplate {
  content: string;
  confidence: number;
}

export const CAREER_KEYWORDS = ["job", "career", "work", "business", "interview", "promotion", "quit", "start", "launch", "boss", "colleague", "office", "resign", "hire"];
export const LOVE_KEYWORDS = ["love", "relationship", "partner", "date", "marriage", "compatible", "breakup", "soulmate", "romance", "dating", "boyfriend", "girlfriend", "spouse", "husband", "wife"];
export const MONEY_KEYWORDS = ["money", "finance", "invest", "wealth", "salary", "save", "spend", "budget", "stock", "income", "expense", "profit", "loss", "rich"];
export const TIMING_KEYWORDS = ["when", "timing", "date", "month", "year", "best time", "should i", "good day", "right time", "opportunity", "wait", "now", "soon"];

export function detectCategory(message: string): ResponseCategory {
  const lower = message.toLowerCase();
  
  if (CAREER_KEYWORDS.some(k => lower.includes(k))) return "career";
  if (LOVE_KEYWORDS.some(k => lower.includes(k))) return "love";
  if (MONEY_KEYWORDS.some(k => lower.includes(k))) return "money";
  if (TIMING_KEYWORDS.some(k => lower.includes(k))) return "timing";
  return "general";
}

const careerResponses: ResponseTemplate[] = [
  {
    content: `Your {dayMasterElement} Day Master combined with your {archetype} archetype indicates strong leadership potential. The current {todayElement} energy supports professional advancement. Focus on showcasing your natural strengths — your elemental profile suggests you excel in roles requiring both creativity and strategic thinking.

Consider timing major career moves when {dayMasterElement} energy is strongest, typically in the morning hours. Your {archetype} nature means you thrive when given autonomy and room for innovation.`,
    confidence: 89,
  },
  {
    content: `As a {dayMaster} Day Master with {archetype} characteristics, your career path benefits most from environments that honor your {dayMasterElement} essence. Today's {todayElement} energy creates an interesting dynamic — use it to network and build alliances.

Your elemental balance suggests success in fields where you can express both your analytical and creative sides. Avoid making final decisions during Metal hours (3-7pm) when tensions may cloud judgment.`,
    confidence: 92,
  },
  {
    content: `The stars reveal that your {archetype} nature seeks meaningful work, not just employment. Your {dayMaster} ({dayMasterElement}) energy is currently supported by today's {todayElement} flow, making this a favorable period for professional conversations and negotiations.

Trust your {archetype} instincts — they're aligned with your cosmic blueprint. The next strong window for career advancement opens when Wood energy peaks.`,
    confidence: 87,
  },
];

const loveResponses: ResponseTemplate[] = [
  {
    content: `Your {dayMasterElement} essence as a {archetype} creates a unique romantic signature. You are naturally drawn to partners who complement your elemental profile — particularly those with strong {dominantElement} energy in their charts.

Today's {todayElement} influence heightens emotional sensitivity. This is an excellent time for deep conversations and vulnerability. Your {archetype} nature means you value authenticity above all in relationships.`,
    confidence: 88,
  },
  {
    content: `As a {dayMaster} Day Master, your relationship style reflects {dayMasterElement}'s qualities — nurturing growth, passionate expression, and deep emotional connection. Your {archetype} archetype adds depth to your romantic connections.

The current {todayElement} energy suggests focusing on communication. Partners with complementary elements often bring the balance your chart seeks.`,
    confidence: 91,
  },
  {
    content: `Your {archetype} essence seeks a partner who can match your {dayMasterElement} intensity while providing grounding. Today's {todayElement} cosmic weather favors romantic encounters and strengthening existing bonds.

Trust the timing of the universe — your elemental profile suggests significant relationship developments when Water and {dayMasterElement} energies align. This creates optimal conditions for lasting connections.`,
    confidence: 86,
  },
];

const moneyResponses: ResponseTemplate[] = [
  {
    content: `Your wealth element, derived from your {dayMaster} Day Master, indicates strong potential for financial growth. As a {archetype}, you likely excel at generating income through creativity and innovation rather than traditional paths.

Today's {todayElement} influence affects your financial decisions. Consider delaying major purchases until the elemental balance shifts in your favor.`,
    confidence: 85,
  },
  {
    content: `As a {dayMaster} ({dayMasterElement}) with {archetype} characteristics, your approach to wealth should honor your natural elemental flow. Your chart suggests steady growth over sudden windfalls — patience is your greatest financial asset.

The current {todayElement} period supports thoughtful planning. Align your financial decisions with these cosmic currents for optimal results.`,
    confidence: 90,
  },
  {
    content: `Your {archetype} nature combined with {dayMasterElement} energy creates a unique relationship with wealth. You're naturally inclined toward sustainable growth and ethical investments that align with your values.

Today's {todayElement} energy suggests reviewing your financial plans rather than making new commitments. Trust your elemental wisdom.`,
    confidence: 88,
  },
];

const timingResponses: ResponseTemplate[] = [
  {
    content: `For a {dayMaster} Day Master like yourself, timing is intimately connected to elemental flow. Today's {todayElement} energy creates a dynamic interaction with your chart. The {archetype} in you thrives when decisions align with cosmic rhythms.

The most favorable windows for action typically occur when {dayMasterElement} energy is supported — watch for days when complementary elements dominate. Your next strong timing window opens within the coming lunar cycle.`,
    confidence: 93,
  },
  {
    content: `Your {archetype} nature seeks the perfect moment, and today's {todayElement} configuration offers useful insights. As a {dayMasterElement} Day Master, you benefit most from acting when elemental tensions are low and support is high.

Morning hours (5-9am) when Wood energy peaks often favor your {dayMaster} essence. Trust your {archetype} intuition — it's calibrated to your cosmic blueprint.`,
    confidence: 89,
  },
  {
    content: `Timing for a {dayMaster} ({dayMasterElement}) follows the five-element cycle closely. Today's {todayElement} energy suggests a period of reflection and preparation before taking major action.

Your {archetype} archetype amplifies these cosmic signals. The universe rarely demands immediate action — trust the timing that feels aligned with your deeper wisdom.`,
    confidence: 91,
  },
];

const generalResponses: ResponseTemplate[] = [
  {
    content: `Your cosmic blueprint as a {dayMaster} Day Master ({dayMasterElement}) with {archetype} characteristics reveals a soul on a meaningful journey. Today's {todayElement} energy invites reflection on your path and purpose.

Your {dominantElement}-dominant chart suggests focusing on growth, creativity, and embracing new beginnings during this period.`,
    confidence: 87,
  },
  {
    content: `As a {archetype} with {dayMasterElement} as your core essence, you carry a unique cosmic signature. Today's {todayElement} influence creates an opportunity for alignment with your higher purpose.

Your Four Pillars suggest that wisdom comes through honoring your elemental nature. When {dayMasterElement} is supported, you thrive. When challenged, you grow. Both states serve your evolution.`,
    confidence: 84,
  },
  {
    content: `The {archetype} within you, powered by {dayMaster} ({dayMasterElement}) energy, seeks expression and fulfillment. Today's {todayElement} cosmic weather is favorable for introspection and connecting with your inner guidance.

Remember that your {dominantElement}-leaning chart gives you natural strengths others lack. Lean into what makes you unique — it's aligned with your destiny path.`,
    confidence: 86,
  },
];

export function getRandomResponse(category: ResponseCategory): ResponseTemplate {
  const responses = {
    career: careerResponses,
    love: loveResponses,
    money: moneyResponses,
    timing: timingResponses,
    general: generalResponses,
  };
  
  const categoryResponses = responses[category];
  return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
}

export function fillTemplate(
  template: string,
  variables: {
    userName: string;
    dayMaster: string;
    dayMasterElement: string;
    archetype: string;
    dominantElement: string;
    todayElement: string;
  }
): string {
  let result = template;
  result = result.replace(/{userName}/g, variables.userName);
  result = result.replace(/{dayMaster}/g, variables.dayMaster);
  result = result.replace(/{dayMasterElement}/g, variables.dayMasterElement);
  result = result.replace(/{archetype}/g, variables.archetype);
  result = result.replace(/{dominantElement}/g, variables.dominantElement);
  result = result.replace(/{todayElement}/g, variables.todayElement);
  return result;
}

export function getDailyElement(): string {
  const elements = ["Wood", "Fire", "Earth", "Metal", "Water"];
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return elements[dayOfYear % 5];
}
