import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const pdf = readFileSync(new URL('../lib/export-pdf.ts', import.meta.url), 'utf8');

test('PDF narrative has explicit ES EN FR DE IT PT branches instead of English fallback', () => {
  for (const language of ['es','en','fr','de','it','pt']) {
    assert.match(pdf, new RegExp(`${language}:\\s*['\"]`));
  }
  assert.doesNotMatch(pdf, /language === 'es' \?/);
});

test('PDF localizes visible priority instead of printing ALTA MEDIA BAJA verbatim', () => {
  assert.match(pdf, /const priorityLabel = result\.priority === 'ALTA' \? t\.high/);
  assert.match(pdf, /\$\{t\.priority\}: \$\{priorityLabel\}/);
});

test('PDF keeps a premium consulting-style cover, executive metrics and section hierarchy', () => {
  assert.match(pdf, /function drawCover\(\)/);
  assert.match(pdf, /function sectionTitle\(text: string\)/);
  assert.match(pdf, /function metricCard\(label: string, value: string/);
  assert.match(pdf, /page\.drawRectangle\(\{ x: 0, y: PAGE_HEIGHT - 226/);
  assert.match(pdf, /metricCard\(t\.products/);
  assert.match(pdf, /sectionTitle\(t\.regulatoryAssessment\)/);
  assert.match(pdf, /sectionTitle\(t\.savedEvidence\)/);
  assert.match(pdf, /sectionTitle\(t\.documentaryGuide\)/);
});

test('PDF retains legal traceability and footer separation while upgrading visuals', () => {
  assert.match(pdf, /lineBlock\(BRAND_INDEPENDENCE_NOTICE, 9\)/);
  assert.match(pdf, /regulatory\.disclaimer/);
  assert.match(pdf, /obligation\.source\.reference/);
  assert.match(pdf, /item\.source_document/);
  assert.match(pdf, /p\.drawRectangle\(\{ x: LEFT, y: 46/);
  assert.match(pdf, /t\.advisoryAssessment/);
});
