export type TextMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export type AiProvider = 'siliconflow' | 'cloudflare' | 'openai';

export type TextGenerationResult = {
  text: string;
  provider: AiProvider;
  model: string;
};

export type AiCostPolicy = 'free_only' | 'free_first' | 'premium_allowed';

const AI_PROVIDER_TIMEOUT_MS = 30_000;
export const SILICONFLOW_CANONICAL_BASE_URL = 'https://api.siliconflow.com/v1';
export const CLOUDFLARE_DEFAULT_MODEL = '@cf/qwen/qwen3.8-27b';

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

export function isValidCloudflareAccountId(value: string | undefined): boolean {
  return Boolean(value && /^[a-f0-9]{32}$/i.test(value));
}

function siliconFlowBaseUrl() {
  const value = process.env.SILICONFLOW_BASE_URL || SILICONFLOW_CANONICAL_BASE_URL;
  if (!isTrustedSiliconFlowBaseUrl(value)) throw new Error('La URL del proveedor gratuito no coincide con el endpoint oficial permitido.');
  return SILICONFLOW_CANONICAL_BASE_URL;
}

function cloudflareBaseUrl() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!isValidCloudflareAccountId(accountId)) return null;
  return `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1`;
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
  return Boolean(process.env.SILICONFLOW_API_KEY)
    || Boolean(process.env.CLOUDFLARE_AI_API_TOKEN && isValidCloudflareAccountId(process.env.CLOUDFLARE_ACCOUNT_ID));
}

function completionText(body: { choices?: { message?: { content?: unknown } }[] }) {
  return typeof body.choices?.[0]?.message?.content === 'string' ? body.choices[0].message.content.trim() : '';
}

async function siliconFlowText(messages: TextMessage[], options?: { maxTokens?: number; temperature?: number }) {
  const key = process.env.SILICONFLOW_API_KEY;
  if (!key) return null;
  const model = process.env.SILICONFLOW_TEXT_MODEL || 'THUDM/GLM-Z1-9B-0414';
  const response = await providerFetch(`${siliconFlowBaseUrl()}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: false, max_tokens: options?.maxTokens ?? 1800, temperature: options?.temperature ?? 0.1 }),
  });
  const body = await response.json() as { choices?: { message?: { content?: unknown } }[] };
  const text = response.ok ? completionText(body) : '';
  return text ? { text, provider: 'siliconflow' as const, model } : null;
}

async function cloudflareText(messages: TextMessage[], options?: { maxTokens?: number; temperature?: number }) {
  const key = process.env.CLOUDFLARE_AI_API_TOKEN;
  const baseUrl = cloudflareBaseUrl();
  if (!key || !baseUrl) return null;
  const model = process.env.CLOUDFLARE_AI_MODEL || CLOUDFLARE_DEFAULT_MODEL;
  const response = await providerFetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: false, max_tokens: options?.maxTokens ?? 1800, temperature: options?.temperature ?? 0.1 }),
  });
  const body = await response.json() as { choices?: { message?: { content?: unknown } }[] };
  const text = response.ok ? completionText(body) : '';
  return text ? { text, provider: 'cloudflare' as const, model } : null;
}

async function openAiText(messages: TextMessage[]): Promise<TextGenerationResult> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) throw new Error('No hay ningún proveedor de IA configurado.');
  const model = process.env.OPENAI_REGULATORY_AGENT_MODEL || process.env.OPENAI_PRODUCT_EXTRACT_MODEL || 'gpt-5.6-terra';
  const instructions = messages.filter(m => m.role === 'system').map(m => m.content).join(' ');
  const input = messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: [{ type: 'input_text', text: m.content }] }));
  const response = await providerFetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, store: false, instructions, input }),
  });
  const body = await response.json() as Record<string, unknown>;
  if (!response.ok) throw new Error('No se ha podido consultar la IA.');
  const output = Array.isArray(body.output) ? body.output : [];
  for (const item of output) {
    if (!item || typeof item !== 'object') continue;
    const content = Array.isArray((item as { content?: unknown }).content) ? (item as { content: unknown[] }).content : [];
    for (const part of content) if (part && typeof part === 'object' && (part as { type?: unknown }).type === 'output_text' && typeof (part as { text?: unknown }).text === 'string') return { text: (part as { text: string }).text.trim(), provider: 'openai', model };
  }
  throw new Error('La IA no ha devuelto una respuesta utilizable.');
}

export async function generateText(messages: TextMessage[], options?: { maxTokens?: number; temperature?: number }): Promise<TextGenerationResult> {
  const silicon = await siliconFlowText(messages, options);
  if (silicon) return silicon;
  const cloudflare = await cloudflareText(messages, options);
  if (cloudflare) return cloudflare;
  if (aiCostPolicy() === 'free_only') throw new Error('Los proveedores gratuitos están temporalmente no disponibles.');
  return openAiText(messages);
}

async function siliconFlowVision(dataUrl: string, prompt: string, options?: { maxTokens?: number }) {
  const key = process.env.SILICONFLOW_API_KEY;
  if (!key) return null;
  const model = process.env.SILICONFLOW_VISION_MODEL || process.env.SILICONFLOW_OCR_MODEL || 'PaddlePaddle/PaddleOCR-VL-1.5';
  const response = await providerFetch(`${siliconFlowBaseUrl()}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, stream: false, max_tokens: options?.maxTokens ?? 3000, temperature: 0.1, messages: [{ role: 'user', content: [{ type: 'image_url', image_url: { url: dataUrl, detail: 'high' } }, { type: 'text', text: prompt }] }] }),
  });
  const body = await response.json() as { choices?: { message?: { content?: unknown } }[] };
  const text = response.ok ? completionText(body) : '';
  return text ? { text, provider: 'siliconflow' as const, model } : null;
}

async function cloudflareVision(dataUrl: string, prompt: string, options?: { maxTokens?: number }) {
  const key = process.env.CLOUDFLARE_AI_API_TOKEN;
  const baseUrl = cloudflareBaseUrl();
  if (!key || !baseUrl) return null;
  const model = process.env.CLOUDFLARE_VISION_MODEL || process.env.CLOUDFLARE_AI_MODEL || CLOUDFLARE_DEFAULT_MODEL;
  const response = await providerFetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, stream: false, max_tokens: options?.maxTokens ?? 3000, temperature: 0.1, messages: [{ role: 'user', content: [{ type: 'image_url', image_url: { url: dataUrl } }, { type: 'text', text: prompt }] }] }),
  });
  const body = await response.json() as { choices?: { message?: { content?: unknown } }[] };
  const text = response.ok ? completionText(body) : '';
  return text ? { text, provider: 'cloudflare' as const, model } : null;
}

export async function generateVisionText(dataUrl: string, prompt: string, options?: { maxTokens?: number }): Promise<TextGenerationResult> {
  const silicon = await siliconFlowVision(dataUrl, prompt, options);
  if (silicon) return silicon;
  const cloudflare = await cloudflareVision(dataUrl, prompt, options);
  if (cloudflare) return cloudflare;
  if (aiCostPolicy() === 'free_only') throw new Error('La visión gratuita está temporalmente no disponible.');
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) throw new Error('No hay ningún proveedor de visión configurado.');
  const model = process.env.OPENAI_PRODUCT_EXTRACT_MODEL || 'gpt-5.6-terra';
  const response = await providerFetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
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
