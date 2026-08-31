import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { regulatoryAgentCopy } from '../lib/regulatory-agent-i18n';

const agent = readFileSync(new URL('../app/api/regulatory-agent/route.ts', import.meta.url), 'utf8');
const evidence = readFileSync(new URL('../app/api/evidence/route.ts', import.meta.url), 'utf8');

const languages = ['es','en','fr','de','it','pt'] as const;

test('regulatory agent validates language and treats stored context as untrusted data', () => {
  assert.match(agent, /const initialLanguage = requestLanguage\(request\)/);
  assert.match(agent, /isLanguage\(body\.language\) \? body\.language : initialLanguage/);
  assert.match(agent, /DATOS NO CONFIABLES/);
  assert.match(agent, /no instrucciones/i);
  assert.match(agent, /localizeEuRegulatoryAssessment\(rawRegulatory, language\)/);
  assert.match(agent, /source_url: safeOfficialRegulatoryUrl\(event\.source_url\)/);
  assert.doesNotMatch(agent, /body\.language\.slice/);
});

test('agent rejects cross-origin requests before parsing the request body', () => {
  const originIndex = agent.indexOf('if (!sameOrigin(request))');
  const authIndex = agent.indexOf('await supabase.auth.getUser()');
  const bodyIndex = agent.indexOf('await readJsonBody(request)');
  assert.ok(originIndex >= 0);
  assert.ok(authIndex > originIndex);
  assert.ok(bodyIndex > authIndex);
});

test('regulatory agent API copy exists and is translated in all supported languages', () => {
  const keys = Object.keys(regulatoryAgentCopy.es).sort();
  for (const language of languages) {
    assert.deepEqual(Object.keys(regulatoryAgentCopy[language]).sort(), keys, language);
    for (const key of keys as (keyof typeof regulatoryAgentCopy.es)[]) {
      assert.ok(regulatoryAgentCopy[language][key].trim().length > 0, `${language}.${key}`);
      if (language !== 'es') assert.notEqual(regulatoryAgentCopy[language][key], regulatoryAgentCopy.es[key], `${language}.${key}`);
    }
  }
});

test('evidence writes require an owned existing product and a generated regulatory evidence key', () => {
  assert.match(evidence, /\.eq\('id', analysisId\)[\s\S]*?\.eq\('user_id', user\.id\)/);
  assert.match(evidence, /productIndex >= products\.length/);
  assert.match(evidence, /regulatoryEvidenceKeys\(products\[productIndex\]/);
  assert.match(evidence, /throw new Error\(e\('wrongRequirement'\)\)/);
});
