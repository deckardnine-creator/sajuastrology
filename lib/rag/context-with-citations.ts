// lib/rag/context-with-citations.ts
// Unified RAG context provider
// Returns both: (1) prompt context for AI, (2) citation metadata for frontend UI
// Drop-in replacement for the existing RAG flow in API routes

import { buildSajuQueries } from './saju-query-builder';
import { getEmbedding } from './embedding';
import { searchCorpusChunks } from './vector-search';
import { injectCorpusContext } from './prompt-injector';
import { extractCitationMeta, type CorpusAnalysisMeta } from './citation-extractor';

export interface RAGResult {
  /** Enhanced prompt with classical context injected */
  enhancedPrompt: string;
  /** Structured citation metadata for frontend components */
  citationMeta: CorpusAnalysisMeta | null;
  /** Whether RAG was successfully applied */
  ragApplied: boolean;
}

interface SajuProfile {
  dayMaster: string;       // e.g. '庚'
  monthBranch: string;     // e.g. '申'
  yearStem?: string;
  yearBranch?: string;
  dayStem?: string;
  dayBranch?: string;
  monthStem?: string;
  hourStem?: string;
  hourBranch?: string;
  mainElement?: string;
  yongSin?: string;        // 용신 (useful god)
  geGuk?: string;          // 격국 (framework)
}

interface RAGOptions {
  /** Number of top results to retrieve */
  topK?: number;
  /** Filter by specific sources */
  filterSources?: string[];
  /** The original prompt to enhance */
  basePrompt: string;
  /** Saju characteristics for query building */
  sajuProfile: SajuProfile;
  /** Service type determines search intensity */
  serviceType: 'free' | 'paid' | 'compatibility' | 'consultation';
}

// Default configurations per service type
const SERVICE_CONFIG: Record<string, { topK: number; sources: string[] }> = {
  free: {
    topK: 2,
    sources: ['dripping_heaven'],
  },
  paid: {
    topK: 5,
    sources: ['dripping_heaven', 'penetrating_treasure', 'true_interpretation', 'geju_lunming'],
  },
  compatibility: {
    topK: 3,
    sources: ['dripping_heaven', 'ocean_ziping'],
  },
  consultation: {
    topK: 3,
    sources: ['dripping_heaven', 'penetrating_treasure', 'true_interpretation'],
  },
};

/**
 * Get RAG-enhanced prompt + citation metadata in one call.
 * 
 * Usage in API route (add ~5 lines):
 * ```
 * import { getRAGContext } from '@/lib/rag/context-with-citations';
 * 
 * const ragResult = await getRAGContext({
 *   basePrompt: existingPrompt,
 *   sajuProfile: { dayMaster, monthBranch, ... },
 *   serviceType: 'free',
 * });
 * 
 * // Use ragResult.enhancedPrompt for AI call
 * // Include ragResult.citationMeta in API response JSON
 * ```
 */
export async function getRAGContext(options: RAGOptions): Promise<RAGResult> {
  const {
    basePrompt,
    sajuProfile,
    serviceType,
    topK: customTopK,
    filterSources: customSources,
  } = options;

  const config = SERVICE_CONFIG[serviceType] || SERVICE_CONFIG.free;
  const topK = customTopK ?? config.topK;
  const filterSources = customSources ?? config.sources;

  try {
    // Step 1: Build search queries from saju profile
    const queries = buildSajuQueries({
      dayMaster: sajuProfile.dayMaster,
      monthBranch: sajuProfile.monthBranch,
      yearStem: sajuProfile.yearStem,
      monthStem: sajuProfile.monthStem,
      yongSin: sajuProfile.yongSin,
      geGuk: sajuProfile.geGuk,
    });

    // Step 2: Get embeddings for queries
    const embeddings = await Promise.all(
      queries.map((q: string) => getEmbedding(q))
    );

    // Step 3: Search corpus for each query, merge and deduplicate
    const allResults: Array<any> = [];
    const seenChunks = new Set<string>();

    for (const embedding of embeddings) {
      const results = await searchCorpusChunks({
        queryEmbedding: embedding,
        matchCount: topK,
        filterSource: filterSources.length === 1 ? filterSources[0] : undefined,
      });

      for (const result of results) {
        if (!seenChunks.has(result.chunk_id)) {
          seenChunks.add(result.chunk_id);
          allResults.push(result);
        }
      }
    }

    // Sort by similarity, take top K
    allResults.sort((a, b) => b.similarity - a.similarity);
    const topResults = allResults.slice(0, topK);

    if (topResults.length === 0) {
      return {
        enhancedPrompt: basePrompt,
        citationMeta: null,
        ragApplied: false,
      };
    }

    // Step 4: Inject into prompt
    const enhancedPrompt = injectCorpusContext(basePrompt, topResults);

    // Step 5: Extract citation metadata for frontend
    const citationMeta = extractCitationMeta(
      topResults,
      sajuProfile.dayMaster,
      sajuProfile.monthBranch
    );

    return {
      enhancedPrompt,
      citationMeta,
      ragApplied: true,
    };
  } catch (error) {
    // Fallback: return original prompt if RAG fails
    console.error('[RAG] Context retrieval failed, using fallback:', error);
    return {
      enhancedPrompt: basePrompt,
      citationMeta: null,
      ragApplied: false,
    };
  }
}
