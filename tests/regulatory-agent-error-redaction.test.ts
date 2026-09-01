import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const route = readFileSync(new URL('../app/api/regulatory-agent/route.ts', import.meta.url), 'utf8');

test('ImportVerifier AI never returns raw provider exception messages', () => {
  assert.doesNotMatch(route, /error instanceof Error && error\.message \? error\.message/);
  assert.match(route, /console\.error\('regulatory_agent_failed', error\)/);
  assert.match(route, /return json\(\{ error: a\('assistantFailure'\) \}, 502\)/);
});
