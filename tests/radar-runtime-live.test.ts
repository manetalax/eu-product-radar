import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const route = readFileSync(new URL('../app/api/regulatory-changes/route.ts', import.meta.url), 'utf8');

test('Radar live requires the flag, a strong ingest secret and persisted events', () => {
  assert.match(route, /REGULATORY_INGEST_SECRET/);
  assert.match(route, />= 32/);
  assert.match(route, /REGULATORY_RADAR_LIVE === 'true' && ingestSecretReady && events\.length > 0/);
});
