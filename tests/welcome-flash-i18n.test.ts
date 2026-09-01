import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../components/WelcomeFlash.tsx', import.meta.url), 'utf8');

test('welcome confirmation uses the canonical ImportVerifier brand and active language', () => {
  assert.match(source, /const \{ language \} = useLanguage\(\)/);
  assert.match(source, /const t = welcomeCopy\[language\]/);
  assert.doesNotMatch(source, /Import Rules Verifier/);
  assert.match(source, /ImportVerifier/);
});

test('welcome confirmation copy is explicit in all six supported languages', () => {
  for (const language of ['es', 'en', 'fr', 'de', 'it', 'pt']) {
    assert.match(source, new RegExp(`\\b${language}: \\{ title:`), language);
  }
  assert.match(source, /aria-label=\{t\.close\}/);
  assert.match(source, /\{t\.title\}/);
  assert.match(source, /\{t\.detail\}/);
});
