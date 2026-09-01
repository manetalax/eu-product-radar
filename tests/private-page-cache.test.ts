import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = readFileSync(new URL('../next.config.ts', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../app/dashboard/page.tsx', import.meta.url), 'utf8');

test('authenticated dashboard and reset pages are explicitly non-cacheable', () => {
  const dashboardHeader = config.indexOf("source: '/dashboard/:path*'");
  const resetHeader = config.indexOf("source: '/reset-password'");
  assert.notEqual(dashboardHeader, -1);
  assert.notEqual(resetHeader, -1);
  assert.ok(config.slice(dashboardHeader, dashboardHeader + 180).includes('privateNoStore'));
  assert.ok(config.slice(resetHeader, resetHeader + 220).includes('privateNoStore'));
  assert.match(config, /privateNoStore = \{ key: 'Cache-Control', value: 'private, no-store' \}/);
  assert.match(dashboard, /export const dynamic = 'force-dynamic'/);
  assert.match(dashboard, /supabase\.auth\.getUser\(\)/);
});
