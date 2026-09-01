import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const proxy = readFileSync(new URL('../proxy.ts', import.meta.url), 'utf8');

test('session-refresh proxy covers every customer-authenticated product API but not Stripe webhook', () => {
  for (const path of [
    '/api/analyses/:path*',
    '/api/account/:path*',
    '/api/evidence/:path*',
    '/api/product-extraction/:path*',
    '/api/regulatory-agent/:path*',
    '/api/regulatory-changes/:path*',
    '/api/billing/checkout',
    '/api/billing/confirm',
    '/api/billing/portal',
  ]) assert.ok(proxy.includes(`'${path}'`), `missing proxy matcher ${path}`);
  assert.equal(proxy.includes("'/api/billing/webhook'"), false);
});
