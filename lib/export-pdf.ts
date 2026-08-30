import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Analysis, analysisMarket, analyze, supportsRuleVersion, validateProducts } from './analysis';
import { documentationFor, GUIDE_SCOPE, GUIDE_VERSION } from './documentation';
import { BRAND_NAME } from './brand';
import { MARKETS } from './markets';

export const pdfText = (text: string) => Array.from(text).map(c => {
  const n = c.codePointAt(0)!;
  return n >= 32 && n <= 255 ? c : c === '\n' ? ' ' : `[U+${n.toString(16).toUpperCase()}]`;
}).join('');

export async function pdfBytes(analysis: Analysis): Promise<Uint8Array<ArrayBuffer>> {
  if (!supportsRuleVersion(analysis.rule_version)) throw new Error('Versión de reglas no compatible.');
  const marketCode = analysisMarket(analysis), market = MARKETS[marketCode];
  const products = validateProducts(analysis.products), results = analyze(products, marketCode);
  const doc = await PDFDocument.create();
  doc.setTitle(`${BRAND_NAME} - Informe regulatorio orientativo · ${market.name}`);
  doc.setCreator(BRAND_NAME);
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
      for (const c of (line ? ' ' : '') + word) {
        if (font.widthOfTextAtSize(line + c, size) > maxWidth) emit();
        line += c;
      }
    }
    if (line) emit();
    y -= 7;
  }
  lineBlock('IMPORT RULES VERIFIER', 24, true);
  lineBlock(`Informe del catálogo · ${market.name}`, 16, true);
  lineBlock('Archivo: ' + analysis.filename);
  lineBlock('Análisis (UTC): ' + new Date(analysis.created_at).toISOString());
  lineBlock('Identificador: ' + analysis.id);
  lineBlock('Reglas: ' + analysis.rule_version + ' | Guía: ' + GUIDE_VERSION);
  lineBlock('Guía generada (UTC): ' + new Date().toISOString());
  lineBlock('RESUMEN', 14, true);
  lineBlock(`${products.length} productos | Alta: ${results.filter(r => r.priority === 'ALTA').length} | Media: ${results.filter(r => r.priority === 'MEDIA').length} | Baja: ${results.filter(r => r.priority === 'BAJA').length}`);
  lineBlock(`Indicador medio: ${Math.round(results.reduce((n, r) => n + r.score, 0) / results.length)}/100. Mide campos incompletos, no riesgo legal.`);
  if (marketCode === 'EU') lineBlock('El informe incorpora una evaluación regulatoria automatizada: categoría candidata, normativa potencialmente aplicable, obligaciones, evidencias y puntos que requieren confirmación.');
  lineBlock(GUIDE_SCOPE);
  lineBlock('Cómo usarlo', 14, true);
  lineBlock('1. Completar datos ausentes. 2. Confirmar categoría, características y uso previsto. 3. Revisar normativa candidata y obligaciones. 4. Solicitar la documentación y evidencia técnica aplicable. 5. Validar contenido y aplicabilidad antes de concluir cumplimiento.');
  lineBlock('Import Rules Verifier no emite certificados de conformidad, no representa a una autoridad de la UE y no sustituye asesoramiento jurídico o evaluación técnica especializada.', 9);
  lineBlock('Los caracteres fuera del alfabeto latino se representan como códigos [U+...]. Los datos originales completos permanecen en el Excel.', 9);
  products.forEach((p, i) => {
    newPage();
    const result = results[i];
    lineBlock(`PRODUCTO ${i + 1} / ${products.length}`, 14, true);
    lineBlock(p.name, 16, true);
    lineBlock(`Indicador: ${result.score}/100 | Prioridad: ${result.priority}`);
    lineBlock('Campos vacíos: ' + (result.missing.join(', ') || 'Ninguno de los tres campos básicos'));
    for (const [label, value] of [['Fabricante', p.manufacturer], [market.operatorFieldLabel, p.responsible], ['Advertencias', p.warning]]) lineBlock(`${label}: ${value || 'No aportado'}`);

    if (result.regulatory) {
      const regulatory = result.regulatory;
      lineBlock('EVALUACIÓN REGULATORIA UE', 14, true);
      lineBlock(`Categoría candidata: ${regulatory.category} | Confianza: ${regulatory.confidence === 'high' ? 'alta' : regulatory.confidence === 'medium' ? 'media' : 'baja'}${regulatory.requiresCategoryConfirmation ? ' | Requiere confirmación' : ''}`);
      lineBlock('Normativa identificada', 12, true);
      regulatory.applicableActs.forEach(act => {
        lineBlock(`${act.title} (${act.reference})`, 10, true);
        lineBlock(act.reason, 9);
        lineBlock('Fuente oficial: ' + act.url, 8);
      });
      lineBlock('Acciones y evidencias', 12, true);
      regulatory.obligations.forEach(obligation => {
        if (y < 170) newPage();
        lineBlock(obligation.title, 10, true);
        lineBlock(obligation.reason, 9);
        lineBlock('Evidencia: ' + obligation.evidence.join('; '), 9);
        lineBlock(`Fuente: ${obligation.source.reference} · ${obligation.source.url}`, 8);
      });
      if (regulatory.uncertainties.length) {
        lineBlock('Confirmaciones necesarias', 12, true);
        regulatory.uncertainties.forEach(item => lineBlock('• ' + item, 9));
      }
      lineBlock(regulatory.disclaimer, 8);
    }

    lineBlock('GUÍA DOCUMENTAL', 13, true);
    documentationFor(p, marketCode).forEach(a => {
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
    p.drawText(`${BRAND_NAME} | ${market.shortName} · Evaluación orientativa | ${i + 1} / ${pages.length}`, { x: 48, y: 30, size: 8, font: regular, color: ink });
  });
  return new Uint8Array(await doc.save());
}
