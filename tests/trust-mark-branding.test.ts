import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../components/TrustMark.tsx', import.meta.url), 'utf8');

test('internal trust mark canonicalizes legacy abbreviations to ImportVerifier', () => {
  assert.match(source, /title\.replace\(\/\\b\(\?:EPR\|IRV\)\\b\/g, 'ImportVerifier'\)/);
  assert.doesNotMatch(source, /'IRV Trust Mark'/);
});

test('trust mark remains framed by caller-provided non-certification explanation', () => {
  assert.match(source, /const brandExplanation = explanation/);
  assert.match(source, /title=\{brandExplanation\}/);
  assert.match(source, /<p>\{brandExplanation\}<\/p>/);
});
