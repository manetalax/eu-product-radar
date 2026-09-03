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

// Public entitlement: Unlimited catalogue analysis with differentiated billing capabilities.
// The numeric ceiling is an infrastructure fair-use guardrail, not a marketed product quota.
export const UNLIMITED_FAIR_USE_CEILING = 1_000_000;
export const UNLIMITED_MONTHLY_PRICE_EUR = 9.95;
export const UNLIMITED_ANNUAL_PRICE_EUR = 89.95;
export const UNLIMITED_LIFETIME_PRICE_EUR = 299.95;
export const PERSONALIZED_PRICE_EUR = 995.50;
export const UNLIMITED_PLAN: PlanDefinition = {
  id: 'starter',
  name: 'Unlimited',
  monthlyPriceEur: UNLIMITED_MONTHLY_PRICE_EUR,
  monthlyProductLimit: UNLIMITED_FAIR_USE_CEILING,
  featured: true,
  unlimited: true,
};

export const UNLIMITED_PUBLIC_OFFERS = [
  { id: 'monthly', priceEur: UNLIMITED_MONTHLY_PRICE_EUR, cadence: 'month', ai: false },
  { id: 'annual', priceEur: UNLIMITED_ANNUAL_PRICE_EUR, cadence: 'year', ai: true },
  { id: 'lifetime', priceEur: UNLIMITED_LIFETIME_PRICE_EUR, cadence: 'lifetime', ai: true },
  { id: 'custom', priceEur: PERSONALIZED_PRICE_EUR, cadence: 'custom', ai: true },
] as const;

// Only this entitlement is sold/displayed to new customers; billing choice is separate.
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
