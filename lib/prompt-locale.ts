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
    default:
      return "Write in English.";
  }
}

export function getLocaleLabel(locale?: string): string {
  switch (locale) {
    case "ko": return "Korean";
    case "ja": return "Japanese";
    case "es": return "Spanish";
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
    default:
      return "";
  }
}
