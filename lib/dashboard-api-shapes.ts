import { Analysis, AnalysisSummary, Product, validateProducts } from './analysis';
import { BillingStatus, isUnlimitedBillingOption } from './billing';
import { isMarketCode } from './markets';
import { isPlanId } from './plans';
import { ProductQuota } from './quota';

const UUID = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const MAX_TEXT = 1000;
const MAX_FILENAME = 120;
const MAX_PRODUCTS = 1000;
const MAX_PRODUCT_LIMIT = 1_000_000;

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function nonNegativeInteger(value: unknown, max = Number.MAX_SAFE_INTEGER): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= max;
}

function boundedString(value: unknown, max = MAX_TEXT): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= max;
}

function timestamp(value: unknown): value is string {
  return boundedString(value, 100) && Number.isFinite(Date.parse(value));
}

function billingStatusFromUnknown(value: unknown): BillingStatus | null {
  const source = record(value);
  if (!source) return null;
  const planId = source.planId;
  if (planId !== 'free' && !isPlanId(planId)) return null;
  if (!boundedString(source.planName, 100)) return null;
  if (source.status !== null && typeof source.status !== 'string') return null;
  if (!nonNegativeInteger(source.productLimit, MAX_PRODUCT_LIMIT)) return null;
  if (source.currentPeriodEnd !== null && !timestamp(source.currentPeriodEnd)) return null;
  if (typeof source.cancelAtPeriodEnd !== 'boolean') return null;
  const billingOption = source.billingOption === undefined || source.billingOption === null
    ? null
    : isUnlimitedBillingOption(source.billingOption) ? source.billingOption : undefined;
  if (billingOption === undefined) return null;
  if (planId === 'free' && billingOption !== null) return null;
  return {
    planId,
    planName: source.planName,
    status: source.status as string | null,
    productLimit: source.productLimit,
    currentPeriodEnd: source.currentPeriodEnd as string | null,
    cancelAtPeriodEnd: source.cancelAtPeriodEnd,
    billingOption,
  };
}

export function productQuotaFromUnknown(value: unknown): ProductQuota | null {
  const source = record(value);
  if (!source) return null;
  const billing = billingStatusFromUnknown(source.billing);
  if (!billing) return null;
  if (!nonNegativeInteger(source.limit, MAX_PRODUCT_LIMIT) || source.limit !== billing.productLimit) return null;
  if (!nonNegativeInteger(source.used, MAX_PRODUCT_LIMIT)) return null;
  if (!nonNegativeInteger(source.remaining, MAX_PRODUCT_LIMIT) || source.remaining > source.limit) return null;
  if (source.periodStart !== 'lifetime' && source.periodStart !== 'subscription') return null;
  if (billing.planId === 'free') {
    if (source.periodStart !== 'lifetime' || source.limit !== 5 || source.used > source.limit) return null;
    if (source.remaining !== Math.max(0, source.limit - source.used)) return null;
  } else if (source.periodStart !== 'subscription') {
    return null;
  }
  return { limit: source.limit, used: source.used, remaining: source.remaining, periodStart: source.periodStart, billing };
}

export function productsFromUnknown(value: unknown): Product[] | null {
  try {
    return validateProducts(value);
  } catch {
    return null;
  }
}

export function analysisFromUnknown(value: unknown): Analysis | null {
  const source = record(value);
  if (!source || typeof source.id !== 'string' || !UUID.test(source.id)) return null;
  if (!boundedString(source.filename, MAX_FILENAME) || !timestamp(source.created_at) || !boundedString(source.rule_version, 100)) return null;
  if (source.market_code !== undefined && source.market_code !== null && !isMarketCode(source.market_code)) return null;
  const products = productsFromUnknown(source.products);
  if (!products) return null;
  return {
    id: source.id,
    filename: source.filename,
    created_at: source.created_at,
    rule_version: source.rule_version,
    market_code: isMarketCode(source.market_code) ? source.market_code : undefined,
    products,
  };
}

function analysisSummaryFromUnknown(value: unknown): AnalysisSummary | null {
  const source = record(value);
  if (!source || typeof source.id !== 'string' || !UUID.test(source.id)) return null;
  if (!boundedString(source.filename, MAX_FILENAME) || !timestamp(source.created_at) || !boundedString(source.rule_version, 100)) return null;
  if (source.market_code !== undefined && source.market_code !== null && !isMarketCode(source.market_code)) return null;
  if (!nonNegativeInteger(source.product_count, MAX_PRODUCTS) || source.product_count < 1) return null;
  return {
    id: source.id,
    filename: source.filename,
    created_at: source.created_at,
    rule_version: source.rule_version,
    market_code: isMarketCode(source.market_code) ? source.market_code : undefined,
    product_count: source.product_count,
  };
}

export function analysisSummariesFromUnknown(value: unknown): AnalysisSummary[] | null {
  if (!Array.isArray(value) || value.length > 20) return null;
  const summaries: AnalysisSummary[] = [];
  for (const item of value) {
    const summary = analysisSummaryFromUnknown(item);
    if (!summary) return null;
    summaries.push(summary);
  }
  return summaries;
}
