import test from 'node:test';
import assert from 'node:assert/strict';
import { AccountDeletionError, accountDeletionRequest, DELETE_ACCOUNT_CONFIRMATION } from '../lib/account';

test('el borrado de cuenta exige el correo exacto y una confirmación explícita', () => {
  assert.deepEqual(
    accountDeletionRequest({ email: '  Usuario@Example.com ', confirmation: DELETE_ACCOUNT_CONFIRMATION }, 'usuario@example.com'),
    { email: 'Usuario@Example.com', confirmation: 'BORRAR' },
  );

  for (const [body, code] of [
    [null, 'invalid_confirmation'],
    [[], 'invalid_confirmation'],
    [{ email: 'otra@example.com', confirmation: 'BORRAR' }, 'email_mismatch'],
    [{ email: 'usuario@example.com', confirmation: 'borrar' }, 'confirmation_mismatch'],
    [{ email: 'usuario@example.com', confirmation: '' }, 'confirmation_mismatch'],
  ] as const) {
    assert.throws(
      () => accountDeletionRequest(body, 'usuario@example.com'),
      error => error instanceof AccountDeletionError && error.code === code,
    );
  }
});
