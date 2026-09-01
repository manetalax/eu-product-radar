import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const login = readFileSync(new URL('../app/login/page.tsx', import.meta.url), 'utf8');
const auth = readFileSync(new URL('../components/AuthForm.tsx', import.meta.url), 'utf8');
const intent = readFileSync(new URL('../lib/services/plan-interest.ts', import.meta.url), 'utf8');
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

test('purchase intent carries a short-lived non-sensitive billing cookie across OAuth', () => {
  assert.match(intent, /BILLING_INTENT_COOKIE = 'importverifier-billing-intent'/);
  assert.match(intent, /BILLING_INTENT_MAX_AGE_SECONDS = 15 \* 60/);
  assert.match(intent, /SameSite=Lax/);
  assert.match(intent, /setBillingIntentCookie\(billingOption\)/);
  assert.match(intent, /clearBillingIntentCookie\(\)/);
});

test('checkout recovers billing choice from cookie before fresh authenticated metadata when client omits billingOption', () => {
  assert.match(checkout, /cookieBillingIntent\(request\)/);
  assert.match(checkout, /AUTH_BILLING_INTENT_MAX_AGE_MS = 15 \* 60 \* 1000/);
  assert.match(checkout, /userMetadata\.plan_interest_id !== UNLIMITED_INTERNAL_PLAN_ID/);
  assert.match(checkout, /isUnlimitedBillingOption\(userMetadata\.plan_interest_billing_option\)/);
  assert.match(checkout, /age < 0 \|\| age > AUTH_BILLING_INTENT_MAX_AGE_MS/);
  const explicitIndex = checkout.indexOf('body?.billingOption');
  const cookieIndex = checkout.indexOf('cookieBillingIntent(request)', explicitIndex);
  const metadataIndex = checkout.indexOf('recentAuthBillingIntent(user.user_metadata', cookieIndex);
  const fallbackIndex = checkout.indexOf("?? 'monthly'", metadataIndex);
  assert.ok(explicitIndex >= 0 && cookieIndex > explicitIndex && metadataIndex > cookieIndex && fallbackIndex > metadataIndex);
});

test('billing intent cookie is allowlisted rather than trusted as arbitrary input', () => {
  assert.match(checkout, /decodeURIComponent\(rawValue\.join\('='\)\)/);
  assert.match(checkout, /isUnlimitedBillingOption\(value\) \? value : null/);
});
