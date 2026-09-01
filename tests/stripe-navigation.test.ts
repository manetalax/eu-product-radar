import assert from 'node:assert/strict';
import test from 'node:test';
import { trustedStripeNavigationUrl } from '@/lib/stripe/navigation';

test('accepts canonical Stripe Checkout and Billing Portal URLs', () => {
  assert.equal(
    trustedStripeNavigationUrl('https://checkout.stripe.com/c/pay/cs_test_123?prefilled_email=a%40b.com', 'checkout'),
    'https://checkout.stripe.com/c/pay/cs_test_123?prefilled_email=a%40b.com',
  );
  assert.equal(
    trustedStripeNavigationUrl('https://billing.stripe.com/p/session/test_123', 'portal'),
    'https://billing.stripe.com/p/session/test_123',
  );
});

test('rejects non-HTTPS, credentials, ports, lookalike hosts and wrong Stripe surfaces', () => {
  const invalidCheckout = [
    'http://checkout.stripe.com/c/pay/test',
    'https://user:pass@checkout.stripe.com/c/pay/test',
    'https://checkout.stripe.com:444/c/pay/test',
    'https://checkout.stripe.com.evil.example/c/pay/test',
    'https://billing.stripe.com/p/session/test',
    'javascript:alert(1)',
    '',
  ];
  for (const value of invalidCheckout) assert.equal(trustedStripeNavigationUrl(value, 'checkout'), null, value);

  assert.equal(trustedStripeNavigationUrl('https://checkout.stripe.com/c/pay/test', 'portal'), null);
  assert.equal(trustedStripeNavigationUrl('https://billing.stripe.com.evil.example/p/session/test', 'portal'), null);
  assert.equal(trustedStripeNavigationUrl(null, 'portal'), null);
});
