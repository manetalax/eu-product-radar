import test from 'node:test';
import assert from 'node:assert/strict';
import { billingStatus, IMPORTVERIFIER_UNLIMITED_PRICE_ID, planIdForStripePrice, stripePriceId } from '../lib/billing';

test('solo una suscripción activa y vigente concede la cuota pagada', () => {
  const now = new Date('2026-08-30T12:00:00Z');
  assert.equal(billingStatus({ plan_id: 'pro', status: 'active', current_period_end: '2026-09-30T12:00:00Z' }, now).productLimit, 500);
  assert.equal(billingStatus({ plan_id: 'pro', status: 'canceled', current_period_end: '2026-09-30T12:00:00Z' }, now).productLimit, 5);
  assert.equal(billingStatus({ plan_id: 'pro', status: 'active', current_period_end: '2026-08-01T00:00:00Z' }, now).planId, 'free');
});

test('los precios Stripe se validan y se relacionan con su plan fuera de producción', () => {
  const oldPrice = process.env.STRIPE_PRICE_STARTER;
  process.env.STRIPE_PRICE_STARTER = 'price_starter123';
  try {
    assert.equal(stripePriceId('starter', false), 'price_starter123');
    assert.equal(planIdForStripePrice('price_starter123', false), 'starter');
  } finally {
    if (oldPrice === undefined) delete process.env.STRIPE_PRICE_STARTER;
    else process.env.STRIPE_PRICE_STARTER = oldPrice;
  }
});

test('producción fija Unlimited al price live canónico y rechaza un mapeo derivado', () => {
  const oldPrice = process.env.STRIPE_PRICE_STARTER;
  process.env.STRIPE_PRICE_STARTER = 'price_wrong';
  try {
    assert.equal(stripePriceId('starter', true), IMPORTVERIFIER_UNLIMITED_PRICE_ID);
    assert.equal(planIdForStripePrice(IMPORTVERIFIER_UNLIMITED_PRICE_ID, true), 'starter');
    assert.equal(planIdForStripePrice('price_wrong', true), null);
  } finally {
    if (oldPrice === undefined) delete process.env.STRIPE_PRICE_STARTER;
    else process.env.STRIPE_PRICE_STARTER = oldPrice;
  }
});
