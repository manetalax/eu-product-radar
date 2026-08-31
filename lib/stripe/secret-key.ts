export function validStripeSecretKey(key: string | undefined, production: boolean): boolean {
  if (!key) return false;
  return production ? key.startsWith('sk_live_') : key.startsWith('sk_live_') || key.startsWith('sk_test_');
}
