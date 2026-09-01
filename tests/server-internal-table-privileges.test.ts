import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const migration = readFileSync(new URL('../supabase/migrations/20260901090719_grant_server_internal_table_privileges.sql', import.meta.url), 'utf8');

const expected = [
  'grant select, insert, update on table public.subscriptions to service_role;',
  'grant select, insert, update on table public.unlimited_lifetime_entitlements to service_role;',
  'grant select, insert on table public.ai_usage_events to service_role;',
  'grant select, insert, update on table public.regulatory_change_events to service_role;',
  'grant select, insert, update on table public.stripe_webhook_events to service_role;',
];

test('server-only internal tables retain the minimum service_role privileges required by PostgREST', () => {
  for (const statement of expected) assert.match(migration, new RegExp(statement.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.doesNotMatch(migration, /grant\s+(?:all|select|insert|update|delete)[^;]+\s+to\s+(?:public|anon|authenticated)/i);
  assert.doesNotMatch(migration, /grant\s+delete/i);
});
