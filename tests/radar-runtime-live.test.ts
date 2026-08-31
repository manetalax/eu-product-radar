import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const route = readFileSync(new URL('../app/api/regulatory-changes/route.ts', import.meta.url), 'utf8');
const netlifyScheduler = readFileSync(new URL('../netlify/functions/regulatory-radar.mjs', import.meta.url), 'utf8');
const githubScheduler = readFileSync(new URL('../.github/workflows/regulatory-radar.yml', import.meta.url), 'utf8');

test('Radar live requires the flag, a strong ingest secret and persisted events', () => {
  assert.match(route, /REGULATORY_INGEST_SECRET/);
  assert.match(route, />= 32/);
  assert.match(route, /REGULATORY_RADAR_LIVE === 'true' && ingestSecretReady && events\.length > 0/);
});

test('both Radar schedulers use the canonical authenticated JSON refresh contract', () => {
  assert.match(netlifyScheduler, /api\/internal\/regulatory-refresh/);
  assert.match(netlifyScheduler, /Authorization: `Bearer \$\{secret\}`/);
  assert.match(netlifyScheduler, /'Content-Type': 'application\/json'/);
  assert.match(netlifyScheduler, /body: '\{\}'/);
  assert.match(netlifyScheduler, /secret\.length < 32/);
  assert.match(netlifyScheduler, /AbortController/);

  assert.match(githubScheduler, /api\/internal\/regulatory-refresh/);
  assert.match(githubScheduler, /Authorization: Bearer \$REGULATORY_INGEST_SECRET/);
  assert.match(githubScheduler, /Content-Type: application\/json/);
});
