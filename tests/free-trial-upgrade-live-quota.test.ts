import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const prompt = readFileSync(new URL('../components/FreeTrialUpgradePrompt.tsx', import.meta.url), 'utf8');
const page = readFileSync(new URL('../app/dashboard/page.tsx', import.meta.url), 'utf8');

test('dashboard keeps the upgrade surface mounted for exhausted free accounts', () => {
  assert.match(page, /import FreeTrialUpgradePrompt from '@\/components\/FreeTrialUpgradePrompt'/);
  assert.match(page, /<FreeTrialUpgradePrompt \/>/);
});

test('upgrade prompt reacts when the live dashboard quota reaches 100 percent', () => {
  assert.match(prompt, /dashboardShowsExhaustedFreeQuota/);
  assert.match(prompt, /\.quota-inline \.quota-track > span/);
  assert.match(prompt, /quotaFill\?\.style\.width === '100%'/);
  assert.match(prompt, /new MutationObserver\(syncFromDashboard\)/);
  assert.match(prompt, /setExhausted\(true\)/);
});

test('newly exhausted quota is announced without stealing keyboard focus', () => {
  assert.match(prompt, /className="trial-upgrade-copy" role="status" aria-live="polite" aria-atomic="true"/);
  assert.doesNotMatch(prompt, /\.focus\(\)/);
});

test('checkout progress is announced without exposing provider errors', () => {
  assert.match(prompt, /role="status" aria-live="polite"/);
  assert.match(prompt, /trustedStripeNavigationUrl\(body\.url, 'checkout'\)/);
  assert.match(prompt, /catch \{\s*setError\(t\.error\)/);
});
