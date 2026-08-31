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
