import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../lib/export-regulatory.ts', import.meta.url), 'utf8');

test('regulatory worksheet keeps branded title and explanatory scope bands', () => {
  assert.match(source, /const C = \{ navy:/);
  assert.match(source, /title\.fill = \{ type: 'pattern', pattern: 'solid', fgColor: \{ argb: C\.navy \} \}/);
  assert.match(source, /scope\.fill = \{ type: 'pattern', pattern: 'solid', fgColor: \{ argb: C\.pale \} \}/);
  assert.match(source, /ws\.getRow\(1\)\.height = 44/);
});

test('regulatory worksheet keeps premium headers and readable alternating detail rows', () => {
  assert.match(source, /fgColor: \{ argb: C\.purple \}/);
  assert.match(source, /row % 2 \? C\.white : C\.pale/);
  assert.match(source, /style: 'hair'/);
  assert.match(source, /ws\.autoFilter = `A4:H\$\{row - 1\}`/);
  assert.match(source, /ws\.pageSetup\.printTitlesRow = '1:4'/);
});
