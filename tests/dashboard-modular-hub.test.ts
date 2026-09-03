import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const page = await readFile(new URL('../app/dashboard/page.tsx', import.meta.url), 'utf8');
const hub = await readFile(new URL('../components/DashboardExtrasHub.tsx', import.meta.url), 'utf8');
const organizer = await readFile(new URL('../components/DashboardModuleOrganizer.tsx', import.meta.url), 'utf8');
const brand = await readFile(new URL('../components/Brand.tsx', import.meta.url), 'utf8');

test('advanced dashboard surfaces are grouped instead of rendered as an endless tail', () => {
  assert.ok(page.includes('<DashboardExtrasHub'));
  assert.ok(page.includes('personalized={<PersonalizedPlanOffer />}'));
  assert.ok(page.includes('intelligence={<IntelligenceSuite />}'));
  assert.ok(page.includes('assessment={<LatestRegulatoryAssessment />}'));
  assert.ok(hub.includes('<details className="iv-tool-module"'));
  assert.ok(hub.includes('<summary className="iv-tool-summary"'));
});

test('dashboard organizer keeps persistent modular controls and quick-view presets', () => {
  assert.ok(page.includes('<DashboardModuleOrganizer'));
  assert.ok(organizer.includes("importverifier:dashboard-layout:v2"));
  assert.ok(organizer.includes("applyPreset('focus')"));
  assert.ok(organizer.includes("applyPreset('complete')"));
  assert.ok(organizer.includes("applyPreset('default')"));
  assert.ok(organizer.includes('MutationObserver'));
  assert.ok(organizer.includes("const visibleIds = items.filter(item => !item.hidden).map(item => item.id)"));
  assert.ok(organizer.includes('const targetId = visibleIds[visibleIndex + direction]'));
});

test('the primary brand exposes the Active Verifier stamp and adjacent PASS seal', () => {
  assert.ok(brand.includes('active'));
  assert.ok(brand.includes('verifier'));
  assert.ok(brand.includes('PASS'));
  assert.ok(brand.includes('brand-active-stamp'));
});
