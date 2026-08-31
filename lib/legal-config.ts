export const LEGAL_ENV_KEYS = [
  'LEGAL_PROVIDER_NAME',
  'LEGAL_PROVIDER_ADDRESS',
  'LEGAL_TAX_ID',
  'LEGAL_JURISDICTION',
  'LEGAL_REFUND_POLICY',
] as const;

export type LegalConfig = {
  providerName: string;
  providerAddress: string;
  taxId: string;
  jurisdiction: string;
  refundPolicy: string;
};

export function legalConfig(env: NodeJS.ProcessEnv = process.env): LegalConfig | null {
  const values = LEGAL_ENV_KEYS.map(key => env[key]?.trim() ?? '');
  if (values.some(value => value.length < 2)) return null;
  const [providerName, providerAddress, taxId, jurisdiction, refundPolicy] = values;
  return { providerName, providerAddress, taxId, jurisdiction, refundPolicy };
}

export function assertPaidCheckoutLegalReady(env: NodeJS.ProcessEnv = process.env): void {
  if (env.NODE_ENV !== 'production') return;
  if (!legalConfig(env)) throw new Error('La contratación está temporalmente desactivada hasta completar la información legal obligatoria del prestador. No se ha iniciado ningún cobro.');
}
