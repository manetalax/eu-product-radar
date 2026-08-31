import { NextResponse } from 'next/server';
import { MAX_FILE_BYTES } from '@/lib/analysis';
import { normalizeExtractedProducts, type ExtractedProduct } from '@/lib/product-ingestion';
import { readJsonBody, RequestBodyTooLargeError, sameOrigin, PRIVATE_HEADERS } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';
import { aiCostPolicy, generateText, generateVisionText } from '@/lib/ai-provider';
import { recordAiUsage } from '@/lib/ai-telemetry';
import { consumeApiRateLimit } from '@/lib/api-rate-limit';
import { extractLocalDocumentText } from '@/lib/local-document-text';
import type { Language } from '@/lib/landing-i18n';
import { productExtractionText } from '@/lib/product-extraction-i18n';
import { requestLanguage } from '@/lib/request-language';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: PRIVATE_HEADERS });
const ALLOWED_EXTENSIONS = /\.(pdf|doc|docx|rtf|odt|txt|md|json|png|jpe?g|webp|heic|heif)$/i;
const IMAGE_EXTENSIONS = /\.(png|jpe?g|webp|heic|heif)$/i;
const LOCALLY_EXTRACTABLE = /\.(pdf|docx|rtf|odt|txt|md|json)$/i;
const IMAGE_MIME = /^image\/(png|jpeg|webp|heic|heif)$/i;
const PRODUCT_EXTRACTION_BODY_MAX_BYTES = 8 * 1024 * 1024;
const PRODUCT_PROMPT = `Identifica todos los productos reales presentes en el material. No inventes. Devuelve exclusivamente JSON válido con esta forma: {"products":[{"name":"","manufacturer":"","responsible":"","warning":"","description":"","materials":"","intendedUse":"","audience":"","power":"","connectivity":"","composition":""}]}. Usa cadena vacía cuando un dato no esté explícito o claramente sustentado. Conserva el idioma original. Los campos responsible/importador UE, advertencias, materiales, alimentación, conectividad y composición se usarán para clasificar normativa: no los completes por suposición.`;

function outputText(response: Record<string, unknown>) {
  const output = Array.isArray(response.output) ? response.output : [];
  for (const item of output) {
    if (!item || typeof item !== 'object') continue;
    const content = Array.isArray((item as { content?: unknown }).content) ? (item as { content: unknown[] }).content : [];
    for (const part of content) {
      if (part && typeof part === 'object' && (part as { type?: unknown }).type === 'output_text' && typeof (part as { text?: unknown }).text === 'string') {
        return (part as { text: string }).text;
      }
    }
  }
  return '';
}

function parseProductsJson(text: string): ExtractedProduct[] {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  const candidate = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  const parsed = JSON.parse(candidate) as { products?: unknown };
  if (!Array.isArray(parsed.products)) return [];
  return parsed.products.filter((item): item is ExtractedProduct => Boolean(item) && typeof item === 'object' && !Array.isArray(item));
}

function customerExtractionError(language: Language, error: unknown): string {
  const fallback = productExtractionText(language, 'interpretError');
  if (!(error instanceof Error)) return fallback;
  const safeMessages = [
    productExtractionText(language, 'noProducts'),
    productExtractionText(language, 'freeOnlyDocument'),
    productExtractionText(language, 'backupRequired'),
    fallback,
  ];
  if (safeMessages.some(message => error.message === message || error.message.startsWith(`${message} (`))) return error.message;
  console.error('product_extraction_failed', error);
  return fallback;
}

function parseDataUrl(dataUrl: string, language: Language): { mimeType: string; bytes: Buffer } {
  const match = /^data:([^;,]+);base64,([A-Za-z0-9+/=\r\n]+)$/i.exec(dataUrl);
  if (!match) throw new Error(productExtractionText(language, 'invalidFile'));
  const bytes = Buffer.from(match[2], 'base64');
  if (!bytes.length) throw new Error(productExtractionText(language, 'emptyFile'));
  if (bytes.length > MAX_FILE_BYTES) throw new Error(productExtractionText(language, 'tooLarge'));
  return { mimeType: match[1].toLowerCase(), bytes };
}

function validateUploadType(filename: string, declaredMime: string, dataMime: string, language: Language): 'image' | 'document' {
  const isImageExtension = IMAGE_EXTENSIONS.test(filename);
  const declared = declaredMime.toLowerCase();
  const data = dataMime.toLowerCase();
  const declaredImage = IMAGE_MIME.test(declared);
  const dataImage = IMAGE_MIME.test(data);

  if (isImageExtension) {
    if (!declaredImage || !dataImage) throw new Error(productExtractionText(language, 'imageMime'));
    if (declared !== data && !(declared === 'image/heic' && data === 'image/heif') && !(declared === 'image/heif' && data === 'image/heic')) {
      throw new Error(productExtractionText(language, 'mimeMismatch'));
    }
    return 'image';
  }

  if (declaredImage || dataImage) throw new Error(productExtractionText(language, 'documentMime'));
  if (declared !== 'application/octet-stream' && data !== 'application/octet-stream' && declared !== data) {
    throw new Error(productExtractionText(language, 'mimeMismatch'));
  }
  return 'document';
}

async function structureLocalText(filename: string, text: string, started: number, language: Language): Promise<ExtractedProduct[]> {
  const result = await generateText([
    { role: 'system', content: PRODUCT_PROMPT },
    { role: 'user', content: text.slice(0, 500_000) },
  ], { maxTokens: 3500, temperature: 0 });
  void recordAiUsage({
    task: 'product_text',
    provider: result.provider,
    model: result.model,
    fallback: result.provider === 'openai' && Boolean(process.env.SILICONFLOW_API_KEY),
    latencyMs: Date.now() - started,
  });
  const products = parseProductsJson(result.text);
  if (!products.length) throw new Error(`${productExtractionText(language, 'noProducts')} (${filename})`);
  return products;
}

async function extractDocumentWithOpenAi(filename: string, mimeType: string, dataUrl: string, language: Language) {
  if (aiCostPolicy() === 'free_only') {
    throw new Error(productExtractionText(language, 'freeOnlyDocument'));
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error(productExtractionText(language, 'backupRequired'));
  const model = process.env.OPENAI_PRODUCT_EXTRACT_MODEL || 'gpt-5.6-terra';
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(30_000),
    body: JSON.stringify({
      model,
      store: false,
      instructions: PRODUCT_PROMPT,
      input: [{ role: 'user', content: [
        { type: 'input_file', filename, file_data: dataUrl, ...(mimeType === 'application/pdf' ? { detail: 'high' } : {}) },
        { type: 'input_text', text: PRODUCT_PROMPT },
      ]}],
      text: { format: { type: 'json_schema', name: 'product_extraction', strict: true, schema: {
        type: 'object', properties: { products: { type: 'array', maxItems: 1000, items: {
          type: 'object', properties: {
            name: { type: 'string' }, manufacturer: { type: 'string' }, responsible: { type: 'string' }, warning: { type: 'string' },
            description: { type: 'string' }, materials: { type: 'string' }, intendedUse: { type: 'string' }, audience: { type: 'string' },
            power: { type: 'string' }, connectivity: { type: 'string' }, composition: { type: 'string' },
          },
          required: ['name','manufacturer','responsible','warning','description','materials','intendedUse','audience','power','connectivity','composition'], additionalProperties: false,
        }}}, required: ['products'], additionalProperties: false,
      }}}
    }),
  });
  const body = await response.json() as Record<string, unknown>;
  if (!response.ok) throw new Error(productExtractionText(language, 'interpretError'));
  const text = outputText(body);
  if (!text) throw new Error(productExtractionText(language, 'noProducts'));
  return { products: parseProductsJson(text), model };
}

export async function POST(request: Request) {
  const language = requestLanguage(request);
  if (!sameOrigin(request)) return json({ error: productExtractionText(language, 'origin') }, 403);
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: productExtractionText(language, 'signIn') }, 401);

  let body: { filename?: unknown; mimeType?: unknown; dataUrl?: unknown };
  try {
    body = await readJsonBody(request, PRODUCT_EXTRACTION_BODY_MAX_BYTES) as typeof body;
  } catch (error) {
    const oversized = error instanceof RequestBodyTooLargeError;
    return json({ error: productExtractionText(language, oversized ? 'tooLarge' : 'readError') }, oversized ? 413 : 400);
  }

  const filename = typeof body.filename === 'string' ? body.filename.trim() : '';
  const mimeType = typeof body.mimeType === 'string' ? body.mimeType.trim().toLowerCase() : 'application/octet-stream';
  const dataUrl = typeof body.dataUrl === 'string' ? body.dataUrl : '';
  if (!filename || filename.length > 120 || !ALLOWED_EXTENSIONS.test(filename)) return json({ error: productExtractionText(language, 'unsupportedFormat') }, 400);
  if (!dataUrl.startsWith('data:') || dataUrl.length > Math.ceil(MAX_FILE_BYTES * 4 / 3) + 1000) return json({ error: productExtractionText(language, 'invalidPayload') }, 400);

  let upload: { mimeType: string; bytes: Buffer };
  let kind: 'image' | 'document';
  try {
    upload = parseDataUrl(dataUrl, language);
    kind = validateUploadType(filename, mimeType, upload.mimeType, language);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : productExtractionText(language, 'genericType') }, 400);
  }

  const allowed = await consumeApiRateLimit({ userId: user.id, route: 'product_extraction', limit: 30, windowSeconds: 3600 });
  if (!allowed) return json({ error: productExtractionText(language, 'rateLimit') }, 429);

  const started = Date.now();
  try {
    let products: ExtractedProduct[];

    if (kind === 'image') {
      const result = await generateVisionText(dataUrl, PRODUCT_PROMPT, { maxTokens: 3500 });
      products = parseProductsJson(result.text);
      void recordAiUsage({
        task: 'product_vision',
        provider: result.provider,
        model: result.model,
        fallback: result.provider === 'openai' && Boolean(process.env.SILICONFLOW_API_KEY),
        latencyMs: Date.now() - started,
      });
    } else if (LOCALLY_EXTRACTABLE.test(filename)) {
      const sourceText = extractLocalDocumentText(filename, upload.bytes);
      if (sourceText) products = await structureLocalText(filename, sourceText, started, language);
      else {
        const result = await extractDocumentWithOpenAi(filename, mimeType, dataUrl, language);
        products = result.products;
        void recordAiUsage({ task: 'product_document', provider: 'openai', model: result.model, latencyMs: Date.now() - started });
      }
    } else {
      const result = await extractDocumentWithOpenAi(filename, mimeType, dataUrl, language);
      products = result.products;
      void recordAiUsage({ task: 'product_document', provider: 'openai', model: result.model, latencyMs: Date.now() - started });
    }

    if (!products.length) throw new Error(productExtractionText(language, 'noProducts'));
    return json({ products: normalizeExtractedProducts({ kind, sourceName: filename, products }) });
  } catch (error) {
    return json({ error: customerExtractionError(language, error) }, 502);
  }
}
