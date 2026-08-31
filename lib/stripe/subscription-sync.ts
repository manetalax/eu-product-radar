import type Stripe from 'stripe';
import { planIdForStripePrice } from '@/lib/billing';
import { isPlanId, PLANS_BY_ID } from '@/lib/plans';
import { createAdminClient } from '@/lib/supabase/admin';

export function stripeObjectId(value: string | { id: string } | null): string | null {
  return typeof value === 'string' ? value : value?.id ?? null;
}

export async function syncStripeSubscription(subscription: Stripe.Subscription) {
  const admin = createAdminClient();
  const customerId = stripeObjectId(subscription.customer);
  if (!customerId) throw new Error('unrecognized_subscription_identity');
  if (subscription.items.data.length !== 1) throw new Error('unexpected_subscription_items');
  const priceId = subscription.items.data[0]?.price.id ?? null;
  const metadataUserId = subscription.metadata.user_id || null;

  const { data: existingCustomer, error: customerError } = await admin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();
  if (customerError && customerError.code !== 'PGRST116') throw customerError;
  const existingUserId = existingCustomer?.user_id ?? null;
  if (existingUserId && metadataUserId && existingUserId !== metadataUserId) throw new Error('subscription_customer_user_mismatch');
  const userId = existingUserId ?? metadataUserId;

  const pricePlanId = planIdForStripePrice(priceId);
  const metadataPlanId = isPlanId(subscription.metadata.plan_id) ? subscription.metadata.plan_id : null;
  if (!pricePlanId) throw new Error('unrecognized_subscription_price');
  if (metadataPlanId && pricePlanId !== metadataPlanId) throw new Error('subscription_plan_price_mismatch');
  const planId = pricePlanId;
  if (!userId) throw new Error('unrecognized_subscription_identity');

  const periodEnd = Number.isFinite(subscription.items.data[0].current_period_end)
    ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
    : null;
  const { error } = await admin.from('subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    plan_id: planId,
    status: subscription.status,
    product_limit: PLANS_BY_ID[planId].monthlyProductLimit,
    current_period_end: periodEnd,
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  if (error) {
    if (subscription.status === 'canceled' && error.code === '23503') return;
    throw error;
  }
}
