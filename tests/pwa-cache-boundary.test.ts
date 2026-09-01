import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('service worker caches only public static asset destinations outside explicit localized landing navigations', async () => {
  const source = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
  assert.match(source, /CACHEABLE_ASSET_DESTINATIONS = new Set\(\['style', 'script', 'image', 'font'\]\)/);
  assert.match(source, /if \(!CACHEABLE_ASSET_DESTINATIONS\.has\(request\.destination\)\) return;/);
  assert.match(source, /PRIVATE_PREFIXES = \['\/api\/', '\/auth\/', '\/dashboard', '\/reset-password'\]/);
  assert.match(source, /CACHEABLE_NAVIGATIONS = new Set\(\['\/es', '\/en', '\/fr', '\/de', '\/it', '\/pt'\]\)/);
});

test('service worker refuses private, no-store and authentication-varying responses', async () => {
  const source = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
  assert.match(source, /cacheControl\.includes\('private'\)/);
  assert.match(source, /cacheControl\.includes\('no-store'\)/);
  assert.match(source, /cacheControl\.includes\('no-cache'\)/);
  assert.match(source, /headers\.get\('vary'\)/);
  assert.match(source, /includes\('cookie'\)/);
  assert.match(source, /includes\('authorization'\)/);
  assert.match(source, /responseAllowsCaching\(response\)/);
});

test('public shell precache omits credentials and never stores dynamic login/legal pages', async () => {
  const source = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
  assert.match(source, /new Request\(path, \{ credentials: 'omit', cache: 'reload' \}\)/);
  assert.doesNotMatch(source, /const SHELL = \[[^\]]*'\/login'/);
  assert.doesNotMatch(source, /const SHELL = \[[^\]]*'\/privacy'/);
  assert.doesNotMatch(source, /const SHELL = \[[^\]]*'\/terms'/);
  assert.match(source, /key\.startsWith\('importverifier-shell-'\)/);
});

test('all cacheable public navigations are fetched without cookies before they can enter the shared shell cache', async () => {
  const source = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
  assert.match(source, /CACHE = 'importverifier-shell-v7'/);
  assert.match(source, /fetch\(publicShellRequest\(`\$\{url\.pathname\}\$\{url\.search\}`\)\)/);
  assert.match(source, /fetch\(publicShellRequest\(url\.pathname\)\)/);
  assert.doesNotMatch(source, /request\.mode === 'navigate'[\s\S]{0,500}fetch\(request\)/);
});

test('root offline fallback is keyed by an allowlisted lang query instead of poisoning one shared slash cache', async () => {
  const source = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
  assert.match(source, /function requestedLandingLanguage\(url\)/);
  assert.match(source, /LANDING_LANGUAGES\.has\(value\)/);
  assert.match(source, /request\.mode === 'navigate' && url\.pathname === '\/'/);
  assert.match(source, /cache\.put\(`\/\$\{language\}`/);
  assert.match(source, /caches\.match\(`\/\$\{language\}`\)/);
  assert.doesNotMatch(source, /cache\.put\('\/',/);
});
