import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const lifetime = readFileSync(new URL('../lib/stripe/lifetime-entitlement.ts', import.meta.url), 'utf8');
const checkout = readFileSync(new URL('../app/api/billing/checkout/route.ts', import.meta.url), 'utf8');

test('Lifetime entitlement requires a paid Checkout with a payment intent', () => {
  assert.match(lifetime, /session\.payment_status === 'paid'/);
  assert.doesNotMatch(lifetime, /payment_status === 'no_payment_required'/);
  assert.match(lifetime, /if \(!paymentIntentId\) throw new Error\('unrecognized_lifetime_payment'\)/);
});

test('Lifetime checkout cannot use promotion codes while recurring Unlimited can', () => {
  const promotionFlags = checkout.match(/allow_promotion_codes: (true|false)/g) ?? [];
  assert.deepEqual(promotionFlags, ['allow_promotion_codes: true', 'allow_promotion_codes: false']);
});
