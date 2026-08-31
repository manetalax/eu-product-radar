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
