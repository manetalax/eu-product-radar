import test from 'node:test';
import assert from 'node:assert/strict';
import { readBodyBytes, readJsonBody, readTextBody } from '../lib/http';
import { readFileSync } from 'node:fs';

test('bounded body reader rejects declared and actual payloads over the limit', async () => {
  await assert.rejects(
    readBodyBytes(new Request('https://example.test', { method: 'POST', headers: { 'content-length': '1000' }, body: 'x' }), 100),
    /límite/,
  );
  await assert.rejects(
    readBodyBytes(new Request('https://example.test', { method: 'POST', body: 'x'.repeat(101) }), 100),
    /límite/,
  );
});

test('bounded text and JSON readers preserve valid content', async () => {
  assert.equal(await readTextBody(new Request('https://example.test', { method: 'POST', body: 'hola' }), 100), 'hola');
  assert.deepEqual(await readJsonBody(new Request('https://example.test', { method: 'POST', body: JSON.stringify({ ok: true }) }), 100), { ok: true });
});

test('Stripe webhook reads a bounded raw body before signature verification', () => {
  const webhook = readFileSync(new URL('../app/api/billing/webhook/route.ts', import.meta.url), 'utf8');
  assert.match(webhook, /STRIPE_WEBHOOK_MAX_BYTES = 1024 \* 1024/);
  assert.match(webhook, /readTextBody\(request, STRIPE_WEBHOOK_MAX_BYTES\)/);
  assert.doesNotMatch(webhook, /await request\.text\(\)/);
});

test('small billing JSON endpoints do not inherit the generic 2 MB request allowance', () => {
  for (const path of ['../app/api/billing/checkout/route.ts', '../app/api/billing/confirm/route.ts']) {
    const route = readFileSync(new URL(path, import.meta.url), 'utf8');
    assert.match(route, /BILLING_JSON_MAX_BYTES = 4 \* 1024/);
    assert.match(route, /readJsonBody\(request, BILLING_JSON_MAX_BYTES\)/);
  }
});
