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
  if (env.NODE_ENV === 'production' && env.NEXT_PUBLIC_SITE_URL !== IMPORTVERIFIER_PRODUCTION_URL) {
    errors.push(`NEXT_PUBLIC_SITE_URL debe ser ${IMPORTVERIFIER_PRODUCTION_URL} en producción.`);
  }
  for (const key of requiredPublic) if (!env[key]) errors.push(`Falta ${key}.`);
  for (const key of requiredSecrets) if (!env[key]) errors.push(`Falta ${key}.`);

  const costPolicy = env.AI_COST_POLICY === 'free_only' || env.AI_COST_POLICY === 'premium_allowed' ? env.AI_COST_POLICY : 'free_first';
  if (!env.SILICONFLOW_API_KEY && !env.OPENAI_API_KEY) errors.push('Configura al menos un proveedor de IA.');
  if (costPolicy === 'free_only' && !env.SILICONFLOW_API_KEY) errors.push('AI_COST_POLICY=free_only requiere SILICONFLOW_API_KEY.');
  if (!env.SILICONFLOW_API_KEY) warnings.push('SiliconFlow no configurado: no habrá ruta de IA gratuita.');
  if (!env.OPENAI_API_KEY) warnings.push('OpenAI no configurado: PDF/Word complejos no tendrán fallback documental hasta disponer de parser local.');
  if (!env.REGULATORY_INGEST_SECRET) warnings.push('REGULATORY_INGEST_SECRET no configurado: el Radar podrá leerse pero no recibir ingesta automática.');
  if (!env.RESEND_API_KEY) warnings.push('RESEND_API_KEY no configurado: verifica el proveedor SMTP/transaccional usado por Supabase Auth.');
  if (!env.NEXT_PUBLIC_POSTHOG_KEY) warnings.push('PostHog no configurado: analítica de producto desactivada.');
  return { ok: errors.length === 0, errors, warnings };
}
