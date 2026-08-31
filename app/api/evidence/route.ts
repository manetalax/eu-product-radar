import { NextResponse } from 'next/server';
import { analyze, type Product } from '@/lib/analysis';
import { isValidEvidenceUrl, safeEvidenceUrl } from '@/lib/evidence';
import { evidenceApiText } from '@/lib/evidence-api-i18n';
import { marketCodeOrEu, type MarketCode } from '@/lib/markets';
import { createClient } from '@/lib/supabase/server';
import { PRIVATE_HEADERS, readJsonBody, sameOrigin } from '@/lib/http';
import { requestLanguage } from '@/lib/request-language';
import type { Language } from '@/lib/landing-i18n';

export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: PRIVATE_HEADERS });
const uuid = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const allowed = new Set(['available', 'pending', 'not_applicable']);

function regulatoryEvidenceKeys(product: Product, marketCode: MarketCode): Set<string> {
  const result = analyze([product], marketCode)[0];
  const keys = result?.regulatory?.obligations.flatMap(obligation =>
    obligation.evidence.map(evidence => `${obligation.title}: ${evidence}`.slice(0, 120)),
  ) ?? [];
  return new Set(keys);
}

function customerEvidenceError(language: Language, error: unknown): string {
  const e = (key: Parameters<typeof evidenceApiText>[1]) => evidenceApiText(language, key);
  if (!(error instanceof Error)) return e('invalid');
  const safeMessages = [e('invalidData'), e('validateAnalysis'), e('missingProduct'), e('wrongRequirement'), e('save')];
  if (safeMessages.includes(error.message)) return error.message;
  console.error('evidence_write_failed', error);
  return e('invalid');
}

function sanitizeEvidenceRow<T extends { source_url?: string | null }>(row: T): T & { source_url: string } {
  return { ...row, source_url: safeEvidenceUrl(row.source_url) };
}

export async function GET(request: Request) {
  const language = requestLanguage(request);
  const e = (key: Parameters<typeof evidenceApiText>[1]) => evidenceApiText(language, key);
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: e('signIn') }, 401);
  const analysisId = new URL(request.url).searchParams.get('analysisId') ?? '';
  if (!uuid.test(analysisId)) return json({ error: e('invalidAnalysis') }, 400);
  const { data, error } = await supabase.from('analysis_evidence').select('id,analysis_id,product_index,evidence_key,status,note,source_document,source_page,source_url,updated_at').eq('analysis_id', analysisId).eq('user_id', user.id).order('product_index').order('evidence_key');
  if (error) return json({ error: e('read') }, 503);
  return json({ evidence: (data ?? []).map(sanitizeEvidenceRow) });
}

export async function PUT(request: Request) {
  const language = requestLanguage(request);
  const e = (key: Parameters<typeof evidenceApiText>[1]) => evidenceApiText(language, key);
  if (!sameOrigin(request)) return json({ error: e('origin') }, 403);
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: e('signIn') }, 401);
  try {
    const body = await readJsonBody(request) as Record<string, unknown>;
    const analysisId = typeof body.analysisId === 'string' ? body.analysisId : '';
    const productIndex = Number(body.productIndex);
    const evidenceKey = typeof body.evidenceKey === 'string' ? body.evidenceKey.trim() : '';
    const status = typeof body.status === 'string' ? body.status : '';
    const note = typeof body.note === 'string' ? body.note.trim() : '';
    const sourceDocument = typeof body.sourceDocument === 'string' ? body.sourceDocument.trim() : '';
    const sourcePage = typeof body.sourcePage === 'string' ? body.sourcePage.trim() : '';
    const sourceUrl = typeof body.sourceUrl === 'string' ? body.sourceUrl.trim() : '';
    if (!uuid.test(analysisId)
      || !Number.isInteger(productIndex) || productIndex < 0 || productIndex >= 1000
      || !evidenceKey || evidenceKey.length > 120
      || !allowed.has(status)
      || note.length > 2000
      || sourceDocument.length > 240
      || sourcePage.length > 80
      || sourceUrl.length > 1000
      || (sourceUrl && !isValidEvidenceUrl(sourceUrl))) throw new Error(e('invalidData'));

    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .select('products,market_code')
      .eq('id', analysisId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (analysisError) throw new Error(e('validateAnalysis'));
    const products = Array.isArray(analysis?.products) ? analysis.products as Product[] : [];
    if (!analysis || productIndex >= products.length) throw new Error(e('missingProduct'));
    if (!regulatoryEvidenceKeys(products[productIndex], marketCodeOrEu(analysis.market_code)).has(evidenceKey)) throw new Error(e('wrongRequirement'));

    const { data, error } = await supabase.from('analysis_evidence').upsert({
      analysis_id: analysisId,
      user_id: user.id,
      product_index: productIndex,
      evidence_key: evidenceKey,
      status,
      note,
      source_document: sourceDocument,
      source_page: sourcePage,
      source_url: sourceUrl,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'analysis_id,product_index,evidence_key' }).select('id,analysis_id,product_index,evidence_key,status,note,source_document,source_page,source_url,updated_at').single();
    if (error) throw new Error(e('save'));
    return json({ evidence: sanitizeEvidenceRow(data) });
  } catch (error) {
    return json({ error: customerEvidenceError(language, error) }, 400);
  }
}
