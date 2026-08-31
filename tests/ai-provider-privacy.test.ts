import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const route = readFileSync(new URL('../app/api/regulatory-agent/route.ts', import.meta.url), 'utf8');

test('regulatory agent keeps provider and model server-side only', () => {
  assert.match(route, /recordAiUsage\(\{/);
  assert.match(route, /provider: resultAi\.provider/);
  assert.match(route, /model: resultAi\.model/);
  const responseMatch = route.match(/return json\(\{\s*answer: resultAi\.text,[\s\S]*?disclaimer:[\s\S]*?\}\);/);
  assert.ok(responseMatch, 'expected the public assistant response');
  assert.doesNotMatch(responseMatch[0], /provider:/);
  assert.doesNotMatch(responseMatch[0], /model:/);
});
