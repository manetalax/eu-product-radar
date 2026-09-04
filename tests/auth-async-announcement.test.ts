import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const source = fs.readFileSync(path.join(process.cwd(), 'components/AuthForm.tsx'), 'utf8');

test('auth async work is announced without moving focus', () => {
  assert.match(source, /aria-busy=\{busy\}/);
  assert.match(source, /className="sr-only" role="status" aria-live="polite" aria-atomic="true"/);
  assert.match(source, /\{busy \? t\.processing : ''\}/);
  assert.doesNotMatch(source, /\.focus\(\)/);
});
