import test from 'node:test';
import assert from 'node:assert/strict';
import { dashboardDictionaries, dashboardText } from '../lib/dashboard-copy-v2';

const languages = ['es','en','fr','de','it','pt'] as const;

test('el dashboard tiene exactamente las mismas claves en seis idiomas', () => {
  const expected = Object.keys(dashboardDictionaries.es).sort();
  for (const language of languages) {
    const keys = Object.keys(dashboardDictionaries[language]).sort();
    assert.deepEqual(keys, expected, language);
    for (const [key,value] of Object.entries(dashboardDictionaries[language])) {
      assert.ok(value.trim().length > 0, `${language}.${key} vacío`);
    }
  }
});

test('las superficies principales están realmente traducidas', () => {
  for (const language of ['en','fr','de','it','pt'] as const) {
    for (const key of ['tabDashboard','privateSession','dashboardSubtitle','importBody','reportsReady','privacyTitle'] as const) {
      assert.notEqual(dashboardDictionaries[language][key], dashboardDictionaries.es[key], `${language}.${key}`);
    }
  }
});

test('las plantillas interpolan variables sin dejar tokens visibles', () => {
  assert.equal(dashboardText('en','remaining',{n:3}), '3 left');
  assert.equal(dashboardText('fr','workingWith',{file:'catalogue.xlsx'}), 'Vous travaillez avec catalogue.xlsx.');
  assert.equal(dashboardText('de','subscribeFor',{price:'9,95 €'}), 'Für 9,95 €/Monat abonnieren');
});
