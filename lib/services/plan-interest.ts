'use client';

import { authService } from './auth-client';
import { PurchaseId, purchaseName } from '@/lib/plans';

const PLAN_INTENT_STORAGE_KEY = 'import-rules-verifier-purchase-intent';
const PUBLIC_PURCHASE_INTENT = 'starter' as const;

export function planInterestMetadata(planId: PurchaseId) {
  return { plan_interest_id: planId, plan_interest: purchaseName(planId), plan_interest_at: new Date().toISOString() };
}

export function savePlanIntent(planId: PurchaseId) {
  if (planId === PUBLIC_PURCHASE_INTENT) window.localStorage.setItem(PLAN_INTENT_STORAGE_KEY, planId);
  else window.localStorage.removeItem(PLAN_INTENT_STORAGE_KEY);
}

// Purchase intent is deliberately one-shot. Reading it clears storage before any
// network call, preventing a failed checkout from reopening automatically forever.
// Legacy purchase IDs are never resumed into a new public checkout.
export function readPlanIntent(): PurchaseId | undefined {
  const stored = window.localStorage.getItem(PLAN_INTENT_STORAGE_KEY);
  window.localStorage.removeItem(PLAN_INTENT_STORAGE_KEY);
  return stored === PUBLIC_PURCHASE_INTENT ? stored : undefined;
}

export function clearPlanIntent() {
  window.localStorage.removeItem(PLAN_INTENT_STORAGE_KEY);
}

export function registerPlanInterest(planId: PurchaseId) {
  return authService.updateMetadata(planInterestMetadata(planId));
}
