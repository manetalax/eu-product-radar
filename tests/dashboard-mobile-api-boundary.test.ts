import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const dashboard = readFileSync(new URL('../components/Dashboard.tsx', import.meta.url), 'utf8');

test('Dashboard keeps parser details private and preserves mobile download/file support', () => {
  assert.match(dashboard, /let validJson = false/);
  assert.match(dashboard, /Provider\/proxy parser details must never leak/);
  assert.doesNotMatch(dashboard, /typeof body\.error === 'string'/);
  assert.match(dashboard, /new Error\(d\('importError'\)\)/);
  assert.match(dashboard, /\.heic,\.heif,image\/\*/);
  const delayedRevocations = dashboard.match(/URL\.revokeObjectURL\(url\), 60000/g) ?? [];
  assert.ok(delayedRevocations.length >= 2, 'report and CSV template Blob URLs should remain valid for 60 seconds');
});

test('Dashboard validates Stripe Checkout and Portal destinations before navigation', () => {
  assert.match(dashboard, /trustedStripeNavigationUrl/);
  assert.match(dashboard, /trustedStripeNavigationUrl\(url, 'checkout'\)/);
  assert.match(dashboard, /trustedStripeNavigationUrl\(url, 'portal'\)/);
  assert.match(dashboard, /window\.location\.assign\(trustedUrl\)/);
  assert.doesNotMatch(dashboard, /window\.location\.assign\(url as string\)/);
  assert.match(dashboard, /setError\(d\('paymentError'\)\)/);
  assert.match(dashboard, /setError\(d\('portalError'\)\)/);
});
