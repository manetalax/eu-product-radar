import test from 'node:test';
import assert from 'node:assert/strict';
import { checkReleaseConfig, IMPORTVERIFIER_PRODUCTION_URL, IMPORTVERIFIER_SUPABASE_URL, IMPORTVERIFIER_UNLIMITED_PRICE_ID } from '../lib/release-config';
import { aiCostPolicy, isTrustedSiliconFlowBaseUrl } from '../lib/ai-provider';

const baseEnv = {
  NODE_ENV: 'production',
  NEXT_PUBLIC_SITE_URL: IMPORTVERIFIER_PRODUCTION_URL,
  NEXT_PUBLIC_SUPABASE_URL: IMPORTVERIFIER_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example',
  SUPABASE_SECRET_KEY: 'secret-key',
  STRIPE_SECRET_KEY: 'sk_live_example',
  STRIPE_WEBHOOK_SECRET: 'whsec_example',
  STRIPE_PRICE_STARTER: IMPORTVERIFIER_UNLIMITED_PRICE_ID,
  LEGAL_PROVIDER_NAME: 'Example Provider SL',
  LEGAL_PROVIDER_ADDRESS: 'Example street 1, Madrid, Spain',
  LEGAL_TAX_ID: 'B00000000',
  LEGAL_JURISDICTION: 'Spain',
  LEGAL_REFUND_POLICY: 'Refunds and withdrawal rights are handled according to applicable law and the published terms.',
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

test('producción fija la IA gratuita al endpoint oficial y evita redirección de credenciales', () => {
  const rejected = [
    'http://api.siliconflow.com/v1',
    'https://user:pass@api.siliconflow.com/v1',
    'https://api.siliconflow.com.evil.example/v1',
    'https://evil.example/v1',
    'https://api.siliconflow.com:444/v1',
    'https://api.siliconflow.com/v2',
    'https://api.siliconflow.com/v1?redirect=1',
    'https://api.siliconflow.com/v1#fragment',
    'not-a-url',
  ];
  for (const baseUrl of rejected) {
    assert.equal(isTrustedSiliconFlowBaseUrl(baseUrl), false, baseUrl);
    const result = checkReleaseConfig({ ...baseEnv, AI_COST_POLICY: 'free_only', SILICONFLOW_API_KEY: 'sf-key', SILICONFLOW_BASE_URL: baseUrl });
    assert.equal(result.ok, false, baseUrl);
    assert.ok(result.errors.some(error => /SILICONFLOW_BASE_URL/));
  }
  for (const baseUrl of [undefined, 'https://api.siliconflow.com/v1', 'https://api.siliconflow.com/v1/']) {
    assert.equal(isTrustedSiliconFlowBaseUrl(baseUrl), true);
    const result = checkReleaseConfig({ ...baseEnv, AI_COST_POLICY: 'free_only', SILICONFLOW_API_KEY: 'sf-key', ...(baseUrl ? { SILICONFLOW_BASE_URL: baseUrl } : {}) });
    assert.equal(result.ok, true);
  }
});

test('producción no queda lista para cobrar sin identidad legal completa', () => {
  const incomplete = { ...baseEnv, LEGAL_PROVIDER_NAME: '' } as NodeJS.ProcessEnv;
  const result = checkReleaseConfig({ ...incomplete, AI_COST_POLICY: 'free_only', SILICONFLOW_API_KEY: 'sf-key' });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(error => /información legal obligatoria/));
});

test('producción rechaza un Stripe price distinto del Unlimited live canónico', () => {
  const result = checkReleaseConfig({ ...baseEnv, STRIPE_PRICE_STARTER: 'price_stale', AI_COST_POLICY: 'free_only', SILICONFLOW_API_KEY: 'sf-key' });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(error => error.includes(IMPORTVERIFIER_UNLIMITED_PRICE_ID)));
});

test('producción rechaza claves Stripe de test, webhook malformado y proyecto Supabase equivocado', () => {
  const stripeTest = checkReleaseConfig({ ...baseEnv, STRIPE_SECRET_KEY: 'sk_test_example', AI_COST_POLICY: 'free_only', SILICONFLOW_API_KEY: 'sf-key' });
  assert.equal(stripeTest.ok, false);
  assert.ok(stripeTest.errors.some(error => /clave live de Stripe/));

  const badWebhook = checkReleaseConfig({ ...baseEnv, STRIPE_WEBHOOK_SECRET: 'not-a-webhook-secret', AI_COST_POLICY: 'free_only', SILICONFLOW_API_KEY: 'sf-key' });
  assert.equal(badWebhook.ok, false);
  assert.ok(badWebhook.errors.some(error => /signing secret/));

  const wrongSupabase = checkReleaseConfig({ ...baseEnv, NEXT_PUBLIC_SUPABASE_URL: 'https://other.supabase.co', AI_COST_POLICY: 'free_only', SILICONFLOW_API_KEY: 'sf-key' });
  assert.equal(wrongSupabase.ok, false);
  assert.ok(wrongSupabase.errors.some(error => error.includes(IMPORTVERIFIER_SUPABASE_URL)));

  const leakedSecret = checkReleaseConfig({ ...baseEnv, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'service-role-looking-value', AI_COST_POLICY: 'free_only', SILICONFLOW_API_KEY: 'sf-key' });
  assert.equal(leakedSecret.ok, false);
  assert.ok(leakedSecret.errors.some(error => /publishable key/));
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
