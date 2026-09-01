import test from 'node:test';
import assert from 'node:assert/strict';
import { assessEuRegulatory } from '../lib/eu-regulatory-engine';
import { localizeEuRegulatoryAssessment } from '../lib/eu-regulatory-i18n';
import { localizeMarketReadiness } from '../lib/market-readiness-i18n';
import { marketReadiness } from '../lib/market-readiness';

const product = { name:'radio toy', manufacturer:'', responsible:'', warning:'' };

test('market readiness localizes fixed blockers and labels while preserving state', () => {
  const regulatory = localizeEuRegulatoryAssessment(assessEuRegulatory(product), 'en');
  const result = { name: product.name, score: 10, priority: 'ALTA' as const, missing: ['Fabricante'], regulatory };
  const raw = marketReadiness(product, result);
  const localized = localizeMarketReadiness(raw, 'en');
  assert.equal(localized.state, raw.state);
  assert.equal(localized.label, 'Not ready for market');
  assert.match(localized.blockers[0], /Manufacturer identification is missing/);
  assert.ok(localized.nextActions.some(item => item === regulatory.obligations[0].title));
});

test('Spanish readiness remains presentation compatible', () => {
  const regulatory = assessEuRegulatory(product);
  const result = { name: product.name, score: 10, priority: 'ALTA' as const, missing: ['Fabricante'], regulatory };
  const raw = marketReadiness(product, result);
  assert.equal(localizeMarketReadiness(raw, 'es'), raw);
});
