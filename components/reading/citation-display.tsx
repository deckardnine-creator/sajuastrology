// components/reading/citation-display.tsx
// Wrapper that renders all 3 citation UI components (Banner + Cards + Methodology)
// Import just this ONE component in client.tsx to get all citation UI

'use client';

import React from 'react';
import CorpusAnalysisBanner from './corpus-analysis-banner';
import ClassicCitationCard, { CitationCardList } from './classic-citation-card';
import AnalysisMethodology from './analysis-methodology';

// Source name mapping (same as citation-extractor.ts)
const SOURCE_NAMES: Record<string, { ko: string; cn: string; en: string; ja: string }> = {
  dripping_heaven: { ko: '적천수', cn: '滴天髓', en: 'Dripping Heaven Marrow', ja: '滴天髄' },
  penetrating_treasure: { ko: '궁통보감', cn: '穷通宝鉴', en: 'Penetrating the Treasure Mirror', ja: '窮通宝鑑' },
  true_interpretation: { ko: '자평진전', cn: '子平真诠', en: 'True Interpretation of Ziping', ja: '子平真詮' },
  ocean_ziping: { ko: '연해자평', cn: '渊海子平', en: 'Ocean of Ziping', ja: '淵海子平' },
  geju_lunming: { ko: '격국론명 (자평정종)', cn: '格局论命 (子平正宗)', en: 'Framework Analysis (Orthodox Ziping)', ja: '格局論命 (子平正宗)' },
};

export interface CitationMeta {
  totalCorpusSize: number;
  sourceCount: number;
  matchCount: number;
  topSimilarity: number;
  queryDimensions: number;
  dayMaster: string;
  monthBranch: string;
  citations: Array<{
    source: string;
    source_name_ko: string;
    source_name_cn: string;
    chapter: string;
    excerpt: string;
    similarity: number;
  }>;
}

/**
 * Concept 1: Banner — place after Four Pillars, before Personality
 */
export function CitationBanner({
  citationMeta,
  locale = 'en',
}: {
  citationMeta: CitationMeta | null;
  locale?: string;
}) {
  if (!citationMeta || citationMeta.matchCount === 0) return null;

  return (
    <CorpusAnalysisBanner
      totalCorpusSize={citationMeta.totalCorpusSize}
      matchCount={citationMeta.matchCount}
      topSimilarity={citationMeta.topSimilarity}
      sourceCount={citationMeta.sourceCount}
      queryDimensions={citationMeta.queryDimensions}
      locale={locale as 'en' | 'ko' | 'ja'}
    />
  );
}

/**
 * Concept 3: Citation Cards — place after Personality, before Five Elements
 */
export function CitationCards({
  citationMeta,
  locale = 'en',
}: {
  citationMeta: CitationMeta | null;
  locale?: string;
}) {
  if (!citationMeta || !citationMeta.citations || citationMeta.citations.length === 0) return null;

  const enrichedCitations = citationMeta.citations.map((c) => {
    const names = SOURCE_NAMES[c.source] || {
      ko: c.source_name_ko || c.source,
      cn: c.source_name_cn || c.source,
      en: c.source,
      ja: c.source,
    };
    return {
      sourceNameKo: names.ko,
      sourceNameCn: names.cn,
      sourceNameEn: names.en,
      sourceNameJa: names.ja,
      chapter: c.chapter || '',
      chunkTextCn: c.excerpt || '',
      similarity: c.similarity,
    };
  });

  return (
    <div className="mb-10">
      <CitationCardList
        citations={enrichedCitations}
        locale={locale as 'en' | 'ko' | 'ja'}
        maxDisplay={citationMeta.matchCount}
        collapsible={true}
      />
    </div>
  );
}

/**
 * Concept 4: Methodology — place after Harmony Score, before Compatibility CTA
 */
export function CitationMethodology({
  citationMeta,
  locale = 'en',
}: {
  citationMeta: CitationMeta | null;
  locale?: string;
}) {
  if (!citationMeta) return null;

  return (
    <AnalysisMethodology
      dayMaster={citationMeta.dayMaster}
      monthBranch={citationMeta.monthBranch}
      matchCount={citationMeta.matchCount}
      totalCorpusSize={citationMeta.totalCorpusSize}
      locale={locale as 'en' | 'ko' | 'ja'}
    />
  );
}
