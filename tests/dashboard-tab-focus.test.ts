import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const dashboard = readFileSync(new URL('../components/Dashboard.tsx', import.meta.url), 'utf8');

test('destructive dashboard view changes hand focus to the updated workspace heading', () => {
  assert.match(dashboard, /const workspaceHeading = useRef<HTMLHeadingElement>\(null\)/);
  assert.match(dashboard, /const pendingWorkspaceFocus = useRef<Tab \| null>\(null\)/);
  assert.match(dashboard, /function moveToTabWithFocus\(nextTab: Tab\) \{[\s\S]{0,140}pendingWorkspaceFocus\.current = nextTab;[\s\S]{0,80}setTab\(nextTab\)/);
  assert.match(dashboard, /if \(pendingWorkspaceFocus\.current !== tab\) return;[\s\S]{0,220}workspaceHeading\.current\?\.focus\(\)/);
  assert.match(dashboard, /<h1 ref=\{workspaceHeading\} tabIndex=\{-1\}>/);
});

test('results and history-open transitions use the focus-preserving path', () => {
  const focusedTransitions = dashboard.match(/moveToTabWithFocus\('products'\)/g) ?? [];
  assert.ok(focusedTransitions.length >= 4, 'expected upload, history open, view-products and view-results transitions to preserve focus');
  assert.match(dashboard, /async function open\(id: string\)[\s\S]{0,620}moveToTabWithFocus\('products'\)/);
  assert.match(dashboard, /onClick=\{\(\) => moveToTabWithFocus\('products'\)\}>\{d\('viewProducts'\)\}/);
  assert.match(dashboard, /onClick=\{\(\) => moveToTabWithFocus\('products'\)\}>\{d\('viewResults'\)\}/);
});

test('persistent side navigation keeps focus on the selected navigation control', () => {
  assert.match(dashboard, /tabs\.map\(\(\[id, label, description\]\) => <button[\s\S]{0,260}onClick=\{\(\) => \{ setTab\(id\); setNotice\(''\); \}\}/);
});
