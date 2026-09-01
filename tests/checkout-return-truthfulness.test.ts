import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const dashboard = readFileSync(new URL('../components/Dashboard.tsx', import.meta.url), 'utf8');
const sync = readFileSync(new URL('../components/CheckoutReturnSync.tsx', import.meta.url), 'utf8');

test('dashboard only announces successful payment after server confirmation has synced access', () => {
  assert.match(dashboard, /const synced = params\.get\('synced'\) === '1'/);
  assert.match(dashboard, /checkout === 'success' && synced/);
  assert.doesNotMatch(dashboard, /if \(checkout === 'success'\) setNotice\(d\('checkoutSuccess'\)\)/);
});

test('unsynced checkout return keeps a neutral live confirmation state and failure alert', () => {
  assert.match(sync, /checkout === 'success' && Boolean\(sessionId\) && !synced/);
  assert.match(sync, /aria-live="polite"/);
  assert.match(sync, /role="alert"/);
});
