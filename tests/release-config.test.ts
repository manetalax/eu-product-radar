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

test('la política de coste cae de forma segura a free_first fuera del release guard', () => {
  const previous = process.env.AI_COST_POLICY;
  try {
    delete process.env.AI_COST_POLICY;
    assert.equal(aiCostPolicy(), 'free_first');
    process.env.AI_COST_POLICY = 'free_only';
    assert.equal(aiCostPolicy(), 'free_only');
    process.env.AI_COST_POLICY = 'premium_allowed';
    assert.equal(aiCostPolicy(), 'premium_allowed');
    process.env.AI_COST_POLICY = 'invalid';
    assert.equal(aiCostPolicy(), 'free_first');
  } finally {
    if (previous === undefined) delete process.env.AI_COST_POLICY;
    else process.env.AI_COST_POLICY = previous;
  }
});
