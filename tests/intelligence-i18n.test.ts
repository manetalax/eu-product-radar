import test from 'node:test';
import assert from 'node:assert/strict';
import { intelligenceCopy } from '../lib/intelligence-i18n';

const languages = ['es','en','fr','de','it','pt'] as const;

test('la Intelligence Suite mantiene copy completo en seis idiomas', () => {
  for (const language of languages) {
    const copy = intelligenceCopy[language];
    for (const [key, value] of Object.entries(copy)) {
      assert.equal(typeof value, 'string', `${language}.${key}`);
      assert.ok(value.trim().length > 0, `${language}.${key} vacío`);
    }
  }
});

test('los textos principales no caen silenciosamente al español', () => {
  for (const language of languages.filter(language => language !== 'es')) {
    assert.notEqual(intelligenceCopy[language].heroTitle, intelligenceCopy.es.heroTitle);
    assert.notEqual(intelligenceCopy[language].aiLead, intelligenceCopy.es.aiLead);
    assert.notEqual(intelligenceCopy[language].radarLead, intelligenceCopy.es.radarLead);
    assert.notEqual(intelligenceCopy[language].connectLead, intelligenceCopy.es.connectLead);
  }
});
