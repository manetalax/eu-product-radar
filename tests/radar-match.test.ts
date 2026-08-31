import test from 'node:test';
import assert from 'node:assert/strict';
import { radarMatchScore, relevantRadarChanges } from '../lib/radar-match';

const product = {
  name: 'Auriculares Bluetooth X1',
  manufacturer: 'Marca SA',
  responsible: 'Importador SL',
  warning: 'Leer instrucciones',
  description: 'Auriculares inalámbricos recargables',
  connectivity: 'Bluetooth 5.3',
};

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
