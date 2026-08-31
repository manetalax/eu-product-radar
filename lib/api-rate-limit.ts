import { createAdminClient } from '@/lib/supabase/admin';

export async function consumeApiRateLimit(input: {
  userId: string;
  route: 'regulatory_agent' | 'product_extraction';
  limit: number;
  windowSeconds: number;
}): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc('consume_api_rate_limit', {
      p_user_id: input.userId,
      p_route: input.route,
      p_limit: input.limit,
      p_window_seconds: input.windowSeconds,
    });
    if (error) return false;
    return data === true;
  } catch {
    // Fail closed: an unavailable limiter must not expose an unbounded AI endpoint.
    return false;
  }
}
