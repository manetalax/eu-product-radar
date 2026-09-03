import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const page = await readFile(new URL('../app/dashboard/page.tsx', import.meta.url), 'utf8');
const hub = await readFile(new URL('../components/DashboardExtrasHub.tsx', import.meta.url), 'utf8');
const brand = await readFile(new URL('../components/Brand.tsx', import.meta.url), 'utf8');

test('advanced dashboard surfaces are grouped instead of rendered as an endless tail', () => {
  assert.match(page, /<DashboardExtrasHub/);
  assert.match(page, /personalized={<PersonalizedPlanOffer \/>}/);
  assert.match(page, /intelligence={<IntelligenceSuite \/>}/);
  assert.match(page, /assessment={<LatestRegulatoryAssessment \/>}/);
  assert.match(hub, /<details className="iv-tool-module"/);
  assert.match(hub, /<summary className="iv-tool-summary"/);
});

test('the primary brand exposes the Active Verifier stamp and adjacent PASS seal', () => {
  assert.match(brand, />active<\/text>/);
  assert.match(brand, />verifier<\/text>/);
  assert.match(brand, />PASS<\/text>/);
  assert.match(brand, /brand-active-stamp/);
});
