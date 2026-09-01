import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { trustedStripeNavigationUrl } from '../lib/stripe-navigation';

test('Stripe client navigation accepts only the exact HTTPS host for each billing flow', () => {
  assert.equal(
    trustedStripeNavigationUrl('https://checkout.stripe.com/c/pay/cs_live_123?prefilled_email=a%40b.com', 'checkout'),
    'https://checkout.stripe.com/c/pay/cs_live_123?prefilled_email=a%40b.com',
  );
  assert.equal(
    trustedStripeNavigationUrl('https://billing.stripe.com/p/session/test_123', 'portal'),
    'https://billing.stripe.com/p/session/test_123',
  );

  const rejected: Array<[unknown, 'checkout' | 'portal']> = [
    ['http://checkout.stripe.com/c/pay/test', 'checkout'],
    ['https://checkout.stripe.com.evil.example/c/pay/test', 'checkout'],
    ['https://checkout.stripe.com:444/c/pay/test', 'checkout'],
    ['https://user:pass@checkout.stripe.com/c/pay/test', 'checkout'],
    ['https://billing.stripe.com/p/session/test', 'checkout'],
    ['https://checkout.stripe.com/c/pay/test', 'portal'],
    ['javascript:alert(1)', 'checkout'],
    ['', 'checkout'],
    [null, 'checkout'],
  ];
  for (const [value, target] of rejected) assert.equal(trustedStripeNavigationUrl(value, target), null);
});

test('free-trial checkout uses trusted navigation and customer-safe errors', () => {
  const source = readFileSync('components/FreeTrialUpgradePrompt.tsx', 'utf8');
  assert.match(source, /trustedStripeNavigationUrl\(body\.url, 'checkout'\)/);
  assert.match(source, /window\.location\.assign\(navigationUrl\)/);
  assert.doesNotMatch(source, /body\.error/);
});

test('checkout return confirmation never renders server error strings', () => {
  const source = readFileSync('components/CheckoutReturnSync.tsx', 'utf8');
  assert.doesNotMatch(source, /body\.error/);
  assert.match(source, /confirmed === true/);
});
