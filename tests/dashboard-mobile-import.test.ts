import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../app/dashboard-polish.css', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../components/Dashboard.tsx', import.meta.url), 'utf8');

test('mobile import actions span the full upload card and keep touch-sized controls', () => {
  assert.match(css, /@media\(max-width:700px\)[\s\S]*\.import-actions\{grid-column:1\/-1;width:100%;flex-direction:column\}/);
  assert.match(css, /\.import-actions \.btn,\.import-actions \.text-button\{width:100%;min-height:48px\}/);
});

test('mobile file picker advertises document, spreadsheet and camera/photo inputs', () => {
  assert.match(dashboard, /accept="[^"]*\.csv[^"]*\.xlsx[^"]*\.pdf[^"]*\.docx[^"]*\.png[^"]*\.heic[^"]*image\/\*[^"]*"/);
  assert.match(dashboard, /type="file"/);
});
