import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../app/dashboard-polish.css', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../components/Dashboard.tsx', import.meta.url), 'utf8');
const uploadCopy = readFileSync(new URL('../lib/upload-i18n.ts', import.meta.url), 'utf8');

test('mobile import actions span the full upload card and keep touch-sized controls', () => {
  assert.match(css, /@media\(max-width:700px\)[\s\S]*\.import-actions\{grid-column:1\/-1;width:100%;flex-direction:column\}/);
  assert.match(css, /\.import-actions \.btn,\.import-actions \.text-button\{width:100%;min-height:48px\}/);
});

test('universal file picker remains broad while camera capture is a separate image-only path', () => {
  assert.match(dashboard, /accept="[^"]*\.csv[^"]*\.xlsx[^"]*\.pdf[^"]*\.docx[^"]*\.png[^"]*\.heic[^"]*image\/\*[^"]*"/);
  assert.match(dashboard, /ref=\{cameraInput\}[\s\S]*accept="image\/\*" capture="environment"/);
  assert.match(dashboard, /cameraInput\.current\?\.click\(\)/);
  assert.match(dashboard, /if \(cameraInput\.current\) cameraInput\.current\.value = ''/);
});

test('camera affordance is localized across every active language', () => {
  for (const language of ['es', 'en', 'fr', 'de', 'it', 'pt']) {
    assert.match(uploadCopy, new RegExp(`${language}: \\{[\\s\\S]*cameraAria:[\\s\\S]*takePhoto:`));
  }
  assert.match(dashboard, /aria-label=\{uploadT\.cameraAria\}/);
  assert.match(dashboard, />\{uploadT\.takePhoto\}<\/button>/);
});
