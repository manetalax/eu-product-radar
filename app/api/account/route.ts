import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
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
const NON_CANCELLABLE_SUBSCRIPTION_STATUSES = new Set<Stripe.Subscription.Status>(['canceled', 'incomplete_expired']);

function isStripeResourceMissing(error: unknown) {
  return typeof error === 'object'
    && error !== null
    && 'code' in error
    && (error as { code?: unknown }).code === 'resource_missing';
}

async function cancelCustomerSubscriptions(customerId: string) {
  const stripe = stripeClient();
  let startingAfter: string | undefined;

  do {
    const page = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    for (const subscription of page.data) {
      if (!NON_CANCELLABLE_SUBSCRIPTION_STATUSES.has(subscription.status)) {
        await stripe.subscriptions.cancel(subscription.id);
      }
    }

    if (!page.has_more) return;
    const lastId = page.data.at(-1)?.id;
    if (!lastId) throw new Error('stripe_subscription_pagination_failed');
    startingAfter = lastId;
  } while (startingAfter);
}

async function cancelKnownSubscription(subscriptionId: string) {
  const stripe = stripeClient();
  const latestSubscription = await stripe.subscriptions.retrieve(subscriptionId);
  if (!NON_CANCELLABLE_SUBSCRIPTION_STATUSES.has(latestSubscription.status)) {
    await stripe.subscriptions.cancel(latestSubscription.id);
  }
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

  // Account deletion must never leave recurring Stripe billing behind. Supabase is used
  // only to locate the Stripe customer; Stripe's current state is authoritative. Listing
  // every subscription also protects against duplicate/historical subscriptions that a
  // one-row local projection cannot represent.
  try {
    const admin = createAdminClient();
    const { data: subscription, error: subscriptionError } = await admin
      .from('subscriptions')
      .select('stripe_customer_id,stripe_subscription_id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (subscriptionError && subscriptionError.code !== 'PGRST116') return failure('delete_failed', 503);

    const customerId = typeof subscription?.stripe_customer_id === 'string' ? subscription.stripe_customer_id : '';
    const subscriptionId = typeof subscription?.stripe_subscription_id === 'string' ? subscription.stripe_subscription_id : '';

    try {
      if (customerId) {
        await cancelCustomerSubscriptions(customerId);
      } else if (subscriptionId) {
        await cancelKnownSubscription(subscriptionId);
      }
    } catch (error) {
      // A missing Stripe customer/subscription means the recurring billing object no longer
      // exists. Any other Stripe failure remains fail-closed so deletion cannot orphan a charge.
      if (!isStripeResourceMissing(error)) throw error;
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
