import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('../app/dashboard-polish.css', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../components/Dashboard.tsx', import.meta.url), 'utf8');

test('dashboard bounds imported filenames and wraps long names in narrow layouts', () => {
  assert.match(dashboard, /file\.name\.length > 120/);
  assert.match(css, /\.selected-analysis>div:first-child,\.history-file>div\{min-width:0\}/);
  assert.match(css, /\.selected-analysis h3,\.content-card h2,\.history-file strong\{overflow-wrap:anywhere;word-break:break-word\}/);
  assert.match(css, /\.history-file\{[^}]*min-width:0/);
  assert.match(css, /\.history-file p\{[^}]*overflow-wrap:anywhere/);
});
