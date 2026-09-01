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
  return session.payment_status === 'paid' || session.payment_status === 'no_payment_required';
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

  const admin = createAdminClient();
  const now = new Date().toISOString();
  const { error } = await admin
    .from('unlimited_lifetime_entitlements')
    .update({ status: 'revoked', revoked_at: now, updated_at: now })
    .eq('stripe_payment_intent_id', paymentIntentId)
    .eq('status', 'active');
  if (error) throw error;
  return true;
}
