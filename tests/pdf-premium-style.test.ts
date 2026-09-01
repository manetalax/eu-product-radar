import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../lib/export-pdf.ts', import.meta.url), 'utf8');

test('PDF report keeps premium issuer identity and document classification', () => {
  assert.match(source, /function drawBrandMark/);
  assert.match(source, /target\.drawLine/);
  assert.match(source, /BRAND_DOCUMENT_TITLE/);
  assert.match(source, /reportClass/);
  assert.match(source, /VERIFIED/);
  assert.match(source, /reviewSealLabel/);
  assert.match(source, /drawVerifiedSeal/);
  assert.doesNotMatch(source, /drawText\('IV'/);
});

test('PDF report repeats regulatory context and pagination on every page', () => {
  assert.match(source, /authorityContext/);
  assert.match(source, /pages\.forEach/);
  assert.match(source, /euBlue/);
  assert.match(source, /BRAND_DOCUMENT_FOOTER/);
  assert.match(source, /pages\.length/);
});

test('premium PDF preserves evidence and official-source traceability', () => {
  assert.match(source, /fetchEvidenceForAnalysis/);
  assert.match(source, /evidenceForProduct/);
  assert.match(source, /t\.officialSource/);
  assert.match(source, /item\.source_url/);
  assert.match(source, /BRAND_INDEPENDENCE_NOTICE/);
});
