import { NextResponse } from 'next/server';
import { accountDeletionRequest } from '@/lib/account';
import { PRIVATE_HEADERS, readJsonBody, sameOrigin } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: PRIVATE_HEADERS });

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'Origen de solicitud no permitido.' }, 403);

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user?.email) return json({ error: 'Tu sesión ha caducado. Vuelve a entrar.' }, 401);

  let confirmation;
  try {
    confirmation = accountDeletionRequest(await readJsonBody(request), user.email);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'La confirmación de borrado no es válida.' }, 400);
  }

  // getSession is safe here because getUser has just verified the same cookie-backed identity.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return json({ error: 'Tu sesión ha caducado. Vuelve a entrar.' }, 401);

  const { data, error } = await supabase.functions.invoke('delete-account', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${session.access_token}` },
    body: confirmation,
  });

  if (error || !data?.deleted) {
    return json({ error: 'No se ha podido eliminar la cuenta. Tus datos permanecen intactos; vuelve a intentarlo.' }, 503);
  }

  // The Edge Function revokes every refresh token. This call also clears the browser cookie.
  await supabase.auth.signOut({ scope: 'local' });
  return json({ deleted: true });
}
