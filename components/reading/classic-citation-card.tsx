// components/reading/classic-citation-card.tsx
// Concept 3: Inline Citation Card
// Inserted between reading paragraphs to show classical source references
// Supports EN/KO/JA

'use client';

import React, { useState } from 'react';

interface ClassicCitationCardProps {
  sourceNameKo: string;
  sourceNameCn: string;
  sourceNameEn: string;
  sourceNameJa: string;
  chapter: string;
  chunkTextCn: string;
  interpretationKo?: string;
  interpretationEn?: string;
  interpretationJa?: string;
  similarity: number;
  locale?: 'en' | 'ko' | 'ja';
  /** If true, shows collapsed by default with toggle */
  collapsible?: boolean;
}

const translations = {
  en: {
    badge: 'Classical reference',
    similarity: 'Vector similarity',
    showOriginal: 'Show original text',
    hideOriginal: 'Hide original text',
  },
  ko: {
    badge: '고전 근거',
    similarity: '벡터 유사도',
    showOriginal: '원문 보기',
    hideOriginal: '원문 접기',
  },
  ja: {
    badge: '古典典拠',
    similarity: 'ベクトル類似度',
    showOriginal: '原文を表示',
    hideOriginal: '原文を非表示',
  },
};

export default function ClassicCitationCard({
  sourceNameKo,
  sourceNameCn,
  sourceNameEn,
  sourceNameJa,
  chapter,
  chunkTextCn,
  interpretationKo,
  interpretationEn,
  interpretationJa,
  similarity,
  locale = 'en',
  collapsible = false,
}: ClassicCitationCardProps) {
  const [expanded, setExpanded] = useState(!collapsible);
  const t = translations[locale] || translations.en;

  // Pick display name and interpretation by locale
  const sourceName =
    locale === 'ko'
      ? sourceNameKo
      : locale === 'ja'
        ? sourceNameJa
        : sourceNameEn;

  const sourceNameOriginal =
    locale === 'ko' || locale === 'ja' ? sourceNameCn : '';

  const interpretation =
    locale === 'ko'
      ? interpretationKo
      : locale === 'ja'
        ? interpretationJa
        : interpretationEn;

  const chapterDisplay = chapter || '';

  return (
    <div
      className="my-4 rounded-r-lg overflow-hidden"
      style={{
        borderLeft: '3px solid #1D9E75',
        background: 'rgba(29, 158, 117, 0.03)',
      }}
    >
      <div className="px-4 py-3 sm:px-5 sm:py-4">
        {/* Header: badge + source name */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span
            className="text-[10px] tracking-wider font-medium px-2 py-0.5 rounded-full uppercase"
            style={{
              color: '#1D9E75',
              border: '0.5px solid rgba(29, 158, 117, 0.4)',
            }}
          >
            {t.badge}
          </span>
          <span className="text-xs text-gray-500">
            {sourceName}
            {sourceNameOriginal ? ` (${sourceNameOriginal})` : ''}
            {chapterDisplay ? ` · ${chapterDisplay}` : ''}
          </span>
        </div>

        {/* Collapsible toggle */}
        {collapsible && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs mb-2 transition-colors"
            style={{ color: '#1D9E75' }}
          >
            {expanded ? t.hideOriginal : t.showOriginal}
          </button>
        )}

        {expanded && (
          <>
            {/* Chinese original text */}
            {chunkTextCn && (
              <p
                className="text-sm leading-relaxed mb-2"
                style={{
                  color: 'rgba(255, 255, 255, 0.55)',
                  fontStyle: 'italic',
                }}
              >
                &ldquo;{chunkTextCn.length > 100
                  ? chunkTextCn.slice(0, 100) + '…'
                  : chunkTextCn}&rdquo;
              </p>
            )}

            {/* Interpretation in current locale */}
            {interpretation && (
              <p className="text-sm leading-relaxed text-gray-300">
                {interpretation.length > 200
                  ? interpretation.slice(0, 200) + '…'
                  : interpretation}
              </p>
            )}
          </>
        )}

        {/* Scan line + similarity score */}
        <div className="mt-3">
          <div
            className="h-px mb-2"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(29, 158, 117, 0.5), transparent)',
              animation: 'citationScan 3s ease-in-out infinite',
            }}
          />
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-600">
              {t.similarity}
            </span>
            <span
              className="text-[11px] font-medium"
              style={{ color: '#1D9E75' }}
            >
              {similarity.toFixed(3)}
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes citationScan {
          0% { transform: scaleX(0); transform-origin: left; }
          50% { transform: scaleX(1); transform-origin: left; }
          50.01% { transform: scaleX(1); transform-origin: right; }
          100% { transform: scaleX(0); transform-origin: right; }
        }
      `}</style>
    </div>
  );
}

/**
 * Renders a list of citation cards. Use this when inserting
 * multiple citations between reading sections.
 */
export function CitationCardList({
  citations,
  locale = 'en',
  maxDisplay = 3,
  collapsible = true,
}: {
  citations: Array<{
    sourceNameKo: string;
    sourceNameCn: string;
    sourceNameEn: string;
    sourceNameJa: string;
    chapter: string;
    chunkTextCn: string;
    interpretationKo?: string;
    interpretationEn?: string;
    interpretationJa?: string;
    similarity: number;
  }>;
  locale?: 'en' | 'ko' | 'ja';
  maxDisplay?: number;
  collapsible?: boolean;
}) {
  const displayed = citations.slice(0, maxDisplay);

  return (
    <div className="space-y-3">
      {displayed.map((citation, idx) => (
        <ClassicCitationCard
          key={`citation-${idx}`}
          {...citation}
          locale={locale}
          collapsible={collapsible && idx > 0}
        />
      ))}
    </div>
  );
}
