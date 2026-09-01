import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const checkout = readFileSync(new URL('../app/api/billing/checkout/route.ts', import.meta.url), 'utf8');

test('Checkout rereads all current Stripe subscriptions before creating new recurring value', () => {
  const listIndex = checkout.indexOf('subscriptions.list');
  const createIndex = checkout.indexOf('checkout.sessions.create');
  assert.ok(listIndex >= 0, 'falta preflight directo contra Stripe');
  assert.ok(createIndex > listIndex, 'el preflight debe ejecutarse antes de crear Checkout');
  assert.match(checkout, /customer: customerId/);
  assert.match(checkout, /status: 'all'/);
  assert.match(checkout, /limit: 100/);
  assert.match(checkout, /page\.has_more/);
});

test('Checkout cancels abandoned incomplete subscriptions but preserves other current subscriptions', () => {
  assert.match(checkout, /subscription\.status === 'incomplete'/);
  assert.match(checkout, /await stripe\.subscriptions\.cancel\(subscription\.id\)/);
  assert.match(checkout, /TERMINAL_SUBSCRIPTION_STATUSES/);
  assert.match(checkout, /stripeHasCurrentSubscription/);
  assert.match(checkout, /billingStatus\(record\)\.planId !== 'free' \|\| stripeHasCurrentSubscription/);
});
