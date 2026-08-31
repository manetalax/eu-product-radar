import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../components/CheckoutReturnSync.tsx', import.meta.url), 'utf8');

test('checkout return bounds confirmation latency and never exposes JSON parser errors', () => {
  assert.match(source, /const CONFIRM_TIMEOUT_MS = 20_000/);
  assert.match(source, /const controller = new AbortController\(\)/);
  assert.match(source, /signal: controller\.signal/);
  assert.match(source, /controller\.abort\(\)/);
  assert.match(source, /try \{ body = await response\.json\(\)/);
  assert.match(source, /Never expose parser errors to customers/);
  assert.match(source, /billingText\(language, 'paymentOpen'\)/);
});
