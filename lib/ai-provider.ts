export type TextMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export type TextGenerationResult = {
  text: string;
  provider: 'siliconflow' | 'openai';
  model: string;
};

export type AiCostPolicy = 'free_only' | 'free_first' | 'premium_allowed';

const AI_PROVIDER_TIMEOUT_MS = 30_000;
export const SILICONFLOW_CANONICAL_BASE_URL = 'https://api.siliconflow.com/v1';

export function isTrustedSiliconFlowBaseUrl(value: string | undefined): boolean {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:'
      && parsed.origin === 'https://api.siliconflow.com'
      && !parsed.username
      && !parsed.password
      && (parsed.pathname === '/v1' || parsed.pathname === '/v1/')
      && !parsed.search
      && !parsed.hash;
  } catch {
    return false;
  }
}

function siliconFlowBaseUrl() {
  const value = process.env.SILICONFLOW_BASE_URL || SILICONFLOW_CANONICAL_BASE_URL;
  if (!isTrustedSiliconFlowBaseUrl(value)) {
    throw new Error('La URL del proveedor gratuito no coincide con el endpoint oficial permitido.');
  }
  return SILICONFLOW_CANONICAL_BASE_URL;
}

async function providerFetch(input: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_PROVIDER_TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export function aiCostPolicy(env: NodeJS.ProcessEnv = process.env): AiCostPolicy {
  const value = env.AI_COST_POLICY;
  if (value === 'free_only' || value === 'free_first' || value === 'premium_allowed') return value;
  return env.NODE_ENV === 'production' ? 'free_only' : 'free_first';
}

export function hasFreeTextProvider() {
  return Boolean(process.env.SILICONFLOW_API_KEY);
}

async function siliconFlowText(messages: TextMessage[], options?: { maxTokens?: number; temperature?: number }) {
  const siliconKey = process.env.SILICONFLOW_API_KEY;
  if (!siliconKey) return null;
  const model = process.env.SILICONFLOW_TEXT_MODEL || 'THUDM/GLM-Z1-9B-0414';
  const response = await providerFetch(`${siliconFlowBaseUrl()}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${siliconKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: false, max_tokens: options?.maxTokens ?? 1800, temperature: options?.temperature ?? 0.1 }),
  });
  const body = await response.json() as { choices?: { message?: { content?: unknown } }[] };
  if (!response.ok) return null;
  const text = typeof body.choices?.[0]?.message?.content === 'string' ? body.choices[0].message.content.trim() : '';
  return text ? { text, provider: 'siliconflow' as const, model } : null;
}

async function openAiText(messages: TextMessage[]): Promise<TextGenerationResult> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) throw new Error('No hay ningún proveedor de IA configurado.');
  const model = process.env.OPENAI_REGULATORY_AGENT_MODEL || process.env.OPENAI_PRODUCT_EXTRACT_MODEL || 'gpt-5.6-terra';
  const instructions = messages.filter(message => message.role === 'system').map(message => message.content).join(' ');
  const input = messages.filter(message => message.role !== 'system').map(message => ({ role: message.role, content: [{ type: 'input_text', text: message.content }] }));
  const response = await providerFetch('https://api.openai.com/v1/responses', {
    method: 'POST', headers: { Authorization: `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
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
    for (const part of content) if (part && typeof part === 'object' && (part as { type?: unknown }).type === 'output_text' && typeof (part as { text?: unknown }).text === 'string') return { text: (part as { text: string }).text.trim(), provider: 'openai', model };
  }
  throw new Error('La IA no ha devuelto una respuesta utilizable.');
}

export async function generateText(messages: TextMessage[], options?: { maxTokens?: number; temperature?: number }): Promise<TextGenerationResult> {
  const free = await siliconFlowText(messages, options);
  if (free) return free;
  if (aiCostPolicy() === 'free_only') throw new Error('El proveedor gratuito está temporalmente no disponible.');
  return openAiText(messages);
}

export async function generateVisionText(dataUrl: string, prompt: string, options?: { maxTokens?: number }): Promise<TextGenerationResult> {
  const siliconKey = process.env.SILICONFLOW_API_KEY;
  if (siliconKey) {
    const model = process.env.SILICONFLOW_VISION_MODEL || process.env.SILICONFLOW_OCR_MODEL || 'PaddlePaddle/PaddleOCR-VL-1.5';
    const response = await providerFetch(`${siliconFlowBaseUrl()}/chat/completions`, {
      method: 'POST', headers: { Authorization: `Bearer ${siliconKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, stream: false, max_tokens: options?.maxTokens ?? 3000, temperature: 0.1, messages: [{ role: 'user', content: [{ type: 'image_url', image_url: { url: dataUrl, detail: 'high' } }, { type: 'text', text: prompt }] }] }),
    });
    const body = await response.json() as { choices?: { message?: { content?: unknown } }[] };
    if (response.ok) {
      const text = typeof body.choices?.[0]?.message?.content === 'string' ? body.choices[0].message.content.trim() : '';
      if (text) return { text, provider: 'siliconflow', model };
    }
  }
  if (aiCostPolicy() === 'free_only') throw new Error('La visión gratuita está temporalmente no disponible.');
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) throw new Error('No hay ningún proveedor de visión configurado.');
  const model = process.env.OPENAI_PRODUCT_EXTRACT_MODEL || 'gpt-5.6-terra';
  const response = await providerFetch('https://api.openai.com/v1/responses', {
    method: 'POST', headers: { Authorization: `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, store: false, input: [{ role: 'user', content: [{ type: 'input_image', image_url: dataUrl, detail: 'high' }, { type: 'input_text', text: prompt }] }] }),
  });
  const body = await response.json() as Record<string, unknown>;
  if (!response.ok) throw new Error('No se ha podido interpretar la imagen.');
  const output = Array.isArray(body.output) ? body.output : [];
  for (const item of output) {
    if (!item || typeof item !== 'object') continue;
    const content = Array.isArray((item as { content?: unknown }).content) ? (item as { content: unknown[] }).content : [];
    for (const part of content) if (part && typeof part === 'object' && (part as { type?: unknown }).type === 'output_text' && typeof (part as { text?: unknown }).text === 'string') return { text: (part as { text: string }).text.trim(), provider: 'openai', model };
  }
  throw new Error('La IA no ha devuelto una respuesta utilizable.');
}