import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const analyses = readFileSync(new URL('../app/api/analyses/route.ts', import.meta.url), 'utf8');
const checkout = readFileSync(new URL('../app/api/billing/checkout/route.ts', import.meta.url), 'utf8');
const lifetimeQuota = readFileSync(new URL('../supabase/migrations/202608310004_free_lifetime_trial.sql', import.meta.url), 'utf8');

test('retired one-time audits cannot grant runtime product entitlement', () => {
  assert.doesNotMatch(analyses, /one_time_audits|auditBillingStatus|quota\.billing\.planId\s*===\s*['"]audit['"]|one_time_audit_/);
  assert.doesNotMatch(lifetimeQuota, /one_time_audits|purchase_type|audit/i);
  assert.match(checkout, /candidate !== UNLIMITED_INTERNAL_PLAN_ID/);
  assert.match(checkout, /const UNLIMITED_INTERNAL_PLAN_ID = 'starter'/);
});
