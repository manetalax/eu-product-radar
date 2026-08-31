import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const route = readFileSync(new URL('../app/api/account/route.ts', import.meta.url), 'utf8');
const webhook = readFileSync(new URL('../app/api/billing/webhook/route.ts', import.meta.url), 'utf8');
const subscriptionSync = readFileSync(new URL('../lib/stripe/subscription-sync.ts', import.meta.url), 'utf8');
const edgeDelete = readFileSync(new URL('../supabase/functions/delete-account/index.ts', import.meta.url), 'utf8');

test('el borrado de cuenta cancela Stripe antes de invocar la eliminación de Supabase', () => {
  const cancelIndex = route.indexOf('subscriptions.cancel');
  const deleteIndex = route.indexOf("functions.invoke('delete-account'");
  assert.ok(cancelIndex >= 0, 'falta cancelación Stripe');
  assert.ok(deleteIndex >= 0, 'falta invocación de borrado');
  assert.ok(cancelIndex < deleteIndex, 'Stripe debe cancelarse antes de borrar la cuenta');
});

test('la Edge Function de borrado exige JWT y limita el cuerpo de confirmación', () => {
  assert.match(edgeDelete, /const MAX_CONFIRMATION_BODY_BYTES = 4 \* 1024/);
  assert.match(edgeDelete, /content-length/);
  assert.match(edgeDelete, /new TextEncoder\(\)\.encode\(raw\)\.byteLength > MAX_CONFIRMATION_BODY_BYTES/);
  assert.match(edgeDelete, /admin\.auth\.getUser\(token\)/);
  assert.match(edgeDelete, /admin\.auth\.admin\.signOut\(token, 'global'\)/);
});

test('la sincronización Stripe acepta la cancelación tardía de una cuenta ya eliminada', () => {
  assert.match(subscriptionSync, /subscription\.status === 'canceled' && error\.code === '23503'/);
  assert.doesNotMatch(subscriptionSync, /getUserById\(userId\)/);
  assert.match(webhook, /syncStripeSubscription/);
});

test('el webhook solo descarta eventos ya procesados y reintenta eventos en processing', () => {
  assert.match(webhook, /status: 'processing'/);
  assert.match(webhook, /if \(existing\?\.status === 'processed'\) return NextResponse\.json\(\{ received: true, duplicate: true \}\)/);
  assert.match(webhook, /status: 'processed'/);
  assert.match(webhook, /processed_at: completedAt/);
  assert.doesNotMatch(webhook, /delete\(\)\.eq\('event_id', event\.id\)/);
});
