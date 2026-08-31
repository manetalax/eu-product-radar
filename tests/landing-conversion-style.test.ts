import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const landing = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/landing-conversion.css', import.meta.url), 'utf8');

test('hero presents the five-product trial and one-plan continuation clearly', () => {
  assert.match(landing, /FREE_TRIAL_PRODUCT_LIMIT/);
  assert.match(landing, /trialProof/);
  assert.match(landing, /unlimitedProof/);
  assert.match(landing, /hero-offer-proof/);
  assert.match(landing, /PDF \+ Excel/);
});

test('landing verified seal is explicitly an ImportVerifier review mark', () => {
  assert.match(landing, /hero-verified-seal/);
  assert.match(landing, /VERIFIED/);
  assert.match(landing, /verifiedReview/);
  assert.match(landing, /REVISIÓN IMPORTVERIFIER/);
  assert.doesNotMatch(landing, /EU CERTIFIED|GOVERNMENT CERTIFIED|OFFICIALLY CERTIFIED/i);
});

test('brand and commerce/payment logos are deliberately larger and mobile-safe', () => {
  assert.match(css, /\.brand-logo-tile\{width:68px;height:48px/);
  assert.match(css, /\.amazon-logo\{width:92px\}/);
  assert.match(css, /\.eu-signal\{width:56px;height:56px/);
  assert.match(css, /@media\(max-width:767px\)/);
  assert.match(css, /\.hero-verified-seal\{position:relative/);
});
