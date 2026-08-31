import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const panel = readFileSync(new URL('../components/ReadinessEvidencePanel.tsx', import.meta.url), 'utf8');

test('failed evidence saves roll back optimistic state and surface an alert', () => {
  assert.match(panel, /if \(!response\.ok\) throw new Error\('evidence_save_failed'\)/);
  assert.match(panel, /catch \{/);
  assert.match(panel, /setRows\(current => \[\.\.\.current\.filter/);
  assert.match(panel, /setSaveError\(t\.saveError\)/);
  assert.match(panel, /role="alert" className="message error"/);
});

test('evidence save failure copy exists in all six supported languages', () => {
  for (const text of ['No se ha podido guardar la evidencia','The evidence could not be saved','Impossible d’enregistrer la preuve','Der Nachweis konnte nicht gespeichert werden','Non è stato possibile salvare l’evidenza','Não foi possível guardar a evidência']) {
    assert.ok(panel.includes(text), text);
  }
});
