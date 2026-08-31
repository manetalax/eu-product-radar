import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const callback = readFileSync(new URL('../app/auth/callback/route.ts', import.meta.url), 'utf8');

test('el callback OAuth conserva solo destinos internos y el idioma validado', () => {
  assert.match(callback, /safeAuthDestination/);
  assert.match(callback, /isLanguage/);
  assert.match(callback, /searchParams\.set\('lang'/);
});

test('el callback usa el origen validado y fallback canónico', () => {
  assert.match(callback, /configuredSiteOrigin/);
  assert.match(callback, /IMPORTVERIFIER_PRODUCTION_URL/);
  assert.match(callback, /configuredSiteOrigin\(\) \?\? IMPORTVERIFIER_PRODUCTION_URL/);
  assert.doesNotMatch(callback, /new URL\(configured\)\.origin/);
});
