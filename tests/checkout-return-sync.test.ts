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
  const subscriptionSyncIndex = confirm.indexOf('syncStripeSubscription(subscription)', ownerIndex);
  const lifetimeSyncIndex = confirm.indexOf('syncLifetimeCheckoutSession(session)', ownerIndex);
  assert.ok(originIndex >= 0 && authIndex > originIndex && bodyIndex > authIndex && ownerIndex > bodyIndex);
  assert.ok(subscriptionSyncIndex > ownerIndex && lifetimeSyncIndex > ownerIndex);
  assert.match(confirm, /session\.mode === 'subscription'/);
  assert.match(confirm, /session\.mode === 'payment'/);
  assert.match(confirm, /session\.payment_status !== 'paid'/);
});

test('subscription browser confirmation is positive only after Stripe grants recurring Unlimited', () => {
  const syncIndex = confirm.indexOf('await syncStripeSubscription(subscription)');
  const statusIndex = confirm.indexOf('CONFIRMED_SUBSCRIPTION_STATUSES.has(subscription.status)');
  const priceIndex = confirm.indexOf('billingOptionForStripePrice(priceId)');
  const confirmedIndex = confirm.indexOf('return json({ confirmed: true, billingOption });');
  assert.ok(syncIndex >= 0 && statusIndex > syncIndex && priceIndex > statusIndex && confirmedIndex > priceIndex);
  assert.match(confirm, /new Set\(\['active', 'trialing'\]\)/);
  assert.match(confirm, /if \(!CONFIRMED_SUBSCRIPTION_STATUSES\.has\(subscription\.status\)\)/);
  assert.match(confirm, /paymentOpen'\) \}, 409/);
});

test('confirmed recurring cadence comes from the authoritative Stripe price, not Checkout metadata', () => {
  assert.match(confirm, /billingOptionForStripePrice\(priceId\)/);
  assert.match(confirm, /billingOption !== 'monthly' && billingOption !== 'annual'/);
  assert.doesNotMatch(confirm, /billingOption: session\.metadata\?\.billing_option/);
});

test('webhook and synchronous checkout confirmation share entitlement synchronizers', () => {
  assert.match(webhook, /syncStripeSubscription/);
  assert.match(confirm, /syncStripeSubscription/);
  assert.match(webhook, /syncLifetimeCheckoutSession/);
  assert.match(confirm, /syncLifetimeCheckoutSession/);
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
