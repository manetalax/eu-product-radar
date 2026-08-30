import { NextResponse } from 'next/server';
import { AccountDeletionError, AccountDeletionErrorCode, accountDeletionRequest } from '@/lib/account';
import { PRIVATE_HEADERS, readJsonBody, sameOrigin } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: PRIVATE_HEADERS });
const failure = (errorCode: AccountDeletionErrorCode, status: number) => json({ errorCode }, status);

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return failure('origin_not_allowed', 403);

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user?.email) return failure('session_expired', 401);

  let confirmation;
  try {
    confirmation = accountDeletionRequest(await readJsonBody(request), user.email);
  } catch (error) {
    return failure(error instanceof AccountDeletionError ? error.code : 'invalid_confirmation', 400);
  }

  // getSession is safe here because getUser has just verified the same cookie-backed identity.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return failure('session_expired', 401);

  const { data, error } = await supabase.functions.invoke('delete-account', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${session.access_token}` },
    body: confirmation,
  });

  if (error || !data?.deleted) {
    return failure('delete_failed', 503);
  }

  // The Edge Function revokes every refresh token. This call also clears the browser cookie.
  await supabase.auth.signOut({ scope: 'local' });
  return json({ deleted: true });
}
