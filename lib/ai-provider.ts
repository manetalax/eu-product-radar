export type TextMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export type TextGenerationResult = {
  text: string;
  provider: 'siliconflow' | 'openai';
  model: string;
};

function siliconFlowBaseUrl() {
  return (process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.com/v1').replace(/\/$/, '');
}

export function hasFreeTextProvider() {
  return Boolean(process.env.SILICONFLOW_API_KEY);
}

export async function generateText(messages: TextMessage[], options?: { maxTokens?: number; temperature?: number }): Promise<TextGenerationResult> {
  const siliconKey = process.env.SILICONFLOW_API_KEY;
  if (siliconKey) {
    const model = process.env.SILICONFLOW_TEXT_MODEL || 'THUDM/GLM-Z1-9B-0414';
    const response = await fetch(`${siliconFlowBaseUrl()}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${siliconKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        max_tokens: options?.maxTokens ?? 1800,
        temperature: options?.temperature ?? 0.1,
      }),
    });
    const body = await response.json() as { choices?: { message?: { content?: unknown } }[]; message?: unknown; error?: { message?: unknown } };
    if (response.ok) {
      const text = typeof body.choices?.[0]?.message?.content === 'string' ? body.choices[0].message.content.trim() : '';
      if (text) return { text, provider: 'siliconflow', model };
    }
    // Free provider is best-effort: if it is rate limited or temporarily unavailable,
    // continue to the configured premium fallback rather than failing the user request.
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) throw new Error('No hay ningún proveedor de IA configurado.');
  const model = process.env.OPENAI_REGULATORY_AGENT_MODEL || process.env.OPENAI_PRODUCT_EXTRACT_MODEL || 'gpt-5.6-terra';
  const instructions = messages.filter(message => message.role === 'system').map(message => message.content).join(' ');
  const input = messages.filter(message => message.role !== 'system').map(message => ({
    role: message.role,
    content: [{ type: 'input_text', text: message.content }],
  }));
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, store: false, instructions, input }),
  });
  const body = await response.json() as Record<string, unknown>;
  if (!response.ok) {
    const message = typeof (body.error as { message?: unknown } | undefined)?.message === 'string' ? (body.error as { message: string }).message : 'No se ha podido consultar la IA.';
    throw new Error(message);
  }
  const output = Array.isArray(body.output) ? body.output : [];
  for (const item of output) {
    if (!item || typeof item !== 'object') continue;
    const content = Array.isArray((item as { content?: unknown }).content) ? (item as { content: unknown[] }).content : [];
    for (const part of content) {
      if (part && typeof part === 'object' && (part as { type?: unknown }).type === 'output_text' && typeof (part as { text?: unknown }).text === 'string') {
        return { text: (part as { text: string }).text.trim(), provider: 'openai', model };
      }
    }
  }
  throw new Error('La IA no ha devuelto una respuesta utilizable.');
}
