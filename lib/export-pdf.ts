import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb } from 'pdf-lib';
import { Analysis, analysisMarket, analyze, supportsRuleVersion, validateProducts } from './analysis';
import { documentationFor, GUIDE_VERSION } from './documentation';
import { guideScopeFor } from './guide-i18n';
import { BRAND_DOCUMENT_FOOTER, BRAND_DOCUMENT_TITLE, BRAND_INDEPENDENCE_NOTICE, BRAND_NAME, BRAND_SITE_URL, BRAND_TAGLINE } from './brand';
import { fetchEvidenceForAnalysis, evidenceForProduct } from './evidence';
import { localizeEuRegulatoryAssessment } from './eu-regulatory-i18n';
import { marketDisplayFor } from './market-i18n';
import type { Language } from './landing-i18n';
import { reportLabels } from './report-i18n';

const LANGUAGES: Language[] = ['es','en','fr','de','it','pt'];
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const LEFT = 48;
const CONTENT_WIDTH = 499;

function activeReportLanguage(requested?: Language): Language {
  if (requested) return requested;
  if (typeof document !== 'undefined') {
    const candidate = document.documentElement.lang.slice(0, 2) as Language;
    if (LANGUAGES.includes(candidate)) return candidate;
  }
  return 'es';
}

const localized = (language: Language, values: Record<Language, string>) => values[language];

export const pdfText = (text: string) => Array.from(text).map(c => {
  const n = c.codePointAt(0)!;
  return n >= 32 && n <= 255 ? c : c === '\n' ? ' ' : `[U+${n.toString(16).toUpperCase()}]`;
}).join('');

export async function pdfBytes(analysis: Analysis, requestedLanguage?: Language): Promise<Uint8Array<ArrayBuffer>> {
  if (!supportsRuleVersion(analysis.rule_version)) throw new Error('Versión de reglas no compatible.');
  const language = activeReportLanguage(requestedLanguage);
  const t = reportLabels[language];
  const marketCode = analysisMarket(analysis), marketDisplay = marketDisplayFor(language, marketCode);
  const products = validateProducts(analysis.products), results = analyze(products, marketCode);
  const persistedEvidence = await fetchEvidenceForAnalysis(analysis.id);
  const doc = await PDFDocument.create();
  doc.setTitle(`${BRAND_NAME} - ${t.catalogueReport} · ${marketDisplay.name}`);
  doc.setAuthor(BRAND_NAME);
  doc.setCreator(BRAND_NAME);
  doc.setProducer(BRAND_DOCUMENT_FOOTER);
  doc.setSubject(BRAND_TAGLINE);
  doc.setKeywords([BRAND_NAME, 'EU regulation', 'product compliance', 'regulatory report']);

  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(.045, .065, .105);
  const navy = rgb(.035, .055, .11);
  const purple = rgb(.27, .22, .82);
  const gold = rgb(.83, .67, .25);
  const muted = rgb(.37, .41, .48);
  const pale = rgb(.965, .97, .985);
  const white = rgb(1, 1, 1);
  const line = rgb(.86, .88, .92);
  const red = rgb(.72, .09, .11);
  const euBlue = rgb(.02, .2, .48);

  const authorityContext = localized(language, {
    es: 'Contexto regulatorio UE · Fuentes oficiales y trazabilidad documental',
    en: 'EU regulatory context · Official sources and document traceability',
    fr: 'Contexte réglementaire UE · Sources officielles et traçabilité documentaire',
    de: 'EU-Regulierungskontext · Offizielle Quellen und Dokumentennachweis',
    it: 'Contesto normativo UE · Fonti ufficiali e tracciabilità documentale',
    pt: 'Contexto regulamentar UE · Fontes oficiais e rastreabilidade documental',
  });
  const reportClass = localized(language, {
    es: 'INFORME REGULATORIO', en: 'REGULATORY REPORT', fr: 'RAPPORT RÉGLEMENTAIRE',
    de: 'REGULIERUNGSBERICHT', it: 'RAPPORTO NORMATIVO', pt: 'RELATÓRIO REGULAMENTAR',
  });

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = 780;

  function drawMonogram(target: PDFPage, x: number, yy: number, size = 34, dark = false) {
    target.drawRectangle({ x, y: yy, width: size, height: size, color: dark ? white : navy, borderColor: dark ? gold : purple, borderWidth: 1.3 });
    target.drawText('IV', { x: x + size * .18, y: yy + size * .28, size: size * .34, font: bold, color: dark ? navy : white });
  }

  function drawPageChrome(target: PDFPage) {
    target.drawRectangle({ x: LEFT, y: PAGE_HEIGHT - 18, width: CONTENT_WIDTH, height: 3, color: purple });
    drawMonogram(target, LEFT, PAGE_HEIGHT - 52, 23);
    target.drawText(pdfText(BRAND_NAME.toUpperCase()), { x: LEFT + 31, y: PAGE_HEIGHT - 43, size: 7.7, font: bold, color: navy });
    const site = pdfText(BRAND_SITE_URL);
    const siteWidth = regular.widthOfTextAtSize(site, 7.5);
    target.drawText(site, { x: PAGE_WIDTH - LEFT - siteWidth, y: PAGE_HEIGHT - 42, size: 7.5, font: regular, color: muted });
  }

  function newPage() {
    page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    drawPageChrome(page);
    y = 758;
  }

  function lineBlock(text: string, size = 10, strong = false) {
    const font = strong ? bold : regular, maxWidth = CONTENT_WIDTH;
    const words = pdfText(text).split(/\s+/);
    let currentLine = '';
    const emit = () => {
      if (y < 72) newPage();
      page.drawText(currentLine, { x: LEFT, y, size, font, color: strong ? purple : ink });
      y -= size * 1.45;
      currentLine = '';
    };
    for (const word of words) {
      if (currentLine && font.widthOfTextAtSize(currentLine + ' ' + word, size) > maxWidth) emit();
      for (const c of (currentLine ? ' ' : '') + word) {
        if (font.widthOfTextAtSize(currentLine + c, size) > maxWidth) emit();
        currentLine += c;
      }
    }
    if (currentLine) emit();
    y -= 7;
  }

  function sectionTitle(text: string) {
    if (y < 110) newPage();
    page.drawRectangle({ x: LEFT, y: y - 7, width: CONTENT_WIDTH, height: 30, color: pale, borderColor: line, borderWidth: .6 });
    page.drawRectangle({ x: LEFT, y: y - 7, width: 4, height: 30, color: purple });
    page.drawText(pdfText(text), { x: LEFT + 14, y: y + 2, size: 11, font: bold, color: ink });
    y -= 43;
  }

  function metricCard(label: string, value: string, x: number, width: number) {
    page.drawRectangle({ x, y: y - 54, width, height: 54, color: pale, borderColor: line, borderWidth: .6 });
    page.drawText(pdfText(value), { x: x + 11, y: y - 25, size: 18, font: bold, color: purple });
    const safeLabel = pdfText(label);
    const fitted = safeLabel.length > 26 ? `${safeLabel.slice(0, 25)}…` : safeLabel;
    page.drawText(fitted, { x: x + 11, y: y - 43, size: 7.5, font: regular, color: muted });
  }

  function drawVerifiedSeal() {
    const cx = PAGE_WIDTH - LEFT - 58, cy = PAGE_HEIGHT - 136;
    page.drawCircle({ x: cx, y: cy, size: 44, borderColor: red, borderWidth: 2.4, opacity: .88 });
    page.drawCircle({ x: cx, y: cy, size: 36, borderColor: red, borderWidth: .8, opacity: .75 });
    page.drawText('VERIFIED', { x: cx - 30, y: cy - 4, size: 12, font: bold, color: red, rotate: { type: 'degrees', angle: -8 } as never, opacity: .9 });
  }

  function drawCover() {
    page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 244, width: PAGE_WIDTH, height: 244, color: navy });
    page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 244, width: 8, height: 244, color: purple });
    page.drawRectangle({ x: LEFT, y: PAGE_HEIGHT - 48, width: 76, height: 3, color: gold });
    drawMonogram(page, LEFT, PAGE_HEIGHT - 101, 38, true);
    page.drawText(pdfText(BRAND_DOCUMENT_TITLE), { x: LEFT + 52, y: PAGE_HEIGHT - 78, size: 20, font: bold, color: white });
    page.drawText(pdfText(BRAND_TAGLINE), { x: LEFT + 52, y: PAGE_HEIGHT - 97, size: 8.5, font: regular, color: rgb(.79, .82, .9) });
    page.drawText(pdfText(reportClass), { x: LEFT, y: PAGE_HEIGHT - 146, size: 8, font: bold, color: gold });
    page.drawText(pdfText(`${t.catalogueReport} · ${marketDisplay.name}`), { x: LEFT, y: PAGE_HEIGHT - 173, size: 17, font: bold, color: white });
    page.drawText(pdfText(`${t.identifier}: ${analysis.id}`), { x: LEFT, y: PAGE_HEIGHT - 199, size: 7.5, font: regular, color: rgb(.7, .73, .82) });
    page.drawText(pdfText(BRAND_SITE_URL), { x: LEFT, y: PAGE_HEIGHT - 217, size: 7.5, font: regular, color: rgb(.7, .73, .82) });
    drawVerifiedSeal();
    y = PAGE_HEIGHT - 284;
  }

  drawCover();
  sectionTitle(t.summary);
  lineBlock(`${t.file}: ${analysis.filename}`);
  lineBlock(`${t.analysisUtc}: ${new Date(analysis.created_at).toISOString()}`);
  lineBlock(`${t.identifier}: ${analysis.id}`);
  lineBlock(`${t.rules}: ${analysis.rule_version} | ${t.guide}: ${GUIDE_VERSION}`);
  lineBlock(`${t.generatedUtc}: ${new Date().toISOString()}`);

  const high = results.filter(r => r.priority === 'ALTA').length;
  const medium = results.filter(r => r.priority === 'MEDIA').length;
  const low = results.filter(r => r.priority === 'BAJA').length;
  const cardGap = 8;
  const cardWidth = (CONTENT_WIDTH - cardGap * 3) / 4;
  metricCard(t.products, String(products.length), LEFT, cardWidth);
  metricCard(t.high, String(high), LEFT + (cardWidth + cardGap), cardWidth);
  metricCard(t.medium, String(medium), LEFT + (cardWidth + cardGap) * 2, cardWidth);
  metricCard(t.low, String(low), LEFT + (cardWidth + cardGap) * 3, cardWidth);
  y -= 70;
  lineBlock(`${t.averageIndicator}: ${Math.round(results.reduce((n, r) => n + r.score, 0) / results.length)}/100. ${t.incompleteFieldsNote}`);

  if (marketCode === 'EU') lineBlock(localized(language, {
    es: 'El informe incorpora una evaluación regulatoria automatizada: categoría candidata, normativa potencialmente aplicable, obligaciones, evidencias y puntos que requieren confirmación.',
    en: 'The report includes an automated regulatory assessment with candidate category, potentially applicable legislation, obligations, evidence and points requiring confirmation.',
    fr: 'Le rapport comprend une évaluation réglementaire automatisée avec catégorie candidate, législation potentiellement applicable, obligations, preuves et points nécessitant confirmation.',
    de: 'Der Bericht enthält eine automatisierte regulatorische Bewertung mit möglicher Produktkategorie, potenziell anwendbaren Rechtsvorschriften, Pflichten, Nachweisen und zu bestätigenden Punkten.',
    it: 'Il rapporto include una valutazione normativa automatizzata con categoria candidata, normativa potenzialmente applicabile, obblighi, evidenze e punti da confermare.',
    pt: 'O relatório inclui uma avaliação regulamentar automatizada com categoria candidata, legislação potencialmente aplicável, obrigações, evidências e pontos que exigem confirmação.',
  }));
  lineBlock(guideScopeFor(language));

  sectionTitle(t.howToUse);
  lineBlock(localized(language, {
    es: '1. Completar datos ausentes. 2. Confirmar categoría, características y uso previsto. 3. Revisar normativa candidata y obligaciones. 4. Solicitar la documentación y evidencia técnica aplicable. 5. Validar contenido y aplicabilidad antes de concluir cumplimiento.',
    en: '1. Complete missing data. 2. Confirm category, characteristics and intended use. 3. Review candidate legislation and obligations. 4. Request applicable documentation and technical evidence. 5. Validate content and applicability before reaching any compliance conclusion.',
    fr: '1. Compléter les données manquantes. 2. Confirmer la catégorie, les caractéristiques et l’usage prévu. 3. Examiner la législation candidate et les obligations. 4. Demander les documents et preuves techniques applicables. 5. Valider le contenu et l’applicabilité avant toute conclusion de conformité.',
    de: '1. Fehlende Daten ergänzen. 2. Kategorie, Eigenschaften und Verwendungszweck bestätigen. 3. Mögliche Rechtsvorschriften und Pflichten prüfen. 4. Anwendbare Unterlagen und technische Nachweise anfordern. 5. Inhalt und Anwendbarkeit prüfen, bevor eine Konformitätsaussage getroffen wird.',
    it: '1. Completare i dati mancanti. 2. Confermare categoria, caratteristiche e uso previsto. 3. Verificare normativa candidata e obblighi. 4. Richiedere documentazione ed evidenze tecniche applicabili. 5. Validare contenuto e applicabilità prima di qualsiasi conclusione sulla conformità.',
    pt: '1. Completar os dados em falta. 2. Confirmar categoria, características e utilização prevista. 3. Rever legislação candidata e obrigações. 4. Solicitar documentação e evidência técnica aplicável. 5. Validar conteúdo e aplicabilidade antes de concluir qualquer conformidade.',
  }));
  lineBlock(BRAND_INDEPENDENCE_NOTICE, 9);
  lineBlock(localized(language, {
    es: 'Los caracteres fuera del alfabeto latino se representan como códigos [U+...]. Los datos originales completos permanecen en el Excel.',
    en: 'Characters outside the Latin alphabet are represented as [U+...] codes. Full original data remains available in the Excel report.',
    fr: 'Les caractères hors alphabet latin sont représentés par des codes [U+...]. Les données originales complètes restent disponibles dans le rapport Excel.',
    de: 'Zeichen außerhalb des lateinischen Alphabets werden als [U+...]-Codes dargestellt. Die vollständigen Originaldaten bleiben im Excel-Bericht verfügbar.',
    it: 'I caratteri al di fuori dell’alfabeto latino sono rappresentati come codici [U+...]. I dati originali completi restano disponibili nel rapporto Excel.',
    pt: 'Os caracteres fora do alfabeto latino são representados como códigos [U+...]. Os dados originais completos permanecem disponíveis no relatório Excel.',
  }), 9);

  products.forEach((p, i) => {
    newPage();
    const result = results[i];
    const priorityLabel = result.priority === 'ALTA' ? t.high : result.priority === 'MEDIA' ? t.medium : t.low;
    const missingFields = result.missing.map(field => field === 'Fabricante' ? t.manufacturer : field === 'Seguridad/advertencias' ? t.warnings : field === 'Operador responsable UE' ? marketDisplay.operator : field);
    page.drawText(pdfText(`${t.product} ${i + 1} / ${products.length}`), { x: LEFT, y, size: 8.5, font: bold, color: purple });
    y -= 25;
    lineBlock(p.name, 18, true);
    const scoreLabel = `${result.score}/100 · ${priorityLabel}`;
    page.drawRectangle({ x: LEFT, y: y - 7, width: Math.min(CONTENT_WIDTH, 160), height: 28, color: pale, borderColor: line, borderWidth: .6 });
    page.drawText(pdfText(scoreLabel), { x: LEFT + 11, y: y + 2, size: 10, font: bold, color: ink });
    y -= 43;
    lineBlock(`${t.indicator}: ${result.score}/100 | ${t.priority}: ${priorityLabel}`);
    lineBlock(`${t.emptyFields}: ${missingFields.join(', ') || t.noneBasic}`);
    for (const [label, value] of [[t.manufacturer, p.manufacturer], [marketDisplay.operator, p.responsible], [t.warnings, p.warning]]) lineBlock(`${label}: ${value || t.notProvided}`);

    if (result.regulatory) {
      const regulatory = localizeEuRegulatoryAssessment(result.regulatory, language);
      sectionTitle(t.regulatoryAssessment);
      const confidence = regulatory.confidence === 'high' ? t.confidenceHigh : regulatory.confidence === 'medium' ? t.confidenceMedium : t.confidenceLow;
      lineBlock(`${t.candidateCategory}: ${regulatory.category} | ${t.confidence}: ${confidence}${regulatory.requiresCategoryConfirmation ? ` | ${t.requiresConfirmation}` : ''}`);
      sectionTitle(t.identifiedRules);
      regulatory.applicableActs.forEach(act => { lineBlock(`${act.title} (${act.reference})`, 10, true); lineBlock(act.reason, 9); lineBlock(`${t.officialSource}: ${act.url}`, 8); });
      sectionTitle(t.actionsEvidence);
      regulatory.obligations.forEach(obligation => {
        if (y < 170) newPage();
        lineBlock(obligation.title, 10, true); lineBlock(obligation.reason, 9); lineBlock(`${t.evidence}: ${obligation.evidence.join('; ')}`, 9); lineBlock(`${t.source}: ${obligation.source.reference} · ${obligation.source.url}`, 8);
      });
      if (regulatory.uncertainties.length) { sectionTitle(t.confirmations); regulatory.uncertainties.forEach(item => lineBlock('• ' + item, 9)); }
      lineBlock(regulatory.disclaimer, 8);
    }

    const productEvidence = evidenceForProduct(persistedEvidence, i);
    if (productEvidence.length) {
      sectionTitle(t.savedEvidence);
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

    sectionTitle(t.documentaryGuide);
    documentationFor(p, marketCode, language).forEach(a => {
      if (y < 210) newPage();
      lineBlock(a.title + ' - ' + a.status, 12, true);
      lineBlock(`${t.applicability}: ${a.condition}`); lineBlock(`${t.whereToGet}: ${a.obtain}`); lineBlock(`${t.whatToCheck}: ${a.check}`); lineBlock(`${t.officialSource}: ${a.source}`, 8);
    });
  });

  const pages = doc.getPages();
  pages.forEach((p, i) => {
    p.drawRectangle({ x: LEFT, y: 49, width: CONTENT_WIDTH, height: .7, color: line });
    p.drawCircle({ x: LEFT + 7, y: 34, size: 6.5, color: euBlue });
    p.drawText('EU', { x: LEFT + 2.8, y: 31.6, size: 5.3, font: bold, color: white });
    p.drawText(pdfText(authorityContext), { x: LEFT + 18, y: 31, size: 6.7, font: regular, color: muted });
    const pageNumber = pdfText(`${i + 1} / ${pages.length}`);
    p.drawText(pageNumber, { x: PAGE_WIDTH - LEFT - regular.widthOfTextAtSize(pageNumber, 7), y: 31, size: 7, font: bold, color: navy });
    p.drawText(pdfText(BRAND_DOCUMENT_FOOTER), { x: LEFT, y: 18, size: 6.2, font: regular, color: muted });
  });
  return new Uint8Array(await doc.save());
}
