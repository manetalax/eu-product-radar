import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { radarRuntimeConfigured, radarRuntimeEnabled } from '../lib/radar-runtime';

const route = readFileSync(new URL('../app/api/regulatory-changes/route.ts', import.meta.url), 'utf8');
const agentRoute = readFileSync(new URL('../app/api/regulatory-agent/route.ts', import.meta.url), 'utf8');
const refreshRoute = readFileSync(new URL('../app/api/internal/regulatory-refresh/route.ts', import.meta.url), 'utf8');
const githubScheduler = readFileSync(new URL('../.github/workflows/regulatory-radar.yml', import.meta.url), 'utf8');

test('Radar live requires the flag, a strong ingest secret and persisted events', () => {
  const strongSecret = 'x'.repeat(32);
  assert.equal(radarRuntimeConfigured('true', strongSecret), true);
  assert.equal(radarRuntimeConfigured('false', strongSecret), false);
  assert.equal(radarRuntimeConfigured('true', 'short'), false);
  assert.equal(radarRuntimeEnabled('true', strongSecret, 1), true);
  assert.equal(radarRuntimeEnabled('true', strongSecret, 0), false);
});

test('pre-live Radar events are not exposed to clients or ImportVerifier AI', () => {
  assert.match(route, /radarRuntimeConfigured\(process\.env\.REGULATORY_RADAR_LIVE, process\.env\.REGULATORY_INGEST_SECRET\)/);
  assert.match(route, /if \(!radarConfigured\) return json\(\{ events: \[\], live: false, sourcePolicy: 'official-only' \}\)/);
  assert.match(route, /radarRuntimeEnabled\(process\.env\.REGULATORY_RADAR_LIVE, process\.env\.REGULATORY_INGEST_SECRET, events\.length\)/);
  assert.match(route, /events: live \? events : \[\]/);
  assert.match(agentRoute, /const radarPromise = radarConfigured/);
  assert.match(agentRoute, /: Promise\.resolve\(null\)/);
  assert.match(agentRoute, /radarRuntimeEnabled\(process\.env\.REGULATORY_RADAR_LIVE, process\.env\.REGULATORY_INGEST_SECRET, radarRows\.length\)/);
  assert.match(agentRoute, /: \[\];/);
});

test('Sites-neutral Radar scheduler uses the configured canonical HTTPS origin and authenticated JSON refresh contract', () => {
  assert.match(githubScheduler, /SITE_ORIGIN: \$\{\{ vars\.NEXT_PUBLIC_SITE_URL \}\}/);
  assert.match(githubScheduler, /REGULATORY_INGEST_SECRET: \$\{\{ secrets\.REGULATORY_INGEST_SECRET \}\}/);
  assert.match(githubScheduler, /new URL\(process\.env\.SITE_ORIGIN\)/);
  assert.match(githubScheduler, /u\.protocol !== 'https:'/);
  assert.match(githubScheduler, /Authorization: Bearer \$REGULATORY_INGEST_SECRET/);
  assert.match(githubScheduler, /Content-Type: application\/json/);
  assert.match(githubScheduler, /--data '\{\}'/);
  assert.match(githubScheduler, /\$\{SITE_ORIGIN%\/\}\/api\/internal\/regulatory-refresh/);
  assert.doesNotMatch(githubScheduler, /netlify/i);
});

test('internal Radar refresh accepts only a tiny empty JSON command after bearer authentication', () => {
  const authCheck = refreshRoute.indexOf('authorized(request, secret)');
  const contentTypeCheck = refreshRoute.indexOf("startsWith('application/json')");
  const bodyRead = refreshRoute.indexOf('readJsonBody(request, MAX_REFRESH_BODY_BYTES)');
  assert.ok(authCheck >= 0 && contentTypeCheck > authCheck && bodyRead > contentTypeCheck);
  assert.match(refreshRoute, /MAX_REFRESH_BODY_BYTES = 1024/);
  assert.match(refreshRoute, /Object\.keys\(body as Record<string, unknown>\)\.length !== 0/);
  assert.match(refreshRoute, /RequestBodyTooLargeError/);
  assert.match(refreshRoute, /413/);
  assert.match(refreshRoute, /415/);
});
