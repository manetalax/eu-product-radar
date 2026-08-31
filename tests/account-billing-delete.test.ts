import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const route = readFileSync(new URL('../app/api/account/route.ts', import.meta.url), 'utf8');
const webhook = readFileSync(new URL('../app/api/billing/webhook/route.ts', import.meta.url), 'utf8');

test('el borrado de cuenta cancela Stripe antes de invocar la eliminación de Supabase', () => {
  const cancelIndex = route.indexOf('subscriptions.cancel');
  const deleteIndex = route.indexOf("functions.invoke('delete-account'");
  assert.ok(cancelIndex >= 0, 'falta cancelación Stripe');
  assert.ok(deleteIndex >= 0, 'falta invocación de borrado');
  assert.ok(cancelIndex < deleteIndex, 'Stripe debe cancelarse antes de borrar la cuenta');
});

test('el webhook acepta la cancelación tardía de una cuenta ya eliminada', () => {
  assert.match(webhook, /getUserById\(userId\)/);
  assert.match(webhook, /subscription\.status === 'canceled'/);
});
