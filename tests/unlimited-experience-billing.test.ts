import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const component = readFileSync(new URL('../components/UnlimitedExperience.tsx', import.meta.url), 'utf8');
const analyses = readFileSync(new URL('../app/api/analyses/route.ts', import.meta.url), 'utf8');

test('paid dashboard reads the persisted Stripe price modality instead of assuming monthly', () => {
  assert.match(analyses, /stripe_price_id/);
  assert.match(component, /quota\.billing\.billingOption \?\? 'legacy'/);
  assert.doesNotMatch(component, /UNLIMITED_PLAN\.monthlyPriceEur/);
});

test('paid dashboard contains distinct monthly annual and Lifetime presentation', () => {
  assert.match(component, /billing === 'monthly'/);
  assert.match(component, /billing === 'annual'/);
  assert.match(component, /billing === 'lifetime'/);
  assert.match(component, /UNLIMITED_MONTHLY_PRICE_EUR/);
  assert.match(component, /UNLIMITED_ANNUAL_PRICE_EUR/);
  assert.match(component, /UNLIMITED_LIFETIME_PRICE_EUR/);
});

test('legacy paid records fall back to a generic Unlimited label instead of a false price', () => {
  assert.match(component, /type DisplayBilling = UnlimitedBillingOption \| 'legacy' \| null/);
  assert.match(component, /: t\.legacy/);
});
