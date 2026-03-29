// lib/rag/citation-extractor.ts
// Extracts structured citation metadata from RAG vector search results
// for frontend UI components (banner, citation cards, methodology strip)

export interface CitationData {
  source: string;
  sourceNameKo: string;
  sourceNameCn: string;
  sourceNameEn: string;
  sourceNameJa: string;
  chapter: string;
  chunkTextCn: string;
  interpretationKo: string;
  interpretationEn: string;
  interpretationJa: string;
  similarity: number;
  tags: string[];
  heavenlyStems: string[];
  topics: string[];
}

export interface CorpusAnalysisMeta {
  totalCorpusSize: number;
  sourceCount: number;
  citations: CitationData[];
  topSimilarity: number;
  matchCount: number;
  queryDimensions: number;
  dayMaster: string;
  monthBranch: string;
}

// Source name mappings for all 4 languages
const SOURCE_NAMES: Record<string, { ko: string; cn: string; en: string; ja: string }> = {
  dripping_heaven: {
    ko: '적천수',
    cn: '滴天髓',
    en: 'Dripping Heaven Marrow',
    ja: '滴天髄',
  },
  penetrating_treasure: {
    ko: '궁통보감',
    cn: '穷通宝鉴',
    en: 'Penetrating the Treasure Mirror',
    ja: '窮通宝鑑',
  },
  true_interpretation: {
    ko: '자평진전',
    cn: '子平真诠',
    en: 'True Interpretation of Ziping',
    ja: '子平真詮',
  },
  ocean_ziping: {
    ko: '연해자평',
    cn: '渊海子平',
    en: 'Ocean of Ziping',
    ja: '淵海子平',
  },
  geju_lunming: {
    ko: '격국론명 (자평정종)',
    cn: '格局论命 (子平正宗)',
    en: 'Framework Analysis (Orthodox Ziping)',
    ja: '格局論命 (子平正宗)',
  },
};

/**
 * Extract structured citation data from RAG search results.
 * Call this AFTER vector search, BEFORE prompt injection.
 * The returned metadata goes into the API response for frontend rendering.
 */
export function extractCitationMeta(
  searchResults: Array<{
    source: string;
    source_name_ko?: string;
    source_name_cn?: string;
    chapter?: string;
    chunk_text_cn?: string;
    chunk_text_ko?: string;
    chunk_text_en?: string;
    tags?: string[];
    heavenly_stems?: string[];
    topics?: string[];
    similarity: number;
  }>,
  dayMaster: string,
  monthBranch: string
): CorpusAnalysisMeta {
  const citations: CitationData[] = searchResults.map((result) => {
    const names = SOURCE_NAMES[result.source] || {
      ko: result.source_name_ko || result.source,
      cn: result.source_name_cn || result.source,
      en: result.source,
      ja: result.source,
    };

    return {
      source: result.source,
      sourceNameKo: names.ko,
      sourceNameCn: names.cn,
      sourceNameEn: names.en,
      sourceNameJa: names.ja,
      chapter: result.chapter || '',
      chunkTextCn: result.chunk_text_cn || '',
      interpretationKo: result.chunk_text_ko || '',
      interpretationEn: result.chunk_text_en || '',
      interpretationJa: '',
      similarity: Math.round(result.similarity * 1000) / 1000,
      tags: result.tags || [],
      heavenlyStems: result.heavenly_stems || [],
      topics: result.topics || [],
    };
  });

  const uniqueSources = new Set(searchResults.map((r) => r.source));

  return {
    totalCorpusSize: 562,
    sourceCount: uniqueSources.size,
    citations,
    topSimilarity: citations.length > 0
      ? Math.max(...citations.map((c) => c.similarity))
      : 0,
    matchCount: citations.length,
    queryDimensions: 1536,
    dayMaster,
    monthBranch,
  };
}
