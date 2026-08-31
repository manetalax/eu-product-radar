import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analysisApiCopy } from '../lib/analysis-api-i18n';
import { productQuota, quotaExceededMessage } from '../lib/quota';

const route = readFileSync(new URL('../app/api/analyses/route.ts', import.meta.url), 'utf8');
const languages = ['es','en','fr','de','it','pt'] as const;

test('analyses API resolves request language for GET and POST user-facing responses', () => {
  assert.ok((route.match(/requestLanguage\(request\)/g) ?? []).length >= 2);
  assert.match(route, /analysisApiText\(language, key\)/);
  assert.match(route, /quotaExceededMessage\(products\.length, quota, language\)/);
  assert.match(route, /if \(!sameOrigin\(request\)\)/);
});

test('analysis API copy is complete and translated in all supported languages', () => {
  const keys = Object.keys(analysisApiCopy.es).sort();
  for (const language of languages) {
    assert.deepEqual(Object.keys(analysisApiCopy[language]).sort(), keys, language);
    for (const key of keys as (keyof typeof analysisApiCopy.es)[]) {
      assert.ok(analysisApiCopy[language][key].trim().length > 0, `${language}.${key}`);
      if (language !== 'es') assert.notEqual(analysisApiCopy[language][key], analysisApiCopy.es[key], `${language}.${key}`);
    }
  }
});

test('lifetime free quota message stays at five products and localizes without changing entitlement', () => {
  const quota = productQuota(3);
  for (const language of languages) {
    const message = quotaExceededMessage(4, quota, language);
    assert.match(message, /5/);
    assert.match(message, /4/);
    assert.match(message, /2/);
  }
  assert.deepEqual(productQuota(3), quota);
  assert.equal(quota.periodStart, 'lifetime');
  assert.equal(quota.limit, 5);
  assert.equal(quota.remaining, 2);
});
