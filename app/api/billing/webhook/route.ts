import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { ONE_TIME_AUDIT } from '@/lib/plans';
import { readTextBody } from '@/lib/http';
import { stripeClient } from '@/lib/stripe/server';
import { stripeObjectId, syncStripeSubscription } from '@/lib/stripe/subscription-sync';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
const STRIPE_WEBHOOK_MAX_BYTES = 1024 * 1024;

async function syncAudit(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id || session.client_reference_id;
  if (!userId || session.metadata?.purchase_type !== 'audit') throw new Error('El pago único no contiene una cuenta reconocible.');
  if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') return;
  const admin = createAdminClient();
  const paymentIntentId = stripeObjectId(session.payment_intent);
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
  const startedAt = new Date().toISOString();
  const { error: eventError } = await admin.from('stripe_webhook_events').insert({
    event_id: event.id,
    event_type: event.type,
    status: 'processing',
    processed_at: null,
    updated_at: startedAt,
  });
  if (eventError?.code === '23505') {
    const { data: existing, error: existingError } = await admin
      .from('stripe_webhook_events')
      .select('status')
      .eq('event_id', event.id)
      .maybeSingle();
    if (existingError) return NextResponse.json({ error: 'No se ha podido comprobar el evento.' }, { status: 503 });
    if (existing?.status === 'processed') return NextResponse.json({ received: true, duplicate: true });
  } else if (eventError) {
    return NextResponse.json({ error: 'No se ha podido registrar el evento.' }, { status: 503 });
  }

  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.purchase_type === 'audit') {
        await syncAudit(session);
      } else {
        const subscriptionId = stripeObjectId(session.subscription);
        if (subscriptionId) await syncStripeSubscription(await stripeClient().subscriptions.retrieve(subscriptionId, { expand: ['items.data.price'] }));
      }
    } else if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      await syncStripeSubscription(event.data.object as Stripe.Subscription);
    }

    const completedAt = new Date().toISOString();
    const { error: markError } = await admin.from('stripe_webhook_events').update({
      status: 'processed',
      processed_at: completedAt,
      updated_at: completedAt,
    }).eq('event_id', event.id);
    if (markError) throw markError;
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: 'No se ha podido aplicar el evento.' }, { status: 503 });
  }
}
