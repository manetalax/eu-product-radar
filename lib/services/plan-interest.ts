'use client';

import { authService } from './auth-client';
import type { UnlimitedBillingOption } from '@/lib/billing';
import { isUnlimitedBillingOption } from '@/lib/billing';
import { PurchaseId, purchaseName } from '@/lib/plans';

const PLAN_INTENT_STORAGE_KEY = 'import-rules-verifier-purchase-intent';
export const BILLING_INTENT_COOKIE = 'importverifier-billing-intent';
const PUBLIC_PURCHASE_INTENT = 'starter' as const;
const BILLING_INTENT_MAX_AGE_SECONDS = 15 * 60;

export type PlanIntent = { planId: typeof PUBLIC_PURCHASE_INTENT; billingOption: UnlimitedBillingOption };

function setBillingIntentCookie(billingOption: UnlimitedBillingOption) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${BILLING_INTENT_COOKIE}=${encodeURIComponent(billingOption)}; Path=/; Max-Age=${BILLING_INTENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

function clearBillingIntentCookie() {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${BILLING_INTENT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

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
    // OAuth leaves the application origin, so localStorage cannot be read by the server
    // that creates Checkout. A short-lived same-site preference cookie preserves only the
    // non-sensitive billing choice; Checkout validates it against the public allowlist.
    setBillingIntentCookie(billingOption);
  } else {
    window.localStorage.removeItem(PLAN_INTENT_STORAGE_KEY);
    clearBillingIntentCookie();
  }
}

// Purchase intent is deliberately one-shot for automatic dashboard handling. Reading
// localStorage removes that trigger, while the short-lived cookie survives just long
// enough for the immediately following authenticated Checkout request.
// The previous plain `starter` value remains readable as monthly for compatibility.
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
  clearBillingIntentCookie();
}

export function registerPlanInterest(planId: PurchaseId, billingOption: UnlimitedBillingOption = 'monthly') {
  return authService.updateMetadata(planInterestMetadata(planId, billingOption));
}
