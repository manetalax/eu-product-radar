import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const checkout = readFileSync(new URL('../app/api/billing/checkout/route.ts', import.meta.url), 'utf8');
const confirm = readFileSync(new URL('../app/api/billing/confirm/route.ts', import.meta.url), 'utf8');
const webhook = readFileSync(new URL('../app/api/billing/webhook/route.ts', import.meta.url), 'utf8');
const returnSync = readFileSync(new URL('../components/CheckoutReturnSync.tsx', import.meta.url), 'utf8');
const dashboardPage = readFileSync(new URL('../app/dashboard/page.tsx', import.meta.url), 'utf8');
const proxy = readFileSync(new URL('../proxy.ts', import.meta.url), 'utf8');

test('Stripe success return includes the canonical Checkout Session placeholder', () => {
  assert.match(checkout, /checkout=success&session_id=\{CHECKOUT_SESSION_ID\}/);
});

test('checkout confirmation validates origin, authentication and session ownership before syncing', () => {
  const originIndex = confirm.indexOf('if (!sameOrigin(request))');
  const authIndex = confirm.indexOf('await supabase.auth.getUser()');
  const bodyIndex = confirm.indexOf('await readJsonBody(request)');
  const ownerIndex = confirm.indexOf('ownerId !== user.id');
  const syncIndex = confirm.indexOf('syncStripeSubscription(subscription)');
  assert.ok(originIndex >= 0 && authIndex > originIndex && bodyIndex > authIndex && ownerIndex > bodyIndex && syncIndex > ownerIndex);
  assert.match(confirm, /session\.mode !== 'subscription'/);
  assert.match(confirm, /payment_status !== 'paid'/);
});

test('webhook and synchronous checkout confirmation share one entitlement synchronizer', () => {
  assert.match(webhook, /syncStripeSubscription/);
  assert.match(confirm, /syncStripeSubscription/);
  assert.doesNotMatch(webhook, /async function syncSubscription/);
});

test('checkout confirmation is covered by Supabase session-refresh proxy', () => {
  assert.match(proxy, /'\/api\/billing\/confirm'/);
});

test('dashboard return sync confirms once, reloads with synced marker and cleans URL parameters', () => {
  assert.match(dashboardPage, /<CheckoutReturnSync/);
  assert.match(returnSync, /fetch\('\/api\/billing\/confirm'/);
  assert.match(returnSync, /window\.location\.replace\('\/dashboard\?checkout=success&synced=1'\)/);
  assert.match(returnSync, /url\.searchParams\.delete\('checkout'\)/);
  assert.match(returnSync, /url\.searchParams\.delete\('session_id'\)/);
  assert.match(returnSync, /checkout !== 'success' \|\| !sessionId \|\| synced/);
});
