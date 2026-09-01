import { NextResponse } from 'next/server';
import { billingText } from '@/lib/billing-i18n';
import { PRIVATE_HEADERS, readJsonBody, sameOrigin } from '@/lib/http';
import { requestLanguage } from '@/lib/request-language';
import { syncLifetimeCheckoutSession } from '@/lib/stripe/lifetime-entitlement';
import { stripeClient } from '@/lib/stripe/server';
import { stripeObjectId, syncStripeSubscription } from '@/lib/stripe/subscription-sync';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: PRIVATE_HEADERS });
const checkoutSessionId = /^cs_(?:live|test)_[A-Za-z0-9]+$/;

export async function POST(request: Request) {
  const language = requestLanguage(request);
  const b = (key: Parameters<typeof billingText>[1]) => billingText(language, key);
  if (!sameOrigin(request)) return json({ error: b('origin') }, 403);

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: b('signInCheckout') }, 401);

  let sessionId = '';
  try {
    const body = await readJsonBody(request) as Record<string, unknown> | null;
    sessionId = typeof body?.sessionId === 'string' ? body.sessionId.trim() : '';
    if (!checkoutSessionId.test(sessionId) || sessionId.length > 255) throw new Error('invalid_checkout_session');
  } catch {
    return json({ error: b('invalidRequest') }, 400);
  }

  try {
    const stripe = stripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items.data.price'] });
    const ownerId = session.metadata?.user_id || session.client_reference_id;
    if (ownerId !== user.id) return json({ error: b('invalidRequest') }, 403);
    if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
      return json({ error: b('paymentOpen') }, 409);
    }

    if (session.mode === 'subscription') {
      const subscriptionId = stripeObjectId(session.subscription);
      if (!subscriptionId) return json({ error: b('paymentOpen') }, 409);
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, { expand: ['items.data.price'] });
      await syncStripeSubscription(subscription);
      return json({ confirmed: true, billingOption: session.metadata?.billing_option ?? 'monthly' });
    }

    if (session.mode === 'payment') {
      await syncLifetimeCheckoutSession(session);
      return json({ confirmed: true, billingOption: 'lifetime' });
    }

    return json({ error: b('invalidRequest') }, 403);
  } catch {
    return json({ error: b('paymentOpen') }, 503);
  }
}
