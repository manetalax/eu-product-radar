import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../lib/stripe/subscription-sync.ts', import.meta.url), 'utf8');

test('Stripe subscription sync treats price mapping as authoritative and rejects metadata mismatches', () => {
  const priceIndex = source.indexOf('const pricePlanId = planIdForStripePrice(priceId)');
  const metadataIndex = source.indexOf('const metadataPlanId = isPlanId(subscription.metadata.plan_id)');
  const mismatchIndex = source.indexOf("throw new Error('subscription_plan_price_mismatch')");
  const resolvedIndex = source.indexOf('const planId = pricePlanId ?? metadataPlanId');
  assert.ok(priceIndex >= 0 && metadataIndex > priceIndex && mismatchIndex > metadataIndex && resolvedIndex > mismatchIndex);
  assert.doesNotMatch(source, /const planId = isPlanId\(subscription\.metadata\.plan_id\) \? subscription\.metadata\.plan_id : planIdForStripePrice/);
});

test('Stripe subscription sync fails closed unless exactly one subscription item exists', () => {
  const itemGuard = source.indexOf("if (subscription.items.data.length !== 1) throw new Error('unexpected_subscription_items')");
  const priceRead = source.indexOf('const priceId = subscription.items.data[0]?.price.id ?? null');
  assert.ok(itemGuard >= 0 && priceRead > itemGuard);
  assert.doesNotMatch(source, /Math\.max\(\.\.\.ends\)/);
});
