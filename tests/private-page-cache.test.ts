import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = readFileSync(new URL('../next.config.ts', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../app/dashboard/page.tsx', import.meta.url), 'utf8');

test('authenticated dashboard and reset pages are explicitly non-cacheable', () => {
  assert.match(config, /source: '\/dashboard\/:path\*'.*privateNoStore/s);
  assert.match(config, /source: '\/reset-password'.*privateNoStore/s);
  assert.match(config, /privateNoStore = \{ key: 'Cache-Control', value: 'private, no-store' \}/);
  assert.match(dashboard, /export const dynamic = 'force-dynamic'/);
  assert.match(dashboard, /supabase\.auth\.getUser\(\)/);
});
