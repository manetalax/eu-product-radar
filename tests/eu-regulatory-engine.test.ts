import test from 'node:test';
import assert from 'node:assert/strict';
import { analyze, validateProducts } from '../lib/analysis';
import { assessEuRegulatory, EU_REGULATORY_ENGINE_VERSION } from '../lib/eu-regulatory-engine';

const product = (name: string) => ({ name, manufacturer: 'Fabricante SA', responsible: 'Importador EU SL', warning: 'Leer instrucciones' });

test('una categoría desconocida permanece explícitamente sin confirmar', () => {
  const result = assessEuRegulatory(product('Objeto promocional modelo X'));
  assert.equal(result.engineVersion, EU_REGULATORY_ENGINE_VERSION);
  assert.equal(result.confidence, 'low');
  assert.equal(result.requiresCategoryConfirmation, true);
  assert.match(result.category, /confirmar/i);
  assert.equal(result.applicableActs[0].reference, 'Regulation (EU) 2023/988');
  assert.ok(result.uncertainties.length > 0);
});

test('un juguete obtiene reglas sectoriales candidatas y evaluación de seguridad', () => {
  const result = assessEuRegulatory(product('Muñeca de juguete para niños'));
  assert.equal(result.category, 'Juguete');
  assert.equal(result.confidence, 'high');
  assert.ok(result.applicableActs.some(act => act.reference === 'Directive 2009/48/EC'));
  assert.ok(result.applicableActs.some(act => act.reference.includes('2025/2509')));
  assert.ok(result.obligations.some(item => item.id === 'toy-safety-assessment'));
});

test('un producto radioeléctrico no se declara conforme: exige confirmación y evidencia', () => {
  const result = assessEuRegulatory(product('Auriculares Bluetooth'));
  assert.equal(result.category, 'Equipo radioeléctrico');
  assert.equal(result.requiresCategoryConfirmation, true);
  assert.ok(result.applicableActs.some(act => act.reference === 'Directive 2014/53/EU'));
  assert.ok(result.obligations.some(item => item.id.startsWith('ce-')));
  assert.match(result.disclaimer, /no constituye certificación/i);
});

test('el análisis UE adjunta evaluación regulatoria sin cambiar el indicador legado', () => {
  const products = validateProducts([{ name: 'Lámpara eléctrica', manufacturer: '', responsible: '', warning: '' }]);
  const eu = analyze(products, 'EU')[0];
  assert.equal(eu.score, 92);
  assert.equal(eu.regulatory?.category, 'Equipo eléctrico');
  assert.ok(eu.regulatory?.obligations.some(item => item.id === 'missing-manufacturer'));

  const us = analyze(products, 'US')[0];
  assert.equal(us.score, 92);
  assert.equal(us.regulatory, undefined);
});
