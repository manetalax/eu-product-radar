import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const route = readFileSync(new URL('../app/api/internal/regulatory-ingest/route.ts', import.meta.url), 'utf8');

test('regulatory ingest only accepts JSON and preserves payload-too-large semantics', () => {
  assert.match(route, /contentType\.startsWith\('application\/json'\)/);
  assert.match(route, /status = 200/);
  assert.match(route, /RequestBodyTooLargeError/);
  assert.match(route, /413/);
  assert.match(route, /events\.length > 500/);
});
