import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../app/api/billing/webhook/route.ts', import.meta.url), 'utf8');

test('subscription webhooks re-read current Stripe state before persisting entitlement', () => {
  assert.match(source, /async function retrieveLatestSubscription\(subscriptionId: string\)/);
  assert.match(source, /stripeClient\(\)\.subscriptions\.retrieve\(subscriptionId, \{ expand: \['items\.data\.price'\] \}\)/);
  const eventBranch = source.indexOf("event.type === 'customer.subscription.created'");
  const snapshotRead = source.indexOf('const snapshot = event.data.object as Stripe.Subscription', eventBranch);
  const latestSync = source.indexOf('syncStripeSubscription(await retrieveLatestSubscription(snapshot.id))', snapshotRead);
  assert.ok(eventBranch >= 0 && snapshotRead > eventBranch && latestSync > snapshotRead);
  assert.doesNotMatch(source, /syncStripeSubscription\(event\.data\.object as Stripe\.Subscription\)/);
});
