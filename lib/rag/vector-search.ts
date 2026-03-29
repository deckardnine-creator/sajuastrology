// lib/rag/vector-search.ts
// Supabase pgvector ?†ÏÇ¨??Í≤Ä??
import { createClient } from '@supabase/supabase-js';
import { embedText } from './embedding';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
 * ?¨Ï£º ?πÏÑ± Í∏∞Î∞ò ÏΩîÌçº??Î≤°ÌÑ∞ Í≤Ä?? */
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
    // 1. Í≤Ä??ÏøºÎ¶¨Î•?Î≤°ÌÑ∞Î°?Î≥Ä??    const queryEmbedding = await embedText(queryText);

    // 2. Supabase RPCÎ°??†ÏÇ¨??Í≤Ä??    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
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

    // 3. ÏµúÏÜå ?†ÏÇ¨???ÑÌÑ∞Îß?    const filtered = (data as CorpusChunk[]).filter(
      (chunk) => chunk.similarity >= minSimilarity
    );

    return filtered;
  } catch (err) {
    console.error('searchCorpus failed:', err);
    return []; // RAG ?§Ìå® ??Îπ?Î∞∞Ïó¥ ??Í∏∞Ï°¥ Î¶¨Îî© ?ïÏÉÅ ?ëÎèô
  }
}

/**
 * ?åÏä§Î≥?Í≤Ä??(?πÏ†ï ?êÏ†Ñ?êÏÑúÎß?Í≤Ä??
 */
export async function searchFromSource(
  queryText: string,
  source: 'dripping_heaven' | 'penetrating_treasure' | 'true_interpretation' | 'ocean_ziping' | 'geju_lunming',
  topK: number = 3
): Promise<CorpusChunk[]> {
  return searchCorpus(queryText, { topK, filterSource: source });
}

/**
 * Ï≤úÍ∞Ñ Í∏∞Î∞ò Í≤Ä??(?πÏ†ï Ï≤úÍ∞Ñ Í¥Ä??Ï≤?Å¨Îß?
 */
export async function searchByStem(
  queryText: string,
  stems: string[],
  topK: number = 5
): Promise<CorpusChunk[]> {
  return searchCorpus(queryText, { topK, filterStems: stems });
}
