import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync(new URL('../public/manifest.webmanifest', import.meta.url), 'utf8')) as Record<string, unknown>;
const sw = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');

test('el manifest conserva identidad e instalación standalone', () => {
  assert.equal(manifest.name, 'Import Rules Verifier');
  assert.equal(manifest.short_name, 'ImportVerifier');
  assert.equal(manifest.start_url, '/');
  assert.equal(manifest.scope, '/');
  assert.equal(manifest.display, 'standalone');
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0);
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
