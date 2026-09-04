import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const home = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');

test('landing intelligence and four-option pricing surfaces are language-driven', () => {
  assert.match(home, /const landingExtras: Record<Language/);
  assert.match(home, /extra\.intelligenceTitle/);
  assert.match(home, /extra\.aiBody/);
  assert.match(home, /extra\.twinBody/);
  assert.match(home, /extra\.radarBody/);
  assert.match(home, /extra\.pricingEyebrow/);
  assert.match(home, /extra\.pricingTitle/);
  assert.match(home, /extra\.monthly\.label/);
  assert.match(home, /extra\.annual\.label/);
  assert.match(home, /extra\.lifetime\.label/);
  assert.match(home, /extra\.custom\.label/);
  assert.match(home, /extra\.billingFaqAnswer\(monthlyPrice, annualPrice, lifetimePrice, customPrice\)/);
  assert.doesNotMatch(home, /<h2>AI \+ Twin \+ Radar, en el mismo producto\.<\/h2>/);
  assert.doesNotMatch(home, /<div className="eyebrow">UN PLAN\. TODO INCLUIDO\.<\/div>/);
});
