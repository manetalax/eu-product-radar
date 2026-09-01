export const PLAN_IDS = ['starter', 'growth', 'pro', 'business'] as const;
export type PlanId = typeof PLAN_IDS[number];
export type PurchaseId = PlanId;

export type PlanDefinition = {
  id: PlanId;
  name: string;
  monthlyPriceEur: number;
  monthlyProductLimit: number;
  featured: boolean;
  unlimited?: boolean;
  legacy?: boolean;
};

export const FREE_TRIAL_PRODUCT_LIMIT = 5;

// Public offer: one simple plan. The numeric ceiling is an infrastructure fair-use
// guardrail, not a marketed product quota.
export const UNLIMITED_FAIR_USE_CEILING = 1_000_000;
export const UNLIMITED_PLAN: PlanDefinition = {
  id: 'starter',
  name: 'Unlimited',
  monthlyPriceEur: 9.95,
  monthlyProductLimit: UNLIMITED_FAIR_USE_CEILING,
  featured: true,
  unlimited: true,
};

// Only plans in this array are sold/displayed to new customers.
export const PLANS: readonly PlanDefinition[] = [UNLIMITED_PLAN] as const;

// Hidden legacy subscription definitions keep historical subscriptions and Stripe webhooks readable.
const LEGACY_PLANS: Record<Exclude<PlanId, 'starter'>, PlanDefinition> = {
  growth: { id: 'growth', name: 'Growth (legacy)', monthlyPriceEur: 29, monthlyProductLimit: 150, featured: false, legacy: true },
  pro: { id: 'pro', name: 'Pro (legacy)', monthlyPriceEur: 49, monthlyProductLimit: 500, featured: false, legacy: true },
  business: { id: 'business', name: 'Business (legacy)', monthlyPriceEur: 149, monthlyProductLimit: 2_000, featured: false, legacy: true },
};

export const PLANS_BY_ID: Record<PlanId, PlanDefinition> = {
  starter: UNLIMITED_PLAN,
  ...LEGACY_PLANS,
};

export function isPurchaseId(value: unknown): value is PurchaseId {
  return isPlanId(value);
}

export function purchaseName(value: PurchaseId): string {
  return PLANS_BY_ID[value].name;
}

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === 'string' && (PLAN_IDS as readonly string[]).includes(value);
}
