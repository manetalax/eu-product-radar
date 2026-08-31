import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { privacyCopy, termsCopy } from '../lib/legal-pages-i18n';
import { languageFromAcceptLanguage } from '../lib/server-language';

const privacyPage = readFileSync(new URL('../app/privacy/page.tsx', import.meta.url), 'utf8');
const termsPage = readFileSync(new URL('../app/terms/page.tsx', import.meta.url), 'utf8');
const languages = ['es','en','fr','de','it','pt'] as const;

test('privacy and terms have complete localized structures in all supported languages', () => {
  for (const language of languages) {
    assert.ok(privacyCopy[language].title.length > 0, language);
    assert.equal(privacyCopy[language].sections.length, privacyCopy.es.sections.length, language);
    assert.ok(termsCopy[language].title.length > 0, language);
    assert.equal(termsCopy[language].sections.length, termsCopy.es.sections.length, language);
    if (language !== 'es') {
      assert.notEqual(privacyCopy[language].title, privacyCopy.es.title, language);
      assert.notEqual(termsCopy[language].title, termsCopy.es.title, language);
    }
  }
});

test('server language parser follows supported Accept-Language preferences safely', () => {
  assert.equal(languageFromAcceptLanguage('de-DE,de;q=0.9,en;q=0.8'), 'de');
  assert.equal(languageFromAcceptLanguage('zh-CN,fr-FR;q=0.8'), 'fr');
  assert.equal(languageFromAcceptLanguage('zh-CN'), null);
  assert.equal(languageFromAcceptLanguage(null), null);
});

test('legal pages resolve language server-side and retain truthful configured legal data', () => {
  for (const page of [privacyPage, termsPage]) {
    assert.match(page, /serverLanguage\(params\.lang\)/);
    assert.match(page, /legalConfig\(\)/);
  }
  assert.match(termsPage, /legal \? legal\.refundPolicy : t\.refundFallback/);
  assert.match(privacyPage, /legal\.providerName/);
  assert.match(termsPage, /legal\.providerName/);
});

test('legal pages return directly to the selected static landing locale', () => {
  for (const page of [privacyPage, termsPage]) {
    assert.match(page, /href=\{`\/\$\{language\}`\}/);
    assert.doesNotMatch(page, /href=\{`\/\?lang=\$\{language\}`\}/);
  }
});
