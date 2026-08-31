import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const route = readFileSync(new URL('../app/api/analyses/route.ts', import.meta.url), 'utf8');

test('concurrent duplicate analysis insert is recovered as an idempotent success', () => {
  const insert = route.indexOf(".from('analyses').insert(");
  const unique = route.indexOf("if (error?.code === '23505')");
  const duplicateLookup = route.indexOf("const duplicate = await supabase.from('analyses').select", unique);
  const duplicateReturn = route.indexOf('return json({ analysis: duplicate.data, quota: latestQuota });', duplicateLookup);
  assert.ok(insert >= 0 && unique > insert && duplicateLookup > unique && duplicateReturn > duplicateLookup);
  assert.match(route.slice(unique, duplicateReturn), /\.eq\('id', requestId\)\.eq\('user_id', user\.id\)/);
});
