import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const component = readFileSync(new URL('../components/PurchaseIntentCheckout.tsx', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../app/dashboard/page.tsx', import.meta.url), 'utf8');

test('dashboard mounts purchase-intent continuation after authentication', () => {
  assert.match(dashboard, /<PurchaseIntentCheckout \/>/);
});

test('saved purchase intent is consumed once and only starter can open checkout', () => {
  assert.match(component, /const intent = readPlanIntent\(\)/);
  assert.match(component, /clearPlanIntent\(\)/);
  assert.match(component, /if \(intent !== 'starter'\) return/);
  assert.match(component, /started\.current/);
  assert.match(component, /JSON\.stringify\(\{ purchaseId: 'starter' \}\)/);
});

test('failed automatic checkout is visible but cannot loop on refresh', () => {
  const clearIndex = component.indexOf('clearPlanIntent()');
  const fetchIndex = component.indexOf("fetch('/api/billing/checkout'");
  assert.ok(clearIndex >= 0 && fetchIndex > clearIndex);
  assert.match(component, /role="alert"/);
  assert.match(component, /setBusy\(false\)/);
});
