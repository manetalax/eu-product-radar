import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { UNLIMITED_PUBLIC_OFFERS } from '../lib/plans';

const landing = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

test('public Unlimited offers remain monthly, annual and Lifetime only', () => {
  assert.deepEqual(UNLIMITED_PUBLIC_OFFERS.map(offer => offer.id), ['monthly', 'annual', 'lifetime']);
  assert.deepEqual(UNLIMITED_PUBLIC_OFFERS.map(offer => offer.priceEur), [9.95, 89.95, 149]);
});

test('landing sends each billing choice through login and publishes all paid offers', () => {
  assert.match(landing, /billing=\$\{choice\.id\}/);
  assert.match(landing, /UNLIMITED_PUBLIC_OFFERS\.find\(offer => offer\.id === 'monthly'\)/);
  assert.match(landing, /UNLIMITED_PUBLIC_OFFERS\.find\(offer => offer\.id === 'annual'\)/);
  assert.match(landing, /UNLIMITED_PUBLIC_OFFERS\.find\(offer => offer\.id === 'lifetime'\)/);
  assert.match(landing, /name: `\$\{unlimited\.title\} · \$\{extra\.monthlyLabel\}`/);
  assert.match(landing, /name: `\$\{unlimited\.title\} · \$\{extra\.annualLabel\}`/);
  assert.match(landing, /name: `\$\{unlimited\.title\} · \$\{extra\.lifetimeLabel\}`/);
});

test('three billing cards use a three-two-one responsive grid', () => {
  assert.match(css, /\.polished-plans\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css, /@media\(max-width:900px\)[\s\S]*?\.polished-plans\{grid-template-columns:1fr 1fr\}/);
  assert.match(css, /@media\(max-width:600px\)[\s\S]*?\.value-strip,\.polished-plans\{grid-template-columns:1fr\}/);
});
