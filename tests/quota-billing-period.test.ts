import test from 'node:test';
import assert from 'node:assert/strict';
import { productQuota } from '../lib/quota';
import { unlimitedBillingStatus } from '../lib/billing';
import { UNLIMITED_FAIR_USE_CEILING } from '../lib/plans';

test('quota period semantics distinguish recurring Unlimited from Lifetime', () => {
  const lifetime = productQuota(5, new Date('2026-09-01T00:00:00Z'), unlimitedBillingStatus('lifetime'));
  assert.equal(lifetime.periodStart, 'lifetime');
  assert.equal(lifetime.remaining, UNLIMITED_FAIR_USE_CEILING);

  const recurring = productQuota(5, new Date('2026-09-01T00:00:00Z'), {
    planId: 'starter',
    planName: 'Unlimited',
    status: 'active',
    productLimit: UNLIMITED_FAIR_USE_CEILING,
    currentPeriodEnd: '2026-10-01T00:00:00Z',
    cancelAtPeriodEnd: false,
    billingOption: 'monthly',
  });
  assert.equal(recurring.periodStart, 'subscription');
  assert.equal(recurring.remaining, UNLIMITED_FAIR_USE_CEILING);
});
