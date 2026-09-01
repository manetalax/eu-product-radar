import test from 'node:test';
import assert from 'node:assert/strict';
import { marketDisplayFor } from '../lib/market-i18n';
import { MARKET_CODES } from '../lib/markets';

const languages = ['es','en','fr','de','it','pt'] as const;

test('all market display labels exist in all supported languages', () => {
  for (const code of MARKET_CODES) {
    for (const language of languages) {
      const display = marketDisplayFor(language, code);
      assert.ok(display.name.trim(), `${language}.${code}.name`);
      assert.ok(display.shortName.trim(), `${language}.${code}.shortName`);
      assert.ok(display.operator.trim(), `${language}.${code}.operator`);
      assert.ok(display.operatorLong.trim(), `${language}.${code}.operatorLong`);
    }
  }
});

test('active EU labels are genuinely localized', () => {
  for (const language of ['en','fr','de','it','pt'] as const) {
    assert.notEqual(marketDisplayFor(language, 'EU').name, marketDisplayFor('es', 'EU').name);
    assert.notEqual(marketDisplayFor(language, 'EU').operator, marketDisplayFor('es', 'EU').operator);
  }
  assert.equal(marketDisplayFor('en', 'EU').name, 'European Union');
  assert.equal(marketDisplayFor('en', 'EU').operator, 'EU responsible operator');
});
