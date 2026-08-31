import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { manifestFor } from '../lib/pwa-manifest';
import { LANGUAGES } from '../lib/landing-i18n';

const sw = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');

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

test('la PWA nunca incluye páginas privadas en el shell offline', () => {
  const shellMatch = sw.match(/const SHELL = \[([^\]]+)\]/);
  assert.ok(shellMatch);
  const shell = shellMatch[1];
  for (const privatePath of ['/dashboard', '/api/', '/auth/', '/reset-password']) {
    assert.equal(shell.includes(`'${privatePath}'`), false);
  }
});

test('el service worker excluye explícitamente rutas privadas del caché', () => {
  for (const privatePath of ['/api/', '/auth/', '/dashboard', '/reset-password']) assert.ok(sw.includes(`'${privatePath}'`));
  assert.match(sw, /PRIVATE_PREFIXES\.some/);
  assert.match(sw, /CACHEABLE_NAVIGATIONS/);
});
