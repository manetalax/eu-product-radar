import { FREE_TRIAL_PRODUCT_LIMIT, isPlanId, PlanId, UNLIMITED_FAIR_USE_CEILING, UNLIMITED_PLAN } from './plans';

export const ACTIVE_SUBSCRIPTION_STATUSES = ['active', 'trialing'] as const;
export const UNLIMITED_BILLING_OPTIONS = ['monthly', 'annual', 'lifetime'] as const;
export type UnlimitedBillingOption = typeof UNLIMITED_BILLING_OPTIONS[number];

export const IMPORTVERIFIER_UNLIMITED_PRICE_ID = 'price_1UAJy5HJnO8odw1Mn4jMVjFt';
export const IMPORTVERIFIER_UNLIMITED_ANNUAL_PRICE_ID = 'price_1UAjP0HJnO8odw1M7RBK8jsR';
export const IMPORTVERIFIER_UNLIMITED_LIFETIME_PRICE_ID = 'price_1UAjP8HJnO8odw1MmSXdkNIh';

export const UNLIMITED_PRICE_CONFIG: Record<UnlimitedBillingOption, {
  priceId: string;
  amountCents: number;
  checkoutMode: 'subscription' | 'payment';
  recurringInterval: 'month' | 'year' | null;
}> = {
  monthly: { priceId: IMPORTVERIFIER_UNLIMITED_PRICE_ID, amountCents: 995, checkoutMode: 'subscription', recurringInterval: 'month' },
  annual: { priceId: IMPORTVERIFIER_UNLIMITED_ANNUAL_PRICE_ID, amountCents: 8995, checkoutMode: 'subscription', recurringInterval: 'year' },
  lifetime: { priceId: IMPORTVERIFIER_UNLIMITED_LIFETIME_PRICE_ID, amountCents: 14900, checkoutMode: 'payment', recurringInterval: null },
};

export type BillingPlanId = 'free' | PlanId;

export type BillingStatus = {
  planId: BillingPlanId;
  planName: string;
  status: string | null;
  productLimit: number;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  billingOption: UnlimitedBillingOption | null;
};

export type SubscriptionRecord = {
  plan_id?: unknown;
  status?: unknown;
  current_period_end?: unknown;
  cancel_at_period_end?: unknown;
  stripe_price_id?: unknown;
};

export function isUnlimitedBillingOption(value: unknown): value is UnlimitedBillingOption {
  return typeof value === 'string' && (UNLIMITED_BILLING_OPTIONS as readonly string[]).includes(value);
}

export function unlimitedBillingStatus(status: 'lifetime' | 'active' = 'lifetime'): BillingStatus {
  return {
    planId: UNLIMITED_PLAN.id,
    planName: UNLIMITED_PLAN.name,
    status,
    productLimit: UNLIMITED_FAIR_USE_CEILING,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    billingOption: status === 'lifetime' ? 'lifetime' : null,
  };
}

function billingOptionForStoredStripePrice(priceId: string | null): UnlimitedBillingOption | null {
  if (!priceId) return null;
  // Persisted production rows keep their canonical live Stripe price IDs even when code is
  // exercised in test/development. Recognize those first, then allow configured non-live IDs.
  return billingOptionForStripePrice(priceId, true) ?? billingOptionForStripePrice(priceId, false);
}

export function billingStatus(record: SubscriptionRecord | null, now = new Date()): BillingStatus {
  const storedPlanId = isPlanId(record?.plan_id) ? record.plan_id : null;
  const status = typeof record?.status === 'string' ? record.status : null;
  const periodEnd = typeof record?.current_period_end === 'string' ? record.current_period_end : null;
  const endIsValid = !periodEnd || new Date(periodEnd).getTime() > now.getTime();
  const paid = Boolean(storedPlanId && status && ACTIVE_SUBSCRIPTION_STATUSES.includes(status as typeof ACTIVE_SUBSCRIPTION_STATUSES[number]) && endIsValid);
  if (!paid || !storedPlanId) return {
    planId: 'free',
    planName: 'Gratis',
    status,
    productLimit: FREE_TRIAL_PRODUCT_LIMIT,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: Boolean(record?.cancel_at_period_end),
    billingOption: null,
  };

  const priceId = typeof record?.stripe_price_id === 'string' ? record.stripe_price_id : null;
  const billingOption = billingOptionForStoredStripePrice(priceId);

  // Historical subscription plan IDs remain readable in persistence/webhooks, but every
  // currently active paid subscriber receives the public ImportVerifier Unlimited entitlement.
  return {
    planId: UNLIMITED_PLAN.id,
    planName: UNLIMITED_PLAN.name,
    status,
    productLimit: UNLIMITED_PLAN.monthlyProductLimit,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: Boolean(record?.cancel_at_period_end),
    billingOption: billingOption === 'lifetime' ? null : billingOption,
  };
}

export function stripePriceIdForBillingOption(option: UnlimitedBillingOption, production = process.env.NODE_ENV === 'production'): string {
  if (production) return UNLIMITED_PRICE_CONFIG[option].priceId;
  const envName: Record<UnlimitedBillingOption, string> = {
    monthly: 'STRIPE_PRICE_STARTER',
    annual: 'STRIPE_PRICE_ANNUAL',
    lifetime: 'STRIPE_PRICE_LIFETIME',
  };
  const value = process.env[envName[option]];
  if (!value || !/^price_[A-Za-z0-9]+$/.test(value)) throw new Error(`Falta configurar ${envName[option]} en Netlify.`);
  return value;
}

export function billingOptionForStripePrice(priceId: string | null | undefined, production = process.env.NODE_ENV === 'production'): UnlimitedBillingOption | null {
  if (!priceId) return null;
  const entries: Array<[UnlimitedBillingOption, string | undefined]> = production
    ? [
      ['monthly', IMPORTVERIFIER_UNLIMITED_PRICE_ID],
      ['annual', IMPORTVERIFIER_UNLIMITED_ANNUAL_PRICE_ID],
      ['lifetime', IMPORTVERIFIER_UNLIMITED_LIFETIME_PRICE_ID],
    ]
    : [
      ['monthly', process.env.STRIPE_PRICE_STARTER],
      ['annual', process.env.STRIPE_PRICE_ANNUAL],
      ['lifetime', process.env.STRIPE_PRICE_LIFETIME],
    ];
  return entries.find(([, value]) => value === priceId)?.[0] ?? null;
}

export function stripePriceId(planId: PlanId, production = process.env.NODE_ENV === 'production'): string {
  if (planId === 'starter') return stripePriceIdForBillingOption('monthly', production);
  const names: Record<Exclude<PlanId, 'starter'>, string> = {
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
  if (billingOptionForStripePrice(priceId, production)) return 'starter';
  const entries = [
    ['growth', process.env.STRIPE_PRICE_GROWTH],
    ['pro', process.env.STRIPE_PRICE_PRO],
    ['business', process.env.STRIPE_PRICE_BUSINESS],
  ] as const;
  return entries.find(([, value]) => value === priceId)?.[0] ?? null;
}
