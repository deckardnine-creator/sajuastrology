// components/reading/corpus-analysis-banner.tsx
// Concept 1: Analysis Pipeline Banner
// Shows at the top of reading results — "562 passages analyzed, similarity 0.72"
// Supports EN/KO/JA

'use client';

import React from 'react';

interface CorpusAnalysisBannerProps {
  totalCorpusSize: number;
  matchCount: number;
  topSimilarity: number;
  sourceCount: number;
  queryDimensions: number;
  locale?: 'en' | 'ko' | 'ja';
}

const translations = {
  en: {
    analyzed: (n: number) => `Matched your saju against ${n} classical passages with the highest vector similarity`,
    matches: (n: number) => `${n} matches`,
    passages: 'classical passages',
    sources: 'source texts',
    similarity: 'top similarity',
    dimensions: 'd vector space',
  },
  ko: {
    analyzed: (n: number) => `${n}개 고전 패시지에서 당신의 사주와 가장 높은 유사도를 가진 구절을 매칭했습니다`,
    matches: (n: number) => `${n}개 매칭`,
    passages: '고전 패시지',
    sources: '원전 분석',
    similarity: '최고 유사도',
    dimensions: '차원 벡터',
  },
  ja: {
    analyzed: (n: number) => `${n}の古典文献からあなたの四柱と最も高い類似度を持つ節を照合しました`,
    matches: (n: number) => `${n}件照合`,
    passages: '古典パッセージ',
    sources: '原典分析',
    similarity: '最高類似度',
    dimensions: '次元ベクトル',
  },
};

export default function CorpusAnalysisBanner({
  totalCorpusSize,
  matchCount,
  topSimilarity,
  sourceCount,
  queryDimensions,
  locale = 'en',
}: CorpusAnalysisBannerProps) {
  const t = translations[locale] || translations.en;

  return (
    <div className="w-full mb-6">
      {/* Main pipeline bar */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-lg border"
        style={{
          background: 'rgba(29, 158, 117, 0.04)',
          borderColor: 'rgba(29, 158, 117, 0.15)',
        }}
      >
        {/* Pulse dot */}
        <span
          className="inline-block w-2 h-2 rounded-full flex-shrink-0"
          style={{
            backgroundColor: '#1D9E75',
            animation: 'corpusPulse 2s infinite',
          }}
        />

        <span className="text-xs sm:text-sm text-gray-400 flex-1 leading-snug">
          {t.analyzed(totalCorpusSize)}
        </span>

        <span
          className="text-xs font-medium flex-shrink-0 px-2 py-0.5 rounded"
          style={{
            color: '#1D9E75',
            background: 'rgba(29, 158, 117, 0.1)',
          }}
        >
          {t.matches(matchCount)}
        </span>
      </div>

      {/* Stat badges */}
      <div className="flex flex-wrap gap-2 mt-3">
        <StatBadge value={totalCorpusSize} label={t.passages} />
        <StatBadge value={sourceCount} label={t.sources} />
        <StatBadge
          value={topSimilarity.toFixed(2)}
          label={t.similarity}
          highlight
        />
        <StatBadge value={queryDimensions} label={t.dimensions} />
      </div>

      <style jsx>{`
        @keyframes corpusPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

function StatBadge({
  value,
  label,
  highlight = false,
}: {
  value: string | number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border"
      style={{
        borderColor: highlight
          ? 'rgba(29, 158, 117, 0.2)'
          : 'rgba(255, 255, 255, 0.08)',
        background: highlight
          ? 'rgba(29, 158, 117, 0.06)'
          : 'rgba(255, 255, 255, 0.03)',
      }}
    >
      <span
        className="font-medium"
        style={{ color: highlight ? '#1D9E75' : '#e2e0d9' }}
      >
        {value}
      </span>
      <span className="text-gray-500">{label}</span>
    </span>
  );
}
