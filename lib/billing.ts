import { FREE_TRIAL_PRODUCT_LIMIT, isPlanId, PlanId, UNLIMITED_PLAN } from './plans';

export const ACTIVE_SUBSCRIPTION_STATUSES = ['active', 'trialing'] as const;
export const IMPORTVERIFIER_UNLIMITED_PRICE_ID = 'price_1UAJy5HJnO8odw1Mn4jMVjFt';
export type BillingPlanId = 'free' | PlanId;

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
  const storedPlanId = isPlanId(record?.plan_id) ? record.plan_id : null;
  const status = typeof record?.status === 'string' ? record.status : null;
  const periodEnd = typeof record?.current_period_end === 'string' ? record.current_period_end : null;
  const endIsValid = !periodEnd || new Date(periodEnd).getTime() > now.getTime();
  const paid = Boolean(storedPlanId && status && ACTIVE_SUBSCRIPTION_STATUSES.includes(status as typeof ACTIVE_SUBSCRIPTION_STATUSES[number]) && endIsValid);
  if (!paid || !storedPlanId) return { planId: 'free', planName: 'Gratis', status, productLimit: FREE_TRIAL_PRODUCT_LIMIT, currentPeriodEnd: periodEnd, cancelAtPeriodEnd: Boolean(record?.cancel_at_period_end) };

  // Historical subscription plan IDs remain readable in persistence/webhooks, but every
  // currently active paid subscriber receives the single public ImportVerifier Unlimited entitlement.
  return {
    planId: UNLIMITED_PLAN.id,
    planName: UNLIMITED_PLAN.name,
    status,
    productLimit: UNLIMITED_PLAN.monthlyProductLimit,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: Boolean(record?.cancel_at_period_end),
  };
}

export function stripePriceId(planId: PlanId, production = process.env.NODE_ENV === 'production'): string {
  if (production && planId === 'starter') return IMPORTVERIFIER_UNLIMITED_PRICE_ID;
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

export function planIdForStripePrice(priceId: string | null | undefined, production = process.env.NODE_ENV === 'production'): PlanId | null {
  if (!priceId) return null;
  const entries = [
    ['starter', production ? IMPORTVERIFIER_UNLIMITED_PRICE_ID : process.env.STRIPE_PRICE_STARTER],
    ['growth', process.env.STRIPE_PRICE_GROWTH],
    ['pro', process.env.STRIPE_PRICE_PRO],
    ['business', process.env.STRIPE_PRICE_BUSINESS],
  ] as const;
  return entries.find(([, value]) => value === priceId)?.[0] ?? null;
}
