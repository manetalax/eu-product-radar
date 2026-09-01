import { NextResponse } from 'next/server';
import { isUnlimitedBillingOption, stripePriceIdForBillingOption, UNLIMITED_PRICE_CONFIG } from '@/lib/billing';
import { billingText } from '@/lib/billing-i18n';
import { configuredSiteOrigin, sameOrigin, PRIVATE_HEADERS, readJsonBody, RequestBodyTooLargeError } from '@/lib/http';
import { legalConfig } from '@/lib/legal-config';
import { requestLanguage } from '@/lib/request-language';
import { trustedStripeNavigationUrl } from '@/lib/stripe/navigation';
import { stripeClient } from '@/lib/stripe/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: PRIVATE_HEADERS });
const UNLIMITED_INTERNAL_PLAN_ID = 'starter' as const;
const BILLING_INTENT_COOKIE = 'importverifier-billing-intent';
const TERMINAL_SUBSCRIPTION_STATUSES = new Set(['canceled', 'incomplete_expired']);
const MAX_CHECKOUT_SESSION_SCAN = 500;
const BILLING_JSON_MAX_BYTES = 4 * 1024;
const AUTH_BILLING_INTENT_MAX_AGE_MS = 15 * 60 * 1000;
type UnlimitedBillingOption = 'monthly' | 'annual' | 'lifetime';

function cookieBillingIntent(request: Request): UnlimitedBillingOption | null {
  const rawCookie = request.headers.get('cookie');
  if (!rawCookie) return null;
  for (const part of rawCookie.split(';')) {
    const [rawName, ...rawValue] = part.trim().split('=');
    if (rawName !== BILLING_INTENT_COOKIE) continue;
    try {
      const value = decodeURIComponent(rawValue.join('='));
      return isUnlimitedBillingOption(value) ? value : null;
    } catch {
      return null;
    }
  }
  return null;
}

function recentAuthBillingIntent(userMetadata: Record<string, unknown> | undefined): UnlimitedBillingOption | null {
  if (!userMetadata || userMetadata.plan_interest_id !== UNLIMITED_INTERNAL_PLAN_ID) return null;
  if (!isUnlimitedBillingOption(userMetadata.plan_interest_billing_option)) return null;
  if (typeof userMetadata.plan_interest_at !== 'string') return null;
  const savedAt = Date.parse(userMetadata.plan_interest_at);
  if (!Number.isFinite(savedAt)) return null;
  const age = Date.now() - savedAt;
  if (age < 0 || age > AUTH_BILLING_INTENT_MAX_AGE_MS) return null;
  return userMetadata.plan_interest_billing_option;
}

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

async function reconcileCheckoutSessions(
  stripe: ReturnType<typeof stripeClient>,
  customerId: string,
  userId: string,
  requestedOption: UnlimitedBillingOption,
) {
  let startingAfter: string | undefined;
  let scanned = 0;
  let generation = 0;
  let reusableUrl: string | null = null;

  do {
    const page = await stripe.checkout.sessions.list({
      customer: customerId,
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    scanned += page.data.length;
    if (scanned > MAX_CHECKOUT_SESSION_SCAN) throw new Error('checkout_session_scan_limit');

    for (const session of page.data) {
      const owned = session.metadata?.user_id === userId
        && session.metadata?.plan_id === UNLIMITED_INTERNAL_PLAN_ID
        && isUnlimitedBillingOption(session.metadata?.billing_option);
      if (!owned) continue;
      generation += 1;
      if (session.status !== 'open') continue;

      if (session.metadata?.billing_option === requestedOption && !reusableUrl && session.url) {
        reusableUrl = session.url;
        continue;
      }

      await stripe.checkout.sessions.expire(session.id);
    }

    if (!page.has_more) break;
    const lastId = page.data.at(-1)?.id;
    if (!lastId) throw new Error('checkout_session_pagination_failed');
    startingAfter = lastId;
  } while (startingAfter);

  return { reusableUrl, generation };
}

export async function POST(request: Request) {
  const language = requestLanguage(request);
  const b = (key: Parameters<typeof billingText>[1]) => billingText(language, key);
  if (!sameOrigin(request)) return json({ error: b('origin') }, 403);
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: b('signInCheckout') }, 401);

  let body: Record<string, unknown> | null;
  try {
    body = await readJsonBody(request, BILLING_JSON_MAX_BYTES) as Record<string, unknown> | null;
  } catch (error) {
    return json({ error: b('invalidRequest') }, error instanceof RequestBodyTooLargeError ? 413 : 400);
  }

  const candidate = body?.purchaseId ?? body?.planId;
  if (candidate !== UNLIMITED_INTERNAL_PLAN_ID) return json({ error: b('onlyUnlimited') }, 400);
  // An explicit authenticated request is authoritative. The short-lived same-site cookie
  // bridges OAuth/login navigation where the current dashboard client still sends only
  // purchaseId; authenticated metadata is a second recovery path for signup/callbacks.
  const requestedOption = body?.billingOption
    ?? cookieBillingIntent(request)
    ?? recentAuthBillingIntent(user.user_metadata as Record<string, unknown> | undefined)
    ?? 'monthly';
  if (!isUnlimitedBillingOption(requestedOption)) return json({ error: b('invalidRequest') }, 400);
  const billingOption: UnlimitedBillingOption = requestedOption;
  if (process.env.NODE_ENV === 'production' && !legalConfig()) return json({ error: b('legalNotReady') }, 400);

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

    const stripeHasCurrentSubscription = await hasCurrentStripeSubscription(stripe, customerId);
    if (stripeHasCurrentSubscription) {
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

    const { reusableUrl, generation } = await reconcileCheckoutSessions(stripe, customerId, user.id, billingOption);
    if (reusableUrl) {
      const trustedReusableUrl = trustedStripeNavigationUrl(reusableUrl, 'checkout');
      if (!trustedReusableUrl) throw new Error(b('stripePage'));
      return json({ url: trustedReusableUrl });
    }

    const metadata = { user_id: user.id, plan_id: UNLIMITED_INTERNAL_PLAN_ID, billing_option: billingOption };
    const successUrl = `${siteOrigin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${siteOrigin}/dashboard?checkout=cancelled`;
    const checkoutIdempotencyKey = `checkout-${user.id}-${generation}`;

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
      }, { idempotencyKey: checkoutIdempotencyKey })
      : await stripe.checkout.sessions.create({
        mode: 'payment',
        customer: customerId,
        client_reference_id: user.id,
        line_items: [{ price: priceId, quantity: 1 }],
        allow_promotion_codes: false,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata,
        payment_intent_data: { metadata },
      }, { idempotencyKey: checkoutIdempotencyKey });

    const checkoutUrl = trustedStripeNavigationUrl(session.url, 'checkout');
    if (!checkoutUrl) throw new Error(b('stripePage'));
    return json({ url: checkoutUrl });
  } catch {
    return json({ error: b('paymentOpen') }, 503);
  }
}
