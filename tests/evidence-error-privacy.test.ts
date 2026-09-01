import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const route = readFileSync(new URL('../app/api/evidence/route.ts', import.meta.url), 'utf8');

test('evidence writes whitelist customer-visible errors and hide unexpected exceptions', () => {
  assert.match(route, /function customerEvidenceError\(language: Language, error: unknown\): string/);
  assert.match(route, /const safeMessages = \[e\('invalidData'\), e\('validateAnalysis'\), e\('missingProduct'\), e\('wrongRequirement'\), e\('save'\)\]/);
  assert.match(route, /if \(safeMessages\.includes\(error\.message\)\) return error\.message/);
  assert.match(route, /console\.error\('evidence_write_failed', error\)/);
  assert.match(route, /return json\(\{ error: customerEvidenceError\(language, error\) \}, 400\)/);
  assert.doesNotMatch(route, /return json\(\{ error: error instanceof Error \? error\.message : e\('invalid'\) \}, 400\)/);
});
