import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const regulatoryAgent = readFileSync(new URL('../app/api/regulatory-agent/route.ts', import.meta.url), 'utf8');
const evidence = readFileSync(new URL('../app/api/evidence/route.ts', import.meta.url), 'utf8');

test('authenticated JSON APIs preserve HTTP 413 for oversized request bodies', () => {
  for (const route of [regulatoryAgent, evidence]) {
    assert.match(route, /RequestBodyTooLargeError/);
    assert.match(route, /413/);
  }
});
