// lib/rag/prompt-injector.ts
// RAG 검색 결과를 기존 프롬프트에 동적 주입

import { searchCorpus } from './vector-search';
import { 
  buildSearchQueries, 
  buildQiongTongQuery, 
  buildDiTiStemQuery,
  getSearchConfig 
} from './saju-query-builder';

interface SajuData {
  yearStem?: string;
  yearBranch?: string;
  monthStem?: string;
  monthBranch?: string;
  dayStem?: string;
  dayBranch?: string;
  hourStem?: string;
  hourBranch?: string;
  dominantElement?: string;
  weakElement?: string;
  geGuk?: string;
  yongShin?: string;
  dayMasterStrength?: string;
  specialPatterns?: string[];
}

interface RAGContext {
  contextText: string;        // 프롬프트에 주입할 텍스트
  citations: Citation[];      // UI에 표시할 인용 정보
  searchMeta: {               // 디버그/로깅용
    queriesUsed: string[];
    chunksFound: number;
    avgSimilarity: number;
  };
}

interface Citation {
  source_name_ko: string;
  source_name_cn: string;
  chapter: string;
  excerpt: string;           // 핵심 구절 (200자 이내)
  similarity: number;
}

/**
 * 사주 데이터 → RAG 컨텍스트 생성 (메인 함수)
 * 실패 시 빈 컨텍스트 반환 → 기존 리딩 정상 작동
 */
export async function buildRAGContext(
  sajuData: SajuData,
  serviceType: 'free' | 'paid' | 'compatibility' | 'consultation' = 'paid',
  locale: 'ko' | 'en' | 'ja' | 'es' | 'fr' | 'pt' | 'zh-TW' | 'ru' | 'hi' = 'ko'
): Promise<RAGContext> {
  const emptyContext: RAGContext = {
    contextText: '',
    citations: [],
    searchMeta: { queriesUsed: [], chunksFound: 0, avgSimilarity: 0 },
  };

  try {
    const config = getSearchConfig(serviceType);
    const queries = buildSearchQueries(sajuData);
    const allChunks: any[] = [];
    const queriesUsed: string[] = [];

    // 1차: 일주+월령 기반 검색 (궁통보감 스타일)
    if (sajuData.dayStem && sajuData.monthBranch) {
      const qiongQuery = buildQiongTongQuery(sajuData.dayStem, sajuData.monthBranch);
      const qiongResults = await searchCorpus(qiongQuery, {
        topK: Math.min(2, config.topK),
        filterSource: 'penetrating_treasure',
        minSimilarity: 0.25,
      });
      allChunks.push(...qiongResults);
      queriesUsed.push(qiongQuery);
    }

    // 2차: 적천수 천간론 검색
    if (sajuData.dayStem) {
      const ditiQuery = buildDiTiStemQuery(sajuData.dayStem);
      const ditiResults = await searchCorpus(ditiQuery, {
        topK: Math.min(2, config.topK),
        filterSource: 'dripping_heaven',
        minSimilarity: 0.25,
      });
      allChunks.push(...ditiResults);
      queriesUsed.push(ditiQuery);
    }

    // 3차: 격국/용신 기반 검색 (유료만)
    if (serviceType !== 'free' && queries.secondary) {
      const secResults = await searchCorpus(queries.secondary, {
        topK: 2,
        minSimilarity: 0.25,
      });
      allChunks.push(...secResults);
      queriesUsed.push(queries.secondary);
    }

    // 4차: 특수 패턴 검색 (유료만)
    if (serviceType === 'paid' && queries.tertiary) {
      const terResults = await searchCorpus(queries.tertiary, {
        topK: 1,
        minSimilarity: 0.3,
      });
      allChunks.push(...terResults);
      queriesUsed.push(queries.tertiary);
    }

    if (allChunks.length === 0) {
      return emptyContext;
    }

    // 중복 제거 (chunk_id 기준)
    const seen = new Set<string>();
    const uniqueChunks = allChunks.filter(c => {
      if (seen.has(c.chunk_id)) return false;
      seen.add(c.chunk_id);
      return true;
    });

    // 유사도 순 정렬 후 topK만
    uniqueChunks.sort((a, b) => b.similarity - a.similarity);
    const finalChunks = uniqueChunks.slice(0, config.topK);

    // 인용 정보 생성
    const citations: Citation[] = finalChunks.map(c => ({
      source_name_ko: c.source_name_ko,
      source_name_cn: c.source_name_cn,
      chapter: c.chapter,
      excerpt: c.chunk_text_cn.substring(0, 200),
      similarity: c.similarity,
    }));

    // 프롬프트 주입 텍스트 생성
    const contextText = formatContextForPrompt(finalChunks, locale);

    const avgSimilarity = finalChunks.reduce((sum, c) => sum + c.similarity, 0) / finalChunks.length;

    return {
      contextText,
      citations,
      searchMeta: {
        queriesUsed,
        chunksFound: finalChunks.length,
        avgSimilarity: Math.round(avgSimilarity * 1000) / 1000,
      },
    };
  } catch (err) {
    console.error('buildRAGContext failed (falling back to no-RAG):', err);
    return emptyContext;
  }
}

/**
 * RAG 결과를 프롬프트에 주입할 텍스트로 포맷팅
 */
function formatContextForPrompt(
  chunks: any[],
  locale: 'ko' | 'en' | 'ja' | 'es' | 'fr' | 'pt' | 'zh-TW' | 'ru' | 'hi'
): string {
  if (chunks.length === 0) return '';

  const header = locale === 'ko'
    ? `[고전 사주 이론 참고자료 - 아래 고전 원전의 내용을 리딩에 자연스럽게 반영하세요]`
    : locale === 'en'
    ? `[Classical Four Pillars Theory Reference - Naturally incorporate these classical texts into your reading]`
    : locale === 'es'
    ? `[Referencia de Teoría Clásica de los Cuatro Pilares — Incorpora de forma natural estos textos clásicos en tu lectura]`
    : locale === 'fr'
    ? `[Référence de théorie classique des Quatre Piliers — Intègre naturellement ces textes classiques dans ta lecture]`
    : locale === 'pt'
    ? `[Referência de Teoria Clássica dos Quatro Pilares — Incorpore naturalmente estes textos clássicos na sua leitura]`
    : locale === 'zh-TW'
    ? `[古典四柱理論參考資料 — 請將以下古典原典的內容自然地融入解讀中]`
    : locale === 'ru'
    ? `[Справочник классической теории Четырёх Столпов — естественно интегрируй эти классические тексты в своё чтение]`
    : locale === 'hi'
    ? `[शास्त्रीय चार स्तंभ सिद्धांत संदर्भ — इन शास्त्रीय ग्रंथों को अपनी रीडिंग में स्वाभाविक रूप से शामिल करो]`
    : `[古典四柱理論参考資料 - 以下の古典原典の内容をリーディングに自然に反映してください]`;

  const instruction = locale === 'ko'
    ? `각 고전 구절을 리딩 안에서 자연스럽게 인용하세요. 예시: "적천수(滴天髓)에 이르기를..." 또는 "궁통보감(穷通宝鉴)에서는..." 형식으로 원전명을 밝혀주세요. 원문 한자를 일부 포함하면 신뢰도가 높아집니다.`
    : locale === 'en'
    ? `Naturally cite each classical passage in your reading. Example: "According to the Dripping Heaven Marrow (滴天髓)..." or "The Treasure Mirror (穷通宝鉴) states..." Include the original Chinese name for authenticity.`
    : locale === 'es'
    ? `Cita naturalmente cada pasaje clásico en tu lectura. Ejemplo: "Según el Adivinación del Cielo Goteante (滴天髓)..." o "El Espejo del Tesoro (穷通宝鉴) dice...". Incluye el nombre original en chino (漢字) para mayor autenticidad. Cuando el término sea técnico o específico del Saju, mantén el término coreano o chino original con una breve explicación en español entre paréntesis.`
    : locale === 'fr'
    ? `Cite naturellement chaque passage classique dans ta lecture. Exemple : "Selon le Adivination du Ciel Gouttant (滴天髓)..." ou "Le Miroir du Trésor (穷通宝鉴) dit...". Inclus le nom original en chinois (漢字) pour plus d'authenticité. Quand un terme est technique ou spécifique au Saju, garde le terme coréen ou chinois original avec une brève explication en français entre parenthèses.`
    : locale === 'pt'
    ? `Cite naturalmente cada passagem clássica na sua leitura. Exemplo: "Segundo o Adivinhação do Céu Gotejante (滴天髓)..." ou "O Espelho do Tesouro (穷通宝鉴) diz...". Inclua o nome original em chinês (漢字) para maior autenticidade. Quando o termo for técnico ou específico do Saju, mantenha o termo coreano ou chinês original com uma breve explicação em português entre parênteses.`
    : locale === 'zh-TW'
    ? `請在解讀中自然地引用每段古典文獻。例如：「滴天髓有云：...」或「窮通寶鑒云：...」。直接使用古典原書名稱（如滴天髓、窮通寶鑒、子平真詮）。必須使用繁體中文書寫，不可使用簡體字。`
    : locale === 'ru'
    ? `Естественно цитируй каждый классический отрывок в своём чтении. Пример: "Согласно Капле Небесного Костного Мозга (滴天髓)..." или "Зеркало Сокровищ (穷通宝鉴) гласит...". Включай оригинальное китайское название (漢字) для аутентичности. Когда термин технический или специфичный для Саджу, сохраняй корейский или китайский оригинальный термин с кратким объяснением на русском в скобках.`
    : locale === 'hi'
    ? `अपनी रीडिंग में हर शास्त्रीय अंश को स्वाभाविक रूप से उद्धृत करो। उदाहरण: "स्वर्गीय अस्थि-मज्जा बिन्दु (滴天髓) के अनुसार..." या "खजाने का दर्पण (穷通宝鉴) कहता है...". प्रामाणिकता के लिए मूल चीनी नाम (漢字) शामिल करो। जब शब्द तकनीकी या सजू-विशिष्ट हो, मूल कोरियाई या चीनी शब्द को कोष्ठक में संक्षिप्त हिन्दी व्याख्या के साथ रखो।`
    : `各古典の一節をリーディングの中で自然に引用してください。例：「滴天髓によれば…」「穷通宝鉴では…」のように原典名を明記してください。`;

  const chunkTexts = chunks.map((c, i) => {
    const sourceLine = `[${c.source_name_ko} (${c.source_name_cn}) - ${c.chapter}]`;
    const text = c.chunk_text_cn.substring(0, 500); // 프롬프트 토큰 절약
    return `\n--- 참고 ${i + 1}: ${sourceLine} ---\n${text}`;
  }).join('\n');

  return `${header}\n${instruction}\n${chunkTexts}\n--- 참고자료 끝 ---\n\n`;
}

/**
 * 기존 프롬프트에 RAG 컨텍스트를 주입하는 래퍼
 * 기존 코드에서 이 함수만 호출하면 됨
 */
export async function injectRAGIntoPrompt(
  basePrompt: string,
  sajuData: SajuData,
  serviceType: 'free' | 'paid' | 'compatibility' | 'consultation' = 'paid',
  locale: 'ko' | 'en' | 'ja' | 'es' | 'fr' | 'pt' | 'zh-TW' | 'ru' | 'hi' = 'ko'
): Promise<{ prompt: string; citations: Citation[] }> {
  const ragContext = await buildRAGContext(sajuData, serviceType, locale);

  if (!ragContext.contextText) {
    // RAG 실패 또는 결과 없음 → 기존 프롬프트 그대로
    return { prompt: basePrompt, citations: [] };
  }

  // RAG 컨텍스트를 프롬프트 앞에 추가
  const enhancedPrompt = `${ragContext.contextText}${basePrompt}`;
  
  return {
    prompt: enhancedPrompt,
    citations: ragContext.citations,
  };
}
