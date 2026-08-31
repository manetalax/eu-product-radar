import { NextResponse } from 'next/server';
import { generateText } from '@/lib/ai-provider';
import { sameOrigin, PRIVATE_HEADERS } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: PRIVATE_HEADERS });

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

  try {
    const result = await generateText([
      {
        role: 'system',
        content: [
          'Eres el Regulatory AI Agent de Import Rules Verifier.',
          'Responde únicamente a partir del contexto regulatorio y evidencias proporcionadas por la aplicación.',
          'No inventes normas, certificados, resultados de laboratorio, autoridades, fechas ni hechos ausentes.',
          'Distingue siempre entre información aportada, inferencia, incertidumbre y evidencia confirmada.',
          'Nunca declares que un producto es conforme o certificado. Puedes explicar qué evidencia falta y qué debe verificarse.',
          'Cuando sea útil, estructura la respuesta en: conclusión breve, evidencia encontrada, qué falta, siguiente acción y fuentes presentes en el contexto.',
          `Responde en el idioma solicitado: ${language}.`,
        ].join(' '),
      },
      { role: 'user', content: `CONTEXTO DEL PRODUCTO/ANÁLISIS:\n${context}\n\nPREGUNTA DEL USUARIO:\n${question}` },
    ], { maxTokens: 1800, temperature: 0.1 });

    return json({
      answer: result.text,
      provider: result.provider,
      model: result.model,
      disclaimer: 'Asistencia regulatoria orientativa. No constituye certificación, dictamen jurídico ni aprobación de una autoridad.',
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'No se ha podido consultar el asistente.' }, 502);
  }
}
