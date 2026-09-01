import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const portal = readFileSync(new URL('../app/api/billing/portal/route.ts', import.meta.url), 'utf8');

test('Billing Portal requires a manageable recurring Stripe subscription, not merely a customer id', () => {
  assert.match(portal, /stripe\.subscriptions\.list\(/);
  assert.match(portal, /status: 'all'/);
  assert.match(portal, /MANAGEABLE_SUBSCRIPTION_STATUSES/);
  assert.match(portal, /'active', 'trialing', 'past_due', 'unpaid', 'paused'/);
  assert.doesNotMatch(portal, /MANAGEABLE_SUBSCRIPTION_STATUSES = new Set\([^\n]*'incomplete'/);
  assert.match(portal, /if \(!await hasManageableSubscription\(data\.stripe_customer_id\)\)/);
  assert.match(portal, /return json\(\{ error: b\('noSubscription'\) \}, 404\)/);
});

test('Billing Portal current-state scan is bounded and paginated', () => {
  assert.match(portal, /MAX_SUBSCRIPTION_SCAN = 500/);
  assert.match(portal, /limit: 100/);
  assert.match(portal, /starting_after: startingAfter/);
  assert.match(portal, /scanned > MAX_SUBSCRIPTION_SCAN/);
});
