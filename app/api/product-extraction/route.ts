import { NextResponse } from 'next/server';
import { MAX_FILE_BYTES } from '@/lib/analysis';
import { normalizeExtractedProducts } from '@/lib/product-ingestion';
import { sameOrigin, PRIVATE_HEADERS } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';
import { aiCostPolicy, generateText, generateVisionText } from '@/lib/ai-provider';
import { recordAiUsage } from '@/lib/ai-telemetry';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: PRIVATE_HEADERS });
const ALLOWED_EXTENSIONS = /\.(pdf|doc|docx|rtf|odt|txt|md|json|csv|xls|xlsx|png|jpe?g|webp|heic)$/i;
const LOCAL_TEXT_EXTENSIONS = /\.(txt|md|json|rtf)$/i;
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

function parseProductsJson(text: string): unknown[] {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  const candidate = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  const parsed = JSON.parse(candidate) as { products?: unknown };
  return Array.isArray(parsed.products) ? parsed.products : [];
}

function rtfToPlainText(input: string): string {
  return input
    .replace(/\\par[d]?\b/g, '\n')
    .replace(/\\tab\b/g, '\t')
    .replace(/\\'[0-9a-fA-F]{2}/g, match => String.fromCharCode(parseInt(match.slice(2), 16)))
    .replace(/\\u(-?\d+)\??/g, (_match, value: string) => {
      const point = Number(value);
      return Number.isFinite(point) ? String.fromCharCode(point < 0 ? point + 65536 : point) : '';
    })
    .replace(/\\[a-zA-Z]+-?\d* ?/g, '')
    .replace(/\\[{}\\]/g, match => match.slice(1))
    .replace(/[{}]/g, '')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function decodeTextDataUrl(dataUrl: string, filename: string): string {
  const marker = ';base64,';
  const index = dataUrl.indexOf(marker);
  if (index < 0) throw new Error('Archivo de texto no válido.');
  const decoded = Buffer.from(dataUrl.slice(index + marker.length), 'base64').toString('utf8');
  const text = /\.rtf$/i.test(filename) ? rtfToPlainText(decoded) : decoded;
  if (!text.trim()) throw new Error('El archivo no contiene texto utilizable.');
  return text.slice(0, 500_000);
}

async function extractDocumentWithOpenAi(filename: string, mimeType: string, dataUrl: string) {
  if (aiCostPolicy() === 'free_only') {
    throw new Error('Este formato aún no está disponible en modo gratuito. Usa una imagen, TXT, Markdown, JSON, RTF, CSV o Excel mientras terminamos el parser local de PDF/Word.');
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Este formato requiere temporalmente el proveedor documental de respaldo.');
  const model = process.env.OPENAI_PRODUCT_EXTRACT_MODEL || 'gpt-5.6-terra';
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
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
  if (!response.ok) throw new Error('No se ha podido interpretar el documento.');
  const text = outputText(body);
  if (!text) throw new Error('No se han encontrado productos identificables.');
  return { products: parseProductsJson(text), model };
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'Origen de solicitud no permitido.' }, 403);
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: 'Inicia sesión para analizar documentos o imágenes.' }, 401);

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 7.5 * 1024 * 1024) return json({ error: 'El archivo supera el límite de 5 MB.' }, 413);

  let body: { filename?: unknown; mimeType?: unknown; dataUrl?: unknown };
  try { body = await request.json(); }
  catch { return json({ error: 'No se ha podido leer el archivo.' }, 400); }

  const filename = typeof body.filename === 'string' ? body.filename.trim() : '';
  const mimeType = typeof body.mimeType === 'string' ? body.mimeType : 'application/octet-stream';
  const dataUrl = typeof body.dataUrl === 'string' ? body.dataUrl : '';
  if (!filename || filename.length > 120 || !ALLOWED_EXTENSIONS.test(filename)) return json({ error: 'Formato no compatible. Usa foto, PDF, Word, texto, CSV o Excel.' }, 400);
  if (!dataUrl.startsWith('data:') || !dataUrl.includes(';base64,') || dataUrl.length > Math.ceil(MAX_FILE_BYTES * 4 / 3) + 500) return json({ error: 'El archivo está vacío o supera el límite de 5 MB.' }, 400);

  const started = Date.now();
  try {
    let products: unknown[];
    let kind: 'image' | 'document' = 'document';

    if (mimeType.startsWith('image/')) {
      kind = 'image';
      const result = await generateVisionText(dataUrl, PRODUCT_PROMPT, { maxTokens: 3500 });
      products = parseProductsJson(result.text);
      void recordAiUsage({
        task: 'product_vision',
        provider: result.provider,
        model: result.model,
        fallback: result.provider === 'openai' && Boolean(process.env.SILICONFLOW_API_KEY),
        latencyMs: Date.now() - started,
      });
    } else if (LOCAL_TEXT_EXTENSIONS.test(filename)) {
      const sourceText = decodeTextDataUrl(dataUrl, filename);
      const result = await generateText([
        { role: 'system', content: PRODUCT_PROMPT },
        { role: 'user', content: sourceText },
      ], { maxTokens: 3500, temperature: 0 });
      products = parseProductsJson(result.text);
      void recordAiUsage({
        task: 'product_text',
        provider: result.provider,
        model: result.model,
        fallback: result.provider === 'openai' && Boolean(process.env.SILICONFLOW_API_KEY),
        latencyMs: Date.now() - started,
      });
    } else {
      const result = await extractDocumentWithOpenAi(filename, mimeType, dataUrl);
      products = result.products;
      void recordAiUsage({ task: 'product_document', provider: 'openai', model: result.model, latencyMs: Date.now() - started });
    }

    if (!products.length) throw new Error('No se han encontrado productos identificables.');
    return json({ products: normalizeExtractedProducts({ kind, sourceName: filename, products }) });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'No se ha podido interpretar el archivo.' }, 502);
  }
}
