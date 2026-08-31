import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ingest = readFileSync(new URL('../app/api/internal/regulatory-ingest/route.ts', import.meta.url), 'utf8');
const refresh = readFileSync(new URL('../app/api/internal/regulatory-refresh/route.ts', import.meta.url), 'utf8');

test('internal Radar endpoints do not expose raw exception messages', () => {
  assert.doesNotMatch(ingest, /error instanceof Error \? error\.message/);
  assert.doesNotMatch(refresh, /error instanceof Error \? error\.message/);
  assert.match(ingest, /console\.error\('regulatory_ingest_failed', error\)/);
  assert.match(refresh, /console\.error\('regulatory_refresh_failed', error\)/);
});

test('internal Radar endpoints retain strong bearer-secret checks', () => {
  for (const source of [ingest, refresh]) {
    assert.match(source, /secret\.length >= 32/);
    assert.match(source, /timingSafeEqual/);
    assert.match(source, /header\?\.startsWith\('Bearer '\)/);
  }
});
