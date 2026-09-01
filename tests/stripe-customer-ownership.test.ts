import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sync = readFileSync(new URL('../lib/stripe/subscription-sync.ts', import.meta.url), 'utf8');

test('subscription sync requires persisted Stripe customer ownership', () => {
  assert.match(sync, /\.eq\('stripe_customer_id', customerId\)/);
  assert.match(sync, /if \(!existingUserId\) throw new Error\('unrecognized_subscription_identity'\)/);
  assert.match(sync, /if \(metadataUserId && existingUserId !== metadataUserId\) throw new Error\('subscription_customer_user_mismatch'\)/);
  assert.doesNotMatch(sync, /existingUserId \?\? metadataUserId/);
});

test('subscription metadata remains correlation data rather than an ownership fallback', () => {
  const ownershipCheck = sync.indexOf("if (!existingUserId) throw new Error('unrecognized_subscription_identity')");
  const metadataMismatch = sync.indexOf("if (metadataUserId && existingUserId !== metadataUserId)");
  const upsert = sync.indexOf("admin.from('subscriptions').upsert");
  assert.ok(ownershipCheck >= 0 && metadataMismatch > ownershipCheck && upsert > metadataMismatch);
});
