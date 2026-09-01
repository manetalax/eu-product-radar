import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { readTextBody } from '@/lib/http';
import {
  restoreLifetimeEntitlementForWonDispute,
  revokeLifetimeEntitlementForFullyRefundedCharge,
  suspendLifetimeEntitlementForDisputedCharge,
  syncLifetimeCheckoutSession,
} from '@/lib/stripe/lifetime-entitlement';
import { stripeClient } from '@/lib/stripe/server';
import { stripeObjectId, syncStripeSubscription } from '@/lib/stripe/subscription-sync';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
const STRIPE_WEBHOOK_MAX_BYTES = 1024 * 1024;
const STRIPE_WEBHOOK_PROCESSING_STALE_MS = 5 * 60 * 1000;

async function retrieveLatestSubscription(subscriptionId: string) {
  return stripeClient().subscriptions.retrieve(subscriptionId, { expand: ['items.data.price'] });
}

async function retrieveCheckoutSession(sessionId: string) {
  return stripeClient().checkout.sessions.retrieve(sessionId, { expand: ['line_items.data.price'] });
}

async function retrieveLatestCharge(charge: string | Stripe.Charge | null) {
  const chargeId = stripeObjectId(charge);
  if (!chargeId) throw new Error('unrecognized_dispute_charge');
  return stripeClient().charges.retrieve(chargeId);
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

  // Production entitlements must only originate from Stripe live-mode events. A valid
  // test-mode signing secret must never be able to create production value.
  if (process.env.NODE_ENV === 'production' && event.livemode !== true) {
    return NextResponse.json({ error: 'Evento de Stripe no válido para producción.' }, { status: 400 });
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
      .select('status,updated_at')
      .eq('event_id', event.id)
      .maybeSingle();
    if (existingError || !existing) return NextResponse.json({ error: 'No se ha podido comprobar el evento.' }, { status: 503 });
    if (existing.status === 'processed') return NextResponse.json({ received: true, duplicate: true });

    // Do not execute the same Stripe event concurrently. A recent `processing` row
    // belongs to another in-flight delivery and can be acknowledged as a duplicate.
    // A genuinely stuck row may be reclaimed after the stale window. The conditional
    // UPDATE is the claim: only one concurrent retry can move updated_at forward.
    const staleBefore = new Date(Date.now() - STRIPE_WEBHOOK_PROCESSING_STALE_MS).toISOString();
    const existingUpdatedAt = Date.parse(existing.updated_at);
    if (!Number.isFinite(existingUpdatedAt) || existingUpdatedAt > Date.now() - STRIPE_WEBHOOK_PROCESSING_STALE_MS) {
      return NextResponse.json({ received: true, duplicate: true, processing: true });
    }
    const { data: claimed, error: claimError } = await admin
      .from('stripe_webhook_events')
      .update({ updated_at: startedAt })
      .eq('event_id', event.id)
      .eq('status', 'processing')
      .lt('updated_at', staleBefore)
      .select('event_id')
      .maybeSingle();
    if (claimError) return NextResponse.json({ error: 'No se ha podido reclamar el evento.' }, { status: 503 });
    if (!claimed) return NextResponse.json({ received: true, duplicate: true, processing: true });
  } else if (eventError) {
    return NextResponse.json({ error: 'No se ha podido registrar el evento.' }, { status: 503 });
  }

  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const snapshot = event.data.object as Stripe.Checkout.Session;
      const session = await retrieveCheckoutSession(snapshot.id);
      if (session.mode === 'subscription') {
        const subscriptionId = stripeObjectId(session.subscription);
        if (subscriptionId) await syncStripeSubscription(await retrieveLatestSubscription(subscriptionId));
      } else if (session.mode === 'payment' && session.payment_status === 'paid') {
        await syncLifetimeCheckoutSession(session);
      }
    } else if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const snapshot = event.data.object as Stripe.Subscription;
      await syncStripeSubscription(await retrieveLatestSubscription(snapshot.id));
    } else if (event.type === 'charge.refunded') {
      await revokeLifetimeEntitlementForFullyRefundedCharge(event.data.object as Stripe.Charge);
    } else if (event.type === 'charge.dispute.created') {
      const dispute = event.data.object as Stripe.Dispute;
      await suspendLifetimeEntitlementForDisputedCharge(await retrieveLatestCharge(dispute.charge));
    } else if (event.type === 'charge.dispute.closed') {
      const dispute = event.data.object as Stripe.Dispute;
      const charge = await retrieveLatestCharge(dispute.charge);
      if (dispute.status === 'won') {
        await restoreLifetimeEntitlementForWonDispute(charge);
      } else {
        await suspendLifetimeEntitlementForDisputedCharge(charge);
      }
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