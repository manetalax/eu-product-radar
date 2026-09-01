import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { guideScopeFor } from '../lib/guide-i18n';

const exporter = readFileSync(new URL('../lib/export-report.ts', import.meta.url), 'utf8');

test('Excel documentary guide uses the selected-language scope instead of the Spanish constant', () => {
  assert.match(exporter, /guideScopeFor\(language\)/);
  assert.doesNotMatch(exporter, /\bGUIDE_SCOPE\b/);
  assert.notEqual(guideScopeFor('en'), guideScopeFor('es'));
  assert.notEqual(guideScopeFor('fr'), guideScopeFor('es'));
  assert.notEqual(guideScopeFor('de'), guideScopeFor('es'));
  assert.notEqual(guideScopeFor('it'), guideScopeFor('es'));
  assert.notEqual(guideScopeFor('pt'), guideScopeFor('es'));
});
