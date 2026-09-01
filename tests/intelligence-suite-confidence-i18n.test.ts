import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { reportLabels } from '../lib/report-i18n';

const suite = readFileSync(new URL('../components/IntelligenceSuite.tsx', import.meta.url), 'utf8');

test('Regulatory Twin renders localized confidence instead of raw technical enum', () => {
  assert.match(suite, /const report = reportLabels\[language\]/);
  assert.match(suite, /confidenceLabel\(regulatory\.confidence\)/);
  assert.doesNotMatch(suite, /<strong>\{regulatory\.confidence\}<\/strong>/);
});

test('confidence labels exist for every supported report language', () => {
  for (const language of ['es', 'en', 'fr', 'de', 'it', 'pt'] as const) {
    assert.ok(reportLabels[language].confidenceHigh);
    assert.ok(reportLabels[language].confidenceMedium);
    assert.ok(reportLabels[language].confidenceLow);
  }
});
