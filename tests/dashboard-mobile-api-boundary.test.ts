import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const dashboard = readFileSync(new URL('../components/Dashboard.tsx', import.meta.url), 'utf8');

test('Dashboard keeps parser details private and preserves mobile download/file support', () => {
  assert.match(dashboard, /let validJson = false/);
  assert.match(dashboard, /Provider\/proxy parser details must never leak/);
  assert.match(dashboard, /\.heic,\.heif,image\/\*/);
  const delayedRevocations = dashboard.match(/URL\.revokeObjectURL\(url\), 60000/g) ?? [];
  assert.ok(delayedRevocations.length >= 2, 'report and CSV template Blob URLs should remain valid for 60 seconds');
});
