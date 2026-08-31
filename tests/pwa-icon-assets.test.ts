import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const manifest = JSON.parse(readFileSync(join(root, 'public/manifest.webmanifest'), 'utf8')) as { icons?: { src?: string }[] };

test('every manifest icon points to a real public asset', () => {
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0);
  for (const icon of manifest.icons ?? []) {
    assert.ok(icon.src?.startsWith('/'), `invalid icon src: ${icon.src}`);
    const relative = icon.src!.replace(/^\//, '');
    assert.ok(existsSync(join(root, 'public', relative)), `missing manifest icon: ${icon.src}`);
  }
});

test('ImportVerifier SVG icon is own-brand and avoids institutional EU claims', () => {
  const icon = readFileSync(join(root, 'public/icon.svg'), 'utf8');
  assert.match(icon, /ImportVerifier/);
  assert.match(icon, /<svg/);
  assert.doesNotMatch(icon, /European Commission|European Union|EU official|certified/i);
});
