import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../components/CheckoutReturnSync.tsx', import.meta.url), 'utf8');

test('checkout return bounds confirmation latency and never exposes JSON parser or server errors', () => {
  assert.match(source, /const CONFIRM_TIMEOUT_MS = 20_000/);
  assert.match(source, /const controller = new AbortController\(\)/);
  assert.match(source, /signal: controller\.signal/);
  assert.match(source, /controller\.abort\(\)/);
  assert.match(source, /const parsed = await response\.json\(\)/);
  assert.match(source, /confirmed === true/);
  assert.match(source, /Never expose parser\/proxy details to customers/);
  assert.doesNotMatch(source, /body\.error/);
  assert.match(source, /billingText\(language, 'paymentOpen'\)/);
});
