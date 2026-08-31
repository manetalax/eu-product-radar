import test from 'node:test';
import assert from 'node:assert/strict';
import { reportLabels } from '../lib/report-i18n';
import type { Language } from '../lib/landing-i18n';

const languages: Language[] = ['es','en','fr','de','it','pt'];

test('los informes conservan etiquetas estructurales completas en seis idiomas', () => {
  for (const language of languages) {
    const labels = reportLabels[language];
    for (const [key, value] of Object.entries(labels)) {
      assert.ok(value.trim().length > 0, `${language}.${key} vacío`);
    }
  }
});

test('las superficies principales no recaen al español en idiomas secundarios', () => {
  for (const language of languages.filter(item => item !== 'es')) {
    assert.notEqual(reportLabels[language].summary, reportLabels.es.summary);
    assert.notEqual(reportLabels[language].catalogueReport, reportLabels.es.catalogueReport);
    assert.notEqual(reportLabels[language].documentaryGuide, reportLabels.es.documentaryGuide);
    assert.notEqual(reportLabels[language].savedEvidence, reportLabels.es.savedEvidence);
  }
});
