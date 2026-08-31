import test from 'node:test';
import assert from 'node:assert/strict';
import { assessEuRegulatory } from '../lib/eu-regulatory-engine';
import { localizeEuRegulatoryAssessment } from '../lib/eu-regulatory-i18n';

const original = assessEuRegulatory({ name:'juguete con batería', manufacturer:'', responsible:'', warning:'' });

test('Spanish regulatory assessment remains byte-for-byte presentation compatible', () => {
  assert.equal(localizeEuRegulatoryAssessment(original, 'es'), original);
});

test('secondary languages localize category, reasons, obligations, evidence, uncertainty and disclaimer', () => {
  for (const language of ['en','fr','de','it','pt'] as const) {
    const localized = localizeEuRegulatoryAssessment(original, language);
    assert.notEqual(localized.category, original.category, language);
    assert.notEqual(localized.applicableActs[0].reason, original.applicableActs[0].reason, language);
    assert.notEqual(localized.obligations[0].title, original.obligations[0].title, language);
    assert.notEqual(localized.obligations[0].reason, original.obligations[0].reason, language);
    assert.notDeepEqual(localized.obligations[0].evidence, original.obligations[0].evidence, language);
    assert.notEqual(localized.uncertainties[0], original.uncertainties[0], language);
    assert.notEqual(localized.disclaimer, original.disclaimer, language);
    assert.equal(localized.applicableActs[0].reference, original.applicableActs[0].reference);
    assert.equal(localized.applicableActs[0].url, original.applicableActs[0].url);
  }
});

test('dynamic CE obligations get localized without changing their official source', () => {
  const electrical = assessEuRegulatory({ name:'cargador eléctrico', manufacturer:'Maker', responsible:'EU Operator', warning:'Read manual' });
  const ce = electrical.obligations.find(item => item.id.startsWith('ce-'))!;
  const localized = localizeEuRegulatoryAssessment(electrical, 'en').obligations.find(item => item.id === ce.id)!;
  assert.match(localized.title, /CE marking/i);
  assert.equal(localized.source.reference, ce.source.reference);
  assert.equal(localized.source.url, ce.source.url);
});
