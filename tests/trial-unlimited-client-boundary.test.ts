import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const unlimited = readFileSync(new URL('../components/UnlimitedExperience.tsx', import.meta.url), 'utf8');
const trial = readFileSync(new URL('../components/FreeTrialUpgradePrompt.tsx', import.meta.url), 'utf8');

for (const [name, source] of [['UnlimitedExperience', unlimited], ['FreeTrialUpgradePrompt', trial]] as const) {
  test(`${name} validates successful quota payloads before trusting billing state`, () => {
    assert.match(source, /productQuotaFromUnknown/);
    assert.match(source, /parsed && typeof parsed === 'object' && !Array\.isArray\(parsed\)/);
    assert.doesNotMatch(source, /type QuotaResponse/);
    assert.doesNotMatch(source, /body\?\.quota\?\.billing\?\.planId/);
  });
}

test('trial upgrade still validates Stripe checkout navigation before redirecting', () => {
  assert.match(trial, /trustedStripeNavigationUrl\(body\.url, 'checkout'\)/);
  assert.match(trial, /!response\.ok \|\| !navigationUrl/);
});

test('trial exhaustion offers the three truthful Unlimited billing choices with retained value', () => {
  assert.match(trial, /trial-upgrade-benefits/);
  assert.match(trial, /ImportVerifier AI \+ Regulatory Twin/);
  assert.match(trial, /PDF y Excel con historial y trazabilidad/);
  assert.match(trial, /id:'monthly'/);
  assert.match(trial, /id:'annual'/);
  assert.match(trial, /id:'lifetime'/);
  assert.match(trial, /Ahorra 29,45 € frente a 12 meses/);
  assert.match(trial, /Pago seguro mediante Stripe/);
  assert.match(trial, /JSON\.stringify\(\{ purchaseId: 'starter', billingOption \}\)/);
  assert.doesNotMatch(trial, /countdown|limited time|only today/i);
});
