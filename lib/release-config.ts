import { isTrustedSiliconFlowBaseUrl } from './ai-provider';
import { LEGAL_ENV_KEYS, legalConfig } from './legal-config';
import { IMPORTVERIFIER_SUPABASE_URL, trustedSupabaseProjectUrl } from './supabase/config';

export { IMPORTVERIFIER_SUPABASE_URL } from './supabase/config';
export const IMPORTVERIFIER_PRODUCTION_URL = 'https://importverifier.netlify.app';
export const IMPORTVERIFIER_UNLIMITED_PRICE_ID = 'price_1UAJy5HJnO8odw1Mn4jMVjFt';
export const IMPORTVERIFIER_UNLIMITED_ANNUAL_PRICE_ID = 'price_1UAjP0HJnO8odw1M7RBK8jsR';
export const IMPORTVERIFIER_UNLIMITED_LIFETIME_PRICE_ID = 'price_1UAjP8HJnO8odw1MmSXdkNIh';

export type ReleaseConfigCheck = { ok: boolean; errors: string[]; warnings: string[] };

const requiredSecrets = [
  'SUPABASE_SECRET_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_STARTER',
  'STRIPE_PRICE_ANNUAL',
  'STRIPE_PRICE_LIFETIME',
] as const;

const requiredPublic = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'] as const;

export function checkReleaseConfig(env: NodeJS.ProcessEnv = process.env): ReleaseConfigCheck {
  const errors: string[] = [];
  const warnings: string[] = [];
  const production = env.NODE_ENV === 'production';
  if (production && env.NEXT_PUBLIC_SITE_URL !== IMPORTVERIFIER_PRODUCTION_URL) {
    errors.push(`NEXT_PUBLIC_SITE_URL debe ser ${IMPORTVERIFIER_PRODUCTION_URL} en producción.`);
  }
  for (const key of requiredPublic) if (!env[key]) errors.push(`Falta ${key}.`);
  for (const key of requiredSecrets) if (!env[key]) errors.push(`Falta ${key}.`);

  if (production && env.NEXT_PUBLIC_SUPABASE_URL && !trustedSupabaseProjectUrl(env.NEXT_PUBLIC_SUPABASE_URL, true)) {
    errors.push(`NEXT_PUBLIC_SUPABASE_URL debe apuntar al proyecto canónico de ImportVerifier: ${IMPORTVERIFIER_SUPABASE_URL}.`);
  }
  if (production && env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && !env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.startsWith('sb_publishable_')) {
    errors.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY debe ser una publishable key de Supabase, no una secret/service-role key.');
  }
  if (production && env.SUPABASE_SECRET_KEY && !env.SUPABASE_SECRET_KEY.startsWith('sb_secret_')) {
    errors.push('SUPABASE_SECRET_KEY debe ser una secret key de Supabase con prefijo sb_secret_.');
  }
  if (production && env.STRIPE_SECRET_KEY && !env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
    errors.push('STRIPE_SECRET_KEY debe ser una clave live de Stripe en producción.');
  }
  if (production && env.STRIPE_WEBHOOK_SECRET && !env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_')) {
    errors.push('STRIPE_WEBHOOK_SECRET debe ser el signing secret del webhook de Stripe.');
  }
  if (production && env.STRIPE_PRICE_STARTER && env.STRIPE_PRICE_STARTER !== IMPORTVERIFIER_UNLIMITED_PRICE_ID) {
    errors.push(`STRIPE_PRICE_STARTER debe ser el price live canónico mensual de ImportVerifier Unlimited: ${IMPORTVERIFIER_UNLIMITED_PRICE_ID}.`);
  }
  if (production && env.STRIPE_PRICE_ANNUAL && env.STRIPE_PRICE_ANNUAL !== IMPORTVERIFIER_UNLIMITED_ANNUAL_PRICE_ID) {
    errors.push(`STRIPE_PRICE_ANNUAL debe ser el price live canónico anual de ImportVerifier Unlimited: ${IMPORTVERIFIER_UNLIMITED_ANNUAL_PRICE_ID}.`);
  }
  if (production && env.STRIPE_PRICE_LIFETIME && env.STRIPE_PRICE_LIFETIME !== IMPORTVERIFIER_UNLIMITED_LIFETIME_PRICE_ID) {
    errors.push(`STRIPE_PRICE_LIFETIME debe ser el price live canónico Lifetime de ImportVerifier Unlimited: ${IMPORTVERIFIER_UNLIMITED_LIFETIME_PRICE_ID}.`);
  }
  if (production && !legalConfig(env)) {
    errors.push(`Falta completar la información legal obligatoria para aceptar pagos: ${LEGAL_ENV_KEYS.join(', ')}.`);
  }

  const costPolicy = env.AI_COST_POLICY === 'free_only' || env.AI_COST_POLICY === 'premium_allowed' ? env.AI_COST_POLICY : 'free_first';
  if (production && costPolicy !== 'free_only') errors.push('Producción debe usar AI_COST_POLICY=free_only para impedir consumo de IA de pago.');
  if (!env.SILICONFLOW_API_KEY && !env.OPENAI_API_KEY) errors.push('Configura al menos un proveedor de IA.');
  if (costPolicy === 'free_only' && !env.SILICONFLOW_API_KEY) errors.push('AI_COST_POLICY=free_only requiere SILICONFLOW_API_KEY.');
  if (production && !isTrustedSiliconFlowBaseUrl(env.SILICONFLOW_BASE_URL)) {
    errors.push('SILICONFLOW_BASE_URL debe ser el endpoint HTTPS oficial https://api.siliconflow.com/v1, sin credenciales, puertos, query ni fragmentos.');
  }
  if (!env.SILICONFLOW_API_KEY) warnings.push('SiliconFlow no configurado: no habrá ruta de IA gratuita.');
  if (!env.OPENAI_API_KEY && costPolicy !== 'free_only') warnings.push('OpenAI no configurado: PDF/Word complejos no tendrán fallback documental hasta disponer de parser local.');

  const ingestSecret = env.REGULATORY_INGEST_SECRET?.trim() ?? '';
  const radarLive = env.REGULATORY_RADAR_LIVE === 'true';
  if (!ingestSecret) warnings.push('REGULATORY_INGEST_SECRET no configurado: el Radar podrá leerse pero no recibir ingesta automática.');
  else if (ingestSecret.length < 32) errors.push('REGULATORY_INGEST_SECRET debe tener al menos 32 caracteres.');
  if (radarLive && ingestSecret.length < 32) errors.push('REGULATORY_RADAR_LIVE=true requiere un REGULATORY_INGEST_SECRET válido y compartido con el scheduler.');
  if (!radarLive) warnings.push('REGULATORY_RADAR_LIVE no está activo: la interfaz no debe presentar la monitorización oficial como operativa.');

  if (!env.RESEND_API_KEY) warnings.push('RESEND_API_KEY no configurado: verifica el proveedor SMTP/transaccional usado por Supabase Auth.');
  if (!env.NEXT_PUBLIC_POSTHOG_KEY) warnings.push('PostHog no configurado: analítica de producto desactivada.');
  return { ok: errors.length === 0, errors, warnings };
}
