import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const rootLayout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const dashboardLayout = readFileSync(new URL('../app/dashboard/layout.tsx', import.meta.url), 'utf8');

test('dashboard-only CSS is not loaded by the public root shell', () => {
  assert.doesNotMatch(rootLayout, /dashboard-polish\.css/);
  assert.doesNotMatch(rootLayout, /account-security\.css/);
  assert.match(rootLayout, /premium-global\.css/);
  assert.match(rootLayout, /landing-conversion\.css/);
});

test('authenticated dashboard route owns its detailed dashboard and account CSS', () => {
  assert.match(dashboardLayout, /import '\.\.\/dashboard-polish\.css'/);
  assert.match(dashboardLayout, /import '\.\.\/account-security\.css'/);
  assert.match(dashboardLayout, /return children/);
});
