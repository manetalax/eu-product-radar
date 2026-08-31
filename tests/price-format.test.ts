import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPrice, LANGUAGES } from '../lib/landing-i18n';

test('Unlimited 9.95 keeps cents in every supported locale', () => {
  for (const language of LANGUAGES) {
    const formatted = formatPrice(language, 9.95);
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
