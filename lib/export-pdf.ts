import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Analysis, analyze, RULE_VERSION, validateProducts } from './analysis';
import { documentationFor, GUIDE_SCOPE, GUIDE_VERSION } from './documentation';

// Standard PDF fonts cover Spanish. Preserve other scripts as explicit Unicode
// escapes instead of silently dropping names or failing the entire download.
export const pdfText = (text: string) => Array.from(text).map(c => {
  const n = c.codePointAt(0)!;
  return n >= 32 && n <= 255 ? c : c === '\n' ? ' ' : `[U+${n.toString(16).toUpperCase()}]`;
}).join('');

export async function pdfBytes(analysis: Analysis): Promise<Uint8Array<ArrayBuffer>> {
  if (analysis.rule_version !== RULE_VERSION) throw new Error('Versión de reglas no compatible.');
  const products = validateProducts(analysis.products), results = analyze(products);
  const doc = await PDFDocument.create();
  doc.setTitle('EU Product Radar - Informe documental');
  doc.setCreator('EU Product Radar');
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(.07, .1, .17), purple = rgb(.31, .27, .9);
  let page = doc.addPage([595.28, 841.89]), y = 780;
  function newPage() { page = doc.addPage([595.28, 841.89]); y = 780; }
  function lineBlock(text: string, size = 10, strong = false) {
    const font = strong ? bold : regular, maxWidth = 499;
    const words = pdfText(text).split(/\s+/);
    let line = '';
    const emit = () => {
      if (y < 64) newPage();
      page.drawText(line, { x: 48, y, size, font, color: strong ? purple : ink });
      y -= size * 1.45; line = '';
    };
    for (const word of words) {
      if (line && font.widthOfTextAtSize(line + ' ' + word, size) > maxWidth) emit();
      // Break very long URLs, filenames and unspaced imported values safely.
      for (const c of (line ? ' ' : '') + word) {
        if (font.widthOfTextAtSize(line + c, size) > maxWidth) emit();
        line += c;
      }
    }
    if (line) emit();
    y -= 7;
  }
  lineBlock('EU PRODUCT RADAR', 24, true);
  lineBlock('Informe del catálogo y guía documental', 16, true);
  lineBlock('Archivo: ' + analysis.filename);
  lineBlock('Análisis (UTC): ' + new Date(analysis.created_at).toISOString());
  lineBlock('Identificador: ' + analysis.id);
  lineBlock('Reglas: ' + analysis.rule_version + ' | Guía: ' + GUIDE_VERSION);
  lineBlock('Guía generada (UTC): ' + new Date().toISOString());
  lineBlock('RESUMEN', 14, true);
  lineBlock(`${products.length} productos | Alta: ${results.filter(r => r.priority === 'ALTA').length} | Media: ${results.filter(r => r.priority === 'MEDIA').length} | Baja: ${results.filter(r => r.priority === 'BAJA').length}`);
  lineBlock(`Indicador medio: ${Math.round(results.reduce((n, r) => n + r.score, 0) / results.length)}/100. Mide campos incompletos, no riesgo legal.`);
  lineBlock(GUIDE_SCOPE);
  lineBlock('Cómo usarlo', 14, true);
  lineBlock('1. Completar los datos ausentes. 2. Identificar categoría y mercados. 3. Solicitar al proveedor documentación del modelo. 4. Revisar su contenido y aplicabilidad antes de concluir cumplimiento.');
  lineBlock('No se recalcula el historial ni se valida documentación al descargar. El indicador conserva 8 puntos de base y suma 28 por campo vacío. Alta: 60 o más; media: 30 a 59; baja: menos de 30.');
  lineBlock('Los caracteres fuera del alfabeto latino se representan como códigos [U+...]. Los datos originales completos permanecen en el Excel.', 9);
  products.forEach((p, i) => {
    newPage();
    lineBlock(`PRODUCTO ${i + 1} / ${products.length}`, 14, true);
    lineBlock(p.name, 16, true);
    lineBlock(`Indicador: ${results[i].score}/100 | Prioridad: ${results[i].priority}`);
    lineBlock('Campos vacíos: ' + (results[i].missing.join(', ') || 'Ninguno de los tres campos básicos'));
    for (const [label, value] of [['Fabricante', p.manufacturer], ['Responsable UE', p.responsible], ['Advertencias', p.warning]]) lineBlock(`${label}: ${value || 'No aportado'}`);
    documentationFor(p).forEach(a => {
      if (y < 210) newPage();
      lineBlock(a.title + ' - ' + a.status, 12, true);
      lineBlock('Aplicabilidad: ' + a.condition);
      lineBlock('Dónde conseguirlo: ' + a.obtain);
      lineBlock('Qué comprobar: ' + a.check);
      lineBlock('Fuente oficial: ' + a.source, 8);
    });
  });
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    p.drawText(`EU Product Radar | Guía orientativa | ${i + 1} / ${pages.length}`, { x: 48, y: 30, size: 8, font: regular, color: ink });
  });
  return new Uint8Array(await doc.save());
}
