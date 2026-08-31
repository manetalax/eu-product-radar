import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PRIVATE_HEADERS, readJsonBody, sameOrigin } from '@/lib/http';

export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: PRIVATE_HEADERS });
const uuid = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const allowed = new Set(['available', 'pending', 'not_applicable']);
const httpsUrl = /^https:\/\//i;

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: 'Inicia sesión.' }, 401);
  const analysisId = new URL(request.url).searchParams.get('analysisId') ?? '';
  if (!uuid.test(analysisId)) return json({ error: 'Análisis no válido.' }, 400);
  const { data, error } = await supabase.from('analysis_evidence').select('id,analysis_id,product_index,evidence_key,status,note,source_document,source_page,source_url,updated_at').eq('analysis_id', analysisId).eq('user_id', user.id).order('product_index').order('evidence_key');
  if (error) return json({ error: 'No se puede leer la evidencia.' }, 503);
  return json({ evidence: data ?? [] });
}

export async function PUT(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: 'Inicia sesión.' }, 401);
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
      || (sourceUrl && !httpsUrl.test(sourceUrl))) throw new Error('Datos de evidencia no válidos.');
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
    if (error) throw new Error('No se ha podido guardar la evidencia.');
    return json({ evidence: data });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Datos no válidos.' }, 400);
  }
}
