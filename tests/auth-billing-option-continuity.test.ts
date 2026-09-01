import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const login = readFileSync(new URL('../app/login/page.tsx', import.meta.url), 'utf8');
const auth = readFileSync(new URL('../components/AuthForm.tsx', import.meta.url), 'utf8');

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
