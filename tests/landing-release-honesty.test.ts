import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const landing = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');

test('landing does not advertise direct marketplace connectors before OAuth is live', () => {
  assert.match(landing, /Compatible with Shopify, Amazon and Etsy exports/);
  assert.match(landing, /Compatible con exportaciones de Shopify, Amazon y Etsy/);
  assert.doesNotMatch(landing, /'Shopify, Amazon and Etsy connectors'/);
  assert.doesNotMatch(landing, /'Conectores Shopify, Amazon y Etsy'/);
});

test('Radar marketing makes official monitoring conditional on activation', () => {
  assert.match(landing, /Radar workspace \(official monitoring when activated\)/);
  assert.match(landing, /espacio Radar \(monitorización oficial cuando esté activada\)/);
});

test('legal navigation preserves selected language', () => {
  assert.match(landing, /href=\{`\/privacy\?lang=\$\{language\}`\}/);
  assert.match(landing, /href=\{`\/terms\?lang=\$\{language\}`\}/);
});

test('structured data uses localized free-plan and EU copy', () => {
  assert.match(landing, /description: t\.pricing\.freeBody/);
  assert.match(landing, /name: t\.markets\.cards\.EU\.name/);
  assert.doesNotMatch(landing, /free product analyses/);
});
