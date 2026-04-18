// components/reading/analysis-methodology.tsx
// Concept 4: Analysis Methodology Strip
// Shows at the bottom of reading — "How this reading was generated"
// 4-step process timeline: Saju calc → Vector embedding → Corpus matching → AI synthesis
// Supports all locales — falls back to EN for translations not yet provided.

'use client';

import React from 'react';
import type { Locale } from '@/lib/translations';

interface AnalysisMethodologyProps {
  dayMaster: string;
  monthBranch: string;
  matchCount: number;
  totalCorpusSize: number;
  locale?: Locale;
}

interface Step {
  title: string;
  description: string;
}

const getSteps = (
  locale: Locale,
  dayMaster: string,
  monthBranch: string,
  matchCount: number,
  totalCorpusSize: number
): Step[] => {
  // en is the guaranteed fallback; additional locales land later.
  const steps: Partial<Record<Locale, Step[]>> & { en: Step[] } = {
    en: [
      {
        title: 'Saju calculation',
        description: `Four Pillars computed from the traditional calendar (Day Master: ${dayMaster}, Month Branch: ${monthBranch})`,
      },
      {
        title: 'Vector embedding',
        description: 'Saju characteristics encoded into 1,536-dimensional vector space',
      },
      {
        title: 'Corpus matching',
        description: `Top ${matchCount} passages extracted by cosine similarity from ${totalCorpusSize} classical passages`,
      },
      {
        title: 'AI synthesis',
        description: 'Classical references combined with saju data to generate a personalized reading',
      },
    ],
    ko: [
      {
        title: '사주 산출',
        description: `만세력 기반 사주팔자 산출 (일간: ${dayMaster}, 월지: ${monthBranch})`,
      },
      {
        title: '벡터 임베딩',
        description: '사주 특성을 1,536차원 벡터 공간으로 변환',
      },
      {
        title: '코퍼스 매칭',
        description: `${totalCorpusSize}개 고전 패시지에서 코사인 유사도 상위 ${matchCount}개 추출`,
      },
      {
        title: 'AI 종합 분석',
        description: '고전 근거와 사주 데이터를 종합하여 개인화된 리딩 생성',
      },
    ],
    ja: [
      {
        title: '四柱算出',
        description: `万年暦に基づく四柱八字算出（日干: ${dayMaster}、月支: ${monthBranch}）`,
      },
      {
        title: 'ベクトル埋め込み',
        description: '四柱特性を1,536次元ベクトル空間に変換',
      },
      {
        title: 'コーパス照合',
        description: `${totalCorpusSize}の古典文献からコサイン類似度上位${matchCount}件を抽出`,
      },
      {
        title: 'AI総合分析',
        description: '古典典拠と四柱データを総合し、個別化された鑑定を生成',
      },
    ],
  };

  return steps[locale] || steps.en;
};

// en is the guaranteed fallback.
const headings: Partial<Record<Locale, string>> & { en: string } = {
  en: 'How this reading was generated',
  ko: '이 리딩의 분석 과정',
  ja: 'この鑑定の分析プロセス',
};

export default function AnalysisMethodology({
  dayMaster,
  monthBranch,
  matchCount,
  totalCorpusSize,
  locale = 'en',
}: AnalysisMethodologyProps) {
  const steps = getSteps(locale, dayMaster, monthBranch, matchCount, totalCorpusSize);
  const heading = headings[locale] || headings.en;

  return (
    <div
      className="mt-8 rounded-lg border p-4 sm:p-5"
      style={{
        borderColor: 'rgba(255, 255, 255, 0.06)',
        background: 'rgba(255, 255, 255, 0.02)',
      }}
    >
      <h4
        className="text-xs font-medium mb-4 tracking-wide"
        style={{ color: 'rgba(255, 255, 255, 0.5)' }}
      >
        {heading}
      </h4>

      <div className="flex gap-3">
        {/* Timeline dots + lines */}
        <div className="flex flex-col items-center pt-1">
          {steps.map((_, idx) => (
            <React.Fragment key={`dot-${idx}`}>
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{
                  border: '2px solid #1D9E75',
                  background:
                    idx === 0
                      ? '#1D9E75'
                      : 'transparent',
                }}
              />
              {idx < steps.length - 1 && (
                <div
                  className="w-px flex-shrink-0"
                  style={{
                    height: '28px',
                    background: 'rgba(29, 158, 117, 0.2)',
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <div className="flex flex-col" style={{ gap: '14px' }}>
          {steps.map((step, idx) => (
            <div key={`step-${idx}`} className="leading-snug">
              <span
                className="text-xs font-medium"
                style={{ color: 'rgba(255, 255, 255, 0.85)' }}
              >
                {step.title}
              </span>
              <span className="text-xs text-gray-600 ml-1.5">
                — {step.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
