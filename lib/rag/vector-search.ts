// lib/rag/vector-search.ts
// Supabase pgvector 유사도 검색

import { createClient } from '@supabase/supabase-js';
import { embedText } from './embedding';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

interface CorpusChunk {
  id: string;
  chunk_id: string;
  source: string;
  source_name_ko: string;
  source_name_cn: string;
  chapter: string;
  chunk_text_cn: string;
  chunk_text_ko: string | null;
  chunk_text_en: string | null;
  tags: string[];
  heavenly_stems: string[];
  earthly_branches: string[];
  topics: string[];
  similarity: number;
}

interface SearchOptions {
  topK?: number;
  filterSource?: string;
  filterStems?: string[];
  filterTopics?: string[];
  minSimilarity?: number;
}

/**
 * 사주 특성 기반 코퍼스 벡터 검색
 */
export async function searchCorpus(
  queryText: string,
  options: SearchOptions = {}
): Promise<CorpusChunk[]> {
  const {
    topK = 5,
    filterSource = null,
    filterStems = null,
    filterTopics = null,
    minSimilarity = 0.3,
  } = options;

  try {
    // 1. 검색 쿼리를 벡터로 변환
    const queryEmbedding = await embedText(queryText);

    // 2. Supabase RPC로 유사도 검색
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase.rpc('match_corpus_chunks', {
      query_embedding: queryEmbedding,
      match_count: topK,
      filter_source: filterSource,
      filter_stems: filterStems,
      filter_topics: filterTopics,
    });

    if (error) {
      console.error('Vector search error:', error);
      return [];
    }

    // 3. 최소 유사도 필터링
    const filtered = (data as CorpusChunk[]).filter(
      (chunk) => chunk.similarity >= minSimilarity
    );

    return filtered;
  } catch (err) {
    console.error('searchCorpus failed:', err);
    return []; // RAG 실패 시 빈 배열 → 기존 리딩 정상 작동
  }
}

/**
 * 소스별 검색 (특정 원전에서만 검색)
 */
export async function searchFromSource(
  queryText: string,
  source: 'dripping_heaven' | 'penetrating_treasure' | 'true_interpretation' | 'ocean_ziping' | 'geju_lunming',
  topK: number = 3
): Promise<CorpusChunk[]> {
  return searchCorpus(queryText, { topK, filterSource: source });
}

/**
 * 천간 기반 검색 (특정 천간 관련 청크만)
 */
export async function searchByStem(
  queryText: string,
  stems: string[],
  topK: number = 5
): Promise<CorpusChunk[]> {
  return searchCorpus(queryText, { topK, filterStems: stems });
}
