import test from 'node:test';
import assert from 'node:assert/strict';
import { checkReleaseConfig, IMPORTVERIFIER_PRODUCTION_URL } from '../lib/release-config';
import { aiCostPolicy } from '../lib/ai-provider';

const baseEnv = {
  NODE_ENV: 'production',
  NEXT_PUBLIC_SITE_URL: IMPORTVERIFIER_PRODUCTION_URL,
  NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'public-key',
  SUPABASE_SECRET_KEY: 'secret-key',
  STRIPE_SECRET_KEY: 'sk_live_example',
  STRIPE_WEBHOOK_SECRET: 'whsec_example',
  STRIPE_PRICE_STARTER: 'price_example',
} as NodeJS.ProcessEnv;

test('permite producción gratuita sin exigir OpenAI', () => {
  const result = checkReleaseConfig({ ...baseEnv, AI_COST_POLICY: 'free_only', SILICONFLOW_API_KEY: 'sf-key' });
  assert.equal(result.ok, true);
  assert.equal(result.errors.some(error => /OPENAI/i.test(error)), false);
});

test('free_only exige SiliconFlow y siempre exige al menos un proveedor', () => {
  const freeOnly = checkReleaseConfig({ ...baseEnv, AI_COST_POLICY: 'free_only' });
  assert.equal(freeOnly.ok, false);
  assert.ok(freeOnly.errors.some(error => /SILICONFLOW_API_KEY/));
  assert.ok(freeOnly.errors.some(error => /al menos un proveedor/));
});

test('producción rechaza políticas que permitan gasto de IA', () => {
  for (const policy of ['free_first', 'premium_allowed'] as const) {
    const result = checkReleaseConfig({ ...baseEnv, AI_COST_POLICY: policy, SILICONFLOW_API_KEY: 'sf-key', OPENAI_API_KEY: 'openai-key' });
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(error => /free_only/));
  }
});

test('Radar live exige un secreto de ingesta fuerte y compartible', () => {
  const missing = checkReleaseConfig({ ...baseEnv, AI_COST_POLICY: 'free_only', SILICONFLOW_API_KEY: 'sf-key', REGULATORY_RADAR_LIVE: 'true' });
  assert.equal(missing.ok, false);
  assert.ok(missing.errors.some(error => /REGULATORY_RADAR_LIVE=true/));

  const short = checkReleaseConfig({ ...baseEnv, AI_COST_POLICY: 'free_only', SILICONFLOW_API_KEY: 'sf-key', REGULATORY_RADAR_LIVE: 'true', REGULATORY_INGEST_SECRET: 'too-short' });
  assert.equal(short.ok, false);
  assert.ok(short.errors.some(error => /32 caracteres/));

  const valid = checkReleaseConfig({ ...baseEnv, AI_COST_POLICY: 'free_only', SILICONFLOW_API_KEY: 'sf-key', REGULATORY_RADAR_LIVE: 'true', REGULATORY_INGEST_SECRET: '0123456789abcdef0123456789abcdef' });
  assert.equal(valid.ok, true);
});

test('Radar apagado deja advertencia explícita y no bloquea el release', () => {
  const result = checkReleaseConfig({ ...baseEnv, AI_COST_POLICY: 'free_only', SILICONFLOW_API_KEY: 'sf-key' });
  assert.equal(result.ok, true);
  assert.ok(result.warnings.some(warning => /REGULATORY_RADAR_LIVE/));
});

test('el router cae en free_only por defecto en producción y en free_first fuera de producción', () => {
  assert.equal(aiCostPolicy({ NODE_ENV: 'production' } as NodeJS.ProcessEnv), 'free_only');
  assert.equal(aiCostPolicy({ NODE_ENV: 'development' } as NodeJS.ProcessEnv), 'free_first');
  assert.equal(aiCostPolicy({} as NodeJS.ProcessEnv), 'free_first');
  assert.equal(aiCostPolicy({ NODE_ENV: 'production', AI_COST_POLICY: 'invalid' } as NodeJS.ProcessEnv), 'free_only');
  assert.equal(aiCostPolicy({ NODE_ENV: 'production', AI_COST_POLICY: 'premium_allowed' } as NodeJS.ProcessEnv), 'premium_allowed');
});
