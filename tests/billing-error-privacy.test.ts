import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const checkout = readFileSync(new URL('../app/api/billing/checkout/route.ts', import.meta.url), 'utf8');
const portal = readFileSync(new URL('../app/api/billing/portal/route.ts', import.meta.url), 'utf8');

test('checkout never exposes raw provider or database exception messages', () => {
  assert.match(checkout, /catch \{\s*return json\(\{ error: b\('paymentOpen'\) \}, 503\);\s*\}/s);
  assert.doesNotMatch(checkout, /catch \(error\) \{\s*return json\(\{ error: error instanceof Error \? error\.message : b\('paymentOpen'\)/s);
});

test('billing portal never exposes raw provider or database exception messages', () => {
  assert.match(portal, /catch \{\s*return json\(\{ error: b\('portalOpen'\) \}, 503\);\s*\}/s);
  assert.doesNotMatch(portal, /portalError instanceof Error \? portalError\.message/);
});
