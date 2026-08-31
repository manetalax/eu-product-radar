import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Analysis, analysisMarket, analyze, supportsRuleVersion, validateProducts } from './analysis';
import { documentationFor, GUIDE_SCOPE, GUIDE_VERSION } from './documentation';
import { BRAND_DOCUMENT_FOOTER, BRAND_DOCUMENT_TITLE, BRAND_INDEPENDENCE_NOTICE, BRAND_NAME, BRAND_SITE_URL, BRAND_TAGLINE } from './brand';
import { fetchEvidenceForAnalysis, evidenceForProduct } from './evidence';
import { MARKETS } from './markets';
import type { Language } from './landing-i18n';
import { reportLabels } from './report-i18n';

export const pdfText = (text: string) => Array.from(text).map(c => {
  const n = c.codePointAt(0)!;
  return n >= 32 && n <= 255 ? c : c === '\n' ? ' ' : `[U+${n.toString(16).toUpperCase()}]`;
}).join('');

export async function pdfBytes(analysis: Analysis, language: Language = 'es'): Promise<Uint8Array<ArrayBuffer>> {
  if (!supportsRuleVersion(analysis.rule_version)) throw new Error('Versión de reglas no compatible.');
  const t = reportLabels[language];
  const marketCode = analysisMarket(analysis), market = MARKETS[marketCode];
  const products = validateProducts(analysis.products), results = analyze(products, marketCode);
  const persistedEvidence = await fetchEvidenceForAnalysis(analysis.id);
  const doc = await PDFDocument.create();
  doc.setTitle(`${BRAND_NAME} - ${t.catalogueReport} · ${market.name}`);
  doc.setAuthor(BRAND_NAME);
  doc.setCreator(BRAND_NAME);
  doc.setProducer(BRAND_DOCUMENT_FOOTER);
  doc.setSubject(BRAND_TAGLINE);
  doc.setKeywords([BRAND_NAME, 'EU regulation', 'product compliance', 'regulatory report']);
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
  lineBlock(BRAND_DOCUMENT_TITLE, 24, true);
  lineBlock(BRAND_TAGLINE, 10);
  lineBlock(BRAND_SITE_URL, 9);
  lineBlock(`${t.catalogueReport} · ${market.name}`, 16, true);
  lineBlock(`${t.file}: ${analysis.filename}`);
  lineBlock(`${t.analysisUtc}: ${new Date(analysis.created_at).toISOString()}`);
  lineBlock(`${t.identifier}: ${analysis.id}`);
  lineBlock(`${t.rules}: ${analysis.rule_version} | ${t.guide}: ${GUIDE_VERSION}`);
  lineBlock(`${t.generatedUtc}: ${new Date().toISOString()}`);
  lineBlock(t.summary, 14, true);
  lineBlock(`${products.length} ${t.products} | ${t.high}: ${results.filter(r => r.priority === 'ALTA').length} | ${t.medium}: ${results.filter(r => r.priority === 'MEDIA').length} | ${t.low}: ${results.filter(r => r.priority === 'BAJA').length}`);
  lineBlock(`${t.averageIndicator}: ${Math.round(results.reduce((n, r) => n + r.score, 0) / results.length)}/100. ${t.incompleteFieldsNote}`);
  if (marketCode === 'EU') lineBlock(language === 'es' ? 'El informe incorpora una evaluación regulatoria automatizada: categoría candidata, normativa potencialmente aplicable, obligaciones, evidencias y puntos que requieren confirmación.' : 'The report includes an automated regulatory assessment with candidate category, potentially applicable legislation, obligations, evidence and points requiring confirmation.');
  lineBlock(GUIDE_SCOPE);
  lineBlock(t.howToUse, 14, true);
  lineBlock(language === 'es' ? '1. Completar datos ausentes. 2. Confirmar categoría, características y uso previsto. 3. Revisar normativa candidata y obligaciones. 4. Solicitar la documentación y evidencia técnica aplicable. 5. Validar contenido y aplicabilidad antes de concluir cumplimiento.' : '1. Complete missing data. 2. Confirm category, characteristics and intended use. 3. Review candidate legislation and obligations. 4. Request applicable documentation and technical evidence. 5. Validate content and applicability before reaching any compliance conclusion.');
  lineBlock(BRAND_INDEPENDENCE_NOTICE, 9);
  lineBlock(language === 'es' ? 'Los caracteres fuera del alfabeto latino se representan como códigos [U+...]. Los datos originales completos permanecen en el Excel.' : 'Characters outside the Latin alphabet are represented as [U+...] codes. Full original data remains available in the Excel report.', 9);
  products.forEach((p, i) => {
    newPage();
    const result = results[i];
    lineBlock(`${t.product} ${i + 1} / ${products.length}`, 14, true);
    lineBlock(p.name, 16, true);
    lineBlock(`${t.indicator}: ${result.score}/100 | ${t.priority}: ${result.priority}`);
    lineBlock(`${t.emptyFields}: ${result.missing.join(', ') || t.noneBasic}`);
    for (const [label, value] of [[t.manufacturer, p.manufacturer], [market.operatorFieldLabel, p.responsible], [t.warnings, p.warning]]) lineBlock(`${label}: ${value || t.notProvided}`);

    if (result.regulatory) {
      const regulatory = result.regulatory;
      lineBlock(t.regulatoryAssessment, 14, true);
      const confidence = regulatory.confidence === 'high' ? t.confidenceHigh : regulatory.confidence === 'medium' ? t.confidenceMedium : t.confidenceLow;
      lineBlock(`${t.candidateCategory}: ${regulatory.category} | ${t.confidence}: ${confidence}${regulatory.requiresCategoryConfirmation ? ` | ${t.requiresConfirmation}` : ''}`);
      lineBlock(t.identifiedRules, 12, true);
      regulatory.applicableActs.forEach(act => {
        lineBlock(`${act.title} (${act.reference})`, 10, true);
        lineBlock(act.reason, 9);
        lineBlock(`${t.officialSource}: ${act.url}`, 8);
      });
      lineBlock(t.actionsEvidence, 12, true);
      regulatory.obligations.forEach(obligation => {
        if (y < 170) newPage();
        lineBlock(obligation.title, 10, true);
        lineBlock(obligation.reason, 9);
        lineBlock(`${t.evidence}: ${obligation.evidence.join('; ')}`, 9);
        lineBlock(`${t.source}: ${obligation.source.reference} · ${obligation.source.url}`, 8);
      });
      if (regulatory.uncertainties.length) {
        lineBlock(t.confirmations, 12, true);
        regulatory.uncertainties.forEach(item => lineBlock('• ' + item, 9));
      }
      lineBlock(regulatory.disclaimer, 8);
    }

    const productEvidence = evidenceForProduct(persistedEvidence, i);
    if (productEvidence.length) {
      lineBlock(t.savedEvidence, 13, true);
      productEvidence.forEach(item => {
        if (y < 150) newPage();
        const status = item.status === 'available' ? t.available : item.status === 'not_applicable' ? t.notApplicable : t.pending;
        lineBlock(`${item.evidence_key} · ${status}`, 10, true);
        if (item.source_document) lineBlock(`${t.document}: ${item.source_document}`, 9);
        if (item.source_page) lineBlock(`${t.pageSection}: ${item.source_page}`, 9);
        if (item.source_url) lineBlock(`${t.referenceUrl}: ${item.source_url}`, 8);
        if (item.note) lineBlock(`${t.note}: ${item.note}`, 9);
      });
    }

    lineBlock(t.documentaryGuide, 13, true);
    documentationFor(p, marketCode).forEach(a => {
      if (y < 210) newPage();
      lineBlock(a.title + ' - ' + a.status, 12, true);
      lineBlock(`${t.applicability}: ${a.condition}`);
      lineBlock(`${t.whereToGet}: ${a.obtain}`);
      lineBlock(`${t.whatToCheck}: ${a.check}`);
      lineBlock(`${t.officialSource}: ${a.source}`, 8);
    });
  });
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    p.drawText(`${BRAND_DOCUMENT_FOOTER} | ${market.shortName} · ${t.advisoryAssessment} | ${i + 1} / ${pages.length}`, { x: 48, y: 30, size: 8, font: regular, color: ink });
  });
  return new Uint8Array(await doc.save());
}