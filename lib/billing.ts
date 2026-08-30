import { FREE_TRIAL_PRODUCT_LIMIT, isPlanId, ONE_TIME_AUDIT, PlanId, PLANS_BY_ID } from './plans';

export const ACTIVE_SUBSCRIPTION_STATUSES = ['active', 'trialing'] as const;
export type BillingPlanId = 'free' | 'audit' | PlanId;

export type BillingStatus = {
  planId: BillingPlanId;
  planName: string;
  status: string | null;
  productLimit: number;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

export type SubscriptionRecord = {
  plan_id?: unknown;
  status?: unknown;
  current_period_end?: unknown;
  cancel_at_period_end?: unknown;
};

export function billingStatus(record: SubscriptionRecord | null, now = new Date()): BillingStatus {
  const planId = isPlanId(record?.plan_id) ? record.plan_id : null;
  const status = typeof record?.status === 'string' ? record.status : null;
  const periodEnd = typeof record?.current_period_end === 'string' ? record.current_period_end : null;
  const endIsValid = !periodEnd || new Date(periodEnd).getTime() > now.getTime();
  const paid = Boolean(planId && status && ACTIVE_SUBSCRIPTION_STATUSES.includes(status as typeof ACTIVE_SUBSCRIPTION_STATUSES[number]) && endIsValid);
  if (!paid || !planId) return { planId: 'free', planName: 'Gratis', status, productLimit: FREE_TRIAL_PRODUCT_LIMIT, currentPeriodEnd: periodEnd, cancelAtPeriodEnd: Boolean(record?.cancel_at_period_end) };
  const plan = PLANS_BY_ID[planId];
  return { planId, planName: plan.name, status, productLimit: plan.monthlyProductLimit, currentPeriodEnd: periodEnd, cancelAtPeriodEnd: Boolean(record?.cancel_at_period_end) };
}

export function auditBillingStatus(): BillingStatus {
  return { planId: 'audit', planName: ONE_TIME_AUDIT.name, status: 'paid', productLimit: ONE_TIME_AUDIT.productLimit, currentPeriodEnd: null, cancelAtPeriodEnd: false };
}

export function stripePriceId(planId: PlanId): string {
  const names: Record<PlanId, string> = {
    starter: 'STRIPE_PRICE_STARTER',
    growth: 'STRIPE_PRICE_GROWTH',
    pro: 'STRIPE_PRICE_PRO',
    business: 'STRIPE_PRICE_BUSINESS',
  };
  const value = process.env[names[planId]];
  if (!value || !/^price_[A-Za-z0-9]+$/.test(value)) throw new Error(`Falta configurar ${names[planId]} en Netlify.`);
  return value;
}

export function planIdForStripePrice(priceId: string | null | undefined): PlanId | null {
  if (!priceId) return null;
  const entries = [
    ['starter', process.env.STRIPE_PRICE_STARTER],
    ['growth', process.env.STRIPE_PRICE_GROWTH],
    ['pro', process.env.STRIPE_PRICE_PRO],
    ['business', process.env.STRIPE_PRICE_BUSINESS],
  ] as const;
  return entries.find(([, value]) => value === priceId)?.[0] ?? null;
}
