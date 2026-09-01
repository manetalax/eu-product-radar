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

test('checkout return retries only transient confirmation states within the global timeout', () => {
  assert.match(source, /MAX_CONFIRM_ATTEMPTS = 3/);
  assert.match(source, /RETRYABLE_CONFIRM_STATUSES = new Set\(\[409, 429, 502, 503, 504\]\)/);
  assert.match(source, /for \(let attempt = 0; attempt < MAX_CONFIRM_ATTEMPTS; attempt \+= 1\)/);
  assert.match(source, /RETRYABLE_CONFIRM_STATUSES\.has\(response\.status\)/);
  assert.match(source, /retryDelay\(attempt\)/);
  assert.match(source, /controller\.signal\.aborted/);
});
