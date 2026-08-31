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
  const priceId = subscription.items.data[0]?.price.id ?? null;
  let userId = subscription.metadata.user_id;

  if (!userId && customerId) {
    const { data, error } = await admin.from('subscriptions').select('user_id').eq('stripe_customer_id', customerId).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    userId = data?.user_id;
  }

  const pricePlanId = planIdForStripePrice(priceId);
  const metadataPlanId = isPlanId(subscription.metadata.plan_id) ? subscription.metadata.plan_id : null;
  if (pricePlanId && metadataPlanId && pricePlanId !== metadataPlanId) throw new Error('subscription_plan_price_mismatch');
  const planId = pricePlanId ?? metadataPlanId;
  if (!userId || !planId || !customerId) throw new Error('unrecognized_subscription_identity');

  const ends = subscription.items.data.map(item => item.current_period_end).filter(Number.isFinite);
  const periodEnd = ends.length ? new Date(Math.max(...ends) * 1000).toISOString() : null;
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
