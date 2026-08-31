import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BRAND_NAME, BRAND_DOCUMENT_TITLE } from '../lib/brand';

const brand = readFileSync(new URL('../components/Brand.tsx', import.meta.url), 'utf8');

test('canonical product name is ImportVerifier everywhere brand constants are consumed', () => {
  assert.equal(BRAND_NAME, 'ImportVerifier');
  assert.equal(BRAND_DOCUMENT_TITLE, 'IMPORTVERIFIER');
});

test('visible wordmark no longer renders the retired Import Rules Verifier name', () => {
  assert.match(brand, /<strong>Import<\/strong><strong[^>]*>Verifier<\/strong>/);
  assert.doesNotMatch(brand, />Rules</);
  assert.doesNotMatch(brand, /Import Rules Verifier/);
});

test('brand link can preserve the caller locale and uses a language-neutral accessible name', () => {
  assert.match(brand, /href = '\/'/);
  assert.match(brand, /href=\{href\}/);
  assert.match(brand, /aria-label=\{BRAND_NAME\}/);
  assert.doesNotMatch(brand, /aria-label=\{`\$\{BRAND_NAME\}, inicio`\}/);
});
