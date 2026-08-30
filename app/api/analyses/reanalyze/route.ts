import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PRIVATE_HEADERS, readJsonBody, sameOrigin } from '@/lib/http';
import { validateProducts } from '@/lib/analysis';

export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: PRIVATE_HEADERS });
const uuid = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: 'Tu sesión ha caducado.' }, 401);
  try {
    const body = await readJsonBody(request) as Record<string, unknown>;
    const analysisId = typeof body.analysisId === 'string' ? body.analysisId : '';
    if (!uuid.test(analysisId)) throw new Error('Análisis no válido.');
    const products = validateProducts(body.products);
    const { data, error } = await supabase.from('analyses').update({ products }).eq('id', analysisId).eq('user_id', user.id).select('id,filename,created_at,rule_version,market_code,products').single();
    if (error) throw new Error('No se ha podido actualizar el análisis.');
    return json({ analysis: data });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Datos no válidos.' }, 400);
  }
}
