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
const ACCOUNT_DELETE_BODY_MAX_BYTES = 4 * 1024;

function isStripeResourceMissing(error: unknown) {
  return typeof error === 'object'
    && error !== null
    && 'code' in error
    && (error as { code?: unknown }).code === 'resource_missing';
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return failure('origin_not_allowed', 403);

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user?.email) return failure('session_expired', 401);

  let confirmation;
  try {
    confirmation = accountDeletionRequest(await readJsonBody(request, ACCOUNT_DELETE_BODY_MAX_BYTES), user.email);
  } catch (error) {
    return failure(error instanceof AccountDeletionError ? error.code : 'invalid_confirmation', 400);
  }

  // A deleted account must never leave a recurring Stripe subscription charging in the background.
  // The database row can lag behind Stripe, so use it only to locate the subscription and re-read
  // Stripe's current state before deciding whether cancellation is still required.
  try {
    const admin = createAdminClient();
    const { data: subscription, error: subscriptionError } = await admin
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (subscriptionError && subscriptionError.code !== 'PGRST116') return failure('delete_failed', 503);

    const subscriptionId = typeof subscription?.stripe_subscription_id === 'string' ? subscription.stripe_subscription_id : '';
    if (subscriptionId) {
      const stripe = stripeClient();
      try {
        const latestSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        if (latestSubscription.status !== 'canceled') {
          await stripe.subscriptions.cancel(latestSubscription.id);
        }
      } catch (error) {
        // A missing Stripe subscription means there is no recurring object left to cancel.
        // Other Stripe failures remain fail-closed so account deletion cannot orphan a charge.
        if (!isStripeResourceMissing(error)) throw error;
      }
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
