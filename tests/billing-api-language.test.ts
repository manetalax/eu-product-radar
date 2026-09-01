import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { billingCopy } from '../lib/billing-i18n';

const checkout = readFileSync(new URL('../app/api/billing/checkout/route.ts', import.meta.url), 'utf8');
const portal = readFileSync(new URL('../app/api/billing/portal/route.ts', import.meta.url), 'utf8');

const languages = ['es','en','fr','de','it','pt'] as const;

test('checkout and portal resolve the request language before returning user-facing errors', () => {
  for (const source of [checkout, portal]) {
    assert.match(source, /requestLanguage\(request\)/);
    assert.match(source, /billingText\(language, key\)/);
  }
  assert.doesNotMatch(portal, /Origen de solicitud no permitido|Inicia sesión para gestionar tu plan|Esta cuenta todavía no tiene una suscripción/);
});

test('billing messages exist in every supported language and secondary languages are translated', () => {
  const keys = Object.keys(billingCopy.es).sort();
  for (const language of languages) {
    assert.deepEqual(Object.keys(billingCopy[language]).sort(), keys, language);
    for (const key of keys as (keyof typeof billingCopy.es)[]) {
      assert.ok(billingCopy[language][key].trim().length > 0, `${language}.${key}`);
      if (language !== 'es') assert.notEqual(billingCopy[language][key], billingCopy.es[key], `${language}.${key}`);
    }
  }
});
