// Paid reading: 3 parallel calls, each producing ~1000 words
// Total paid content: ~3000 words (5x the ~600 word free reading)

import { calculateAdvancedSaju } from "./saju-advanced";
import { reconstructChartFromReading } from "./constants";
import { getLanguageInstruction, getLanguageHeader, getLanguageFooter } from "./prompt-locale";
import type { SajuChart } from "./saju-calculator";

// Force language in JSON field descriptions — Gemini ignores top-level rules in JSON mode
function langPrefix(locale?: string): string {
  if (locale === "ko") return "반드시 한국어로 작성하세요. ";
  if (locale === "ja") return "必ず日本語で書いてください。";
  if (locale === "es") return "Escribe completamente en español. ";
  if (locale === "fr") return "Écris entièrement en français. ";
  if (locale === "pt") return "Escreva inteiramente em português. ";
  if (locale === "zh-TW") return "必須以繁體中文書寫。";
  if (locale === "ru") return "Пиши полностью на русском. ";
  if (locale === "hi") return "पूरी तरह हिन्दी में लिखो। ";
  if (locale === "id") return "Tulis sepenuhnya dalam Bahasa Indonesia. ";
  return "";
}

// Spanish-specific glossary & term-handling rule. For technical Saju terms,
// keep the Korean/Chinese original alongside a Spanish explanation in
// parentheses (academic-footnote style). Where space is tight or a concept
// is widely recognized in English, preserve the English term. This matches
// Rimfactory's "world's first multilingual Saju" positioning and manages
// user expectations — perfect translation is not the goal; natural,
// authoritative bilingual prose is.
function spanishTermingRule(locale?: string): string {
  if (locale !== "es") return "";
  return `
- SPANISH TERMINOLOGY RULE: When referring to technical Saju concepts, use natural Spanish but preserve original terms for authenticity, in academic-footnote style:
  · "Maestro del Día (日主 / Day Master)"
  · "Gran Fortuna (大運 / 10-year luck cycle)"
  · "los Cuatro Pilares (四柱)"
  · "los Cinco Elementos (五行)"
  · "Madera 木, Fuego 火, Tierra 土, Metal 金, Agua 水"
  · "Estrella de Riqueza (財星)", "Dios Oculto (藏干)"
- When a concept has no elegant Spanish rendering or the Spanish term would be awkward in tight UI-like spaces, keep the English term (e.g., "Day Master", "Yang Wood"). Do not invent or literally translate technical compound terms.
- For classical text citations, cite the Korean or Chinese name with Chinese characters, e.g., "el Adivinación del Cielo Goteante (滴天髓)".
- Use friendly, direct tone (tú form). Neutral Spanish, not region-specific.`;
}

// French-specific glossary & term-handling rule. Mirrors Spanish pattern:
// natural French prose with bilingual academic-footnote style for technical
// Saju terms, preserving 漢字 for authenticity. Use tu form (friendly direct
// tone) with standard Parisian French. Where French rendering would be
// awkward, fall back to English or Korean/Chinese with French gloss.
function frenchTermingRule(locale?: string): string {
  if (locale !== "fr") return "";
  return `
- FRENCH TERMINOLOGY RULE: When referring to technical Saju concepts, use natural French but preserve original terms for authenticity, in academic-footnote style:
  · "Maître du Jour (日主 / Day Master)"
  · "Grande Fortune (大運 / cycle de chance de 10 ans)"
  · "les Quatre Piliers (四柱)"
  · "les Cinq Éléments (五行)"
  · "Bois 木, Feu 火, Terre 土, Métal 金, Eau 水"
  · "Étoile de Richesse (財星)", "Dieu Caché (藏干)"
- When a concept has no elegant French rendering or the French term would be awkward in tight UI-like spaces, keep the English term (e.g., "Day Master", "Yang Wood"). Do not invent or literally translate technical compound terms.
- For classical text citations, cite the Korean or Chinese name with Chinese characters, e.g., "le Adivination du Ciel Gouttant (滴天髓)".
- Use friendly, direct tone (tu form, not vous). Standard Parisian French.`;
}

// Portuguese-specific glossary & term-handling rule. Mirrors Spanish/French
// pattern: natural Brazilian Portuguese prose with bilingual academic-footnote
// style for technical Saju terms, preserving 漢字 for authenticity. Use você
// form (friendly direct, Brazilian standard). Where Portuguese rendering would
// be awkward, fall back to English or Korean/Chinese with Portuguese gloss.
function portugueseTermingRule(locale?: string): string {
  if (locale !== "pt") return "";
  return `
- PORTUGUESE TERMINOLOGY RULE: When referring to technical Saju concepts, use natural Portuguese but preserve original terms for authenticity, in academic-footnote style:
  · "Mestre do Dia (日主 / Day Master)"
  · "Grande Fortuna (大運 / ciclo de sorte de 10 anos)"
  · "os Quatro Pilares (四柱)"
  · "os Cinco Elementos (五行)"
  · "Madeira 木, Fogo 火, Terra 土, Metal 金, Água 水"
  · "Estrela da Riqueza (財星)", "Deus Oculto (藏干)"
- When a concept has no elegant Portuguese rendering or the Portuguese term would be awkward in tight UI-like spaces, keep the English term (e.g., "Day Master", "Yang Wood"). Do not invent or literally translate technical compound terms.
- For classical text citations, cite the Korean or Chinese name with Chinese characters, e.g., "o Adivinhação do Céu Gotejante (滴天髓)".
- Use friendly, direct tone (você form, not tu). Standard Brazilian Portuguese.`;
}

// Traditional Chinese-specific glossary & term-handling rule. Unlike Western
// languages, Chinese readers already know the original Chinese 漢字 names for
// Saju terms — so we don't need bilingual footnotes. Just use the canonical
// Chinese names directly. Saju is the Korean reading of 四柱 (sì zhù).
// Critical: must be Traditional Chinese (繁體), not Simplified (简体).
function traditionalChineseTermingRule(locale?: string): string {
  if (locale !== "zh-TW") return "";
  return `
- TRADITIONAL CHINESE TERMINOLOGY RULE: Use canonical Chinese names directly without translation footnotes (Chinese readers know these terms):
  · 四柱（即韓國「Saju」、日本「四柱推命」）
  · 八字、天干、地支、日主、大運（10年運勢）
  · 五行：木、火、土、金、水
  · 十神：比肩、劫財、食神、傷官、偏財、正財、七殺、正官、偏印、正印
  · 神煞：天乙貴人、文昌貴人、桃花、驛馬等
- 必須使用繁體中文（如：時、運、學、體），不可使用簡體字（如：时、运、学、体）。
- 引用古典時直接使用原始名稱：滴天髓、窮通寶鑒、子平真詮、命理正宗、三命通會。
- 使用得體有禮但平易近人的語調，避免過於正式或文言文化的表達。`;
}

// Russian-specific glossary & term-handling rule. Mirrors Spanish/French/PT
// pattern: natural Russian prose with bilingual academic-footnote style for
// technical Saju terms, preserving 漢字 for authenticity. Use ты form
// (informal direct, modern product UX standard). Where Russian rendering
// would be awkward, fall back to English or Korean/Chinese with Russian gloss.
function russianTermingRule(locale?: string): string {
  if (locale !== "ru") return "";
  return `
- RUSSIAN TERMINOLOGY RULE: When referring to technical Saju concepts, use natural Russian but preserve original terms for authenticity, in academic-footnote style:
  · "Хозяин Дня (日主 / Day Master)"
  · "Большая Удача (大運 / 10-летний цикл удачи)"
  · "Четыре Столпа (四柱)"
  · "Пять Элементов (五行)"
  · "Дерево 木, Огонь 火, Земля 土, Металл 金, Вода 水"
  · "Звезда Богатства (財星)", "Скрытый Бог (藏干)"
- When a concept has no elegant Russian rendering or the Russian term would be awkward in tight UI-like spaces, keep the English term (e.g., "Day Master", "Yang Wood"). Do not invent or literally translate technical compound terms.
- For classical text citations, cite the Korean or Chinese name with Chinese characters, e.g., "Капля Небесного Костного Мозга (滴天髓)".
- Use informal, direct tone (ты form, not Вы). Modern Russian.`;
}

// Hindi-specific glossary & term-handling rule. Mirrors Spanish/French/PT/RU
// pattern: natural Hindi prose with bilingual academic-footnote style for
// technical Saju terms, preserving 漢字 for authenticity. Use तुम (tum) form
// — semi-formal, the standard for product UX in modern Hindi. Where Hindi
// rendering would be awkward, fall back to English or Korean/Chinese.
function hindiTermingRule(locale?: string): string {
  if (locale !== "hi") return "";
  return `
- HINDI TERMINOLOGY RULE: When referring to technical Saju concepts, use natural Hindi but preserve original terms for authenticity, in academic-footnote style:
  · "दिन का स्वामी (日主 / Day Master)"
  · "बड़ा भाग्य (大運 / 10-वर्षीय भाग्य चक्र)"
  · "चार स्तंभ (四柱)"
  · "पाँच तत्व (五行)"
  · "लकड़ी 木, अग्नि 火, पृथ्वी 土, धातु 金, जल 水"
  · "धन तारा (財星)", "छुपा देवता (藏干)"
- When a concept has no elegant Hindi rendering or the Hindi term would be awkward in tight UI-like spaces, keep the English term (e.g., "Day Master", "Yang Wood"). Do not invent or literally translate technical compound terms.
- For classical text citations, cite the Korean or Chinese name with Chinese characters, e.g., "स्वर्गीय अस्थि-मज्जा बिन्दु (滴天髓)".
- Use semi-formal tone with तुम (tum) form, not आप. Modern, natural Hindi suitable for product UX.
- Use Devanagari script (देवनागरी), not Roman/Latin script.`;
}

// Indonesian-specific glossary & term-handling rule. Mirrors Spanish/French/PT/RU/HI
// pattern: natural Bahasa Indonesia prose with bilingual academic-footnote style for
// technical Saju terms, preserving 漢字 for authenticity. Use kamu form
// (friendly direct, standard for Indonesian digital products). Where Indonesian
// rendering would be awkward, fall back to English or Korean/Chinese.
function indonesianTermingRule(locale?: string): string {
  if (locale !== "id") return "";
  return `
- INDONESIAN TERMINOLOGY RULE: When referring to technical Saju concepts, use natural Indonesian but preserve original terms for authenticity, in academic-footnote style:
  · "Penguasa Hari (日主 / Day Master)"
  · "Keberuntungan Besar (大運 / siklus keberuntungan 10 tahun)"
  · "Empat Pilar (四柱)"
  · "Lima Elemen (五行)"
  · "Kayu 木, Api 火, Tanah 土, Logam 金, Air 水"
  · "Bintang Kekayaan (財星)", "Dewa Tersembunyi (藏干)"
- When a concept has no elegant Indonesian rendering or the Indonesian term would be awkward in tight UI-like spaces, keep the English term (e.g., "Day Master", "Yang Wood"). Do not invent or literally translate technical compound terms.
- For classical text citations, cite the Korean or Chinese name with Chinese characters, e.g., "Tetesan Sumsum Surgawi (滴天髓)".
- Use friendly, direct tone with kamu form, not Anda. Modern, natural Bahasa Indonesia suitable for digital product UX.`;
}

export function buildPaidPromptPart1(chartSummary: string, locale?: string): string {
  const lp = langPrefix(locale);
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" });
  return `${getLanguageHeader(locale)}You are a master of Saju (사주) with 40 years of experience. You have studied under three different Korean masters and have read over 50,000 charts. Your readings are legendary for their specificity and uncanny accuracy.

TODAY'S DATE: ${today}. All timing guidance must be based on this date.

${chartSummary}

RULES: 
- ${getLanguageInstruction(locale)}
- Every sentence must trace to THIS specific chart.
- Flowing literary prose, no bullets/lists/headers inside the JSON values.
- Warm but authoritative — like a beloved mentor who sees everything.
- NEVER mention AI. Speak as the voice of ancient wisdom.
- Be SPECIFIC: name industries, career types, partner qualities, timing windows.
- Use the person's element interactions to justify every insight.
- CRITICAL LANGUAGE RULE: ALL text values in the JSON MUST be written entirely in ${locale === "ko" ? "Korean (한국어)" : locale === "ja" ? "Japanese (日本語)" : locale === "es" ? "Spanish (español)" : locale === "fr" ? "French (français)" : locale === "pt" ? "Portuguese (português)" : locale === "zh-TW" ? "Traditional Chinese (繁體中文)" : locale === "ru" ? "Russian (русский)" : locale === "hi" ? "Hindi (हिन्दी)" : locale === "id" ? "Indonesian (Bahasa Indonesia)" : "English"}. JSON keys must remain in English.${spanishTermingRule(locale)}${frenchTermingRule(locale)}${portugueseTermingRule(locale)}${traditionalChineseTermingRule(locale)}${russianTermingRule(locale)}${hindiTermingRule(locale)}${indonesianTermingRule(locale)}

GENERATE as JSON:
{
  "career": "${lp}5-6 paragraphs of deep career analysis. Begin with what their Day Master reveals about their professional nature — not just what they're good at, but WHY they're drawn to certain work and what happens to their energy in different work environments. Then analyze how their archetype shapes leadership or collaboration style. Identify 3-4 specific industries or career paths that align with their elemental composition, explaining the energetic reason for each match. Discuss their relationship with money and wealth accumulation based on their wealth stars. Give precise timing guidance: which years in the next decade favor bold moves, which favor consolidation. End with their ultimate career calling based on the hidden dynamics between their pillars. Write approximately 500-600 words.",
  
  "love": "${lp}5-6 paragraphs of deep relationship analysis. Start with how their Day Master loves — the specific way they express and receive affection based on their element. Describe the exact type of partner energy that complements theirs (be specific about personality traits, communication style, even physical energy). Analyze their relationship patterns: what they unconsciously seek, what triggers withdrawal, what creates deepening intimacy. Discuss the role of their archetype in relationships — how it creates both magnetic attraction and potential friction. Map relationship timing: when their chart favors new connections, deepening commitments, or necessary solitude. Address their shadow pattern in love — the one blind spot that, once recognized, transforms their relationships. Write approximately 500-600 words."
}

RESPOND WITH ONLY VALID JSON. No markdown fences, no explanation.${getLanguageFooter(locale)}`;
}

export function buildPaidPromptPart2(chartSummary: string, currentYear: number, locale?: string): string {
  const lp = langPrefix(locale);
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" });
  return `${getLanguageHeader(locale)}You are a master of Saju (사주) with 40 years of experience. You have studied under three different Korean masters and have read over 50,000 charts. Your readings are legendary for their specificity and uncanny accuracy.

TODAY'S DATE: ${today}. The current year is ${currentYear}. All health advice and forecasts must start from this date, NOT from past years.

${chartSummary}

RULES:
- ${getLanguageInstruction(locale)}
- Every sentence must trace to THIS specific chart.
- Flowing literary prose, no bullets/lists/headers inside the JSON values.
- Warm but authoritative — like a beloved mentor who sees everything.
- NEVER mention AI. Speak as the voice of ancient wisdom.
- Be SPECIFIC about timing, seasons, health practices, and yearly predictions.
- Use element interactions to justify every insight.
- CRITICAL LANGUAGE RULE: ALL text values in the JSON MUST be written entirely in ${locale === "ko" ? "Korean (한국어)" : locale === "ja" ? "Japanese (日本語)" : locale === "es" ? "Spanish (español)" : locale === "fr" ? "French (français)" : locale === "pt" ? "Portuguese (português)" : locale === "zh-TW" ? "Traditional Chinese (繁體中文)" : locale === "ru" ? "Russian (русский)" : locale === "hi" ? "Hindi (हिन्दी)" : locale === "id" ? "Indonesian (Bahasa Indonesia)" : "English"}. JSON keys must remain in English.${spanishTermingRule(locale)}${frenchTermingRule(locale)}${portugueseTermingRule(locale)}${traditionalChineseTermingRule(locale)}${russianTermingRule(locale)}${hindiTermingRule(locale)}${indonesianTermingRule(locale)}

GENERATE as JSON:
{
  "health": "${lp}4-5 paragraphs. Begin with their elemental body constitution — which organ systems are naturally strong and which need protection (Wood=liver/gallbladder/eyes/tendons, Fire=heart/small intestine/circulation/tongue, Earth=stomach/spleen/muscles/mouth, Metal=lungs/large intestine/skin/nose, Water=kidneys/bladder/bones/ears). Go beyond generic organ mentions — explain HOW their specific element imbalance manifests in daily life (energy patterns, sleep tendencies, stress responses, digestive patterns). Identify their seasonal vulnerabilities with specific months. Prescribe a personalized wellness protocol: specific foods that nourish their weak elements, environments that restore them, exercise styles that match their energy pattern, and daily habits that maintain balance. Address their mental health pattern based on element interactions — what drains them psychologically and what restores their inner equilibrium. Write approximately 400-500 words.",
  
  "decade_forecast": "${lp}6-8 paragraphs covering ${currentYear} through ${currentYear + 10}. This should read like a detailed roadmap with year-by-year insights. For each significant year, explain what elemental energy dominates and how it interacts with their natal chart. Clearly identify: the single BEST year of the decade and why, the most CHALLENGING year and how to navigate it, a major TRANSITION year that changes their life direction. Cover career peaks, relationship milestones, financial windows, and personal growth phases. Include specific seasonal timing within key years (e.g., 'the spring of ${currentYear + 3} brings...'). Address the overall arc of the decade — what theme connects these ten years, and what the person they become by ${currentYear + 10} looks like compared to who they are now. End with their 'decade gift' — the wisdom or achievement this particular ten-year cycle is designed to deliver. Write approximately 600-700 words."
}

RESPOND WITH ONLY VALID JSON. No markdown fences, no explanation.${getLanguageFooter(locale)}`;
}

export function buildPaidPromptPart3(chartSummary: string, locale?: string): string {
  const lp = langPrefix(locale);
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" });
  return `${getLanguageHeader(locale)}You are a master of Saju (사주) with 40 years of experience. You have studied under three different Korean masters and have read over 50,000 charts. Your readings are legendary for their specificity and uncanny accuracy.

TODAY'S DATE: ${today}. Monthly forecasts must start from THIS month forward.

${chartSummary}

RULES:
- ${getLanguageInstruction(locale)}
- Every sentence must trace to THIS specific chart.
- Flowing literary prose, no bullets/lists/headers inside the JSON values.
- Warm but authoritative — like a beloved mentor who sees everything.
- NEVER mention AI. Speak as the voice of ancient wisdom.
- The hidden_talent section should be the most MEMORABLE part of the entire reading.
- Use element interactions to justify every insight.
- CRITICAL LANGUAGE RULE: ALL text values in the JSON MUST be written entirely in ${locale === "ko" ? "Korean (한국어)" : locale === "ja" ? "Japanese (日本語)" : locale === "es" ? "Spanish (español)" : locale === "fr" ? "French (français)" : locale === "pt" ? "Portuguese (português)" : locale === "zh-TW" ? "Traditional Chinese (繁體中文)" : locale === "ru" ? "Russian (русский)" : locale === "hi" ? "Hindi (हिन्दी)" : locale === "id" ? "Indonesian (Bahasa Indonesia)" : "English"}. JSON keys must remain in English.${spanishTermingRule(locale)}${frenchTermingRule(locale)}${portugueseTermingRule(locale)}${traditionalChineseTermingRule(locale)}${russianTermingRule(locale)}${hindiTermingRule(locale)}${indonesianTermingRule(locale)}

GENERATE as JSON:
{
  "monthly_energy": "${lp}3-4 paragraphs covering the next 6 months as a flowing narrative arc. Don't just list month-by-month — weave them into a story of transformation. What energy is building right now? When does it peak? What challenge arrives mid-arc? How does the resolution reshape their trajectory? Be specific about timing and actions: 'By mid-August, the Metal energy intensifying in your chart demands...' Include practical guidance for each phase of the arc. End with where they'll stand 6 months from now if they ride this energy consciously. Write approximately 350-450 words.",
  
  "hidden_talent": "${lp}5-6 paragraphs. This is the crown jewel of the reading — the section they screenshot and share. Begin with: 'There is something encoded in your Four Pillars that most readings overlook — a talent so quietly embedded in the interaction between your pillars that only a deep reading reveals it.' Then unveil a SPECIFIC, SURPRISING insight about a hidden ability or calling. This must NOT be generic ('you're creative' or 'you're a leader'). It must be derived from the specific interplay of their stems and branches — for example, how the clash between their month and hour pillars creates an unusual ability, or how their Day Master's relationship with a hidden stem reveals an unexpected gift. Connect this talent to concrete manifestations in their life — moments they may have already experienced this gift without recognizing it. Explain why this talent has been hidden (usually their dominant element overshadows it). Give a specific, actionable 3-step process to activate this potential: a daily practice, an environmental change, and a relationship shift. End with a vision of who they become when this hidden talent is fully expressed — paint a vivid picture that feels both surprising and deeply true. Write approximately 500-600 words."
}

RESPOND WITH ONLY VALID JSON. No markdown fences, no explanation.${getLanguageFooter(locale)}`;
}

export function buildChartSummary(reading: any): string {
  const dmEn = `${reading.day_master_yinyang === "yang" ? "Yang" : "Yin"} ${reading.day_master_element.charAt(0).toUpperCase() + reading.day_master_element.slice(1)}`;
  const currentYear = new Date().getFullYear();
  const birthYear = new Date(reading.birth_date).getFullYear();
  const age = currentYear - birthYear;

  let advancedSection = "";
  try {
    const chart = reconstructChartFromReading(reading) as SajuChart;
    chart.gender = reading.gender;
    const adv = calculateAdvancedSaju(chart);
    const lines = [];
    lines.push(`Day Master Strength: ${adv.dayMasterStrength}`);
    if (adv.currentDaeun) lines.push(`Current Major Luck (대운): ${adv.currentDaeun.stem.en}/${adv.currentDaeun.branch.en} (${adv.currentDaeun.tenGodRelation}) age ${adv.currentDaeun.startAge}-${adv.currentDaeun.endAge}`);
    if (adv.nextDaeun) lines.push(`Next Major Luck: ${adv.nextDaeun.stem.en}/${adv.nextDaeun.branch.en} (${adv.nextDaeun.tenGodRelation}) age ${adv.nextDaeun.startAge}-${adv.nextDaeun.endAge}`);
    for (const d of adv.daeun) {
      lines.push(`  Daeun age ${d.startAge}-${d.endAge}: ${d.stem.zh}${d.branch.zh} ${d.tenGodRelation}`);
    }
    const keyInteractions = adv.interactions.filter(i => ["충", "삼합", "육합"].includes(i.type));
    if (keyInteractions.length > 0) lines.push(`Key Interactions: ${keyInteractions.map(c => `${c.typeEn}(${c.branches.join("")})`).join(", ")}`);
    if (adv.specialStars.length > 0) lines.push(`Special Stars: ${adv.specialStars.map(s => `${s.ko}(${s.name})`).join(", ")}`);
    advancedSection = "\n\nADVANCED ANALYSIS:\n" + lines.join("\n");
  } catch { advancedSection = ""; }

  return `CHART DATA FOR ${reading.name}:
- Day Master: ${reading.day_stem} ${dmEn} (${reading.day_master_element}, ${reading.day_master_yinyang})
- Archetype: ${reading.archetype} (${reading.ten_god})
- Age: ~${age}, Gender: ${reading.gender}
- Elements: Wood ${reading.elements_wood}, Fire ${reading.elements_fire}, Earth ${reading.elements_earth}, Metal ${reading.elements_metal}, Water ${reading.elements_water}
- Dominant Element: ${reading.dominant_element}, Weakest: ${reading.weakest_element}
- Harmony Score: ${reading.harmony_score}/100
- Four Pillars: Year ${reading.year_stem}${reading.year_branch}, Month ${reading.month_stem}${reading.month_branch}, Day ${reading.day_stem}${reading.day_branch}, Hour ${reading.hour_stem}${reading.hour_branch}${advancedSection}`;
}
