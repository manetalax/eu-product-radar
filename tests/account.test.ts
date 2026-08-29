import test from 'node:test';
import assert from 'node:assert/strict';
import { accountDeletionRequest, DELETE_ACCOUNT_CONFIRMATION } from '../lib/account';

test('el borrado de cuenta exige el correo exacto y una confirmación explícita', () => {
  assert.deepEqual(
    accountDeletionRequest({ email: '  Usuario@Example.com ', confirmation: DELETE_ACCOUNT_CONFIRMATION }, 'usuario@example.com'),
    { email: 'Usuario@Example.com', confirmation: 'BORRAR' },
  );

  for (const body of [
    null,
    [],
    { email: 'otra@example.com', confirmation: 'BORRAR' },
    { email: 'usuario@example.com', confirmation: 'borrar' },
    { email: 'usuario@example.com', confirmation: '' },
  ]) {
    assert.throws(() => accountDeletionRequest(body, 'usuario@example.com'));
  }
});
