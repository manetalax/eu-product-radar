import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const lifetime = readFileSync(new URL('../lib/stripe/lifetime-entitlement.ts', import.meta.url), 'utf8');
const checkout = readFileSync(new URL('../app/api/billing/checkout/route.ts', import.meta.url), 'utf8');
const confirm = readFileSync(new URL('../app/api/billing/confirm/route.ts', import.meta.url), 'utf8');
const webhook = readFileSync(new URL('../app/api/billing/webhook/route.ts', import.meta.url), 'utf8');

test('Permanent paid entitlement requires a paid Checkout with a payment intent', () => {
  assert.match(lifetime, /session\.payment_status === 'paid'/);
  assert.doesNotMatch(lifetime, /payment_status === 'no_payment_required'/);
  assert.match(lifetime, /if \(!paymentIntentId\) throw new Error\('unrecognized_permanent_payment'\)/);
});

test('Lifetime webhook only grants paid one-time Checkout sessions', () => {
  assert.match(webhook, /session\.mode === 'payment' && session\.payment_status === 'paid'/);
  assert.doesNotMatch(webhook, /payment_status === 'no_payment_required'/);
});

test('Lifetime checkout cannot use promotion codes while recurring Unlimited can', () => {
  const promotionFlags = checkout.match(/allow_promotion_codes: (true|false)/g) ?? [];
  assert.deepEqual(promotionFlags, ['allow_promotion_codes: true', 'allow_promotion_codes: false']);
});

test('a revoked Lifetime payment cannot be resurrected by Checkout replay or confirmation', () => {
  assert.match(lifetime, /samePayment && existingEntitlement\?\.status === 'revoked'\) return false/);
  assert.match(lifetime, /stripe_checkout_session_id,stripe_payment_intent_id,status/);
  assert.match(confirm, /const granted = await syncLifetimeCheckoutSession\(session\)/);
  assert.match(confirm, /if \(!granted\) return json\(\{ error: b\('paymentOpen'\) \}, 409\)/);
});

test('a stale different Lifetime payment cannot replace an already active purchase identity', () => {
  assert.match(lifetime, /existingEntitlement\?\.status === 'active' && !samePayment\) return false/);
  assert.match(lifetime, /older\/delayed Checkout must never overwrite its payment identity/);
});

test('Lifetime browser confirmation requires paid status while subscriptions may have no-payment-required states', () => {
  assert.match(confirm, /session\.mode === 'payment'[\s\S]*session\.payment_status !== 'paid'[\s\S]*409/);
  assert.match(confirm, /session\.mode === 'subscription'[\s\S]*session\.payment_status !== 'paid' && session\.payment_status !== 'no_payment_required'/);
});

test('Lifetime access is suspended for disputes and only restored after a won non-refunded charge', () => {
  assert.match(webhook, /event\.type === 'charge\.dispute\.created'/);
  assert.match(webhook, /event\.type === 'charge\.dispute\.closed'/);
  assert.match(webhook, /dispute\.status === 'won'/);
  assert.match(webhook, /retrieveLatestCharge\(dispute\.charge\)/);
  assert.match(lifetime, /suspendLifetimeEntitlementForDisputedCharge/);
  assert.match(lifetime, /restoreLifetimeEntitlementForWonDispute/);
  assert.match(lifetime, /if \(charge\.refunded \|\| charge\.amount_refunded >= charge\.amount\) return false/);
});
