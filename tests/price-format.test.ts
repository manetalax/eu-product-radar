import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPrice, LANGUAGES } from '../lib/landing-i18n';
import { UNLIMITED_PLAN } from '../lib/plans';

test('canonical Unlimited price is EUR 9.95 and keeps cents in every supported locale', () => {
  assert.equal(UNLIMITED_PLAN.monthlyPriceEur, 9.95);
  for (const language of LANGUAGES) {
    const formatted = formatPrice(language, UNLIMITED_PLAN.monthlyPriceEur);
    assert.match(formatted, /9[,.]95/, language);
    assert.match(formatted, /€/);
  }
});

test('integer EUR prices remain clean without forced cents', () => {
  for (const language of LANGUAGES) {
    const formatted = formatPrice(language, 29);
    assert.doesNotMatch(formatted, /29[,.]00/, language);
  }
});
