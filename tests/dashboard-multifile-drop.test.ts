import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { uploadCopy } from '../lib/upload-i18n';

const dashboard = readFileSync(new URL('../components/Dashboard.tsx', import.meta.url), 'utf8');

test('dashboard rejects ambiguous multi-file drops instead of silently importing the first file', () => {
  assert.match(dashboard, /const files = event\.dataTransfer\.files;/);
  assert.match(dashboard, /if \(files\.length > 1\) \{ setNotice\(''\); setError\(uploadT\.singleFileOnly\); return; \}/);
  assert.match(dashboard, /const file = files\.item\(0\); if \(file\) void load\(file\);/);
  assert.doesNotMatch(dashboard, /event\.dataTransfer\.files\?\.\[0\]/);
});

test('single-file drop guidance is localized in every supported language', () => {
  for (const language of ['es', 'en', 'fr', 'de', 'it', 'pt'] as const) {
    assert.ok(uploadCopy[language].singleFileOnly.trim().length > 20);
  }
});

test('drop zone does not import while loading, busy or free quota is exhausted', () => {
  assert.match(dashboard, /if \(busy \|\| loading \|\| quotaBlocked\) return;/);
  assert.match(dashboard, /aria-disabled=\{busy \|\| loading \|\| quotaBlocked\}/);
});
