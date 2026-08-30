export const PLAN_IDS = ['starter', 'growth', 'pro', 'business'] as const;
export type PlanId = typeof PLAN_IDS[number];
export type PurchaseId = PlanId | 'audit';

export type PlanDefinition = {
  id: PlanId;
  name: string;
  monthlyPriceEur: number;
  monthlyProductLimit: number;
  featured: boolean;
};

export const FREE_TRIAL_PRODUCT_LIMIT = 5;
export const ONE_TIME_AUDIT = { id: 'audit' as const, name: 'Auditoría profesional', priceEur: 29, productLimit: 30 };

export const PLANS: readonly PlanDefinition[] = [
  { id: 'starter', name: 'Starter', monthlyPriceEur: 19, monthlyProductLimit: 50, featured: false },
  { id: 'growth', name: 'Growth', monthlyPriceEur: 29, monthlyProductLimit: 150, featured: false },
  { id: 'pro', name: 'Pro', monthlyPriceEur: 49, monthlyProductLimit: 500, featured: true },
  { id: 'business', name: 'Business', monthlyPriceEur: 149, monthlyProductLimit: 2_000, featured: false },
] as const;

export const PLANS_BY_ID = Object.fromEntries(PLANS.map(plan => [plan.id, plan])) as Record<PlanId, PlanDefinition>;

export function isPurchaseId(value: unknown): value is PurchaseId {
  return value === 'audit' || isPlanId(value);
}

export function purchaseName(value: PurchaseId): string {
  return value === 'audit' ? ONE_TIME_AUDIT.name : PLANS_BY_ID[value].name;
}

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === 'string' && (PLAN_IDS as readonly string[]).includes(value);
}
