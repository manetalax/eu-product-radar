import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const migration = readFileSync(new URL('../supabase/migrations/202609010001_unlimited_lifetime_entitlement.sql', import.meta.url), 'utf8');
const sync = readFileSync(new URL('../lib/stripe/lifetime-entitlement.ts', import.meta.url), 'utf8');
const webhook = readFileSync(new URL('../app/api/billing/webhook/route.ts', import.meta.url), 'utf8');
const analyses = readFileSync(new URL('../app/api/analyses/route.ts', import.meta.url), 'utf8');

test('Lifetime entitlement is separate, private and can bypass only the free-product trigger when active', () => {
  assert.match(migration, /create table if not exists public\.unlimited_lifetime_entitlements/);
  assert.match(migration, /user_id uuid primary key references auth\.users\(id\) on delete cascade/);
  assert.match(migration, /status text not null default 'active' check \(status in \('active','revoked'\)\)/);
  assert.match(migration, /alter table public\.unlimited_lifetime_entitlements force row level security/);
  assert.match(migration, /revoke all on public\.unlimited_lifetime_entitlements from public, anon, authenticated/);
  assert.match(migration, /using \(\(select auth\.uid\(\)\) = user_id\)/);
  assert.match(migration, /from public\.unlimited_lifetime_entitlements e[\s\S]*e\.status = 'active'/);
  assert.doesNotMatch(migration, /one_time_audits|audit/i);
});

test('Lifetime grant trusts Stripe price, settled state and persisted customer ownership', () => {
  assert.match(sync, /session\.mode !== 'payment'/);
  assert.match(sync, /payment_status === 'paid' \|\| session\.payment_status === 'no_payment_required'/);
  assert.match(sync, /billingOptionForStripePrice\(priceId\) !== 'lifetime'/);
  assert.match(sync, /priceId !== IMPORTVERIFIER_UNLIMITED_LIFETIME_PRICE_ID/);
  assert.match(sync, /session\.metadata\?\.plan_id !== 'starter'/);
  assert.match(sync, /session\.metadata\?\.billing_option !== 'lifetime'/);
  assert.match(sync, /\.eq\('stripe_customer_id', customerId\)/);
  assert.match(sync, /existingCustomer\.user_id !== metadataUserId/);
});

test('full Stripe refund revokes Lifetime while partial refund does not', () => {
  assert.match(sync, /if \(!charge\.refunded \|\| charge\.amount_refunded < charge\.amount\) return false/);
  assert.match(sync, /status: 'revoked'/);
  assert.match(webhook, /event\.type === 'charge\.refunded'/);
  assert.match(webhook, /revokeLifetimeEntitlementForFullyRefundedCharge/);
});

test('analysis quota recognizes only active Lifetime entitlement', () => {
  assert.match(analyses, /from\('unlimited_lifetime_entitlements'\)\.select\('status'\)/);
  assert.match(analyses, /lifetime\.data\?\.status === 'active'/);
  assert.match(analyses, /unlimitedBillingStatus\('lifetime'\)/);
});
