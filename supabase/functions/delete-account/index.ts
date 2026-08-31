import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.112.4';

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'private, no-store, max-age=0',
};
const CONFIRMATION = 'BORRAR';
const MAX_CONFIRMATION_BODY_BYTES = 4 * 1024;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

Deno.serve(async (request: Request) => {
  if (request.method !== 'DELETE') {
    return new Response(null, { status: 405, headers: { Allow: 'DELETE' } });
  }

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return json({ error: 'unauthorized' }, 401);

  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declaredLength) && declaredLength > MAX_CONFIRMATION_BODY_BYTES) {
    return json({ error: 'invalid_confirmation' }, 400);
  }

  const token = authorization.slice('Bearer '.length);
  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceRoleKey) return json({ error: 'service_unavailable' }, 503);

  const admin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  const { data: { user }, error: userError } = await admin.auth.getUser(token);
  if (userError || !user?.email) return json({ error: 'unauthorized' }, 401);

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_CONFIRMATION_BODY_BYTES) {
      return json({ error: 'invalid_confirmation' }, 400);
    }
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return json({ error: 'invalid_confirmation' }, 400);
  }

  const emailMatches = typeof body.email === 'string'
    && body.email.trim().toLocaleLowerCase('en-US') === user.email.trim().toLocaleLowerCase('en-US');
  if (!emailMatches || body.confirmation !== CONFIRMATION) {
    return json({ error: 'invalid_confirmation' }, 400);
  }

  // Revoke every refresh token before deletion. Existing access tokens expire naturally,
  // but the user row and all owned rows are removed immediately afterwards.
  const { error: revokeError } = await admin.auth.admin.signOut(token, 'global');
  if (revokeError) return json({ error: 'session_revocation_failed' }, 503);

  const { error: deletionError } = await admin.auth.admin.deleteUser(user.id);
  if (deletionError) return json({ error: 'account_deletion_failed' }, 503);

  return json({ deleted: true });
});
