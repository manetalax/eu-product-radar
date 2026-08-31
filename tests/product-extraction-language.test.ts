import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { productExtractionText } from '../lib/product-extraction-i18n';

const route = readFileSync(new URL('../app/api/product-extraction/route.ts', import.meta.url), 'utf8');

test('la extracción localiza el rechazo de origen en los seis idiomas', () => {
  const languages = ['es', 'en', 'fr', 'de', 'it', 'pt'] as const;
  const messages = languages.map(language => productExtractionText(language, 'origin'));
  assert.equal(new Set(messages).size, languages.length);
  assert.match(route, /productExtractionText\(language, 'origin'\)/);
  assert.doesNotMatch(route, /error: 'Origin not allowed\.'/);
});
