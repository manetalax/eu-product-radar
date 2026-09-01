import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPrice, LANGUAGES } from '../lib/landing-i18n';
import { UNLIMITED_ANNUAL_PRICE_EUR, UNLIMITED_LIFETIME_PRICE_EUR, UNLIMITED_MONTHLY_PRICE_EUR, UNLIMITED_PLAN } from '../lib/plans';

test('canonical Unlimited price is EUR 9.95 and keeps cents in every supported locale', () => {
  assert.equal(UNLIMITED_PLAN.monthlyPriceEur, 9.95);
  for (const language of LANGUAGES) {
    const formatted = formatPrice(language, UNLIMITED_PLAN.monthlyPriceEur);
    assert.match(formatted, /9[,.]95/, language);
    assert.match(formatted, /€/);
  }
});

test('all three public Unlimited prices retain their cents in every locale', () => {
  const expected = [UNLIMITED_MONTHLY_PRICE_EUR, UNLIMITED_ANNUAL_PRICE_EUR, UNLIMITED_LIFETIME_PRICE_EUR];
  for (const language of LANGUAGES) {
    for (const price of expected) assert.match(formatPrice(language, price), /[,.]95/, language);
  }
});

test('integer EUR prices remain clean without forced cents', () => {
  for (const language of LANGUAGES) {
    const formatted = formatPrice(language, 29);
    assert.doesNotMatch(formatted, /29[,.]00/, language);
  }
});
