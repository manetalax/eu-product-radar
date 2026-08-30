'use client';

import { authService } from './auth-client';
import { isPurchaseId, PurchaseId, purchaseName } from '@/lib/plans';

const PLAN_INTENT_STORAGE_KEY = 'import-rules-verifier-purchase-intent';

export function planInterestMetadata(planId: PurchaseId) {
  return { plan_interest_id: planId, plan_interest: purchaseName(planId), plan_interest_at: new Date().toISOString() };
}

export function savePlanIntent(planId: PurchaseId) {
  window.localStorage.setItem(PLAN_INTENT_STORAGE_KEY, planId);
}

export function readPlanIntent(): PurchaseId | undefined {
  const stored = window.localStorage.getItem(PLAN_INTENT_STORAGE_KEY);
  if (isPurchaseId(stored)) return stored;
  return undefined;
}

export function clearPlanIntent() {
  window.localStorage.removeItem(PLAN_INTENT_STORAGE_KEY);
}

export function registerPlanInterest(planId: PurchaseId) {
  return authService.updateMetadata(planInterestMetadata(planId));
}
