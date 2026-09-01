import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const checkout = readFileSync(new URL('../app/api/billing/checkout/route.ts', import.meta.url), 'utf8');
const portal = readFileSync(new URL('../app/api/billing/portal/route.ts', import.meta.url), 'utf8');

test('checkout never exposes raw provider or database exception messages', () => {
  assert.match(checkout, /catch \{[\s\S]*?return json\(\{ error: b\('paymentOpen'\) \}, 503\);[\s\S]*?\}/);
  assert.doesNotMatch(checkout, /catch \(error\) \{[\s\S]*?return json\(\{ error: error instanceof Error \? error\.message : b\('paymentOpen'\)/);
});

test('billing portal never exposes raw provider or database exception messages', () => {
  assert.match(portal, /catch \{[\s\S]*?return json\(\{ error: b\('portalOpen'\) \}, 503\);[\s\S]*?\}/);
  assert.doesNotMatch(portal, /portalError instanceof Error \? portalError\.message/);
});
