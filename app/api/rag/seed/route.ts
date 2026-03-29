// app/api/rag/seed/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { embedBatch } from '@/lib/rag/embedding';
import corpusData from '@/lib/rag/corpus-data.json';

export const runtime = 'nodejs';
export const maxDuration = 300;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    if (key !== supabaseServiceKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const startBatch = parseInt(searchParams.get('batch') || '0');
    const chunks = corpusData as any[];
    const BATCH_SIZE = 50;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    let processed = 0;
    let errors = 0;
    const results: string[] = [];
    const totalBatches = Math.ceil(chunks.length / BATCH_SIZE);

    for (let i = startBatch * BATCH_SIZE; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;

      try {
        const texts = batch.map((c: any) =>
          `${c.source_name_cn} ${c.chapter} ${c.chunk_text_cn}`
        );
        const embeddings = await embedBatch(texts);

        const rows = batch.map((chunk: any, idx: number) => ({
          chunk_id: chunk.id,
          source: chunk.source,
          source_name_ko: chunk.source_name_ko,
          source_name_cn: chunk.source_name_cn,
          chapter: chunk.chapter,
          chunk_text_cn: chunk.chunk_text_cn,
          tags: chunk.tags,
          heavenly_stems: chunk.heavenly_stems,
          earthly_branches: chunk.earthly_branches,
          topics: chunk.topics,
          embedding: embeddings[idx],
          char_count: chunk.char_count,
        }));

        const { error: insertError } = await supabase
          .from('sj_corpus_chunks')
          .upsert(rows, { onConflict: 'chunk_id' });

        if (insertError) {
          results.push(`Batch ${batchNum}/${totalBatches}: ERROR - ${insertError.message}`);
          errors += batch.length;
        } else {
          results.push(`Batch ${batchNum}/${totalBatches}: OK (${batch.length} chunks)`);
          processed += batch.length;
        }
      } catch (batchErr: any) {
        results.push(`Batch ${batchNum}/${totalBatches}: ERROR - ${batchErr.message}`);
        errors += batch.length;
        return NextResponse.json({
          success: false,
          processed,
          errors,
          failedAtBatch: batchNum,
          resumeWith: `?key=...&batch=${batchNum - 1}`,
          details: results,
        });
      }

      await new Promise(r => setTimeout(r, 500));
    }

    const { count } = await supabase
      .from('sj_corpus_chunks')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      processed,
      errors,
      totalInDB: count,
      details: results,
    });
  } catch (err: any) {
    console.error('Seed API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { count: totalCount } = await supabase
      .from('sj_corpus_chunks')
      .select('*', { count: 'exact', head: true });

    const { count: embeddedCount } = await supabase
      .from('sj_corpus_chunks')
      .select('*', { count: 'exact', head: true })
      .not('embedding', 'is', null);

    const { data: rows } = await supabase
      .from('sj_corpus_chunks')
      .select('source_name_ko');

    const bySource: Record<string, number> = {};
    rows?.forEach((row: any) => {
      bySource[row.source_name_ko] = (bySource[row.source_name_ko] || 0) + 1;
    });

    return NextResponse.json({
      total: totalCount || 0,
      embedded: embeddedCount || 0,
      bySource,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
