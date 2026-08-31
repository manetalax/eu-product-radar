import test from 'node:test';
import assert from 'node:assert/strict';
import { validStripeSecretKey } from '../lib/stripe/secret-key';

test('production Stripe runtime accepts only live secret keys', () => {
  assert.equal(validStripeSecretKey('sk_live_example', true), true);
  assert.equal(validStripeSecretKey('sk_test_example', true), false);
  assert.equal(validStripeSecretKey('rk_live_example', true), false);
  assert.equal(validStripeSecretKey('', true), false);
  assert.equal(validStripeSecretKey(undefined, true), false);
});

test('development may use Stripe test keys without weakening production', () => {
  assert.equal(validStripeSecretKey('sk_test_example', false), true);
  assert.equal(validStripeSecretKey('sk_live_example', false), true);
  assert.equal(validStripeSecretKey('not-a-secret', false), false);
});
