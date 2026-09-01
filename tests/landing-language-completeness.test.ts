import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const home = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');

test('landing intelligence and three-option pricing surfaces are language-driven', () => {
  assert.match(home, /const landingExtras: Record<Language/);
  assert.match(home, /extra\.intelligenceTitle/);
  assert.match(home, /extra\.aiBody/);
  assert.match(home, /extra\.twinBody/);
  assert.match(home, /extra\.radarBody/);
  assert.match(home, /extra\.pricingEyebrow/);
  assert.match(home, /extra\.pricingTitle/);
  assert.match(home, /extra\.monthlyLabel/);
  assert.match(home, /extra\.annualLabel/);
  assert.match(home, /extra\.lifetimeLabel/);
  assert.match(home, /extra\.billingFaqAnswer\(monthlyPrice, annualPrice, lifetimePrice\)/);
  assert.match(home, /extra\.planLabel/);
  assert.doesNotMatch(home, /<h2>AI \+ Twin \+ Radar, en el mismo producto\.<\/h2>/);
  assert.doesNotMatch(home, /<div className="eyebrow">UN PLAN\. TODO INCLUIDO\.<\/div>/);
});
