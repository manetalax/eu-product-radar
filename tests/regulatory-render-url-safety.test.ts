import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { safeOfficialRegulatoryUrl } from '@/lib/regulatory-source-url';

const component = readFileSync(new URL('../components/RegulatoryAssessment.tsx', import.meta.url), 'utf8');

test('regulatory assessment sanitizes official links immediately before rendering', () => {
  assert.match(component, /safeOfficialRegulatoryUrl\(act\.url\)/);
  assert.match(component, /safeOfficialRegulatoryUrl\(obligation\.source\.url\)/);
  assert.doesNotMatch(component, /href=\{act\.url\}/);
  assert.doesNotMatch(component, /href=\{obligation\.source\.url\}/);
});

test('official regulatory URL sanitizer rejects unsafe render targets', () => {
  assert.equal(safeOfficialRegulatoryUrl('https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R0988'), 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R0988');
  assert.equal(safeOfficialRegulatoryUrl('javascript:alert(1)'), '');
  assert.equal(safeOfficialRegulatoryUrl('https://eur-lex.europa.eu.evil.example/legal-content'), '');
  assert.equal(safeOfficialRegulatoryUrl('https://user:pass@eur-lex.europa.eu/legal-content'), '');
  assert.equal(safeOfficialRegulatoryUrl('https://eur-lex.europa.eu:444/legal-content'), '');
});
