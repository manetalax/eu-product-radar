import { createAdminClient } from '@/lib/supabase/admin';

export type AiTelemetryTask = 'regulatory_agent' | 'product_text' | 'product_vision' | 'product_document';

export type AiUsageSummary = {
  total: number;
  successful: number;
  free: number;
  premium: number;
  fallback: number;
  zeroPremiumRate: number;
  averageLatencyMs: number;
};

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

export async function readAiUsageSummary(since = new Date(Date.now() - 24 * 60 * 60 * 1000)): Promise<AiUsageSummary> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('ai_usage_events')
    .select('success,premium,fallback,latency_ms')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })
    .limit(10_000);
  if (error) throw new Error('No se puede leer la telemetría interna de IA.');
  const rows = data ?? [];
  const total = rows.length;
  const successful = rows.filter(row => row.success).length;
  const premium = rows.filter(row => row.premium).length;
  const fallback = rows.filter(row => row.fallback).length;
  const free = total - premium;
  const averageLatencyMs = total ? Math.round(rows.reduce((sum, row) => sum + Number(row.latency_ms || 0), 0) / total) : 0;
  return {
    total,
    successful,
    free,
    premium,
    fallback,
    zeroPremiumRate: total ? Math.round((free / total) * 10_000) / 100 : 100,
    averageLatencyMs,
  };
}
