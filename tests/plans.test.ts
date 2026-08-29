import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPrice, formatProductCount, landingCopy, LANGUAGES } from '../lib/landing-i18n';
import { PLANS } from '../lib/plans';

test('los planes comerciales conservan la escalera final acordada', () => {
  assert.deepEqual(PLANS.map(plan => [plan.id, plan.monthlyPriceEur, plan.monthlyProductLimit]), [
    ['starter', 19, 50],
    ['growth', 29, 150],
    ['pro', 49, 500],
    ['business', 149, 2_000],
  ]);
  assert.deepEqual(PLANS.filter(plan => plan.featured).map(plan => plan.id), ['pro']);
});

test('cada idioma tiene textos completos de planes y unidades propias', () => {
  for (const language of LANGUAGES) {
    for (const plan of PLANS) assert.ok(landingCopy[language].pricing.descriptions[plan.id].length > 20);
    assert.ok(formatPrice(language, 19).includes('19'));
    assert.ok(formatProductCount(language, 2_000).includes('2'));
  }
  assert.equal(formatProductCount('de', 10_000), '10.000 Produkte');
  assert.equal(formatProductCount('en', 10_000), '10,000 products');
  assert.equal(formatProductCount('fr', 10_000), '10 000 produits');
  assert.equal(formatProductCount('it', 10_000), '10.000 prodotti');
  assert.equal(formatProductCount('pt', 10_000), '10 000 produtos');
  assert.equal(formatProductCount('es', 10_000), '10.000 productos');
  assert.equal(formatProductCount('de', 2_000), '2.000 Produkte');
  assert.equal(formatProductCount('es', 2_000), '2.000 productos');
});
