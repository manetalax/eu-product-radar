export type StripeNavigationKind = 'checkout' | 'portal';

const STRIPE_NAVIGATION_HOSTS: Record<StripeNavigationKind, string> = {
  checkout: 'checkout.stripe.com',
  portal: 'billing.stripe.com',
};

export function trustedStripeNavigationUrl(value: unknown, kind: StripeNavigationKind): string | null {
  if (typeof value !== 'string' || value.length > 4096) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    if (url.hostname !== STRIPE_NAVIGATION_HOSTS[kind]) return null;
    if (url.port || url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}
