import test from 'node:test';
import assert from 'node:assert/strict';
import { analyze, validateProducts } from '../lib/analysis';
import { marketReadiness } from '../lib/market-readiness';

test('bloquea comercialización cuando falta fabricante u operador UE', () => {
  const product = validateProducts([{ name: 'Lámpara eléctrica', manufacturer: '', responsible: '', warning: 'Leer instrucciones' }])[0];
  const result = analyze([product], 'EU')[0];
  const decision = marketReadiness(product, result);
  assert.equal(decision.state, 'NOT_READY_TO_MARKET');
  assert.ok(decision.blockers.length >= 2);
});

test('permite continuar solo como revisión cuando la categoría necesita confirmación', () => {
  const product = validateProducts([{ name: 'Modelo X', manufacturer: 'Marca SA', responsible: 'Importador SL', warning: 'Leer instrucciones', connectivity: 'Bluetooth 5.3' }])[0];
  const result = analyze([product], 'EU')[0];
  const decision = marketReadiness(product, result);
  assert.equal(decision.state, 'REVIEW_REQUIRED');
  assert.match(decision.label, /Revisión/i);
});

test('nunca presenta el estado positivo como certificación', () => {
  const product = validateProducts([{ name: 'Producto doméstico', manufacturer: 'Marca SA', responsible: 'Importador SL', warning: 'Leer instrucciones', description: 'Artículo doméstico general', intendedUse: 'Uso doméstico' }])[0];
  const result = analyze([product], 'EU')[0];
  const decision = marketReadiness(product, result);
  assert.notEqual(decision.label.toLowerCase(), 'cumple');
  assert.notEqual(decision.label.toLowerCase(), 'certificado');
});
