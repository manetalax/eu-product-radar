import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { IMPORTVERIFIER_SUPABASE_URL, trustedSupabaseProjectUrl } from '../lib/supabase/config';

const adminClient = readFileSync(new URL('../lib/supabase/admin.ts', import.meta.url), 'utf8');

test('production Supabase configuration only accepts the canonical ImportVerifier project origin', () => {
  for (const value of [IMPORTVERIFIER_SUPABASE_URL, `${IMPORTVERIFIER_SUPABASE_URL}/`]) {
    assert.equal(trustedSupabaseProjectUrl(value, true), IMPORTVERIFIER_SUPABASE_URL);
  }
  for (const value of [
    'https://hfuwwjdcyudflamwwnon.supabase.co.evil.example',
    'https://other.supabase.co',
    'https://hfuwwjdcyudflamwwnon.supabase.co:444',
    'https://user:pass@hfuwwjdcyudflamwwnon.supabase.co',
    'https://hfuwwjdcyudflamwwnon.supabase.co/rest/v1',
    'https://hfuwwjdcyudflamwwnon.supabase.co/?redirect=1',
    'http://hfuwwjdcyudflamwwnon.supabase.co',
    'not-a-url',
  ]) assert.equal(trustedSupabaseProjectUrl(value, true), null, value);
});

test('development permits only localhost HTTP in addition to the canonical project', () => {
  assert.equal(trustedSupabaseProjectUrl('http://localhost:54321', false), 'http://localhost:54321');
  assert.equal(trustedSupabaseProjectUrl('http://localhost:54321/path', false), null);
  assert.equal(trustedSupabaseProjectUrl('https://other.supabase.co', false), null);
});

test('privileged Supabase client obtains its destination through the validated shared configuration', () => {
  assert.match(adminClient, /const \{ url \} = supabaseConfig\(\)/);
  assert.doesNotMatch(adminClient, /NEXT_PUBLIC_SUPABASE_URL/);
  assert.match(adminClient, /secret\?\.startsWith\('sb_secret_'\)/);
});
