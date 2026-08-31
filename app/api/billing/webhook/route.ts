import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { isPlanId, ONE_TIME_AUDIT, PLANS_BY_ID } from '@/lib/plans';
import { planIdForStripePrice } from '@/lib/billing';
import { readTextBody } from '@/lib/http';
import { stripeClient } from '@/lib/stripe/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
const STRIPE_WEBHOOK_MAX_BYTES = 1024 * 1024;

function id(value: string | { id: string } | null): string | null {
  return typeof value === 'string' ? value : value?.id ?? null;
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const admin = createAdminClient();
  const customerId = id(subscription.customer);
  const priceId = subscription.items.data[0]?.price.id ?? null;
  let userId = subscription.metadata.user_id;
  if (!userId && customerId) {
    const { data } = await admin.from('subscriptions').select('user_id').eq('stripe_customer_id', customerId).maybeSingle();
    userId = data?.user_id;
  }
  const planId = isPlanId(subscription.metadata.plan_id) ? subscription.metadata.plan_id : planIdForStripePrice(priceId);
  if (!userId || !planId || !customerId) throw new Error('La suscripción no contiene una cuenta y un plan reconocibles.');
  const ends = subscription.items.data.map(item => item.current_period_end).filter(Number.isFinite);
  const periodEnd = ends.length ? new Date(Math.max(...ends) * 1000).toISOString() : null;
  const { error } = await admin.from('subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    plan_id: planId,
    status: subscription.status,
    product_limit: PLANS_BY_ID[planId].monthlyProductLimit,
    current_period_end: periodEnd,
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (error) {
    if (subscription.status === 'canceled' && error.code === '23503') return;
    throw error;
  }
}

async function syncAudit(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id || session.client_reference_id;
  if (!userId || session.metadata?.purchase_type !== 'audit') throw new Error('El pago único no contiene una cuenta reconocible.');
  if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') return;
  const admin = createAdminClient();
  const paymentIntentId = id(session.payment_intent);
  const { error } = await admin.from('one_time_audits').upsert({
    user_id: userId,
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: paymentIntentId,
    status: 'paid',
    product_limit: ONE_TIME_AUDIT.productLimit,
    purchased_at: new Date().toISOString(),
  }, { onConflict: 'stripe_checkout_session_id' });
  if (error) throw error;
}

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret?.startsWith('whsec_')) return NextResponse.json({ error: 'Webhook de Stripe no configurado.' }, { status: 503 });
  let event: Stripe.Event;
  try {
    const rawBody = await readTextBody(request, STRIPE_WEBHOOK_MAX_BYTES);
    event = stripeClient().webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return NextResponse.json({ error: 'Firma de Stripe no válida o contenido excesivo.' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error: eventError } = await admin.from('stripe_webhook_events').insert({ event_id: event.id, event_type: event.type });
  if (eventError?.code === '23505') return NextResponse.json({ received: true, duplicate: true });
  if (eventError) return NextResponse.json({ error: 'No se ha podido registrar el evento.' }, { status: 503 });

  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.purchase_type === 'audit') {
        await syncAudit(session);
      } else {
        const subscriptionId = id(session.subscription);
        if (subscriptionId) await syncSubscription(await stripeClient().subscriptions.retrieve(subscriptionId, { expand: ['items.data.price'] }));
      }
    } else if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      await syncSubscription(event.data.object as Stripe.Subscription);
    }
    return NextResponse.json({ received: true });
  } catch {
    await admin.from('stripe_webhook_events').delete().eq('event_id', event.id);
    return NextResponse.json({ error: 'No se ha podido aplicar el evento.' }, { status: 503 });
  }
}
