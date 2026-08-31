import 'server-only';
import Stripe from 'stripe';

let instance: Stripe | undefined;

export function validStripeSecretKey(key: string | undefined, production = process.env.NODE_ENV === 'production'): boolean {
  if (!key) return false;
  return production ? key.startsWith('sk_live_') : key.startsWith('sk_live_') || key.startsWith('sk_test_');
}

export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!validStripeSecretKey(key)) {
    throw new Error(process.env.NODE_ENV === 'production'
      ? 'STRIPE_SECRET_KEY debe ser una clave live válida en producción.'
      : 'Falta configurar una STRIPE_SECRET_KEY válida.');
  }
  instance ??= new Stripe(key, { maxNetworkRetries: 2, appInfo: { name: 'Import Rules Verifier', version: '1.0.0' } });
  return instance;
}
