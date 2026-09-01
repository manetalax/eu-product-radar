import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { radarMatchScore, relevantRadarChanges } from '../lib/radar-match';
import { safeOfficialRegulatoryUrl } from '../lib/regulatory-source-url';

const product = {
  name: 'Auriculares Bluetooth X1',
  manufacturer: 'Marca SA',
  responsible: 'Importador SL',
  warning: 'Leer instrucciones',
  description: 'Auriculares inalámbricos recargables',
  connectivity: 'Bluetooth 5.3',
};
const suiteSource = readFileSync(new URL('../components/IntelligenceSuite.tsx', import.meta.url), 'utf8');

test('prioriza un cambio cuyas palabras clave coinciden con el producto', () => {
  const score = radarMatchScore({ id: '1', title: 'Radio', summary: '', affected_keywords: ['bluetooth', 'equipo radioeléctrico'] }, product, 'radio equipment');
  assert.ok(score >= 2);
});

test('descarta cambios sin relación textual con el producto', () => {
  const changes = relevantRadarChanges([
    { id: 'toys', title: 'Juguetes', summary: '', affected_keywords: ['juguete', 'niños'] },
    { id: 'radio', title: 'Radio', summary: '', affected_keywords: ['bluetooth'] },
  ], product, 'radio equipment');
  assert.deepEqual(changes.map(change => change.id), ['radio']);
});

test('solo conserva URLs HTTPS de dominios regulatorios UE permitidos', () => {
  assert.equal(safeOfficialRegulatoryUrl('https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32023R0988#x'), 'https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32023R0988');
  assert.equal(safeOfficialRegulatoryUrl('https://sub.ec.europa.eu/path'), 'https://sub.ec.europa.eu/path');
  for (const unsafe of [
    'http://eur-lex.europa.eu/path',
    'https://eur-lex.europa.eu.evil.test/path',
    'https://user:secret@ec.europa.eu/path',
    'https://example.com/path',
    'https://ec.europa.eu/path with spaces',
  ]) assert.equal(safeOfficialRegulatoryUrl(unsafe), '');
});

test('un evento histórico con URL manipulada puede coincidir pero nunca conserva enlace activo', () => {
  const [change] = relevantRadarChanges([{
    id: 'radio', title: 'Radio', summary: '', affected_keywords: ['bluetooth'], source_url: 'javascript:alert(1)',
  }], product, 'radio equipment');
  assert.equal(change.source_url, '');
});

test('Intelligence Suite solo renderiza el enlace Radar cuando la URL saneada existe', () => {
  assert.match(suiteSource, /event\.source_url \?/);
  assert.match(suiteSource, /href=\{event\.source_url\}/);
  assert.match(suiteSource, /rel="noopener noreferrer"/);
});
