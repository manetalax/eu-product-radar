import { NextResponse } from 'next/server';
import { billingStatus, stripePriceId } from '@/lib/billing';
import { billingText } from '@/lib/billing-i18n';
import { configuredSiteOrigin, sameOrigin, PRIVATE_HEADERS, readJsonBody } from '@/lib/http';
import { legalConfig } from '@/lib/legal-config';
import { requestLanguage } from '@/lib/request-language';
import { stripeClient } from '@/lib/stripe/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: PRIVATE_HEADERS });
const UNLIMITED_INTERNAL_PLAN_ID = 'starter' as const;
const UNLIMITED_MONTHLY_CENTS = 995;

export async function POST(request: Request) {
  const language = requestLanguage(request);
  const b = (key: Parameters<typeof billingText>[1]) => billingText(language, key);
  if (!sameOrigin(request)) return json({ error: b('origin') }, 403);
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: b('signInCheckout') }, 401);

  try {
    const body = await readJsonBody(request) as Record<string, unknown> | null;
    const candidate = body?.purchaseId ?? body?.planId;
    if (candidate !== UNLIMITED_INTERNAL_PLAN_ID) throw new Error(b('onlyUnlimited'));
    if (process.env.NODE_ENV === 'production' && !legalConfig()) throw new Error(b('legalNotReady'));
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : b('invalidRequest') }, 400);
  }

  try {
    const stripe = stripeClient();
    const admin = createAdminClient();
    const { data: record, error } = await admin.from('subscriptions').select('stripe_customer_id,plan_id,status,current_period_end,cancel_at_period_end').eq('user_id', user.id).maybeSingle();
    if (error && error.code !== 'PGRST116') throw new Error(b('subscriptionRead'));

    let customerId = record?.stripe_customer_id as string | null | undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, metadata: { supabase_user_id: user.id } }, { idempotencyKey: `customer-${user.id}` });
      customerId = customer.id;
      const { error: saveError } = await admin.from('subscriptions').upsert({ user_id: user.id, stripe_customer_id: customerId, plan_id: 'free', status: 'none', product_limit: 5, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      if (saveError) throw new Error(b('paymentPrepare'));
    }

    const siteOrigin = configuredSiteOrigin();
    if (!siteOrigin) throw new Error(b('siteUrl'));

    if (billingStatus(record).planId !== 'free' && customerId) {
      const portal = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: `${siteOrigin}/dashboard` });
      return json({ url: portal.url });
    }

    const priceId = stripePriceId(UNLIMITED_INTERNAL_PLAN_ID);
    const price = await stripe.prices.retrieve(priceId);
    const validUnlimitedPrice = price.active
      && price.currency === 'eur'
      && price.unit_amount === UNLIMITED_MONTHLY_CENTS
      && price.type === 'recurring'
      && price.recurring?.interval === 'month'
      && price.recurring.interval_count === 1;
    if (!validUnlimitedPrice) throw new Error(b('stripePrice'));

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${siteOrigin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteOrigin}/dashboard?checkout=cancelled`,
      metadata: { user_id: user.id, plan_id: UNLIMITED_INTERNAL_PLAN_ID },
      subscription_data: { metadata: { user_id: user.id, plan_id: UNLIMITED_INTERNAL_PLAN_ID } },
    }, { idempotencyKey: `checkout-${user.id}-${UNLIMITED_INTERNAL_PLAN_ID}-${new Date().toISOString().slice(0, 13)}` });
    if (!session.url) throw new Error(b('stripePage'));
    return json({ url: session.url });
  } catch {
    return json({ error: b('paymentOpen') }, 503);
  }
}
