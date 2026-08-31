import test from 'node:test';
import assert from 'node:assert/strict';
import { productExtractionCopy, productExtractionText } from '../lib/product-extraction-i18n';
import { requestLanguage } from '../lib/request-language';

const languages = ['es','en','fr','de','it','pt'] as const;

test('product extraction messages have complete six-language parity', () => {
  const expected = Object.keys(productExtractionCopy.es).sort();
  for (const language of languages) {
    assert.deepEqual(Object.keys(productExtractionCopy[language]).sort(), expected, language);
    for (const value of Object.values(productExtractionCopy[language])) assert.ok(value.trim().length > 0);
  }
});

test('free-only workaround is genuinely localized', () => {
  for (const language of ['en','fr','de','it','pt'] as const) {
    assert.notEqual(productExtractionText(language, 'freeOnlyDocument'), productExtractionText('es', 'freeOnlyDocument'));
  }
});

test('server language resolver prioritizes explicit header then cookie then Accept-Language', () => {
  assert.equal(requestLanguage(new Request('https://example.test', { headers: { 'x-importverifier-language':'de', cookie:'iv_lang=fr', 'accept-language':'en-GB,en;q=0.9' } })), 'de');
  assert.equal(requestLanguage(new Request('https://example.test', { headers: { cookie:'iv_lang=fr', 'accept-language':'en-GB,en;q=0.9' } })), 'fr');
  assert.equal(requestLanguage(new Request('https://example.test', { headers: { 'accept-language':'pt-PT,pt;q=0.9' } })), 'pt');
  assert.equal(requestLanguage(new Request('https://example.test')), 'es');
});
