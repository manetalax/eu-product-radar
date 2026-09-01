import test from 'node:test';
import assert from 'node:assert/strict';
import { guideScopeByLanguage, guideScopeFor } from '../lib/guide-i18n';
import { LANGUAGES } from '../lib/landing-i18n';

test('documentary guide scope is complete in all supported languages', () => {
  assert.deepEqual(Object.keys(guideScopeByLanguage).sort(), [...LANGUAGES].sort());
  for (const language of LANGUAGES) {
    const value = guideScopeFor(language);
    assert.ok(value.length > 80, `${language} scope is too short`);
    assert.ok(!value.includes('undefined'));
  }
});

test('secondary languages do not silently reuse the Spanish scope', () => {
  const es = guideScopeFor('es');
  for (const language of ['en','fr','de','it','pt'] as const) {
    assert.notEqual(guideScopeFor(language), es);
  }
});
