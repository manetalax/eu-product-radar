export const IMPORTVERIFIER_PRODUCTION_URL = 'https://importverifier.netlify.app';

export type ReleaseConfigCheck = { ok: boolean; errors: string[]; warnings: string[] };

const requiredSecrets = [
  'SUPABASE_SECRET_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_STARTER',
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

  const costPolicy = env.AI_COST_POLICY === 'free_only' || env.AI_COST_POLICY === 'premium_allowed' ? env.AI_COST_POLICY : 'free_first';
  if (production && costPolicy !== 'free_only') errors.push('Producción debe usar AI_COST_POLICY=free_only para impedir consumo de IA de pago.');
  if (!env.SILICONFLOW_API_KEY && !env.OPENAI_API_KEY) errors.push('Configura al menos un proveedor de IA.');
  if (costPolicy === 'free_only' && !env.SILICONFLOW_API_KEY) errors.push('AI_COST_POLICY=free_only requiere SILICONFLOW_API_KEY.');
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
