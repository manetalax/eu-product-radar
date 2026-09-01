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
  assert.match(checkout, /if \(stripeHasCurrentSubscription\)/);
});

test('stale local subscription status cannot block re-subscription when Stripe has no current subscription', () => {
  assert.doesNotMatch(checkout, /billingStatus\(record\)/);
  assert.doesNotMatch(checkout, /billingStatus,/);
  const livePreflight = checkout.indexOf('const stripeHasCurrentSubscription = await hasCurrentStripeSubscription');
  const portalBranch = checkout.indexOf('if (stripeHasCurrentSubscription)', livePreflight);
  const priceRead = checkout.indexOf('const expected = UNLIMITED_PRICE_CONFIG[billingOption]', portalBranch);
  assert.ok(livePreflight >= 0 && portalBranch > livePreflight && priceRead > portalBranch);
});

test('Checkout reuses same-option open sessions and expires sibling billing modalities', () => {
  const listIndex = checkout.indexOf('checkout.sessions.list');
  const expireIndex = checkout.indexOf('checkout.sessions.expire');
  const createIndex = checkout.indexOf('checkout.sessions.create');
  assert.ok(listIndex >= 0 && expireIndex > listIndex && createIndex > expireIndex);
  assert.match(checkout, /session\.status !== 'open'/);
  assert.match(checkout, /session\.metadata\?\.billing_option === requestedOption && !reusableUrl && session\.url/);
  assert.match(checkout, /return \{ reusableUrl, generation \}/);
  assert.match(checkout, /trustedReusableUrl/);
});

test('Checkout uses a modality-neutral generation idempotency key to serialize concurrent requests', () => {
  assert.match(checkout, /const checkoutIdempotencyKey = `checkout-\$\{user\.id\}-\$\{generation\}`/);
  const idempotencyUses = checkout.match(/idempotencyKey: checkoutIdempotencyKey/g) ?? [];
  assert.equal(idempotencyUses.length, 2, 'monthly\/annual and Lifetime must share the same generation key');
  assert.doesNotMatch(checkout, /checkout-\$\{user\.id\}-\$\{billingOption\}/);
});

test('Checkout session reconciliation is bounded and owner-scoped', () => {
  assert.match(checkout, /MAX_CHECKOUT_SESSION_SCAN = 500/);
  assert.match(checkout, /scanned > MAX_CHECKOUT_SESSION_SCAN/);
  assert.match(checkout, /session\.metadata\?\.user_id === userId/);
  assert.match(checkout, /session\.metadata\?\.plan_id === UNLIMITED_INTERNAL_PLAN_ID/);
});
