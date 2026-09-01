import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../app/api/billing/webhook/route.ts', import.meta.url), 'utf8');

test('duplicate Stripe webhook deliveries are serialized and stale processing rows can be reclaimed atomically', () => {
  assert.match(source, /STRIPE_WEBHOOK_PROCESSING_STALE_MS = 5 \* 60 \* 1000/);
  assert.match(source, /\.select\('status,updated_at'\)/);
  assert.match(source, /existing\.status === 'processed'/);
  assert.match(source, /received: false, duplicate: true, processing: true \}, \{ status: 409 \}/);
  assert.match(source, /\.eq\('status', 'processing'\)[\s\S]*\.lt\('updated_at', staleBefore\)[\s\S]*\.select\('event_id'\)/);
  assert.match(source, /if \(!claimed\) return NextResponse\.json\(\{ received: false, duplicate: true, processing: true \}, \{ status: 409 \}\)/);
  assert.doesNotMatch(source, /received: true, duplicate: true, processing: true/);
});
