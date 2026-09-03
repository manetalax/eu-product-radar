import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const page = await readFile(new URL('../app/dashboard/page.tsx', import.meta.url), 'utf8');
const hub = await readFile(new URL('../components/DashboardExtrasHub.tsx', import.meta.url), 'utf8');
const brand = await readFile(new URL('../components/Brand.tsx', import.meta.url), 'utf8');

test('advanced dashboard surfaces are grouped instead of rendered as an endless tail', () => {
  assert.ok(page.includes('<DashboardExtrasHub'));
  assert.ok(page.includes('personalized={<PersonalizedPlanOffer />}'));
  assert.ok(page.includes('intelligence={<IntelligenceSuite />}'));
  assert.ok(page.includes('assessment={<LatestRegulatoryAssessment />}'));
  assert.ok(hub.includes('<details className="iv-tool-module"'));
  assert.ok(hub.includes('<summary className="iv-tool-summary"'));
});

test('the primary brand exposes the Active Verifier stamp and adjacent PASS seal', () => {
  assert.ok(brand.includes('>active</text>'));
  assert.ok(brand.includes('>verifier</text>'));
  assert.ok(brand.includes('>PASS</text>'));
  assert.ok(brand.includes('brand-active-stamp'));
});
