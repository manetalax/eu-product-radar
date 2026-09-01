import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const dashboard = readFileSync(new URL('../components/Dashboard.tsx', import.meta.url), 'utf8');

test('persisted checkout intent waits for entitlement and cannot reopen checkout for active Unlimited', () => {
  assert.match(dashboard, /const planIntentHandled = useRef\(false\)/);
  assert.match(dashboard, /if \(!quota \|\| planIntentHandled\.current\) return/);
  assert.match(dashboard, /planIntentHandled\.current = true/);
  assert.match(dashboard, /if \(quota\.billing\.planId === 'starter'\) \{\s*clearPlanIntent\(\);\s*return;\s*\}/);
});

test('persisted checkout intent preserves the selected monthly, annual or Lifetime billing option', () => {
  assert.match(dashboard, /const intent = readPlanIntent\(\)/);
  assert.match(dashboard, /void startCheckout\(intent\.billingOption\)/);
  assert.match(dashboard, /async function startCheckout\(option: UnlimitedBillingOption = 'monthly'\)/);
  assert.match(dashboard, /billingOption: option/);
});
