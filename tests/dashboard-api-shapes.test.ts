import test from 'node:test';
import assert from 'node:assert/strict';
import { analysisFromUnknown, analysisSummariesFromUnknown, productQuotaFromUnknown, productsFromUnknown } from '../lib/dashboard-api-shapes';

const product = { name: 'Toy car', manufacturer: 'Maker', responsible: 'EU Operator', warning: '3+' };
const analysis = {
  id: '11111111-1111-4111-8111-111111111111',
  filename: 'catalogue.csv',
  created_at: '2026-08-31T12:00:00.000Z',
  rule_version: 'market-readiness-v2',
  market_code: 'EU',
  products: [product],
};
const freeQuota = {
  limit: 5,
  used: 2,
  remaining: 3,
  periodStart: 'lifetime',
  billing: {
    planId: 'free',
    planName: 'Gratis',
    status: null,
    productLimit: 5,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
  },
};

test('Dashboard success parsers accept canonical analysis, products, history and quota', () => {
  assert.deepEqual(productsFromUnknown([product]), [product]);
  assert.deepEqual(analysisFromUnknown(analysis), analysis);
  assert.deepEqual(analysisSummariesFromUnknown([{ ...analysis, products: undefined, product_count: 1 }]), [{
    id: analysis.id,
    filename: analysis.filename,
    created_at: analysis.created_at,
    rule_version: analysis.rule_version,
    market_code: 'EU',
    product_count: 1,
  }]);
  assert.deepEqual(productQuotaFromUnknown(freeQuota), freeQuota);
});

test('Dashboard success parsers reject malformed 2xx payloads instead of trusting casts', () => {
  assert.equal(productsFromUnknown([{ ...product, name: '' }]), null);
  assert.equal(analysisFromUnknown({ ...analysis, id: 'not-a-uuid' }), null);
  assert.equal(analysisFromUnknown({ ...analysis, products: 'not-an-array' }), null);
  assert.equal(analysisFromUnknown({ ...analysis, market_code: 'XX' }), null);
  assert.equal(analysisSummariesFromUnknown([{ ...analysis, products: undefined, product_count: '1' }]), null);
  assert.equal(analysisSummariesFromUnknown(new Array(21).fill({ ...analysis, products: undefined, product_count: 1 })), null);
  assert.equal(productQuotaFromUnknown({ ...freeQuota, remaining: 999 }), null);
  assert.equal(productQuotaFromUnknown({ ...freeQuota, billing: { ...freeQuota.billing, productLimit: 50 } }), null);
  assert.equal(productQuotaFromUnknown({ ...freeQuota, periodStart: 'monthly' }), null);
});

test('Dashboard quota parser accepts Unlimited compatibility ID without exposing arbitrary plans', () => {
  const unlimited = {
    limit: 1_000_000,
    used: 123,
    remaining: 1_000_000,
    periodStart: 'subscription',
    billing: {
      planId: 'starter',
      planName: 'Unlimited',
      status: 'active',
      productLimit: 1_000_000,
      currentPeriodEnd: '2026-10-01T00:00:00.000Z',
      cancelAtPeriodEnd: false,
    },
  };
  assert.deepEqual(productQuotaFromUnknown(unlimited), unlimited);
  assert.equal(productQuotaFromUnknown({ ...unlimited, billing: { ...unlimited.billing, planId: 'attacker-plan' } }), null);
});
