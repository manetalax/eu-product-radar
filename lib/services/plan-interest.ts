'use client';

import { authService } from './auth-client';
import type { UnlimitedBillingOption } from '@/lib/billing';
import { isUnlimitedBillingOption } from '@/lib/billing';
import { PurchaseId, purchaseName } from '@/lib/plans';

const PLAN_INTENT_STORAGE_KEY = 'import-rules-verifier-purchase-intent';
const PUBLIC_PURCHASE_INTENT = 'starter' as const;

export type PlanIntent = { planId: typeof PUBLIC_PURCHASE_INTENT; billingOption: UnlimitedBillingOption };

export function planInterestMetadata(planId: PurchaseId, billingOption: UnlimitedBillingOption = 'monthly') {
  return {
    plan_interest_id: planId,
    plan_interest: purchaseName(planId),
    plan_interest_billing_option: billingOption,
    plan_interest_at: new Date().toISOString(),
  };
}

export function savePlanIntent(planId: PurchaseId, billingOption: UnlimitedBillingOption = 'monthly') {
  if (planId === PUBLIC_PURCHASE_INTENT) {
    window.localStorage.setItem(PLAN_INTENT_STORAGE_KEY, JSON.stringify({ planId, billingOption } satisfies PlanIntent));
  } else {
    window.localStorage.removeItem(PLAN_INTENT_STORAGE_KEY);
  }
}

// Purchase intent is deliberately one-shot. Reading it clears storage before any
// network call, preventing a failed checkout from reopening automatically forever.
// The previous plain `starter` value remains readable as monthly for backwards compatibility.
export function readPlanIntent(): PlanIntent | undefined {
  const stored = window.localStorage.getItem(PLAN_INTENT_STORAGE_KEY);
  window.localStorage.removeItem(PLAN_INTENT_STORAGE_KEY);
  if (stored === PUBLIC_PURCHASE_INTENT) return { planId: PUBLIC_PURCHASE_INTENT, billingOption: 'monthly' };
  if (!stored) return undefined;
  try {
    const parsed = JSON.parse(stored) as Record<string, unknown>;
    if (parsed.planId === PUBLIC_PURCHASE_INTENT && isUnlimitedBillingOption(parsed.billingOption)) {
      return { planId: PUBLIC_PURCHASE_INTENT, billingOption: parsed.billingOption };
    }
  } catch {
    // Malformed or stale intent is discarded rather than affecting checkout.
  }
  return undefined;
}

export function clearPlanIntent() {
  window.localStorage.removeItem(PLAN_INTENT_STORAGE_KEY);
}

export function registerPlanInterest(planId: PurchaseId, billingOption: UnlimitedBillingOption = 'monthly') {
  return authService.updateMetadata(planInterestMetadata(planId, billingOption));
}
