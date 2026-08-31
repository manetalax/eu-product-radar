import { NextResponse } from 'next/server';
import { AccountDeletionError, AccountDeletionErrorCode, accountDeletionRequest } from '@/lib/account';
import { PRIVATE_HEADERS, readJsonBody, sameOrigin } from '@/lib/http';
import { stripeClient } from '@/lib/stripe/server';
import { createAdminClient } from '@/lib/supabase/admin';
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

  // A deleted account must never leave a recurring Stripe subscription charging in the background.
  try {
    const admin = createAdminClient();
    const { data: subscription, error: subscriptionError } = await admin
      .from('subscriptions')
      .select('stripe_subscription_id,status')
      .eq('user_id', user.id)
      .maybeSingle();
    if (subscriptionError && subscriptionError.code !== 'PGRST116') return failure('delete_failed', 503);

    const subscriptionId = typeof subscription?.stripe_subscription_id === 'string' ? subscription.stripe_subscription_id : '';
    const subscriptionStatus = typeof subscription?.status === 'string' ? subscription.status : '';
    if (subscriptionId && subscriptionStatus !== 'canceled') {
      await stripeClient().subscriptions.cancel(subscriptionId);
    }
  } catch {
    return failure('delete_failed', 503);
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
