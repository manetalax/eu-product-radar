import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PERSONALIZED_PUBLIC_OFFER, UNLIMITED_PUBLIC_OFFERS } from '../lib/plans';

const landing = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

test('public standard offers remain monthly, annual and Lifetime with the new prices', () => {
  assert.deepEqual(UNLIMITED_PUBLIC_OFFERS.map(offer => offer.id), ['monthly', 'annual', 'lifetime']);
  assert.deepEqual(UNLIMITED_PUBLIC_OFFERS.map(offer => offer.priceEur), [9.95, 89.95, 299.95]);
  assert.deepEqual(UNLIMITED_PUBLIC_OFFERS.map(offer => offer.ai), [false, true, true]);
  assert.equal(PERSONALIZED_PUBLIC_OFFER.priceEur, 995.50);
});

test('landing publishes standard billing choices and the personalized offer', () => {
  assert.match(landing, /billing=\$\{choice\.id\}/);
  assert.match(landing, /UNLIMITED_PUBLIC_OFFERS\.find\(offer => offer\.id === 'monthly'\)/);
  assert.match(landing, /UNLIMITED_PUBLIC_OFFERS\.find\(offer => offer\.id === 'annual'\)/);
  assert.match(landing, /UNLIMITED_PUBLIC_OFFERS\.find\(offer => offer\.id === 'lifetime'\)/);
  assert.match(landing, /PERSONALIZED_PUBLIC_OFFER\.priceEur/);
  assert.match(landing, /ImportVerifier AI no incluido/);
  assert.match(landing, /Integración de WhatsApp/);
  assert.match(landing, /Dominio propio/);
});

test('standard billing cards retain responsive layout and personalized card stacks independently', () => {
  assert.match(css, /\.polished-plans\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css, /@media\(max-width:900px\)[\s\S]*?\.polished-plans\{grid-template-columns:1fr 1fr\}/);
  assert.match(css, /@media\(max-width:600px\)[\s\S]*?\.value-strip,\.polished-plans\{grid-template-columns:1fr\}/);
  assert.match(landing, /className="plan personalized-plan"/);
});
