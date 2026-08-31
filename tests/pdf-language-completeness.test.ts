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
  assert.match(pdf, /page\.drawRectangle\(\{ x: 0, y: PAGE_HEIGHT - \d+, width: PAGE_WIDTH, height: \d+, color: navy \}\)/);
  assert.match(pdf, /drawMonogram\(page/);
  assert.match(pdf, /page\.drawText\(pdfText\(reportClass\)/);
  assert.match(pdf, /metricCard\(t\.products/);
  assert.match(pdf, /sectionTitle\(t\.regulatoryAssessment\)/);
  assert.match(pdf, /sectionTitle\(t\.savedEvidence\)/);
  assert.match(pdf, /sectionTitle\(t\.documentaryGuide\)/);
});

test('PDF retains legal traceability and repeated footer separation while upgrading visuals', () => {
  assert.match(pdf, /lineBlock\(BRAND_INDEPENDENCE_NOTICE, 9\)/);
  assert.match(pdf, /lineBlock\(regulatory\.disclaimer, 8\)/);
  assert.match(pdf, /obligation\.source\.reference/);
  assert.match(pdf, /item\.source_document/);
  assert.match(pdf, /item\.source_url/);
  assert.match(pdf, /pages\.forEach\(\(p, i\) =>/);
  assert.match(pdf, /p\.drawRectangle\(\{ x: LEFT, y: \d+, width: CONTENT_WIDTH, height: \.7, color: line \}\)/);
  assert.match(pdf, /p\.drawText\('EU'/);
  assert.match(pdf, /\$\{i \+ 1\} \/ \$\{pages\.length\}/);
  assert.match(pdf, /p\.drawText\(pdfText\(BRAND_DOCUMENT_FOOTER\)/);
});
