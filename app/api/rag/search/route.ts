// app/api/rag/search/route.ts
// 벡터 검색 테스트 API (개발용)
// POST /api/rag/search — 사주 특성으로 관련 고전 구절 검색

import { NextRequest, NextResponse } from 'next/server';
import { searchCorpus } from '@/lib/rag/vector-search';
import { buildRAGContext } from '@/lib/rag/prompt-injector';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 모드 1: 직접 텍스트 검색
    if (body.query) {
      const results = await searchCorpus(body.query, {
        topK: body.topK || 5,
        filterSource: body.source || null,
        filterStems: body.stems || null,
        minSimilarity: body.minSimilarity || 0.2,
      });

      return NextResponse.json({
        query: body.query,
        results: results.map(r => ({
          source: r.source_name_ko,
          chapter: r.chapter,
          similarity: Math.round(r.similarity * 1000) / 1000,
          text: r.chunk_text_cn.substring(0, 300),
          stems: r.heavenly_stems,
          topics: r.topics,
        })),
        count: results.length,
      });
    }

    // 모드 2: 사주 데이터로 RAG 컨텍스트 생성
    if (body.sajuData) {
      const context = await buildRAGContext(
        body.sajuData,
        body.serviceType || 'paid',
        body.locale || 'ko'
      );

      return NextResponse.json({
        citations: context.citations,
        searchMeta: context.searchMeta,
        contextPreview: context.contextText.substring(0, 500),
        contextLength: context.contextText.length,
      });
    }

    return NextResponse.json(
      { error: 'Provide "query" for text search or "sajuData" for saju-based search' },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('Search API error:', err);
    return NextResponse.json(
      { error: err.message || 'Search failed' },
      { status: 500 }
    );
  }
}
