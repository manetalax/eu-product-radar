import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const initial = readFileSync(new URL('../supabase/migrations/202608310006_api_rate_limits.sql', import.meta.url), 'utf8');
const fix = readFileSync(new URL('../supabase/migrations/20260901090429_grant_api_rate_limit_service_role.sql', import.meta.url), 'utf8');

test('rate-limit RPC remains browser-inaccessible but executable by server service_role', () => {
  assert.match(initial, /revoke all on function public\.consume_api_rate_limit\(uuid, text, integer, integer\) from public, anon, authenticated;/);
  assert.match(fix, /grant execute on function public\.consume_api_rate_limit\(uuid, text, integer, integer\) to service_role;/);
  assert.match(fix, /revoke execute on function public\.consume_api_rate_limit\(uuid, text, integer, integer\) from public, anon, authenticated;/);
  assert.doesNotMatch(fix, /grant execute[^;]+to (?:public|anon|authenticated)/i);
});
