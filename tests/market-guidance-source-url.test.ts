import test from 'node:test';
import assert from 'node:assert/strict';
import { SOURCES } from '../lib/documentation';
import { safeMarketGuidanceUrl } from '../lib/regulatory-source-url';

test('market guidance constants stay on explicit official HTTPS hosts', () => {
  const cases = [
    ['EU', SOURCES.euGpsr],
    ['EU', SOURCES.euCe],
    ['EU', SOURCES.euAssessment],
    ['US', SOURCES.usTesting],
    ['US', SOURCES.usGcc],
    ['CN', SOURCES.cnCcc],
    ['GB', SOURCES.gbSafety],
    ['GB', SOURCES.gbMarking],
    ['JP', SOURCES.jpSafety],
    ['JP', SOURCES.jpPse],
  ] as const;

  for (const [market, source] of cases) {
    assert.ok(safeMarketGuidanceUrl(source, market), `${market} source must remain on its explicit official host: ${source}`);
  }
});

test('future-market guidance rejects unsafe and lookalike destinations', () => {
  assert.equal(safeMarketGuidanceUrl('http://www.cpsc.gov/Business--Manufacturing', 'US'), '');
  assert.equal(safeMarketGuidanceUrl('https://www.cpsc.gov.evil.example/path', 'US'), '');
  assert.equal(safeMarketGuidanceUrl('https://sub.www.cpsc.gov/path', 'US'), '');
  assert.equal(safeMarketGuidanceUrl('https://user:pass@www.gov.uk/guidance/test', 'GB'), '');
  assert.equal(safeMarketGuidanceUrl('https://www.gov.uk:8443/guidance/test', 'GB'), '');
  assert.equal(safeMarketGuidanceUrl('https://www.meti.go.jp.evil.example/path', 'JP'), '');
  assert.equal(safeMarketGuidanceUrl('javascript:alert(1)', 'EU'), '');
  assert.equal(safeMarketGuidanceUrl('https://www.customs.gov.cn/path#fragment', 'CN'), 'https://www.customs.gov.cn/path');
});
