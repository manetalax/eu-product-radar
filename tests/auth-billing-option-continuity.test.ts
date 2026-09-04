import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const login = readFileSync(new URL('../app/login/page.tsx', import.meta.url), 'utf8');
const auth = readFileSync(new URL('../components/AuthForm.tsx', import.meta.url), 'utf8');
const intent = readFileSync(new URL('../lib/services/plan-interest.ts', import.meta.url), 'utf8');
const checkout = readFileSync(new URL('../app/api/billing/checkout/route.ts', import.meta.url), 'utf8');
const landing = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');

test('login validates and forwards every checkout billing option including Personalizada', () => {
  assert.match(login, /billing\?: string/);
  assert.match(login, /isCheckoutBillingOption\(billing\)/);
  assert.match(login, /requestedBillingOption=\{requestedPlan \? requestedBillingOption : undefined\}/);
  assert.match(landing, /billing=custom/);
});

test('password, Google and signup flows preserve recurring, Lifetime or Personalizada purchase intent', () => {
  assert.match(auth, /requestedBillingOption = 'monthly'/);
  assert.match(auth, /CheckoutBillingOption/);
  assert.match(auth, /savePlanIntent\(requestedPlan, requestedBillingOption\)/);
  assert.match(auth, /planInterestMetadata\(requestedPlan, requestedBillingOption\)/);
  assert.match(auth, /rememberPlanIntent\(\)/);
  assert.doesNotMatch(auth, /savePlanIntent\(requestedPlan\);/);
  assert.doesNotMatch(auth, /planInterestMetadata\(requestedPlan\)(?!,)/);
});

test('purchase intent carries a short-lived non-sensitive billing cookie across OAuth', () => {
  assert.match(intent, /BILLING_INTENT_COOKIE = 'importverifier-billing-intent'/);
  assert.match(intent, /BILLING_INTENT_MAX_AGE_SECONDS = 15 \* 60/);
  assert.match(intent, /CheckoutBillingOption/);
  assert.match(intent, /isCheckoutBillingOption\(parsed\.billingOption\)/);
  assert.match(intent, /SameSite=Lax/);
  assert.match(intent, /setBillingIntentCookie\(billingOption\)/);
  assert.match(intent, /clearBillingIntentCookie\(\)/);
});

test('checkout recovers custom billing choice from cookie or fresh authenticated metadata', () => {
  assert.match(checkout, /cookieBillingIntent\(request\)/);
  assert.match(checkout, /AUTH_BILLING_INTENT_MAX_AGE_MS = 15 \* 60 \* 1000/);
  assert.match(checkout, /isCheckoutBillingOption\(userMetadata\.plan_interest_billing_option\)/);
  assert.match(checkout, /isCheckoutBillingOption\(value\) \? value : null/);
  assert.match(checkout, /age < 0 \|\| age > AUTH_BILLING_INTENT_MAX_AGE_MS/);
  const explicitIndex = checkout.indexOf('body?.billingOption');
  const cookieIndex = checkout.indexOf('cookieBillingIntent(request)', explicitIndex);
  const metadataIndex = checkout.indexOf('recentAuthBillingIntent(user.user_metadata', cookieIndex);
  const fallbackIndex = checkout.indexOf("?? 'monthly'", metadataIndex);
  assert.ok(explicitIndex >= 0 && cookieIndex > explicitIndex && metadataIndex > cookieIndex && fallbackIndex > metadataIndex);
});
