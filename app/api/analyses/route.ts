import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RULE_VERSION, validateProducts } from '@/lib/analysis';
import { PRIVATE_HEADERS, readJsonBody, sameOrigin } from '@/lib/http';
import { currentUtcMonthStart, productQuota, quotaExceededMessage } from '@/lib/quota';
import { isActiveMarketCode, MarketCode } from '@/lib/markets';
import { auditBillingStatus, billingStatus } from '@/lib/billing';

export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: PRIVATE_HEADERS });
type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function readQuota(supabase: SupabaseClient, userId: string) {
  const periodStart = currentUtcMonthStart();
  const [{ data, error }, subscription, audit] = await Promise.all([
    supabase.from('monthly_product_usage').select('product_count').eq('user_id', userId).eq('period_start', periodStart).maybeSingle(),
    supabase.from('subscriptions').select('plan_id,status,current_period_end,cancel_at_period_end').eq('user_id', userId).maybeSingle(),
    supabase.from('one_time_audits').select('id,product_limit').eq('user_id', userId).eq('status', 'paid').is('consumed_at', null).order('purchased_at', { ascending: true }).limit(1).maybeSingle(),
  ]);
  if (error) throw new Error('La cuota no está disponible. Ejecuta la migración mensual en Supabase.');
  if (subscription.error?.code && subscription.error.code !== 'PGRST116') throw new Error('La suscripción no está disponible. Ejecuta la migración de pagos en Supabase.');
  if (audit.error?.code && audit.error.code !== 'PGRST116') throw new Error('La auditoría de pago único no está disponible. Ejecuta la migración de auditorías en Supabase.');
  const subscriptionBilling = billingStatus(subscription.data);
  const billing = subscriptionBilling.planId === 'free' && audit.data ? auditBillingStatus() : subscriptionBilling;
  return productQuota(billing.planId === 'audit' ? 0 : Number(data?.product_count ?? 0), new Date(), billing);
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: 'Inicia sesión para consultar tus análisis.' }, 401);
  const params = new URL(request.url).searchParams;
  const id = params.get('id');
  if (id) {
    if (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)) return json({ error: 'Identificador no válido.' }, 400);
    const { data, error } = await supabase.from('analyses').select('id,filename,created_at,rule_version,market_code,products').eq('user_id', user.id).eq('id', id).maybeSingle();
    if (error) return json({ error: 'No se puede leer el análisis. Comprueba la configuración de la base de datos.' }, 503);
    if (!data) return json({ error: 'Análisis no encontrado.' }, 404);
    return json({ analysis: data });
  }
  const rawPage = params.get('page') ?? '0';
  if (!/^\d{1,6}$/.test(rawPage)) return json({ error: 'Página no válida.' }, 400);
  const page = Number(rawPage);
  const [{ data, error }, quotaResult] = await Promise.all([
    supabase.from('analyses').select('id,filename,created_at,rule_version,market_code,product_count').eq('user_id', user.id).order('created_at', { ascending: false }).order('id', { ascending: false }).range(page * 20, page * 20 + 20),
    readQuota(supabase, user.id).then(quota => ({ quota })).catch(quotaError => ({ error: quotaError })),
  ]);
  if (error) return json({ error: 'El historial no está disponible. Puede faltar ejecutar la configuración SQL en Supabase.' }, 503);
  if ('error' in quotaResult) return json({ error: quotaResult.error instanceof Error ? quotaResult.error.message : 'La cuota no está disponible.' }, 503);
  return json({ analyses: (data ?? []).slice(0, 20), hasMore: (data?.length ?? 0) > 20, quota: quotaResult.quota });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'Origen de solicitud no permitido.' }, 403);
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: 'Tu sesión ha caducado. Vuelve a entrar.' }, 401);
  let products;
  let filename;
  let requestId;
  let marketCode: MarketCode;
  try {
    const body = await readJsonBody(request) as Record<string, unknown> | null;
    if (!body || typeof body.filename !== 'string' || !body.filename.trim() || body.filename.length > 120) throw new Error('El nombre de archivo debe tener entre 1 y 120 caracteres.');
    if (typeof body.requestId !== 'string' || !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(body.requestId)) throw new Error('Identificador de importación no válido.');
    if (!isActiveMarketCode(body.marketCode)) throw new Error('Europa es el mercado operativo en esta fase. Los siguientes mercados se activarán después de validar sus reglas.');
    filename = body.filename.trim(); requestId = body.requestId;
    marketCode = body.marketCode;
    products = validateProducts(body.products);
  } catch (error) { return json({ error: error instanceof Error ? error.message : 'Archivo no válido.' }, 400); }
  const existing = await supabase.from('analyses').select('id,filename,created_at,rule_version,market_code,products').eq('id', requestId).eq('user_id', user.id).maybeSingle();
  if (existing.error) return json({ error: 'No se ha podido comprobar la importación. Vuelve a intentarlo.' }, 503);
  let quota;
  try { quota = await readQuota(supabase, user.id); }
  catch (quotaError) { return json({ error: quotaError instanceof Error ? quotaError.message : 'La cuota no está disponible.' }, 503); }
  if (existing.data) return json({ analysis: existing.data, quota });
  if (products.length > quota.remaining) return json({ error: quotaExceededMessage(products.length, quota), quota }, 429);
  const { data, error } = await supabase.from('analyses').insert({ id: requestId, user_id: user.id, filename, products, market_code: marketCode, rule_version: RULE_VERSION }).select('id,filename,created_at,rule_version,market_code,products').single();
  if (error?.message?.includes('monthly_product_limit_exceeded') || error?.message?.includes('free_monthly_product_limit_exceeded') || error?.message?.includes('one_time_audit_product_limit_exceeded') || error?.message?.includes('one_time_audit_already_consumed')) {
    const latestQuota = await readQuota(supabase, user.id).catch(() => quota);
    return json({ error: quotaExceededMessage(products.length, latestQuota), quota: latestQuota }, 429);
  }
  if (error) return json({ error: 'No se ha podido guardar el análisis. No se ha confirmado ningún guardado; revisa la conexión y la configuración SQL.' }, 503);
  const updatedQuota = await readQuota(supabase, user.id).catch(() => productQuota(quota.used + products.length));
  return json({ analysis: data, quota: updatedQuota }, 201);
}
