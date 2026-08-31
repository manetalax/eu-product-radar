import { NextResponse } from 'next/server';
import { sameOrigin, PRIVATE_HEADERS } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: PRIVATE_HEADERS });

function outputText(response: Record<string, unknown>) {
  const output = Array.isArray(response.output) ? response.output : [];
  for (const item of output) {
    if (!item || typeof item !== 'object') continue;
    const content = Array.isArray((item as { content?: unknown }).content) ? (item as { content: unknown[] }).content : [];
    for (const part of content) {
      if (part && typeof part === 'object' && (part as { type?: unknown }).type === 'output_text' && typeof (part as { text?: unknown }).text === 'string') return (part as { text: string }).text;
    }
  }
  return '';
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'Origen de solicitud no permitido.' }, 403);
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: 'Inicia sesión para usar el asistente regulatorio.' }, 401);

  let body: { question?: unknown; context?: unknown; language?: unknown };
  try { body = await request.json(); }
  catch { return json({ error: 'Solicitud no válida.' }, 400); }

  const question = typeof body.question === 'string' ? body.question.trim() : '';
  const context = typeof body.context === 'string' ? body.context.trim() : '';
  const language = typeof body.language === 'string' ? body.language.slice(0, 12) : 'es';
  if (!question || question.length > 2000) return json({ error: 'Escribe una pregunta de hasta 2.000 caracteres.' }, 400);
  if (!context || context.length > 40_000) return json({ error: 'El contexto del análisis no es válido.' }, 400);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return json({ error: 'El asistente regulatorio todavía no está configurado.' }, 503);

  try {
    const openai = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_REGULATORY_AGENT_MODEL || process.env.OPENAI_PRODUCT_EXTRACT_MODEL || 'gpt-5.6-terra',
        store: false,
        instructions: [
          'Eres el Regulatory AI Agent de Import Rules Verifier.',
          'Responde únicamente a partir del contexto regulatorio y evidencias proporcionadas por la aplicación.',
          'No inventes normas, certificados, resultados de laboratorio, autoridades, fechas ni hechos ausentes.',
          'Distingue siempre entre información aportada, inferencia, incertidumbre y evidencia confirmada.',
          'Nunca declares que un producto es conforme o certificado. Puedes explicar qué evidencia falta y qué debe verificarse.',
          'Cuando sea útil, estructura la respuesta en: conclusión breve, evidencia encontrada, qué falta, siguiente acción y fuentes presentes en el contexto.',
          `Responde en el idioma solicitado: ${language}.`,
        ].join(' '),
        input: [{ role: 'user', content: [{ type: 'input_text', text: `CONTEXTO DEL PRODUCTO/ANÁLISIS:\n${context}\n\nPREGUNTA DEL USUARIO:\n${question}` }] }],
      }),
    });
    const response = await openai.json() as Record<string, unknown>;
    if (!openai.ok) {
      const message = typeof (response.error as { message?: unknown } | undefined)?.message === 'string' ? (response.error as { message: string }).message : 'No se ha podido consultar el asistente.';
      throw new Error(message);
    }
    const answer = outputText(response);
    if (!answer) throw new Error('El asistente no ha devuelto una respuesta utilizable.');
    return json({ answer, disclaimer: 'Asistencia regulatoria orientativa. No constituye certificación, dictamen jurídico ni aprobación de una autoridad.' });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'No se ha podido consultar el asistente.' }, 502);
  }
}
