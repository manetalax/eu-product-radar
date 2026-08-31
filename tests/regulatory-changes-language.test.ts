import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { regulatoryChangesText } from '../lib/regulatory-changes-i18n';

const route = readFileSync(new URL('../app/api/regulatory-changes/route.ts', import.meta.url), 'utf8');

test('Regulatory Radar API copy is localized in all supported languages', () => {
  const languages = ['es', 'en', 'fr', 'de', 'it', 'pt'] as const;
  for (const key of ['signIn', 'loadError'] as const) {
    const messages = languages.map(language => regulatoryChangesText(language, key));
    assert.equal(new Set(messages).size, languages.length);
  }
  assert.match(route, /requestLanguage\(request\)/);
  assert.match(route, /regulatoryChangesText\(language, key\)/);
});

test('Radar live remains gated by explicit flag, strong secret and persisted events', () => {
  assert.match(route, /process\.env\.REGULATORY_RADAR_LIVE === 'true'/);
  assert.match(route, /REGULATORY_INGEST_SECRET\?\.trim\(\)\.length/);
  assert.match(route, /ingestSecretReady && events\.length > 0/);
  assert.match(route, /sourcePolicy: 'official-only'/);
});

test('Radar API sanitizes persisted official-source URLs before returning them to clients', () => {
  assert.match(route, /safeOfficialRegulatoryUrl/);
  assert.match(route, /source_url: safeOfficialRegulatoryUrl\(event\.source_url\)/);
});
