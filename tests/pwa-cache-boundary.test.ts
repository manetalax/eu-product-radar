import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('service worker caches only public static asset destinations outside explicit public navigations', async () => {
  const source = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
  assert.match(source, /CACHEABLE_ASSET_DESTINATIONS = new Set\(\['style', 'script', 'image', 'font'\]\)/);
  assert.match(source, /if \(!CACHEABLE_ASSET_DESTINATIONS\.has\(request\.destination\)\) return;/);
  assert.match(source, /PRIVATE_PREFIXES = \['\/api\/', '\/auth\/', '\/dashboard', '\/reset-password'\]/);
});

test('service worker refuses private and no-store responses', async () => {
  const source = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
  assert.match(source, /cacheControl\.includes\('private'\)/);
  assert.match(source, /cacheControl\.includes\('no-store'\)/);
  assert.match(source, /cacheControl\.includes\('no-cache'\)/);
  assert.match(source, /responseAllowsCaching\(response\)/);
});
