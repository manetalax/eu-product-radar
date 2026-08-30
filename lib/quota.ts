import type { BillingStatus } from './billing';

export const FREE_MONTHLY_PRODUCT_LIMIT = 5;

export type ProductQuota = {
  limit: number;
  used: number;
  remaining: number;
  periodStart: string;
  billing: BillingStatus;
};

export function currentUtcMonthStart(now = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

export function productQuota(used: number, now = new Date(), billing: BillingStatus = { planId: 'free', planName: 'Gratis', status: null, productLimit: FREE_MONTHLY_PRODUCT_LIMIT, currentPeriodEnd: null, cancelAtPeriodEnd: false }): ProductQuota {
  const safeUsed = Number.isFinite(used) && used > 0 ? Math.floor(used) : 0;
  return {
    limit: billing.productLimit,
    used: safeUsed,
    remaining: Math.max(0, billing.productLimit - safeUsed),
    periodStart: currentUtcMonthStart(now),
    billing,
  };
}

export function quotaExceededMessage(incomingProducts: number, quota: ProductQuota): string {
  if (quota.billing.planId === 'audit') return `Tu auditoría profesional permite una única carga de hasta ${quota.limit} productos. Este archivo contiene ${incomingProducts}. No se ha guardado ningún producto.`;
  return `Tu plan ${quota.billing.planName} incluye ${quota.limit} productos al mes. Este archivo contiene ${incomingProducts} y te quedan ${quota.remaining}. No se ha guardado ningún producto.`;
}
