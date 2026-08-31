export type StripeNavigationTarget = 'checkout' | 'portal';

const STRIPE_HOSTS: Record<StripeNavigationTarget, string> = {
  checkout: 'checkout.stripe.com',
  portal: 'billing.stripe.com',
};

/**
 * Client-side defense in depth for Stripe redirects returned by our billing APIs.
 * Server routes already validate Stripe URLs; this prevents a malformed or
 * compromised client response from becoming an arbitrary navigation target.
 */
export function trustedStripeNavigationUrl(value: unknown, target: StripeNavigationTarget): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    if (url.username || url.password || url.port) return null;
    if (url.hostname !== STRIPE_HOSTS[target]) return null;
    return url.toString();
  } catch {
    return null;
  }
}
