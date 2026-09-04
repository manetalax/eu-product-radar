import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { formatProductCount, landingCopy, LANGUAGES } from '../lib/landing-i18n';
import { FREE_TRIAL_PRODUCT_LIMIT, PERSONALIZED_PUBLIC_OFFER, PLANS, UNLIMITED_FAIR_USE_CEILING, UNLIMITED_PUBLIC_OFFERS } from '../lib/plans';

const planInterest = readFileSync(new URL('../lib/services/plan-interest.ts', import.meta.url), 'utf8');
const loginPage = readFileSync(new URL('../app/login/page.tsx', import.meta.url), 'utf8');

test('cada cuenta conserva exactamente 5 productos de prueba gratuita', () => {
  assert.equal(FREE_TRIAL_PRODUCT_LIMIT, 5);
});

test('la oferta pública diferencia IA, Lifetime y Personalizada', () => {
  assert.deepEqual(PLANS.map(plan => [plan.id, plan.name, plan.monthlyPriceEur, plan.unlimited]), [
    ['starter', 'Unlimited', 9.95, true],
  ]);
  assert.equal(PLANS[0].monthlyProductLimit, UNLIMITED_FAIR_USE_CEILING);
  assert.deepEqual(PLANS.filter(plan => plan.featured).map(plan => plan.id), ['starter']);
  assert.deepEqual(UNLIMITED_PUBLIC_OFFERS.map(offer => [offer.id, offer.priceEur, offer.cadence, offer.ai]), [
    ['monthly', 9.95, 'month', false],
    ['annual', 89.95, 'year', true],
    ['lifetime', 299.95, 'lifetime', true],
  ]);
  assert.equal(PERSONALIZED_PUBLIC_OFFER.priceEur, 995.50);
  assert.equal(PERSONALIZED_PUBLIC_OFFER.ai, true);
  assert.deepEqual(PERSONALIZED_PUBLIC_OFFER.includes, ['technical-customization', 'domain', 'logo', 'whatsapp-integration']);
});

test('la intención pública sigue siendo one-shot y conserva mensual/anual/Lifetime/Personalizada', () => {
  assert.match(planInterest, /const PUBLIC_PURCHASE_INTENT = 'starter'/);
  assert.match(planInterest, /window\.localStorage\.removeItem\(PLAN_INTENT_STORAGE_KEY\)/);
  assert.match(planInterest, /if \(stored === PUBLIC_PURCHASE_INTENT\) return \{ planId: PUBLIC_PURCHASE_INTENT, billingOption: 'monthly' \}/);
  assert.match(planInterest, /isCheckoutBillingOption\(parsed\.billingOption\)/);
  assert.match(planInterest, /billingOption: CheckoutBillingOption/);
  assert.match(loginPage, /const requestedPlan = plan === 'starter' \? 'starter' as const : undefined/);
  assert.doesNotMatch(loginPage, /isPurchaseId/);
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
