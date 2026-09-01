import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const route = readFileSync(new URL('../app/api/product-extraction/route.ts', import.meta.url), 'utf8');

test('direct document fallback is bounded and remains unreachable under free_only before provider fetch', () => {
  const policyGuard = route.indexOf("if (aiCostPolicy() === 'free_only')");
  const providerFetch = route.indexOf("fetch('https://api.openai.com/v1/responses'");
  const timeout = route.indexOf('signal: AbortSignal.timeout(30_000)');
  assert.ok(policyGuard >= 0 && providerFetch > policyGuard && timeout > providerFetch);
});
