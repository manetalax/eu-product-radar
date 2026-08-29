'use client';

import { authService } from './auth-client';
import { isPlanId, PlanId, PLANS, PLANS_BY_ID } from '@/lib/plans';

const PLAN_INTENT_STORAGE_KEY = 'product-radar-plan-intent';

export function planInterestMetadata(planId: PlanId) {
  return { plan_interest_id: planId, plan_interest: PLANS_BY_ID[planId].name, plan_interest_at: new Date().toISOString() };
}

export function savePlanIntent(planId: PlanId) {
  window.localStorage.setItem(PLAN_INTENT_STORAGE_KEY, planId);
}

export function readPlanIntent(): PlanId | undefined {
  const stored = window.localStorage.getItem(PLAN_INTENT_STORAGE_KEY);
  if (isPlanId(stored)) return stored;
  return PLANS.find(plan => plan.name === stored)?.id;
}

export function clearPlanIntent() {
  window.localStorage.removeItem(PLAN_INTENT_STORAGE_KEY);
}

export function registerPlanInterest(planId: PlanId) {
  return authService.updateMetadata(planInterestMetadata(planId));
}
