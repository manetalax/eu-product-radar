import type { BillingStatus } from './billing';

export const FREE_ACCOUNT_PRODUCT_LIMIT = 5;

export type ProductQuota = {
  limit: number;
  used: number;
  remaining: number;
  periodStart: string;
  billing: BillingStatus;
};

export function productQuota(used: number, _now = new Date(), billing: BillingStatus = { planId: 'free', planName: 'Gratis', status: null, productLimit: FREE_ACCOUNT_PRODUCT_LIMIT, currentPeriodEnd: null, cancelAtPeriodEnd: false }): ProductQuota {
  const safeUsed = Number.isFinite(used) && used > 0 ? Math.floor(used) : 0;
  const paid = billing.planId !== 'free' && billing.planId !== 'audit';
  return {
    limit: billing.productLimit,
    used: safeUsed,
    remaining: paid ? billing.productLimit : Math.max(0, billing.productLimit - safeUsed),
    periodStart: billing.planId === 'free' ? 'lifetime' : 'subscription',
    billing,
  };
}

export function quotaExceededMessage(incomingProducts: number, quota: ProductQuota): string {
  if (quota.billing.planId === 'audit') return `Tu auditoría profesional permite una única carga de hasta ${quota.limit} productos. Este archivo contiene ${incomingProducts}. No se ha guardado ningún producto.`;
  if (quota.billing.planId === 'free') return `Tu prueba gratuita incluye 5 productos en total por cuenta. Este archivo contiene ${incomingProducts} y te quedan ${quota.remaining}. No se ha guardado ningún producto.`;
  return 'La solicitud supera una protección técnica del servicio. Divide el catálogo en archivos más pequeños y vuelve a intentarlo.';
}
