import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const confirm = readFileSync(new URL('../app/auth/confirm/route.ts', import.meta.url), 'utf8');

test('auth confirm no confía directamente en NEXT_PUBLIC_SITE_URL', () => {
  assert.match(confirm, /configuredSiteOrigin/);
  assert.match(confirm, /IMPORTVERIFIER_PRODUCTION_URL/);
  assert.match(confirm, /configuredSiteOrigin\(\) \?\? IMPORTVERIFIER_PRODUCTION_URL/);
  assert.doesNotMatch(confirm, /process\.env\.NEXT_PUBLIC_SITE_URL!/);
});

test('auth confirm mantiene destinos internos fijos para signup y recovery', () => {
  assert.match(confirm, /type === 'recovery' \? '\/reset-password' : '\/dashboard\?welcome=registered'/);
  assert.match(confirm, /new URL\(destination, origin\)/);
  assert.match(confirm, /new URL\('\/login\?message=link_error', origin\)/);
});
