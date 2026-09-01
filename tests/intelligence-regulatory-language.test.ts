import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const suite = readFileSync(new URL('../components/IntelligenceSuite.tsx', import.meta.url), 'utf8');

test('Intelligence Suite localizes regulatory presentation while preserving raw matching context', () => {
  assert.match(suite, /localizeEuRegulatoryAssessment\(rawRegulatory, language\)/);
  assert.match(suite, /const actions = regulatory\?\.obligations\.map/);
  assert.match(suite, /regulatory\.uncertainties\.map/);
  assert.match(suite, /regulatory\.applicableActs\.slice/);
  assert.match(suite, /relevantRadarChanges\(radarEvents, product, rawRegulatory\?\.category/);
});

test('saved evidence keys remain based on canonical raw obligation text', () => {
  assert.match(suite, /const key = `\$\{rawObligation\.title\}: \$\{rawTitle\}`\.slice\(0, 120\)/);
  assert.match(suite, /displayed\.evidence\[index\] \?\? rawTitle/);
});
