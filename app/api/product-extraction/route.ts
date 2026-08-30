import { NextResponse } from 'next/server';
import { MAX_FILE_BYTES } from '@/lib/analysis';
import { normalizeExtractedProducts } from '@/lib/product-ingestion';
import { sameOrigin, PRIVATE_HEADERS } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: PRIVATE_HEADERS });
const ALLOWED_EXTENSIONS = /\.(pdf|doc|docx|rtf|odt|txt|md|json|csv|xls|xlsx|png|jpe?g|webp|heic)$/i;

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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return json({ error: 'La lectura inteligente todavía no está configurada.' }, 503);

  const fileInput = mimeType.startsWith('image/')
    ? { type: 'input_image', image_url: dataUrl, detail: 'high' }
    : { type: 'input_file', filename, file_data: dataUrl, ...(mimeType === 'application/pdf' ? { detail: 'high' } : {}) };

  try {
    const openai = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_PRODUCT_EXTRACT_MODEL || 'gpt-5.6-terra',
        store: false,
        instructions: 'Extrae únicamente productos reales visibles o mencionados. No inventes. Para cada campo, usa solo información explícita o claramente inferible del propio material. Si no hay evidencia suficiente, devuelve cadena vacía. Conserva el idioma original.',
        input: [{ role: 'user', content: [
          fileInput,
          { type: 'input_text', text: 'Identifica todos los productos y devuelve: nombre; fabricante/marca; operador responsable/importador UE; advertencias; descripción; materiales; uso previsto; público o edad; alimentación/voltaje/batería; conectividad (Wi‑Fi/Bluetooth/radio); composición o ingredientes. Estos campos se usarán para clasificar normativa, por lo que no debes rellenarlos por suposición.' },
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
    const response = await openai.json() as Record<string, unknown>;
    if (!openai.ok) {
      const message = typeof (response.error as { message?: unknown } | undefined)?.message === 'string' ? (response.error as { message: string }).message : 'No se ha podido interpretar el archivo.';
      throw new Error(message);
    }
    const text = outputText(response);
    if (!text) throw new Error('No se han encontrado productos identificables.');
    const parsed = JSON.parse(text) as { products?: unknown };
    return json({ products: normalizeExtractedProducts({ kind: mimeType.startsWith('image/') ? 'image' : 'document', sourceName: filename, products: Array.isArray(parsed.products) ? parsed.products : [] }) });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'No se ha podido interpretar el archivo.' }, 502);
  }
}
