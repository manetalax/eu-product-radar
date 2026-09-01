import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RULE_VERSION, validateProducts } from '@/lib/analysis';
import { analysisApiText } from '@/lib/analysis-api-i18n';
import { PRIVATE_HEADERS, readJsonBody, sameOrigin } from '@/lib/http';
import { productQuota, quotaExceededMessage } from '@/lib/quota';
import { isActiveMarketCode, MarketCode } from '@/lib/markets';
import { billingStatus, unlimitedBillingStatus } from '@/lib/billing';
import type { Language } from '@/lib/landing-i18n';
import { requestLanguage } from '@/lib/request-language';

export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: PRIVATE_HEADERS });
type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function readQuota(supabase: SupabaseClient, userId: string, language: Language) {
  const a = (key: Parameters<typeof analysisApiText>[1]) => analysisApiText(language, key);
  const [subscription, lifetime, freeUsage] = await Promise.all([
    supabase.from('subscriptions').select('plan_id,status,current_period_end,cancel_at_period_end').eq('user_id', userId).maybeSingle(),
    supabase.from('unlimited_lifetime_entitlements').select('status').eq('user_id', userId).maybeSingle(),
    supabase.from('free_account_usage').select('product_count').eq('user_id', userId).maybeSingle(),
  ]);
  if (subscription.error?.code && subscription.error.code !== 'PGRST116') throw new Error(a('subscriptionUnavailable'));
  if (lifetime.error?.code && lifetime.error.code !== 'PGRST116') throw new Error(a('subscriptionUnavailable'));
  if (freeUsage.error?.code && freeUsage.error.code !== 'PGRST116') throw new Error(a('freeUnavailable'));

  if (lifetime.data?.status === 'active') return productQuota(0, new Date(), unlimitedBillingStatus('lifetime'));
  const subscriptionBilling = billingStatus(subscription.data);
  if (subscriptionBilling.planId !== 'free') return productQuota(0, new Date(), subscriptionBilling);
  return productQuota(Number(freeUsage.data?.product_count ?? 0), new Date(), subscriptionBilling);
}

export async function GET(request: Request) {
  const language = requestLanguage(request);
  const a = (key: Parameters<typeof analysisApiText>[1]) => analysisApiText(language, key);
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: a('signInGet') }, 401);
  const params = new URL(request.url).searchParams;
  const id = params.get('id');
  if (id) {
    if (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)) return json({ error: a('invalidId') }, 400);
    const { data, error } = await supabase.from('analyses').select('id,filename,created_at,rule_version,market_code,products').eq('user_id', user.id).eq('id', id).maybeSingle();
    if (error) return json({ error: a('readAnalysis') }, 503);
    if (!data) return json({ error: a('notFound') }, 404);
    return json({ analysis: data });
  }
  const rawPage = params.get('page') ?? '0';
  if (!/^\d{1,6}$/.test(rawPage)) return json({ error: a('invalidPage') }, 400);
  const page = Number(rawPage);
  const [{ data, error }, quotaResult] = await Promise.all([
    supabase.from('analyses').select('id,filename,created_at,rule_version,market_code,product_count').eq('user_id', user.id).order('created_at', { ascending: false }).order('id', { ascending: false }).range(page * 20, page * 20 + 20),
    readQuota(supabase, user.id, language).then(quota => ({ quota })).catch(quotaError => ({ error: quotaError })),
  ]);
  if (error) return json({ error: a('historyUnavailable') }, 503);
  if ('error' in quotaResult) return json({ error: quotaResult.error instanceof Error ? quotaResult.error.message : a('quotaUnavailable') }, 503);
  return json({ analyses: (data ?? []).slice(0, 20), hasMore: (data?.length ?? 0) > 20, quota: quotaResult.quota });
}

export async function POST(request: Request) {
  const language = requestLanguage(request);
  const a = (key: Parameters<typeof analysisApiText>[1]) => analysisApiText(language, key);
  if (!sameOrigin(request)) return json({ error: a('origin') }, 403);
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: a('sessionExpired') }, 401);

  let body: Record<string, unknown> | null;
  try { body = await readJsonBody(request) as Record<string, unknown> | null; }
  catch { return json({ error: a('invalidFile') }, 400); }
  if (!body || typeof body.filename !== 'string' || !body.filename.trim() || body.filename.length > 120) return json({ error: a('filename') }, 400);
  if (typeof body.requestId !== 'string' || !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(body.requestId)) return json({ error: a('requestId') }, 400);
  if (!isActiveMarketCode(body.marketCode)) return json({ error: a('market') }, 400);

  const filename = body.filename.trim();
  const requestId = body.requestId;
  const marketCode: MarketCode = body.marketCode;
  let products;
  try { products = validateProducts(body.products); }
  catch { return json({ error: a('invalidFile') }, 400); }

  const existing = await supabase.from('analyses').select('id,filename,created_at,rule_version,market_code,products').eq('id', requestId).eq('user_id', user.id).maybeSingle();
  if (existing.error) return json({ error: a('checkImport') }, 503);

  let quota;
  try { quota = await readQuota(supabase, user.id, language); }
  catch (quotaError) { return json({ error: quotaError instanceof Error ? quotaError.message : a('quotaUnavailable') }, 503); }
  if (existing.data) return json({ analysis: existing.data, quota });
  if (quota.billing.planId === 'free' && products.length > quota.remaining) return json({ error: quotaExceededMessage(products.length, quota, language), quota }, 429);

  const { data, error } = await supabase.from('analyses').insert({ id: requestId, user_id: user.id, filename, products, market_code: marketCode, rule_version: RULE_VERSION }).select('id,filename,created_at,rule_version,market_code,products').single();
  if (error?.message?.includes('free_account_product_limit_exceeded') || error?.message?.includes('monthly_product_limit_exceeded') || error?.message?.includes('free_monthly_product_limit_exceeded')) {
    const latestQuota = await readQuota(supabase, user.id, language).catch(() => quota);
    return json({ error: quotaExceededMessage(products.length, latestQuota, language), quota: latestQuota }, 429);
  }
  if (error?.code === '23505') {
    const duplicate = await supabase.from('analyses').select('id,filename,created_at,rule_version,market_code,products').eq('id', requestId).eq('user_id', user.id).maybeSingle();
    if (!duplicate.error && duplicate.data) {
      const latestQuota = await readQuota(supabase, user.id, language).catch(() => quota);
      return json({ analysis: duplicate.data, quota: latestQuota });
    }
  }
  if (error) return json({ error: a('saveAnalysis') }, 503);
  const updatedQuota = await readQuota(supabase, user.id, language).catch(() => productQuota(quota.used + products.length, new Date(), quota.billing));
  return json({ analysis: data, quota: updatedQuota }, 201);
}
