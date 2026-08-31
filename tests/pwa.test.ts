import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { manifestFor } from '../lib/pwa-manifest';
import { LANGUAGES } from '../lib/landing-i18n';

const sw = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
const pwaRegister = readFileSync(new URL('../components/PwaRegister.tsx', import.meta.url), 'utf8');

test('el manifest conserva identidad e instalación standalone en todos los idiomas', () => {
  for (const language of LANGUAGES) {
    const manifest = manifestFor(language);
    assert.equal(manifest.name, 'Import Rules Verifier');
    assert.equal(manifest.short_name, 'ImportVerifier');
    assert.equal(manifest.start_url, '/');
    assert.equal(manifest.scope, '/');
    assert.equal(manifest.display, 'standalone');
    assert.equal(manifest.lang, language);
    assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0);
  }
});

test('el manifest localiza descripción y accesos directos sin cambiar rutas', () => {
  const descriptions = LANGUAGES.map(language => manifestFor(language).description);
  assert.equal(new Set(descriptions).size, LANGUAGES.length);
  for (const language of LANGUAGES) {
    const shortcuts = manifestFor(language).shortcuts ?? [];
    assert.deepEqual(shortcuts.map(item => item.url), ['/dashboard', '/privacy']);
    assert.ok(shortcuts.every(item => Boolean(item.name)));
  }
});

test('la PWA nunca incluye páginas privadas ni el manifest localizado en el shell offline', () => {
  const shellMatch = sw.match(/const SHELL = \[([^\]]+)\]/);
  assert.ok(shellMatch);
  const shell = shellMatch[1];
  for (const privatePath of ['/dashboard', '/api/', '/auth/', '/reset-password', '/manifest.webmanifest']) {
    assert.equal(shell.includes(`'${privatePath}'`), false);
  }
  assert.match(sw, /url\.pathname === '\/manifest\.webmanifest'/);
});

test('el service worker excluye explícitamente rutas privadas del caché', () => {
  for (const privatePath of ['/api/', '/auth/', '/dashboard', '/reset-password']) assert.ok(sw.includes(`'${privatePath}'`));
  assert.match(sw, /PRIVATE_PREFIXES\.some/);
  assert.match(sw, /CACHEABLE_NAVIGATIONS/);
});

test('las actualizaciones del service worker no dejan rechazos sin gestionar al volver online o visible', () => {
  assert.match(pwaRegister, /const updateRegistration = async \(\) =>/);
  assert.match(pwaRegister, /try \{[\s\S]*await registration\.update\(\);[\s\S]*\} catch \{/);
  assert.match(pwaRegister, /const refresh = \(\) => \{ if \(!document\.hidden\) void updateRegistration\(\); \}/);
  assert.match(pwaRegister, /cancelled = true/);
  assert.doesNotMatch(pwaRegister, /void registration\?\.update\(\)/);
});

test('el registro PWA se difiere fuera de la carga crítica y su temporizador se limpia', () => {
  assert.match(pwaRegister, /const REGISTRATION_DELAY_MS = 1200/);
  assert.match(pwaRegister, /const scheduleRegistration = \(\) =>/);
  assert.match(pwaRegister, /window\.setTimeout\(\(\) => \{ void register\(\); \}, REGISTRATION_DELAY_MS\)/);
  assert.match(pwaRegister, /window\.addEventListener\('load', scheduleRegistration, \{ once: true \}\)/);
  assert.match(pwaRegister, /window\.clearTimeout\(registrationTimer\)/);
  assert.doesNotMatch(pwaRegister, /window\.addEventListener\('load', register/);
});
