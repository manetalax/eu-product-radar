import { NextResponse } from 'next/server';
import { billingStatus, isUnlimitedBillingOption, stripePriceIdForBillingOption, UNLIMITED_PRICE_CONFIG } from '@/lib/billing';
import { billingText } from '@/lib/billing-i18n';
import { configuredSiteOrigin, sameOrigin, PRIVATE_HEADERS, readJsonBody } from '@/lib/http';
import { legalConfig } from '@/lib/legal-config';
import { requestLanguage } from '@/lib/request-language';
import { trustedStripeNavigationUrl } from '@/lib/stripe/navigation';
import { stripeClient } from '@/lib/stripe/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: PRIVATE_HEADERS });
const UNLIMITED_INTERNAL_PLAN_ID = 'starter' as const;
const TERMINAL_SUBSCRIPTION_STATUSES = new Set(['canceled', 'incomplete_expired']);

async function hasCurrentStripeSubscription(stripe: ReturnType<typeof stripeClient>, customerId: string) {
  let startingAfter: string | undefined;
  let hasCurrent = false;

  do {
    const page = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    for (const subscription of page.data) {
      if (TERMINAL_SUBSCRIPTION_STATUSES.has(subscription.status)) continue;
      if (subscription.status === 'incomplete') {
        // An abandoned/incomplete Checkout must not block the customer indefinitely or
        // remain payable after a new successful subscription is started.
        await stripe.subscriptions.cancel(subscription.id);
        continue;
      }
      hasCurrent = true;
    }

    if (!page.has_more) return hasCurrent;
    const lastId = page.data.at(-1)?.id;
    if (!lastId) throw new Error('stripe_subscription_pagination_failed');
    startingAfter = lastId;
  } while (startingAfter);

  return hasCurrent;
}

export async function POST(request: Request) {
  const language = requestLanguage(request);
  const b = (key: Parameters<typeof billingText>[1]) => billingText(language, key);
  if (!sameOrigin(request)) return json({ error: b('origin') }, 403);
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: b('signInCheckout') }, 401);

  let billingOption: 'monthly' | 'annual' | 'lifetime' = 'monthly';
  try {
    const body = await readJsonBody(request) as Record<string, unknown> | null;
    const candidate = body?.purchaseId ?? body?.planId;
    if (candidate !== UNLIMITED_INTERNAL_PLAN_ID) throw new Error(b('onlyUnlimited'));
    const requestedOption = body?.billingOption ?? 'monthly';
    if (!isUnlimitedBillingOption(requestedOption)) throw new Error(b('invalidRequest'));
    billingOption = requestedOption;
    if (process.env.NODE_ENV === 'production' && !legalConfig()) throw new Error(b('legalNotReady'));
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : b('invalidRequest') }, 400);
  }

  try {
    const stripe = stripeClient();
    const admin = createAdminClient();
    const [{ data: record, error }, { data: lifetime, error: lifetimeError }] = await Promise.all([
      admin.from('subscriptions').select('stripe_customer_id,plan_id,status,current_period_end,cancel_at_period_end').eq('user_id', user.id).maybeSingle(),
      admin.from('unlimited_lifetime_entitlements').select('status').eq('user_id', user.id).maybeSingle(),
    ]);
    if (error && error.code !== 'PGRST116') throw new Error(b('subscriptionRead'));
    if (lifetimeError && lifetimeError.code !== 'PGRST116') throw new Error(b('subscriptionRead'));
    if (lifetime?.status === 'active') return json({ error: b('alreadyUnlimited') }, 409);

    let customerId = record?.stripe_customer_id as string | null | undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, metadata: { supabase_user_id: user.id } }, { idempotencyKey: `customer-${user.id}` });
      customerId = customer.id;
      const { error: saveError } = await admin.from('subscriptions').upsert({ user_id: user.id, stripe_customer_id: customerId, plan_id: 'free', status: 'none', product_limit: 5, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      if (saveError) throw new Error(b('paymentPrepare'));
    }

    const siteOrigin = configuredSiteOrigin();
    if (!siteOrigin) throw new Error(b('siteUrl'));

    // Supabase is a projection of billing state and can lag behind Stripe webhooks. Re-read
    // the customer directly before creating new recurring value. Incomplete abandoned
    // subscriptions are canceled; any other non-terminal subscription routes to Portal.
    const stripeHasCurrentSubscription = await hasCurrentStripeSubscription(stripe, customerId);
    if (billingStatus(record).planId !== 'free' || stripeHasCurrentSubscription) {
      const portal = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: `${siteOrigin}/dashboard` });
      const portalUrl = trustedStripeNavigationUrl(portal.url, 'portal');
      if (!portalUrl) throw new Error(b('stripePage'));
      return json({ url: portalUrl });
    }

    const expected = UNLIMITED_PRICE_CONFIG[billingOption];
    const priceId = stripePriceIdForBillingOption(billingOption);
    const price = await stripe.prices.retrieve(priceId);
    const recurringMatches = expected.recurringInterval === null
      ? price.type === 'one_time' && price.recurring == null
      : price.type === 'recurring' && price.recurring?.interval === expected.recurringInterval && price.recurring.interval_count === 1;
    const validUnlimitedPrice = price.active
      && price.currency === 'eur'
      && price.unit_amount === expected.amountCents
      && recurringMatches;
    if (!validUnlimitedPrice) throw new Error(b('stripePrice'));

    const metadata = { user_id: user.id, plan_id: UNLIMITED_INTERNAL_PLAN_ID, billing_option: billingOption };
    const successUrl = `${siteOrigin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${siteOrigin}/dashboard?checkout=cancelled`;

    const session = expected.checkoutMode === 'subscription'
      ? await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        client_reference_id: user.id,
        line_items: [{ price: priceId, quantity: 1 }],
        allow_promotion_codes: true,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata,
        subscription_data: { metadata },
      }, { idempotencyKey: `checkout-${user.id}-${billingOption}-${new Date().toISOString().slice(0, 13)}` })
      : await stripe.checkout.sessions.create({
        mode: 'payment',
        customer: customerId,
        client_reference_id: user.id,
        line_items: [{ price: priceId, quantity: 1 }],
        // Lifetime creates permanent value. Keep promotions on recurring plans only so a
        // 100% promotion can never turn the one-time Checkout into a free Lifetime grant.
        allow_promotion_codes: false,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata,
        payment_intent_data: { metadata },
      }, { idempotencyKey: `checkout-${user.id}-${billingOption}` });

    const checkoutUrl = trustedStripeNavigationUrl(session.url, 'checkout');
    if (!checkoutUrl) throw new Error(b('stripePage'));
    return json({ url: checkoutUrl });
  } catch {
    return json({ error: b('paymentOpen') }, 503);
  }
}
