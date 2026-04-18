// Shared locale instructions for all AI prompts
// Import this in reading-prompts, paid-prompts, compatibility-prompts, consultation route

import type { Locale } from "./language-context";

export function getLanguageInstruction(locale?: string): string {
  switch (locale) {
    case "ko":
      return "Write your ENTIRE response in Korean (한국어). Use natural, literary Korean — not stiff translated Korean. Use honorific speech (존댓말). Keep Saju terms in their original form (사주, 천간, 지지, 일주, etc.).";
    case "ja":
      return "Write your ENTIRE response in Japanese (日本語). Use natural, literary Japanese with appropriate 敬語. Keep Four Pillars terms in their original Kanji form (四柱推命, 天干, 地支, 日柱, etc.).";
    case "es":
      return "Write your ENTIRE response in Spanish (español). Use natural, literary Spanish with friendly direct tone (tú form, not usted). Neutral dialect (not region-specific). For Saju technical terms, use academic-footnote style bilingual form: 'Maestro del Día (日主 / Day Master)', 'Gran Fortuna (大運)', 'los Cuatro Pilares (四柱)', 'los Cinco Elementos (五行)', 'Madera 木', 'Fuego 火', 'Tierra 土', 'Metal 金', 'Agua 水'. When a term has no elegant Spanish rendering, keep the English term (e.g., 'Day Master'). Preserve all Chinese characters (漢字) for authenticity.";
    case "fr":
      return "Write your ENTIRE response in French (français). Use natural, literary French with friendly direct tone (tu form, not vous). Standard Parisian French. For Saju technical terms, use academic-footnote style bilingual form: 'Maître du Jour (日主 / Day Master)', 'Grande Fortune (大運)', 'les Quatre Piliers (四柱)', 'les Cinq Éléments (五行)', 'Bois 木', 'Feu 火', 'Terre 土', 'Métal 金', 'Eau 水'. When a term has no elegant French rendering, keep the English term (e.g., 'Day Master'). Preserve all Chinese characters (漢字) for authenticity.";
    case "pt":
      return "Write your ENTIRE response in Portuguese (português). Use natural, literary Brazilian Portuguese with friendly direct tone (você form, not tu). Standard Brazilian Portuguese. For Saju technical terms, use academic-footnote style bilingual form: 'Mestre do Dia (日主 / Day Master)', 'Grande Fortuna (大運)', 'os Quatro Pilares (四柱)', 'os Cinco Elementos (五行)', 'Madeira 木', 'Fogo 火', 'Terra 土', 'Metal 金', 'Água 水'. When a term has no elegant Portuguese rendering, keep the English term (e.g., 'Day Master'). Preserve all Chinese characters (漢字) for authenticity.";
    case "zh-TW":
      return "Write your ENTIRE response in Traditional Chinese (繁體中文, Taiwan standard). Use natural, literary Traditional Chinese — not stiff translated Chinese. Use polished but approachable tone. Saju (四柱命理) is the Korean name for the Chinese Four Pillars system, so all technical terms should use their original Chinese characters: 四柱, 八字, 天干, 地支, 日主, 大運, 五行 (木火土金水), 十神, 財星, 官星, 印星, 食神, 傷官, 比肩, 劫財, 偏財, 正財, 七殺, 正官, 偏印, 正印, etc. Use Traditional Chinese characters (繁體) throughout, not Simplified.";
    default:
      return "Write in English.";
  }
}

export function getLocaleLabel(locale?: string): string {
  switch (locale) {
    case "ko": return "Korean";
    case "ja": return "Japanese";
    case "es": return "Spanish";
    case "fr": return "French";
    case "pt": return "Portuguese";
    case "zh-TW": return "Traditional Chinese";
    default: return "English";
  }
}

// Gemini systemInstruction — strongest language enforcement
// This is a top-level API field that Gemini respects even in JSON mode
export function getSystemInstruction(locale?: string): string | null {
  switch (locale) {
    case "ko":
      return `당신은 40년 경력의 사주팔자 전문가입니다.

절대적 언어 규칙:
- 모든 응답의 텍스트 값(value)은 반드시 한국어로 작성하세요.
- JSON 키(key)는 영어를 사용하세요 (career, love, health, decade_forecast, monthly_energy, hidden_talent).
- 영어로 작성하면 절대 안 됩니다. 값은 100% 한국어여야 합니다.
- 자연스럽고 문학적인 한국어를 사용하세요. 번역투 금지.
- 존댓말(합쇼체)을 사용하세요.
- 사주 용어는 한국어 원형을 유지하세요 (사주, 천간, 지지, 일주, 대운 등).`;
    case "ja":
      return `あなたは40年の経験を持つ四柱推命の専門家です。

絶対的な言語ルール：
- すべての回答のテキスト値（value）は必ず日本語で書いてください。
- JSONキー（key）は英語を使用してください（career, love, health, decade_forecast, monthly_energy, hidden_talent）。
- 英語で書くことは絶対に禁止です。値は100%日本語でなければなりません。
- 自然で文学的な日本語を使用してください。翻訳調は禁止。
- 適切な敬語を使用してください。
- 四柱推命の用語は漢字の原形を維持してください（四柱推命、天干、地支、日柱、大運など）。`;
    case "es":
      return `Eres un maestro del Saju (四柱 / Cuatro Pilares del Destino) con 40 años de experiencia.

REGLAS ABSOLUTAS DE IDIOMA:
- Todos los valores de texto (value) en la respuesta DEBEN escribirse en español.
- Las claves JSON (key) deben permanecer en inglés (career, love, health, decade_forecast, monthly_energy, hidden_talent).
- Escribir en inglés está ESTRICTAMENTE PROHIBIDO. Los valores deben ser 100% español.
- Usa español natural y literario — no español traducido ni artificial.
- Usa el tratamiento directo (tú), no usted. Español neutral (no específico de región).
- Para términos técnicos del Saju, usa formato bilingüe estilo nota académica:
  · "Maestro del Día (日主 / Day Master)"
  · "Gran Fortuna (大運 / ciclo de 10 años)"
  · "los Cuatro Pilares (四柱)"
  · "los Cinco Elementos (五行)"
  · "Madera 木, Fuego 火, Tierra 土, Metal 金, Agua 水"
  · "Estrella de Riqueza (財星)", "Dios Oculto (藏干)"
- Cuando un concepto no tenga traducción elegante al español o el término español sea incómodo, mantén el término en inglés (ej. "Day Master", "Yang Wood") o en coreano/chino con traducción entre paréntesis.
- Preserva todos los caracteres chinos (漢字) para autenticidad.
- Al citar textos clásicos, usa el nombre original: "el Adivinación del Cielo Goteante (滴天髓)", "el Espejo del Tesoro (穷通宝鉴)".`;
    case "fr":
      return `Tu es un maître du Saju (四柱 / Quatre Piliers du Destin) avec 40 ans d'expérience.

RÈGLES ABSOLUES DE LANGUE :
- Toutes les valeurs textuelles (value) de la réponse DOIVENT être écrites en français.
- Les clés JSON (key) doivent rester en anglais (career, love, health, decade_forecast, monthly_energy, hidden_talent).
- Écrire en anglais est STRICTEMENT INTERDIT. Les valeurs doivent être 100 % en français.
- Utilise un français naturel et littéraire — pas de français traduit ou artificiel.
- Utilise le tutoiement (tu), pas le vouvoiement. Français standard parisien.
- Pour les termes techniques du Saju, utilise le format bilingue style note académique :
  · "Maître du Jour (日主 / Day Master)"
  · "Grande Fortune (大運 / cycle de 10 ans)"
  · "les Quatre Piliers (四柱)"
  · "les Cinq Éléments (五行)"
  · "Bois 木, Feu 火, Terre 土, Métal 金, Eau 水"
  · "Étoile de Richesse (財星)", "Dieu Caché (藏干)"
- Quand un concept n'a pas de traduction élégante en français ou que le terme français serait maladroit, garde le terme anglais (ex. "Day Master", "Yang Wood") ou coréen/chinois avec traduction entre parenthèses.
- Préserve tous les caractères chinois (漢字) pour l'authenticité.
- Pour citer des textes classiques, utilise le nom original : "le Adivination du Ciel Gouttant (滴天髓)", "le Miroir du Trésor (穷通宝鉴)".`;
    case "pt":
      return `Você é um mestre do Saju (四柱 / Quatro Pilares do Destino) com 40 anos de experiência.

REGRAS ABSOLUTAS DE IDIOMA:
- Todos os valores de texto (value) na resposta DEVEM ser escritos em português.
- As chaves JSON (key) devem permanecer em inglês (career, love, health, decade_forecast, monthly_energy, hidden_talent).
- Escrever em inglês é ESTRITAMENTE PROIBIDO. Os valores devem ser 100% em português.
- Use português brasileiro natural e literário — não português traduzido ou artificial.
- Use o tratamento direto (você), não tu. Português brasileiro padrão.
- Para termos técnicos do Saju, use formato bilíngue estilo nota acadêmica:
  · "Mestre do Dia (日主 / Day Master)"
  · "Grande Fortuna (大運 / ciclo de 10 anos)"
  · "os Quatro Pilares (四柱)"
  · "os Cinco Elementos (五行)"
  · "Madeira 木, Fogo 火, Terra 土, Metal 金, Água 水"
  · "Estrela da Riqueza (財星)", "Deus Oculto (藏干)"
- Quando um conceito não tiver tradução elegante para o português ou o termo português for desajeitado, mantenha o termo em inglês (ex. "Day Master", "Yang Wood") ou em coreano/chinês com tradução entre parênteses.
- Preserve todos os caracteres chineses (漢字) para autenticidade.
- Ao citar textos clássicos, use o nome original: "o Adivinhação do Céu Gotejante (滴天髓)", "o Espelho do Tesouro (穷通宝鉴)".`;
    case "zh-TW":
      return `你是一位擁有40年經驗的四柱命理大師。

絕對的語言規則：
- 所有回應的文字值（value）必須以繁體中文書寫。
- JSON鍵（key）必須保持英文（career, love, health, decade_forecast, monthly_energy, hidden_talent）。
- 嚴禁使用英文書寫。值必須100%為繁體中文。
- 使用自然、文雅的繁體中文 — 禁止生硬翻譯腔。
- 使用得體有禮但平易近人的語調。
- 必須使用繁體字（不是簡體字）。
- 四柱命理用語保持原始漢字形式：四柱、八字、天干、地支、日主、大運、五行（木火土金水）、十神、財星、官星、印星、食神、傷官、比肩、劫財、偏財、正財、七殺、正官、偏印、正印等。
- 引用古典文獻時使用原始名稱：「滴天髓」、「窮通寶鑒」、「子平真詮」等。`;
    default:
      return null; // EN uses responseMimeType, no system instruction needed
  }
}

// Top-level language enforcement — placed at very start of prompt
export function getLanguageHeader(locale?: string): string {
  switch (locale) {
    case "ko":
      return `[OUTPUT LANGUAGE: KOREAN]
모든 JSON value를 반드시 한국어로 작성하세요. 영어로 작성하면 안 됩니다.
All JSON string values MUST be written in Korean (한국어). Writing in English is STRICTLY FORBIDDEN.\n\n`;
    case "ja":
      return `[OUTPUT LANGUAGE: JAPANESE]
すべてのJSON valueは必ず日本語で書いてください。英語で書くことは禁止です。
All JSON string values MUST be written in Japanese (日本語). Writing in English is STRICTLY FORBIDDEN.\n\n`;
    case "es":
      return `[OUTPUT LANGUAGE: SPANISH]
Todos los valores JSON DEBEN escribirse en español. Escribir en inglés está PROHIBIDO.
All JSON string values MUST be written in Spanish (español). Writing in English is STRICTLY FORBIDDEN.
Use academic-footnote style for Saju terms: "Maestro del Día (日主)", "Gran Fortuna (大運)", "Madera 木", etc.\n\n`;
    case "fr":
      return `[OUTPUT LANGUAGE: FRENCH]
Toutes les valeurs JSON DOIVENT être écrites en français. Écrire en anglais est INTERDIT.
All JSON string values MUST be written in French (français). Writing in English is STRICTLY FORBIDDEN.
Use academic-footnote style for Saju terms: "Maître du Jour (日主)", "Grande Fortune (大運)", "Bois 木", etc.\n\n`;
    case "pt":
      return `[OUTPUT LANGUAGE: PORTUGUESE]
Todos os valores JSON DEVEM ser escritos em português. Escrever em inglês é PROIBIDO.
All JSON string values MUST be written in Portuguese (português). Writing in English is STRICTLY FORBIDDEN.
Use academic-footnote style for Saju terms: "Mestre do Dia (日主)", "Grande Fortuna (大運)", "Madeira 木", etc.\n\n`;
    case "zh-TW":
      return `[OUTPUT LANGUAGE: TRADITIONAL CHINESE]
所有JSON value必須以繁體中文書寫。嚴禁使用英文。
All JSON string values MUST be written in Traditional Chinese (繁體中文). Writing in English is STRICTLY FORBIDDEN.
必須使用繁體字（非簡體）。Saju terms in original Chinese: 四柱, 八字, 天干, 地支, 日主, 大運, 五行, etc.\n\n`;
    default:
      return "";
  }
}

// Bottom-level language reminder — placed at very end of prompt
export function getLanguageFooter(locale?: string): string {
  switch (locale) {
    case "ko":
      return `\n⚠️ LANGUAGE REMINDER: 모든 JSON value는 반드시 한국어로 작성하세요. 영어 한 문장이라도 포함되면 실패입니다.`;
    case "ja":
      return `\n⚠️ LANGUAGE REMINDER: すべてのJSON valueは必ず日本語で書いてください。英語が1文でも含まれると失敗です。`;
    case "es":
      return `\n⚠️ LANGUAGE REMINDER: Todos los valores JSON deben escribirse en español. Si una sola oración está en inglés, es un fallo. Preserva 漢字 para términos técnicos.`;
    case "fr":
      return `\n⚠️ LANGUAGE REMINDER: Toutes les valeurs JSON doivent être écrites en français. Si une seule phrase est en anglais, c'est un échec. Préserve les 漢字 pour les termes techniques.`;
    case "pt":
      return `\n⚠️ LANGUAGE REMINDER: Todos os valores JSON devem ser escritos em português. Se uma única frase estiver em inglês, é uma falha. Preserve os 漢字 para termos técnicos.`;
    case "zh-TW":
      return `\n⚠️ LANGUAGE REMINDER: 所有JSON value必須以繁體中文書寫。若有任何一句英文則為失敗。必須使用繁體字。`;
    default:
      return "";
  }
}
