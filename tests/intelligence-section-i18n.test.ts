import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { intelligenceSectionCopy } from '../lib/intelligence-section-i18n';

const languages = ['es','en','fr','de','it','pt'] as const;
const suiteSource = readFileSync(new URL('../components/IntelligenceSuite.tsx', import.meta.url), 'utf8');

test('Intelligence Suite section labels exist in all supported languages', () => {
  const keys = Object.keys(intelligenceSectionCopy.en).sort();
  for (const language of languages) {
    assert.deepEqual(Object.keys(intelligenceSectionCopy[language]).sort(), keys, language);
    for (const [key, value] of Object.entries(intelligenceSectionCopy[language])) {
      assert.ok(value.trim().length > 0, `${language}.${key} is empty`);
    }
  }
});

test('non-English section labels do not fall back to English headings', () => {
  for (const language of ['es','fr','de','it','pt'] as const) {
    assert.notEqual(intelligenceSectionCopy[language].twinTitle, intelligenceSectionCopy.en.twinTitle);
    assert.notEqual(intelligenceSectionCopy[language].radarTitle, intelligenceSectionCopy.en.radarTitle);
    assert.notEqual(intelligenceSectionCopy[language].connectTitle, intelligenceSectionCopy.en.connectTitle);
  }
});

test('IntelligenceSuite consumes localized section copy', () => {
  assert.match(suiteSource, /intelligenceSectionCopy\[language\]/);
  assert.match(suiteSource, /section\.twinTitle/);
  assert.match(suiteSource, /section\.radarTitle/);
  assert.match(suiteSource, /section\.connectTitle/);
  assert.doesNotMatch(suiteSource, /<h3>Product Regulatory Twin<\/h3>/);
  assert.doesNotMatch(suiteSource, /<h3>Regulatory Impact Radar<\/h3>/);
  assert.doesNotMatch(suiteSource, /<h3>Connect<\/h3>/);
});
