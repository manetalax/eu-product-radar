import { NextResponse } from 'next/server';
import { billingOptionForStripePrice } from '@/lib/billing';
import { billingText } from '@/lib/billing-i18n';
import { PRIVATE_HEADERS, readJsonBody, RequestBodyTooLargeError, sameOrigin } from '@/lib/http';
import { requestLanguage } from '@/lib/request-language';
import { syncLifetimeCheckoutSession } from '@/lib/stripe/lifetime-entitlement';
import { stripeClient } from '@/lib/stripe/server';
import { stripeObjectId, syncStripeSubscription } from '@/lib/stripe/subscription-sync';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: PRIVATE_HEADERS });
const checkoutSessionId = /^cs_(?:live|test)_[A-Za-z0-9]+$/;
const CONFIRMED_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing']);
const BILLING_JSON_MAX_BYTES = 4 * 1024;

export async function POST(request: Request) {
  const language = requestLanguage(request);
  const b = (key: Parameters<typeof billingText>[1]) => billingText(language, key);
  if (!sameOrigin(request)) return json({ error: b('origin') }, 403);

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: b('signInCheckout') }, 401);

  let sessionId = '';
  try {
    const body = await readJsonBody(request, BILLING_JSON_MAX_BYTES) as Record<string, unknown> | null;
    sessionId = typeof body?.sessionId === 'string' ? body.sessionId.trim() : '';
  } catch (error) {
    return json({ error: b('invalidRequest') }, error instanceof RequestBodyTooLargeError ? 413 : 400);
  }
  if (!checkoutSessionId.test(sessionId) || sessionId.length > 255) return json({ error: b('invalidRequest') }, 400);

  try {
    const stripe = stripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items.data.price'] });
    const ownerId = session.metadata?.user_id || session.client_reference_id;
    if (ownerId !== user.id) return json({ error: b('invalidRequest') }, 403);

    if (session.mode === 'subscription') {
      if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
        return json({ error: b('paymentOpen') }, 409);
      }
      const subscriptionId = stripeObjectId(session.subscription);
      if (!subscriptionId) return json({ error: b('paymentOpen') }, 409);
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, { expand: ['items.data.price'] });
      await syncStripeSubscription(subscription);
      if (!CONFIRMED_SUBSCRIPTION_STATUSES.has(subscription.status)) {
        return json({ error: b('paymentOpen') }, 409);
      }

      const priceId = subscription.items.data.length === 1 ? subscription.items.data[0]?.price?.id : null;
      const billingOption = billingOptionForStripePrice(priceId);
      if (billingOption !== 'monthly' && billingOption !== 'annual') {
        return json({ error: b('paymentOpen') }, 409);
      }
      return json({ confirmed: true, billingOption });
    }

    if (session.mode === 'payment') {
      if (session.payment_status !== 'paid') return json({ error: b('paymentOpen') }, 409);
      const granted = await syncLifetimeCheckoutSession(session);
      if (!granted) return json({ error: b('paymentOpen') }, 409);
      return json({ confirmed: true, billingOption: 'lifetime' });
    }

    return json({ error: b('invalidRequest') }, 403);
  } catch {
    return json({ error: b('paymentOpen') }, 503);
  }
}
