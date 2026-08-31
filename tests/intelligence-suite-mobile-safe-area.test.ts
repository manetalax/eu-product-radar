import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../components/IntelligenceSuite.module.css', import.meta.url), 'utf8');

test('Intelligence Suite protects independent left and right mobile safe areas', () => {
  assert.match(css, /padding-left:max\(16px,env\(safe-area-inset-left\)\)/);
  assert.match(css, /padding-right:max\(16px,env\(safe-area-inset-right\)\)/);
  assert.doesNotMatch(css, /padding:0 max\(16px,env\(safe-area-inset-left\)\)/);
});

test('Intelligence Suite retains bottom safe-area spacing and iOS input zoom protection', () => {
  assert.match(css, /margin-bottom:max\(48px,env\(safe-area-inset-bottom\)\)/);
  assert.match(css, /\.aiInput,\.productSelect,\.urlRow input\{font-size:16px\}/);
});
