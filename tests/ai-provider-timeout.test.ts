import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../lib/ai-provider.ts', import.meta.url), 'utf8');

test('all external AI calls share a bounded provider fetch helper', () => {
  assert.match(source, /const AI_PROVIDER_TIMEOUT_MS = 30_000/);
  assert.match(source, /const controller = new AbortController\(\)/);
  assert.match(source, /setTimeout\(\(\) => controller\.abort\(\), AI_PROVIDER_TIMEOUT_MS\)/);
  assert.match(source, /fetch\(input, \{ \.\.\.init, signal: controller\.signal \}\)/);
  assert.match(source, /clearTimeout\(timeout\)/);
  assert.equal((source.match(/await providerFetch\(/g) ?? []).length, 4);
});
