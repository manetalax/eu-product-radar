import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const route = readFileSync(new URL('../app/api/account/route.ts', import.meta.url), 'utf8');

test('account deletion bounds the confirmation body at the same 4 KB limit as the Edge Function', () => {
  assert.match(route, /const ACCOUNT_DELETE_BODY_MAX_BYTES = 4 \* 1024/);
  assert.match(route, /readJsonBody\(request, ACCOUNT_DELETE_BODY_MAX_BYTES\)/);
});
