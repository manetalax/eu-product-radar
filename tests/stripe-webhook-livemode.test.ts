import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../app/api/billing/webhook/route.ts', import.meta.url), 'utf8');

test('production Stripe webhook rejects test-mode events before persistence or entitlement sync', () => {
  const gate = "if (process.env.NODE_ENV === 'production' && event.livemode !== true)";
  assert.ok(source.includes(gate));

  const gateIndex = source.indexOf(gate);
  const persistenceIndex = source.indexOf("from('stripe_webhook_events').insert");
  const auditIndex = source.indexOf("if (session.metadata?.purchase_type === 'audit')");

  assert.ok(gateIndex >= 0);
  assert.ok(persistenceIndex > gateIndex, 'livemode gate must run before webhook event persistence');
  assert.ok(auditIndex > gateIndex, 'livemode gate must run before legacy audit value can be persisted');
});
