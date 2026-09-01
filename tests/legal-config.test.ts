import test from 'node:test';
import assert from 'node:assert/strict';
import { assertPaidCheckoutLegalReady, legalConfig } from '../lib/legal-config';

const complete = {
  NODE_ENV: 'production',
  LEGAL_PROVIDER_NAME: 'Example Provider SL',
  LEGAL_PROVIDER_ADDRESS: 'Example street 1, Madrid, Spain',
  LEGAL_TAX_ID: 'B00000000',
  LEGAL_JURISDICTION: 'Spain',
  LEGAL_REFUND_POLICY: 'Refunds are handled under applicable law and the published terms.',
} as NodeJS.ProcessEnv;

test('la contratación de producción exige identidad legal completa', () => {
  assert.throws(() => assertPaidCheckoutLegalReady({ NODE_ENV: 'production' } as NodeJS.ProcessEnv), /contratación está temporalmente desactivada/);
  assert.doesNotThrow(() => assertPaidCheckoutLegalReady(complete));
});

test('el guard legal no bloquea desarrollo local', () => {
  assert.doesNotThrow(() => assertPaidCheckoutLegalReady({ NODE_ENV: 'development' } as NodeJS.ProcessEnv));
});

test('legalConfig normaliza y rechaza campos incompletos', () => {
  assert.equal(legalConfig({ ...complete, LEGAL_TAX_ID: ' ' } as NodeJS.ProcessEnv), null);
  const parsed = legalConfig({ ...complete, LEGAL_PROVIDER_NAME: '  Example Provider SL  ' } as NodeJS.ProcessEnv);
  assert.equal(parsed?.providerName, 'Example Provider SL');
});

test('legalConfig rechaza placeholders que podrían habilitar cobros por accidente', () => {
  for (const placeholder of ['TBD', 'TODO', 'pending', 'CHANGE_ME', 'your company', 'por completar']) {
    assert.equal(legalConfig({ ...complete, LEGAL_PROVIDER_NAME: placeholder } as NodeJS.ProcessEnv), null, placeholder);
  }
});
