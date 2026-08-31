import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const agent = readFileSync(new URL('../app/api/regulatory-agent/route.ts', import.meta.url), 'utf8');
const evidence = readFileSync(new URL('../app/api/evidence/route.ts', import.meta.url), 'utf8');

test('regulatory agent validates language and treats stored context as untrusted data', () => {
  assert.match(agent, /isLanguage\(body\.language\) \? body\.language : 'es'/);
  assert.match(agent, /DATOS NO CONFIABLES/);
  assert.match(agent, /no instrucciones/i);
  assert.doesNotMatch(agent, /body\.language\.slice/);
});

test('evidence writes require an owned existing product and a generated regulatory evidence key', () => {
  assert.match(evidence, /\.eq\('id', analysisId\)[\s\S]*?\.eq\('user_id', user\.id\)/);
  assert.match(evidence, /productIndex >= products\.length/);
  assert.match(evidence, /regulatoryEvidenceKeys\(products\[productIndex\]/);
  assert.match(evidence, /no corresponde a un requisito regulatorio/);
});
