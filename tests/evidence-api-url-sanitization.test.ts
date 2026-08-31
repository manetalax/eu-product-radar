import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { safeEvidenceUrl } from '../lib/evidence';

test('safeEvidenceUrl strips unsafe persisted URLs', () => {
  assert.equal(safeEvidenceUrl('https://example.com/evidence.pdf'), 'https://example.com/evidence.pdf');
  assert.equal(safeEvidenceUrl('http://example.com/evidence.pdf'), '');
  assert.equal(safeEvidenceUrl('javascript:alert(1)'), '');
  assert.equal(safeEvidenceUrl('https://user:pass@example.com/evidence.pdf'), '');
  assert.equal(safeEvidenceUrl(undefined), '');
});

test('evidence API sanitizes URLs before returning persisted rows', async () => {
  const source = await readFile(new URL('../app/api/evidence/route.ts', import.meta.url), 'utf8');
  assert.match(source, /safeEvidenceUrl/);
  assert.match(source, /\(data \?\? \[\]\)\.map\(sanitizeEvidenceRow\)/);
  assert.match(source, /sanitizeEvidenceRow\(data\)/);
});

test('regulatory agent sanitizes persisted evidence URLs before AI context', async () => {
  const source = await readFile(new URL('../app/api/regulatory-agent/route.ts', import.meta.url), 'utf8');
  assert.match(source, /source_url: safeEvidenceUrl\(item\.source_url\)/);
  assert.match(source, /evidence,\n\s+radar,/);
});
