import test from 'node:test';
import assert from 'node:assert/strict';
import { trustedSupabaseOAuthNavigationUrl } from '../lib/oauth-navigation';

const BASE = 'https://hfuwwjdcyudflamwwnon.supabase.co';

test('permite únicamente el endpoint OAuth del proyecto Supabase configurado', () => {
  const url = `${BASE}/auth/v1/authorize?provider=google&redirect_to=https%3A%2F%2Fimportverifier.netlify.app%2Fauth%2Fcallback`;
  assert.equal(trustedSupabaseOAuthNavigationUrl(url, BASE), url);
});

test('rechaza hosts lookalike, protocolos inseguros, credenciales y rutas distintas', () => {
  assert.equal(trustedSupabaseOAuthNavigationUrl('https://hfuwwjdcyudflamwwnon.supabase.co.evil.example/auth/v1/authorize?provider=google', BASE), null);
  assert.equal(trustedSupabaseOAuthNavigationUrl('http://hfuwwjdcyudflamwwnon.supabase.co/auth/v1/authorize?provider=google', BASE), null);
  assert.equal(trustedSupabaseOAuthNavigationUrl('https://user:pass@hfuwwjdcyudflamwwnon.supabase.co/auth/v1/authorize?provider=google', BASE), null);
  assert.equal(trustedSupabaseOAuthNavigationUrl(`${BASE}/auth/v1/callback?provider=google`, BASE), null);
  assert.equal(trustedSupabaseOAuthNavigationUrl('https://accounts.google.com/o/oauth2/v2/auth', BASE), null);
});

test('permite HTTP solo cuando el Supabase configurado es local', () => {
  const local = 'http://127.0.0.1:54321';
  const url = `${local}/auth/v1/authorize?provider=google`;
  assert.equal(trustedSupabaseOAuthNavigationUrl(url, local), url);
  assert.equal(trustedSupabaseOAuthNavigationUrl('http://localhost:54321/auth/v1/authorize?provider=google', local), null);
});
