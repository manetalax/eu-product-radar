import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const panel = readFileSync(new URL('../components/ReadinessEvidencePanel.tsx', import.meta.url), 'utf8');

test('failed evidence saves roll back optimistic state and surface an alert', () => {
  assert.match(panel, /async function saveEvidence[^]*Promise<boolean>/);
  assert.match(panel, /if \(!response\.ok\) throw new Error\('evidence_save_failed'\)/);
  assert.match(panel, /catch \{/);
  assert.match(panel, /setRows\(current => \[\.\.\.current\.filter/);
  assert.match(panel, /setSaveError\(t\.saveError\)/);
  assert.match(panel, /return false/);
  assert.match(panel, /role="alert" className="message error"/);
});

test('unsaved evidence text fields visibly restore the last confirmed value', () => {
  assert.match(panel, /async function saveTextField/);
  assert.match(panel, /const saved = await saveEvidence/);
  assert.match(panel, /if \(!saved\) input\.value = previous/);
  for (const field of ['source_document', 'source_page', 'source_url', 'note']) {
    assert.ok(panel.includes(`'${field}'`), field);
  }
});

test('evidence save failure copy exists in all six supported languages', () => {
  for (const text of ['No se ha podido guardar la evidencia','The evidence could not be saved','Impossible d’enregistrer la preuve','Der Nachweis konnte nicht gespeichert werden','Non è stato possibile salvare l’evidenza','Não foi possível guardar a evidência']) {
    assert.ok(panel.includes(text), text);
  }
});


test('same-row evidence writes are synchronously serialized without blocking unrelated rows', () => {
  assert.match(panel, /const savingTokens = useRef\(new Set<string>\(\)\)/);
  assert.match(panel, /if \(savingTokens\.current\.has\(token\)\) return false/);
  assert.match(panel, /savingTokens\.current\.add\(token\)/);
  assert.match(panel, /savingTokens\.current\.delete\(token\)/);
  assert.equal(panel.match(/disabled=\{savingKeys\.has\(token\)\}/g)?.length, 5);
  assert.doesNotMatch(panel, /disabled=\{savingKeys\.size > 0\}/);
});

test('evidence saving progress has a persistent polite atomic announcement', () => {
  assert.match(panel, /<p className="sr-only" role="status" aria-live="polite" aria-atomic="true">\{savingKeys\.size > 0 \? t\.saving : ''\}<\/p>/);
  assert.match(panel, /\{savingKeys\.has\(token\) && <small className="muted">\{t\.saving\}<\/small>\}/);
});
