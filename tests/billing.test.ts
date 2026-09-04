import test from 'node:test';
import assert from 'node:assert/strict';
import {
  billingOptionForStripePrice,
  billingOptionIncludesAi,
  billingStatus,
  IMPORTVERIFIER_PERSONALIZED_PRICE_ID,
  IMPORTVERIFIER_UNLIMITED_ANNUAL_PRICE_ID,
  IMPORTVERIFIER_UNLIMITED_LIFETIME_PRICE_ID,
  IMPORTVERIFIER_UNLIMITED_PRICE_ID,
  planIdForStripePrice,
  stripePriceId,
  stripePriceIdForBillingOption,
  unlimitedBillingStatus,
} from '../lib/billing';
import { UNLIMITED_FAIR_USE_CEILING } from '../lib/plans';

test('una suscripción activa y vigente concede entitlement Unlimited', () => {
  const now = new Date('2026-08-30T12:00:00Z');
  const legacyActive = billingStatus({ plan_id: 'pro', status: 'active', current_period_end: '2026-09-30T12:00:00Z' }, now);
  assert.equal(legacyActive.planId, 'starter');
  assert.equal(legacyActive.planName, 'Unlimited');
  assert.equal(legacyActive.productLimit, UNLIMITED_FAIR_USE_CEILING);
  assert.equal(legacyActive.billingOption, null);
  assert.equal(billingStatus({ plan_id: 'pro', status: 'canceled', current_period_end: '2026-09-30T12:00:00Z' }, now).productLimit, 5);
  assert.equal(billingStatus({ plan_id: 'pro', status: 'active', current_period_end: '2026-08-01T00:00:00Z' }, now).planId, 'free');
});

test('suscripciones canónicas conservan mensual o anual en el estado público', () => {
  const now = new Date('2026-08-30T12:00:00Z');
  assert.equal(billingStatus({ plan_id: 'starter', status: 'active', current_period_end: '2026-09-30T12:00:00Z', stripe_price_id: IMPORTVERIFIER_UNLIMITED_PRICE_ID }, now).billingOption, 'monthly');
  assert.equal(billingStatus({ plan_id: 'starter', status: 'active', current_period_end: '2027-08-30T12:00:00Z', stripe_price_id: IMPORTVERIFIER_UNLIMITED_ANNUAL_PRICE_ID }, now).billingOption, 'annual');
});

test('Lifetime activo concede Unlimited sin fecha de caducidad', () => {
  const lifetime = unlimitedBillingStatus('lifetime');
  assert.equal(lifetime.planId, 'starter');
  assert.equal(lifetime.status, 'lifetime');
  assert.equal(lifetime.productLimit, UNLIMITED_FAIR_USE_CEILING);
  assert.equal(lifetime.currentPeriodEnd, null);
  assert.equal(lifetime.cancelAtPeriodEnd, false);
  assert.equal(lifetime.billingOption, 'lifetime');
});

test('la IA solo se incluye desde Anual y también en Lifetime/Personalizada', () => {
  assert.equal(billingOptionIncludesAi('monthly'), false);
  assert.equal(billingOptionIncludesAi('annual'), true);
  assert.equal(billingOptionIncludesAi('lifetime'), true);
  assert.equal(billingOptionIncludesAi('custom'), true);
  assert.equal(billingOptionIncludesAi(null), false);
});

test('los precios Stripe se validan y se relacionan con Unlimited fuera de producción', () => {
  const oldMonthly = process.env.STRIPE_PRICE_STARTER;
  const oldAnnual = process.env.STRIPE_PRICE_ANNUAL;
  const oldLifetime = process.env.STRIPE_PRICE_LIFETIME;
  const oldCustom = process.env.STRIPE_PRICE_CUSTOM;
  process.env.STRIPE_PRICE_STARTER = 'price_monthly123';
  process.env.STRIPE_PRICE_ANNUAL = 'price_annual123';
  process.env.STRIPE_PRICE_LIFETIME = 'price_lifetime123';
  process.env.STRIPE_PRICE_CUSTOM = 'price_custom123';
  try {
    assert.equal(stripePriceId('starter', false), 'price_monthly123');
    assert.equal(stripePriceIdForBillingOption('annual', false), 'price_annual123');
    assert.equal(stripePriceIdForBillingOption('lifetime', false), 'price_lifetime123');
    assert.equal(stripePriceIdForBillingOption('custom', false), 'price_custom123');
    assert.equal(planIdForStripePrice('price_annual123', false), 'starter');
    assert.equal(planIdForStripePrice('price_custom123', false), 'starter');
    assert.equal(billingOptionForStripePrice('price_lifetime123', false), 'lifetime');
    assert.equal(billingOptionForStripePrice('price_custom123', false), 'custom');
  } finally {
    if (oldMonthly === undefined) delete process.env.STRIPE_PRICE_STARTER; else process.env.STRIPE_PRICE_STARTER = oldMonthly;
    if (oldAnnual === undefined) delete process.env.STRIPE_PRICE_ANNUAL; else process.env.STRIPE_PRICE_ANNUAL = oldAnnual;
    if (oldLifetime === undefined) delete process.env.STRIPE_PRICE_LIFETIME; else process.env.STRIPE_PRICE_LIFETIME = oldLifetime;
    if (oldCustom === undefined) delete process.env.STRIPE_PRICE_CUSTOM; else process.env.STRIPE_PRICE_CUSTOM = oldCustom;
  }
});

test('producción fija las cuatro opciones de checkout a los prices live canónicos', () => {
  assert.equal(stripePriceIdForBillingOption('monthly', true), IMPORTVERIFIER_UNLIMITED_PRICE_ID);
  assert.equal(stripePriceIdForBillingOption('annual', true), IMPORTVERIFIER_UNLIMITED_ANNUAL_PRICE_ID);
  assert.equal(stripePriceIdForBillingOption('lifetime', true), IMPORTVERIFIER_UNLIMITED_LIFETIME_PRICE_ID);
  assert.equal(stripePriceIdForBillingOption('custom', true), IMPORTVERIFIER_PERSONALIZED_PRICE_ID);
  assert.equal(planIdForStripePrice(IMPORTVERIFIER_UNLIMITED_ANNUAL_PRICE_ID, true), 'starter');
  assert.equal(planIdForStripePrice(IMPORTVERIFIER_UNLIMITED_LIFETIME_PRICE_ID, true), 'starter');
  assert.equal(planIdForStripePrice(IMPORTVERIFIER_PERSONALIZED_PRICE_ID, true), 'starter');
  assert.equal(billingOptionForStripePrice(IMPORTVERIFIER_UNLIMITED_PRICE_ID, true), 'monthly');
  assert.equal(billingOptionForStripePrice(IMPORTVERIFIER_PERSONALIZED_PRICE_ID, true), 'custom');
  assert.equal(billingOptionForStripePrice('price_wrong', true), null);
});
