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

test('textiles y calzado activan sus regímenes de etiquetado sin inventar CE', () => {
  const textile = assessEuRegulatory(product('Camiseta algodón hombre'));
  assert.equal(textile.category, 'Producto textil');
  assert.ok(textile.applicableActs.some(act => act.reference === 'Regulation (EU) No 1007/2011'));
  assert.ok(textile.obligations.some(item => item.id === 'textile-labelling'));
  assert.equal(textile.obligations.some(item => item.id.startsWith('ce-')), false);

  const footwear = assessEuRegulatory(product('Zapatilla deportiva urbana'));
  assert.equal(footwear.category, 'Calzado');
  assert.ok(footwear.applicableActs.some(act => act.reference === 'Directive 94/11/EC'));
  assert.ok(footwear.obligations.some(item => item.id === 'footwear-materials'));
});

test('baterías y envases quedan sujetos a sus marcos específicos candidatos', () => {
  const battery = assessEuRegulatory(product('Power bank batería litio 10000 mAh'));
  assert.equal(battery.category, 'Batería o producto con batería');
  assert.ok(battery.applicableActs.some(act => act.reference === 'Regulation (EU) 2023/1542'));
  assert.ok(battery.obligations.some(item => item.id === 'battery-information'));

  const packaging = assessEuRegulatory(product('Caja packaging de cartón para producto'));
  assert.equal(packaging.category, 'Envase o producto de embalaje');
  assert.ok(packaging.applicableActs.some(act => act.reference === 'Regulation (EU) 2025/40'));
});

test('contacto alimentario exige evidencia de aptitud y trazabilidad', () => {
  const result = assessEuRegulatory(product('Botella reutilizable para agua'));
  assert.equal(result.category, 'Artículo en contacto con alimentos');
  assert.ok(result.applicableActs.some(act => act.reference === 'Regulation (EC) No 1935/2004'));
  assert.ok(result.obligations.some(item => item.id === 'food-contact-compliance'));
});

test('detergentes y químicos añaden CLP como candidato sin asumir peligrosidad', () => {
  const detergent = assessEuRegulatory(product('Detergente lavavajillas concentrado'));
  assert.equal(detergent.category, 'Detergente o producto de limpieza');
  assert.ok(detergent.applicableActs.some(act => act.reference === 'Regulation (EC) No 648/2004'));
  assert.ok(detergent.applicableActs.some(act => act.reference === 'Regulation (EC) No 1272/2008'));
  assert.match(detergent.uncertainties.join(' '), /confirmar/i);

  const chemical = assessEuRegulatory(product('Adhesivo industrial multiusos'));
  assert.equal(chemical.category, 'Sustancia o mezcla química');
  assert.ok(chemical.obligations.some(item => item.id === 'clp-classification'));
});

test('mobiliario y productos infantiles permanecen en evaluación conservadora', () => {
  const furniture = assessEuRegulatory(product('Silla de comedor de madera'));
  assert.equal(furniture.category, 'Mueble o artículo de mobiliario');
  assert.ok(furniture.obligations.some(item => item.id === 'furniture-safety'));

  const child = assessEuRegulatory(product('Trona plegable para bebé'));
  assert.equal(child.category, 'Producto infantil no clasificado aún como juguete');
  assert.ok(child.obligations.some(item => item.id === 'child-product-risk'));
  assert.equal(child.requiresCategoryConfirmation, true);
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
