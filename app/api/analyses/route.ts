import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RULE_VERSION, validateProducts } from '@/lib/analysis';
import { PRIVATE_HEADERS, readJsonBody, sameOrigin } from '@/lib/http';

export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: PRIVATE_HEADERS });

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: 'Inicia sesión para consultar tus análisis.' }, 401);
  const params = new URL(request.url).searchParams;
  const id = params.get('id');
  if (id) {
    if (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)) return json({ error: 'Identificador no válido.' }, 400);
    const { data, error } = await supabase.from('analyses').select('id,filename,created_at,rule_version,products').eq('user_id', user.id).eq('id', id).maybeSingle();
    if (error) return json({ error: 'No se puede leer el análisis. Comprueba la configuración de la base de datos.' }, 503);
    if (!data) return json({ error: 'Análisis no encontrado.' }, 404);
    return json({ analysis: data });
  }
  const rawPage = params.get('page') ?? '0';
  if (!/^\d{1,6}$/.test(rawPage)) return json({ error: 'Página no válida.' }, 400);
  const page = Number(rawPage);
  const { data, error } = await supabase.from('analyses').select('id,filename,created_at,rule_version,product_count').eq('user_id', user.id).order('created_at', { ascending: false }).order('id', { ascending: false }).range(page * 20, page * 20 + 20);
  if (error) return json({ error: 'El historial no está disponible. Puede faltar ejecutar la configuración SQL en Supabase.' }, 503);
  return json({ analyses: (data ?? []).slice(0, 20), hasMore: (data?.length ?? 0) > 20 });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'Origen de solicitud no permitido.' }, 403);
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: 'Tu sesión ha caducado. Vuelve a entrar.' }, 401);
  let products;
  let filename;
  let requestId;
  try {
    const body = await readJsonBody(request) as Record<string, unknown> | null;
    if (!body || typeof body.filename !== 'string' || !body.filename.trim() || body.filename.length > 120) throw new Error('El nombre de archivo debe tener entre 1 y 120 caracteres.');
    if (typeof body.requestId !== 'string' || !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(body.requestId)) throw new Error('Identificador de importación no válido.');
    filename = body.filename.trim(); requestId = body.requestId;
    products = validateProducts(body.products);
  } catch (error) { return json({ error: error instanceof Error ? error.message : 'Archivo no válido.' }, 400); }
  const existing = await supabase.from('analyses').select('id,filename,created_at,rule_version,products').eq('id', requestId).eq('user_id', user.id).maybeSingle();
  if (existing.data) return json({ analysis: existing.data });
  const { data, error } = await supabase.from('analyses').insert({ id: requestId, user_id: user.id, filename, products, rule_version: RULE_VERSION }).select('id,filename,created_at,rule_version,products').single();
  if (error) return json({ error: 'No se ha podido guardar el análisis. No se ha confirmado ningún guardado; revisa la conexión y la configuración SQL.' }, 503);
  return json({ analysis: data }, 201);
}
