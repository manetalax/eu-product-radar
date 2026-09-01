import { NextResponse } from 'next/server';
import { billingText } from '@/lib/billing-i18n';
import { configuredSiteOrigin, sameOrigin, PRIVATE_HEADERS } from '@/lib/http';
import { requestLanguage } from '@/lib/request-language';
import { trustedStripeNavigationUrl } from '@/lib/stripe/navigation';
import { stripeClient } from '@/lib/stripe/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: PRIVATE_HEADERS });
const MANAGEABLE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing', 'past_due', 'unpaid', 'paused']);
const MAX_SUBSCRIPTION_SCAN = 500;

async function hasManageableSubscription(customerId: string) {
  const stripe = stripeClient();
  let startingAfter: string | undefined;
  let scanned = 0;
  do {
    const page = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    scanned += page.data.length;
    if (scanned > MAX_SUBSCRIPTION_SCAN) throw new Error('stripe_subscription_scan_limit');
    if (page.data.some(subscription => MANAGEABLE_SUBSCRIPTION_STATUSES.has(subscription.status))) return true;
    if (!page.has_more) return false;
    const lastId = page.data.at(-1)?.id;
    if (!lastId) throw new Error('stripe_subscription_pagination_failed');
    startingAfter = lastId;
  } while (startingAfter);
  return false;
}

export async function POST(request: Request) {
  const language = requestLanguage(request);
  const b = (key: Parameters<typeof billingText>[1]) => billingText(language, key);
  if (!sameOrigin(request)) return json({ error: b('origin') }, 403);
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return json({ error: b('signInPortal') }, 401);
  try {
    const siteOrigin = configuredSiteOrigin();
    if (!siteOrigin) throw new Error(b('siteUrl'));

    const admin = createAdminClient();
    const { data, error: subscriptionError } = await admin.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).maybeSingle();
    if (subscriptionError && subscriptionError.code !== 'PGRST116') throw new Error(b('subscriptionRead'));
    if (!data?.stripe_customer_id) return json({ error: b('noSubscription') }, 404);

    // A Stripe customer can exist for a Lifetime-only purchase or an abandoned
    // incomplete Checkout. Portal is useful only for recurring states the customer can
    // actually manage; pending incomplete subscriptions are reconciled by Checkout.
    if (!await hasManageableSubscription(data.stripe_customer_id)) {
      return json({ error: b('noSubscription') }, 404);
    }

    const session = await stripeClient().billingPortal.sessions.create({ customer: data.stripe_customer_id, return_url: `${siteOrigin}/dashboard` });
    const portalUrl = trustedStripeNavigationUrl(session.url, 'portal');
    if (!portalUrl) throw new Error(b('portalOpen'));
    return json({ url: portalUrl });
  } catch {
    return json({ error: b('portalOpen') }, 503);
  }
}
