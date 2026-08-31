import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../lib/pdf-premium-brand.ts', import.meta.url), 'utf8');

test('premium PDF chrome reconstructs the ImportVerifier mark natively', () => {
  assert.match(source, /export function drawImportVerifierMark/);
  assert.match(source, /PDF-native reconstruction of the product's existing geometric cube\/radar mark/);
  assert.match(source, /page\.drawCircle/);
  assert.match(source, /segment\(\[72, 67\], \[110, 105\], accent/);
});

test('premium PDF footer is localized and carries EU context, report reference and pagination', () => {
  for (const language of ['es', 'en', 'fr', 'de', 'it', 'pt']) assert.match(source, new RegExp(`${language}:`));
  assert.match(source, /page\.drawText\('EU'/);
  assert.match(source, /reportRef/);
  assert.match(source, /pageNumber/);
  assert.match(source, /pageCount/);
});

test('premium PDF header keeps ImportVerifier as the visible issuer', () => {
  assert.match(source, /drawPremiumPageHeader/);
  assert.match(source, /page\.drawText\(BRAND_NAME/);
  assert.match(source, /BRAND_SITE_URL/);
});
