import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../lib/stripe/subscription-sync.ts', import.meta.url), 'utf8');

test('Stripe subscription sync requires a configured price mapping and rejects metadata mismatches', () => {
  const priceIndex = source.indexOf('const pricePlanId = planIdForStripePrice(priceId)');
  const metadataIndex = source.indexOf('const metadataPlanId = isPlanId(subscription.metadata.plan_id)');
  const unknownPriceIndex = source.indexOf("if (!pricePlanId) throw new Error('unrecognized_subscription_price')");
  const mismatchIndex = source.indexOf("throw new Error('subscription_plan_price_mismatch')");
  const resolvedIndex = source.indexOf('const planId = pricePlanId');
  assert.ok(priceIndex >= 0 && metadataIndex > priceIndex && unknownPriceIndex > metadataIndex && mismatchIndex > unknownPriceIndex && resolvedIndex > mismatchIndex);
  assert.doesNotMatch(source, /pricePlanId \?\? metadataPlanId/);
  assert.doesNotMatch(source, /const planId = isPlanId\(subscription\.metadata\.plan_id\) \? subscription\.metadata\.plan_id : planIdForStripePrice/);
});

test('Stripe subscription sync fails closed unless exactly one subscription item exists', () => {
  const itemGuard = source.indexOf("if (subscription.items.data.length !== 1) throw new Error('unexpected_subscription_items')");
  const priceRead = source.indexOf('const priceId = subscription.items.data[0]?.price.id ?? null');
  assert.ok(itemGuard >= 0 && priceRead > itemGuard);
  assert.doesNotMatch(source, /Math\.max\(\.\.\.ends\)/);
});

test('persisted Stripe customer ownership is authoritative over mutable subscription metadata', () => {
  const customerLookup = source.indexOf(".eq('stripe_customer_id', customerId)");
  const existingUser = source.indexOf('const existingUserId = existingCustomer?.user_id ?? null');
  const missingOwner = source.indexOf("if (!existingUserId) throw new Error('unrecognized_subscription_identity')");
  const mismatch = source.indexOf("throw new Error('subscription_customer_user_mismatch')");
  const resolved = source.indexOf('const userId = existingUserId');
  assert.ok(customerLookup >= 0 && existingUser > customerLookup && missingOwner > existingUser && mismatch > missingOwner && resolved > mismatch);
  assert.doesNotMatch(source, /existingUserId \?\? metadataUserId/);
  assert.doesNotMatch(source, /let userId = subscription\.metadata\.user_id/);
});
