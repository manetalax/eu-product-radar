import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const confirm = readFileSync(new URL('../app/auth/confirm/route.ts', import.meta.url), 'utf8');

test('auth confirm fija producción al dominio canónico', () => {
  assert.match(confirm, /process\.env\.NODE_ENV === 'production'/);
  assert.match(confirm, /return IMPORTVERIFIER_PRODUCTION_URL/);
  assert.match(confirm, /configuredSiteOrigin\(\) \?\? IMPORTVERIFIER_PRODUCTION_URL/);
  assert.doesNotMatch(confirm, /process\.env\.NEXT_PUBLIC_SITE_URL!/);
  assert.doesNotMatch(confirm, /euproductradar\.netlify\.app/);
});

test('auth confirm mantiene destinos internos fijos para signup y recovery', () => {
  assert.match(confirm, /type === 'recovery' \? '\/reset-password' : '\/dashboard\?welcome=registered'/);
  assert.match(confirm, /localizedDestination\(destination, origin, language\)/);
  assert.match(confirm, /localizedDestination\('\/login\?message=link_error', origin, language\)/);
});

test('auth confirm solo propaga un idioma validado', () => {
  assert.match(confirm, /const requestedLanguage = request\.nextUrl\.searchParams\.get\('lang'\)/);
  assert.match(confirm, /const language = isLanguage\(requestedLanguage\) \? requestedLanguage : null/);
  assert.match(confirm, /if \(language\) target\.searchParams\.set\('lang', language\)/);
});
