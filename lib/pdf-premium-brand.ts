import { PDFPage, PDFFont, rgb } from 'pdf-lib';
import type { Language } from './landing-i18n';
import { BRAND_NAME, BRAND_SITE_URL } from './brand';

const navy = rgb(.055, .075, .13);
const accent = rgb(.31, .27, .9);
const muted = rgb(.39, .43, .51);
const line = rgb(.88, .9, .94);
const euBlue = rgb(.02, .20, .55);
const white = rgb(1, 1, 1);

export function drawImportVerifierMark(page: PDFPage, x: number, y: number, size: number, inverse = false) {
  const stroke = inverse ? white : navy;
  const scale = size / 144;
  const point = (px: number, py: number) => ({ x: x + px * scale, y: y + py * scale });
  const segment = (a: [number, number], b: [number, number], color = stroke, thickness = 5.5 * scale) =>
    page.drawLine({ start: point(...a), end: point(...b), thickness, color });

  // PDF-native reconstruction of the product's existing geometric cube/radar mark.
  segment([20, 95.5], [72, 124]);
  segment([72, 124], [124, 95.5]);
  segment([124, 95.5], [124, 38.5]);
  segment([124, 38.5], [72, 10]);
  segment([72, 10], [20, 38.5]);
  segment([20, 38.5], [20, 95.5]);
  segment([20, 95.5], [72, 67]);
  segment([72, 67], [124, 95.5]);
  segment([72, 67], [72, 10]);
  segment([72, 67], [110, 105], accent, 6 * scale);
  page.drawCircle({ x: x + 72 * scale, y: y + 67 * scale, size: 7 * scale, color: accent });
}

export function localizedRegulatoryFooter(language: Language) {
  return ({
    es: 'Informe de inteligencia regulatoria · Fuentes oficiales y evidencia trazable',
    en: 'Regulatory intelligence report · Official sources and traceable evidence',
    fr: 'Rapport d’intelligence réglementaire · Sources officielles et preuves traçables',
    de: 'Regulatorischer Intelligence-Bericht · Offizielle Quellen und nachvollziehbare Nachweise',
    it: 'Rapporto di intelligence normativa · Fonti ufficiali ed evidenze tracciabili',
    pt: 'Relatório de inteligência regulamentar · Fontes oficiais e evidência rastreável',
  } as const)[language];
}

export function drawPremiumPageHeader(page: PDFPage, regular: PDFFont, bold: PDFFont, pageWidth: number, left: number, contentWidth: number) {
  page.drawRectangle({ x: left, y: 823.5, width: contentWidth, height: 2.4, color: accent });
  drawImportVerifierMark(page, left, 793, 23);
  page.drawText(BRAND_NAME, { x: left + 31, y: 801, size: 8.2, font: bold, color: navy });
  const siteWidth = regular.widthOfTextAtSize(BRAND_SITE_URL, 7.2);
  page.drawText(BRAND_SITE_URL, { x: pageWidth - left - siteWidth, y: 801, size: 7.2, font: regular, color: muted });
}

export function drawPremiumPageFooter(args: {
  page: PDFPage;
  regular: PDFFont;
  bold: PDFFont;
  pageWidth: number;
  left: number;
  contentWidth: number;
  language: Language;
  marketLabel: string;
  pageNumber: number;
  pageCount: number;
  reportRef: string;
}) {
  const { page, regular, bold, pageWidth, left, contentWidth, language, marketLabel, pageNumber, pageCount, reportRef } = args;
  page.drawRectangle({ x: left, y: 45, width: contentWidth, height: .7, color: line });
  page.drawRectangle({ x: left, y: 23, width: 20, height: 13, color: euBlue });
  page.drawText('EU', { x: left + 5.1, y: 27, size: 6.2, font: bold, color: white });
  page.drawText(localizedRegulatoryFooter(language), { x: left + 27, y: 28, size: 6.6, font: regular, color: muted });
  page.drawText(`${marketLabel} · ${reportRef}`, { x: left + 27, y: 18.5, size: 5.8, font: regular, color: muted });
  const pageText = `${pageNumber} / ${pageCount}`;
  const pageTextWidth = bold.widthOfTextAtSize(pageText, 7);
  page.drawText(pageText, { x: pageWidth - left - pageTextWidth, y: 27, size: 7, font: bold, color: navy });
}
