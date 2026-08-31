import { createAdminClient } from '@/lib/supabase/admin';

export type AiTelemetryTask = 'regulatory_agent' | 'product_text' | 'product_vision' | 'product_document';

export async function recordAiUsage(input: {
  task: AiTelemetryTask;
  provider: 'siliconflow' | 'openai';
  model: string;
  success?: boolean;
  fallback?: boolean;
  latencyMs?: number;
}) {
  try {
    const admin = createAdminClient();
    await admin.from('ai_usage_events').insert({
      task: input.task,
      provider: input.provider,
      model: input.model.slice(0, 200),
      success: input.success ?? true,
      premium: input.provider === 'openai',
      fallback: input.fallback ?? false,
      latency_ms: Math.max(0, Math.min(600000, Math.trunc(input.latencyMs ?? 0))),
    });
  } catch {
    // Telemetry must never block a customer analysis.
  }
}
