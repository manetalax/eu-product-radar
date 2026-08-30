import test from 'node:test';
import assert from 'node:assert/strict';
import { billingStatus, planIdForStripePrice, stripePriceId } from '../lib/billing';

test('solo una suscripción activa y vigente concede la cuota pagada', () => {
  const now = new Date('2026-08-30T12:00:00Z');
  assert.equal(billingStatus({ plan_id: 'pro', status: 'active', current_period_end: '2026-09-30T12:00:00Z' }, now).productLimit, 500);
  assert.equal(billingStatus({ plan_id: 'pro', status: 'canceled', current_period_end: '2026-09-30T12:00:00Z' }, now).productLimit, 5);
  assert.equal(billingStatus({ plan_id: 'pro', status: 'active', current_period_end: '2026-08-01T00:00:00Z' }, now).planId, 'free');
});

test('los precios Stripe se validan y se relacionan con su plan', () => {
  const old = process.env.STRIPE_PRICE_STARTER;
  process.env.STRIPE_PRICE_STARTER = 'price_starter123';
  try {
    assert.equal(stripePriceId('starter'), 'price_starter123');
    assert.equal(planIdForStripePrice('price_starter123'), 'starter');
  } finally {
    if (old === undefined) delete process.env.STRIPE_PRICE_STARTER;
    else process.env.STRIPE_PRICE_STARTER = old;
  }
});
