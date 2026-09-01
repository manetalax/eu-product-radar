import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const login = readFileSync(new URL('../app/login/page.tsx', import.meta.url), 'utf8');
const auth = readFileSync(new URL('../components/AuthForm.tsx', import.meta.url), 'utf8');
const checkout = readFileSync(new URL('../app/api/billing/checkout/route.ts', import.meta.url), 'utf8');

test('login validates and forwards the requested Unlimited billing option', () => {
  assert.match(login, /billing\?: string/);
  assert.match(login, /isUnlimitedBillingOption\(billing\)/);
  assert.match(login, /requestedBillingOption=\{requestedPlan \? requestedBillingOption : undefined\}/);
});

test('password, Google and signup flows preserve annual or Lifetime purchase intent', () => {
  assert.match(auth, /requestedBillingOption = 'monthly'/);
  assert.match(auth, /savePlanIntent\(requestedPlan, requestedBillingOption\)/);
  assert.match(auth, /planInterestMetadata\(requestedPlan, requestedBillingOption\)/);
  assert.match(auth, /rememberPlanIntent\(\)/);
  assert.doesNotMatch(auth, /savePlanIntent\(requestedPlan\);/);
  assert.doesNotMatch(auth, /planInterestMetadata\(requestedPlan\)(?!,)/);
});

test('checkout recovers a fresh authenticated billing intent when the immediate dashboard request omits billingOption', () => {
  assert.match(checkout, /AUTH_BILLING_INTENT_MAX_AGE_MS = 15 \* 60 \* 1000/);
  assert.match(checkout, /userMetadata\.plan_interest_id !== UNLIMITED_INTERNAL_PLAN_ID/);
  assert.match(checkout, /isUnlimitedBillingOption\(userMetadata\.plan_interest_billing_option\)/);
  assert.match(checkout, /age < 0 \|\| age > AUTH_BILLING_INTENT_MAX_AGE_MS/);
  assert.match(checkout, /body\?\.billingOption \?\? recentAuthBillingIntent\(user\.user_metadata/);
});

test('explicit checkout billing option remains authoritative over auth metadata and stale intent falls back to monthly', () => {
  const explicitIndex = checkout.indexOf('body?.billingOption ?? recentAuthBillingIntent');
  const fallbackIndex = checkout.indexOf("?? 'monthly'", explicitIndex);
  assert.ok(explicitIndex >= 0 && fallbackIndex > explicitIndex);
});
