import 'server-only';
import Stripe from 'stripe';

let instance: Stripe | undefined;

export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key?.startsWith('sk_')) throw new Error('Falta configurar STRIPE_SECRET_KEY en Netlify.');
  instance ??= new Stripe(key, { maxNetworkRetries: 2, appInfo: { name: 'Import Rules Verifier', version: '1.0.0' } });
  return instance;
}
