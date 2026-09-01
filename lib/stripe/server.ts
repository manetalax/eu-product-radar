import 'server-only';
import Stripe from 'stripe';
import { BRAND_NAME } from '@/lib/brand';
import { validStripeSecretKey } from './secret-key';

let instance: Stripe | undefined;

export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!validStripeSecretKey(key, process.env.NODE_ENV === 'production')) {
    throw new Error(process.env.NODE_ENV === 'production'
      ? 'STRIPE_SECRET_KEY debe ser una clave live válida en producción.'
      : 'Falta configurar una STRIPE_SECRET_KEY válida.');
  }
  instance ??= new Stripe(key, { maxNetworkRetries: 2, appInfo: { name: BRAND_NAME, version: '1.0.0' } });
  return instance;
}
