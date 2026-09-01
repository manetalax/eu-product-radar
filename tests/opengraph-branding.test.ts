import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../app/opengraph-image.tsx', import.meta.url), 'utf8');

test('shared Open Graph image uses the canonical ImportVerifier brand', () => {
  assert.match(source, /export const alt = 'ImportVerifier ·/);
  assert.match(source, /<span>Import<\/span><span[^>]*>Verifier<\/span>/);
  assert.doesNotMatch(source, /Import Rules Verifier/);
});

test('Open Graph image keeps the independent EU regulatory framing', () => {
  assert.match(source, /EU IMPORT RULES · ANÁLISIS INDEPENDIENTE/);
  assert.match(source, /Unión Europea/);
});
