import test from 'node:test';
import assert from 'node:assert/strict';
import { formatProductCount, landingCopy, LANGUAGES } from '../lib/landing-i18n';
import { FREE_TRIAL_PRODUCT_LIMIT, PLANS, UNLIMITED_FAIR_USE_CEILING } from '../lib/plans';

test('cada cuenta conserva exactamente 5 productos de prueba gratuita', () => {
  assert.equal(FREE_TRIAL_PRODUCT_LIMIT, 5);
});

test('la oferta comercial pública es un único plan Unlimited a 9,95 €/mes', () => {
  assert.deepEqual(PLANS.map(plan => [plan.id, plan.name, plan.monthlyPriceEur, plan.unlimited]), [
    ['starter', 'Unlimited', 9.95, true],
  ]);
  assert.equal(PLANS[0].monthlyProductLimit, UNLIMITED_FAIR_USE_CEILING);
  assert.deepEqual(PLANS.filter(plan => plan.featured).map(plan => plan.id), ['starter']);
});

test('cada idioma conserva textos completos y unidades localizadas', () => {
  for (const language of LANGUAGES) {
    for (const plan of PLANS) assert.ok(landingCopy[language].pricing.descriptions[plan.id].length > 20);
    assert.ok(formatProductCount(language, 2_000).includes('2'));
  }
  assert.equal(formatProductCount('de', 10_000), '10.000 Produkte');
  assert.equal(formatProductCount('en', 10_000), '10,000 products');
  assert.equal(formatProductCount('fr', 10_000), '10 000 produits');
  assert.equal(formatProductCount('it', 10_000), '10.000 prodotti');
  assert.equal(formatProductCount('pt', 10_000), '10 000 produtos');
  assert.equal(formatProductCount('es', 10_000), '10.000 productos');
});
