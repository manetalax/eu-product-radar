import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evidenceApiCopy } from '../lib/evidence-api-i18n';

const route = readFileSync(new URL('../app/api/evidence/route.ts', import.meta.url), 'utf8');
const languages = ['es','en','fr','de','it','pt'] as const;

test('evidence API resolves language for reads and writes', () => {
  assert.ok((route.match(/requestLanguage\(request\)/g) ?? []).length >= 2);
  assert.match(route, /evidenceApiText\(language, key\)/);
  const origin = route.indexOf('if (!sameOrigin(request))');
  const body = route.indexOf('await readJsonBody(request)');
  assert.ok(origin >= 0 && body > origin);
});

test('evidence API copy is complete and translated across supported languages', () => {
  const keys = Object.keys(evidenceApiCopy.es).sort();
  for (const language of languages) {
    assert.deepEqual(Object.keys(evidenceApiCopy[language]).sort(), keys, language);
    for (const key of keys as (keyof typeof evidenceApiCopy.es)[]) {
      assert.ok(evidenceApiCopy[language][key].trim().length > 0, `${language}.${key}`);
      if (language !== 'es') assert.notEqual(evidenceApiCopy[language][key], evidenceApiCopy.es[key], `${language}.${key}`);
    }
  }
});
