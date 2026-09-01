import test from 'node:test';
import assert from 'node:assert/strict';
import { ACCOUNT_DELETION_ERROR_CODES } from '../lib/account';
import { accountCopy } from '../lib/account-i18n';
import { authCopy } from '../lib/auth-i18n';
import { landingCopy, LANGUAGES } from '../lib/landing-i18n';

test('la identidad europea, la autenticación y el borrado están completos en seis idiomas', () => {
  for (const language of LANGUAGES) {
    const hero = landingCopy[language].hero;
    assert.ok(hero.eyebrow.length > 10);
    assert.ok(hero.independent.length > 20);
    assert.ok(hero.title.length > 35);
    assert.ok(hero.lead.length > 50);

    const auth = authCopy[language];
    for (const value of Object.values(auth.titles)) assert.ok(value.length > 4);
    for (const value of Object.values(auth.errors)) assert.ok(value.length > 12);
    for (const value of Object.values(auth.notices)) assert.ok(value.length > 12);
    assert.ok(auth.selectedPlan('Pro').includes('Pro'));

    const account = accountCopy[language];
    assert.ok(account.title.length > 8);
    assert.ok(account.description.length > 30);
    assert.ok(account.confirmation('BORRAR').includes('BORRAR'));
    for (const code of ACCOUNT_DELETION_ERROR_CODES) assert.ok(account.errors[code].length > 12);
  }
});
