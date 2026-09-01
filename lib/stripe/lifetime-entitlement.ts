import type Stripe from 'stripe';
import { billingOptionForStripePrice, IMPORTVERIFIER_UNLIMITED_LIFETIME_PRICE_ID } from '@/lib/billing';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripeObjectId } from '@/lib/stripe/subscription-sync';

function lifetimeLineItemPriceId(session: Stripe.Checkout.Session): string | null {
  const items = session.line_items?.data ?? [];
  if (items.length !== 1) return null;
  return items[0]?.price?.id ?? null;
}

function lifetimeCheckoutSettled(session: Stripe.Checkout.Session) {
  // Lifetime is a paid permanent entitlement. Unlike recurring access, a zero-charge
  // Checkout must never create irreversible product value.
  return session.payment_status === 'paid';
}

async function setLifetimeEntitlementStatusForPaymentIntent(
  paymentIntentId: string,
  status: 'active' | 'revoked',
) {
  const admin = createAdminClient();
  const now = new Date().toISOString();
  const { error } = await admin
    .from('unlimited_lifetime_entitlements')
    .update({
      status,
      revoked_at: status === 'revoked' ? now : null,
      updated_at: now,
    })
    .eq('stripe_payment_intent_id', paymentIntentId)
    .neq('status', status);
  if (error) throw error;
  return true;
}

export async function syncLifetimeCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.mode !== 'payment' || !lifetimeCheckoutSettled(session)) throw new Error('invalid_lifetime_checkout_state');
  const customerId = stripeObjectId(session.customer);
  const metadataUserId = session.metadata?.user_id || session.client_reference_id || null;
  const priceId = lifetimeLineItemPriceId(session);
  if (!customerId || !metadataUserId) throw new Error('unrecognized_lifetime_identity');
  if (billingOptionForStripePrice(priceId) !== 'lifetime' || priceId !== IMPORTVERIFIER_UNLIMITED_LIFETIME_PRICE_ID) {
    throw new Error('unrecognized_lifetime_price');
  }
  if (session.metadata?.plan_id !== 'starter' || session.metadata?.billing_option !== 'lifetime') {
    throw new Error('lifetime_checkout_metadata_mismatch');
  }

  const admin = createAdminClient();
  const { data: existingCustomer, error: customerError } = await admin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();
  if (customerError && customerError.code !== 'PGRST116') throw customerError;
  if (!existingCustomer?.user_id || existingCustomer.user_id !== metadataUserId) {
    throw new Error('lifetime_customer_user_mismatch');
  }

  const paymentIntentId = stripeObjectId(session.payment_intent);
  if (!paymentIntentId) throw new Error('unrecognized_lifetime_payment');

  // A refund/dispute revocation is authoritative for that exact payment. A later
  // confirmation request or delayed/replayed Checkout event must not resurrect it.
  const { data: existingEntitlement, error: entitlementError } = await admin
    .from('unlimited_lifetime_entitlements')
    .select('stripe_checkout_session_id,stripe_payment_intent_id,status')
    .eq('user_id', metadataUserId)
    .maybeSingle();
  if (entitlementError && entitlementError.code !== 'PGRST116') throw entitlementError;
  const samePayment = existingEntitlement?.stripe_checkout_session_id === session.id
    || existingEntitlement?.stripe_payment_intent_id === paymentIntentId;
  if (samePayment && existingEntitlement?.status === 'revoked') {
    throw new Error('lifetime_payment_previously_revoked');
  }

  const now = new Date().toISOString();
  const { error } = await admin.from('unlimited_lifetime_entitlements').upsert({
    user_id: metadataUserId,
    stripe_customer_id: customerId,
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: paymentIntentId,
    status: 'active',
    granted_at: now,
    revoked_at: null,
    updated_at: now,
  }, { onConflict: 'user_id' });
  if (error) throw error;
}

export async function revokeLifetimeEntitlementForFullyRefundedCharge(charge: Stripe.Charge) {
  if (!charge.refunded || charge.amount_refunded < charge.amount) return false;
  const paymentIntentId = stripeObjectId(charge.payment_intent);
  if (!paymentIntentId) return false;
  return setLifetimeEntitlementStatusForPaymentIntent(paymentIntentId, 'revoked');
}

export async function suspendLifetimeEntitlementForDisputedCharge(charge: Stripe.Charge) {
  const paymentIntentId = stripeObjectId(charge.payment_intent);
  if (!paymentIntentId) return false;
  return setLifetimeEntitlementStatusForPaymentIntent(paymentIntentId, 'revoked');
}

export async function restoreLifetimeEntitlementForWonDispute(charge: Stripe.Charge) {
  // A won dispute can restore access only while the underlying charge still represents
  // collected value. A fully refunded charge remains revoked even if a dispute closes won.
  if (charge.refunded || charge.amount_refunded >= charge.amount) return false;
  const paymentIntentId = stripeObjectId(charge.payment_intent);
  if (!paymentIntentId) return false;
  return setLifetimeEntitlementStatusForPaymentIntent(paymentIntentId, 'active');
}
