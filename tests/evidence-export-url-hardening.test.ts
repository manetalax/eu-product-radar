import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isValidEvidenceUrl, safeEvidenceUrl } from '../lib/evidence';

const exportSource = readFileSync(new URL('../lib/export-report.ts', import.meta.url), 'utf8');

test('evidence URLs only allow credential-free HTTPS without whitespace', () => {
  assert.equal(isValidEvidenceUrl('https://example.com/document.pdf'), true);
  assert.equal(isValidEvidenceUrl('http://example.com/document.pdf'), false);
  assert.equal(isValidEvidenceUrl('javascript:alert(1)'), false);
  assert.equal(isValidEvidenceUrl('https://user:secret@example.com/document.pdf'), false);
  assert.equal(isValidEvidenceUrl('https://example.com/a b'), false);
});

test('safeEvidenceUrl strips unsafe or missing legacy values before rendering/export', () => {
  assert.equal(safeEvidenceUrl('https://example.com/evidence'), 'https://example.com/evidence');
  assert.equal(safeEvidenceUrl('http://example.com/evidence'), '');
  assert.equal(safeEvidenceUrl('https://user:secret@example.com/evidence'), '');
  assert.equal(safeEvidenceUrl(undefined), '');
  assert.equal(safeEvidenceUrl(null), '');
});

test('Excel evidence hyperlinks are revalidated at export time', () => {
  assert.match(exportSource, /const safeUrl = safeEvidenceUrl\(item\.source_url\)/);
  assert.match(exportSource, /if \(safeUrl\).*hyperlink: safeUrl/);
  assert.doesNotMatch(exportSource, /hyperlink: item\.source_url/);
});
