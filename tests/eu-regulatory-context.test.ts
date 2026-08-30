import test from 'node:test';
import assert from 'node:assert/strict';
import { analyze, validateProducts } from '../lib/analysis';
import { regulatoryContextText } from '../lib/eu-regulatory-context';

test('clasifica un nombre genérico como radioeléctrico usando conectividad', () => {
  const [product] = validateProducts([{
    name: 'Modelo X200', manufacturer: 'Marca', responsible: 'Importador UE', warning: 'Leer manual',
    description: 'Dispositivo de audio portátil', connectivity: 'Bluetooth 5.3', intendedUse: 'Reproducción de audio',
  }]);
  const result = analyze([product], 'EU')[0];
  assert.equal(result.regulatory?.category, 'Equipo radioeléctrico');
  assert.match(regulatoryContextText(product), /Bluetooth 5\.3/);
  assert.match(result.regulatory?.uncertainties[0] ?? '', /señales del producto/i);
});

test('clasifica un nombre genérico por la información de batería', () => {
  const [product] = validateProducts([{
    name: 'Accesorio portátil A1', manufacturer: 'Marca', responsible: 'Importador UE', warning: 'No perforar',
    power: 'Batería de litio recargable 10.000 mAh', description: 'Fuente de energía portátil para dispositivos',
  }]);
  const result = analyze([product], 'EU')[0];
  assert.equal(result.regulatory?.category, 'Batería o producto con batería');
  assert.ok(result.regulatory?.applicableActs.some(act => act.reference === 'Regulation (EU) 2023/1542'));
});

test('los campos regulatorios opcionales se validan y no aceptan objetos arbitrarios', () => {
  assert.throws(() => validateProducts([{
    name: 'A', manufacturer: '', responsible: '', warning: '', description: { unsafe: true },
  }]), /description/);

  const [product] = validateProducts([{
    name: 'A', manufacturer: '', responsible: '', warning: '', materials: '100% algodón', audience: 'adultos',
  }]);
  assert.equal(product.materials, '100% algodón');
  assert.equal(product.audience, 'adultos');
});
