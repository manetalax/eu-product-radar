export const FREE_MONTHLY_PRODUCT_LIMIT = 5;

export type ProductQuota = {
  limit: number;
  used: number;
  remaining: number;
  periodStart: string;
};

export function currentUtcMonthStart(now = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

export function productQuota(used: number, now = new Date()): ProductQuota {
  const safeUsed = Number.isFinite(used) && used > 0 ? Math.floor(used) : 0;
  return {
    limit: FREE_MONTHLY_PRODUCT_LIMIT,
    used: safeUsed,
    remaining: Math.max(0, FREE_MONTHLY_PRODUCT_LIMIT - safeUsed),
    periodStart: currentUtcMonthStart(now),
  };
}

export function quotaExceededMessage(incomingProducts: number, quota: ProductQuota): string {
  return `Tu plan gratuito incluye ${quota.limit} productos al mes. Este archivo contiene ${incomingProducts} y te quedan ${quota.remaining}. No se ha guardado ningún producto.`;
}
