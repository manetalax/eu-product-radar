import { NextResponse } from 'next/server';
import { billingText } from '@/lib/billing-i18n';
import { configuredSiteOrigin, sameOrigin, PRIVATE_HEADERS } from '@/lib/http';
import { requestLanguage } from '@/lib/request-language';
import { stripeClient } from '@/lib/stripe/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: PRIVATE_HEADERS });

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

    const session = await stripeClient().billingPortal.sessions.create({ customer: data.stripe_customer_id, return_url: `${siteOrigin}/dashboard` });
    return json({ url: session.url });
  } catch {
    return json({ error: b('portalOpen') }, 503);
  }
}
