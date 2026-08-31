import ExcelJS from 'exceljs';
import { documentationFor, GUIDE_VERSION } from './documentation';
import { guideScopeFor } from './guide-i18n';
import { Analysis, analysisMarket, analyze, supportsRuleVersion, validateProducts } from './analysis';
import { BRAND_DOCUMENT_FOOTER, BRAND_DOCUMENT_TITLE, BRAND_NAME, BRAND_TAGLINE } from './brand';
import { fetchEvidenceForAnalysis } from './evidence';
import { MARKETS } from './markets';
import { addRegulatoryWorksheet } from './export-regulatory';
import type { Language } from './landing-i18n';
import { reportLabels } from './report-i18n';

const C = { navy: 'FF111827', purple: 'FF4F46E5', muted: 'FF64748B', pale: 'FFF1F5F9', white: 'FFFFFFFF', line: 'FFE2E8F0' };
const priorityColors = { ALTA: ['FFFEE2E2', 'FF991B1B'], MEDIA: ['FFFEF3C7', 'FF92400E'], BAJA: ['FFDCFCE7', 'FF166534'] };
const LANGUAGES: Language[] = ['es','en','fr','de','it','pt'];

function activeLanguage(requested?: Language): Language {
  if (requested) return requested;
  if (typeof document !== 'undefined') {
    const candidate = document.documentElement.lang.slice(0, 2) as Language;
    if (LANGUAGES.includes(candidate)) return candidate;
  }
  return 'es';
}

const localized = (language: Language, es: string, en: string, fr: string, de: string, it: string, pt: string) => ({ es, en, fr, de, it, pt })[language];

function scope(language: Language) {
  return localized(language,
    'Este informe combina un indicador de campos incompletos con una evaluación regulatoria automatizada y conservadora. No certifica conformidad normativa ni sustituye una evaluación jurídica o técnica.',
    'This report combines an incomplete-field indicator with a conservative automated regulatory assessment. It does not certify compliance or replace legal or technical assessment.',
    'Ce rapport combine un indicateur de champs incomplets avec une évaluation réglementaire automatisée et prudente. Il ne certifie pas la conformité et ne remplace pas une évaluation juridique ou technique.',
    'Dieser Bericht kombiniert einen Indikator für unvollständige Felder mit einer konservativen automatisierten regulatorischen Bewertung. Er zertifiziert keine Konformität und ersetzt keine rechtliche oder technische Bewertung.',
    'Questo rapporto combina un indicatore dei campi incompleti con una valutazione normativa automatizzata e prudente. Non certifica la conformità e non sostituisce una valutazione legale o tecnica.',
    'Este relatório combina um indicador de campos incompletos com uma avaliação regulamentar automatizada e conservadora. Não certifica conformidade nem substitui avaliação jurídica ou técnica.');
}

function sheet(wb: ExcelJS.Workbook, name: string, widths: number[], frozen = 0, page = 'Página') {
  const ws = wb.addWorksheet(name, { views: [{ state: frozen ? 'frozen' : 'normal', ySplit: frozen, showGridLines: false }], properties: { defaultRowHeight: 24 } });
  ws.columns = widths.map(width => ({ width }));
  ws.pageSetup = { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: .3, right: .3, top: .4, bottom: .4, header: .2, footer: .2 } };
  ws.headerFooter.oddFooter = `${BRAND_DOCUMENT_FOOTER} | ${page} &P / &N`;
  return ws;
}
function band(ws: ExcelJS.Worksheet, row: number, text: string, end: number, title = false) {
  ws.mergeCells(row, 1, row, end);
  const cell = ws.getCell(row, 1); cell.value = text;
  cell.font = { name: 'Calibri', size: title ? 22 : 11, bold: title, color: { argb: title ? C.white : C.muted } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: title ? C.navy : C.pale } };
  cell.alignment = { vertical: 'middle', wrapText: true, indent: 1 };
  ws.getRow(row).height = title ? 44 : 42;
}
function header(ws: ExcelJS.Worksheet, row: number, labels: string[]) {
  ws.getRow(row).values = labels; ws.getRow(row).height = 32;
  ws.getRow(row).eachCell(cell => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: C.white } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.purple } };
    cell.alignment = { vertical: 'middle', wrapText: true, indent: 1 };
  });
}
function body(ws: ExcelJS.Worksheet, row: number, values: (string | number | Date | ExcelJS.CellFormulaValue)[]) {
  ws.getRow(row).values = values;
  let lines = 1;
  values.forEach((value, i) => {
    const cell = ws.getCell(row, i + 1);
    cell.font = { name: 'Calibri', size: 11, color: { argb: C.navy } };
    cell.alignment = { vertical: 'middle', wrapText: true, horizontal: typeof value === 'number' || (typeof value === 'object' && !(value instanceof Date)) ? 'right' : 'left' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: row % 2 ? C.pale : C.white } };
    cell.border = { bottom: { style: 'hair', color: { argb: C.line } } };
    if (typeof value === 'string') {
      const chars = Math.max(8, (ws.getColumn(i + 1).width! - 2) * .8);
      lines = Math.max(lines, value.split('\n').reduce((n, s) => n + Math.max(1, Math.ceil(s.length / chars)), 0));
    }
  });
  ws.getRow(row).height = Math.min(409, Math.max(32, lines * 17 + 12));
}

export async function buildReport(analysis: Analysis, requestedLanguage?: Language): Promise<ExcelJS.Workbook> {
  if (!supportsRuleVersion(analysis.rule_version)) throw new Error('Versión de reglas no compatible.');
  const language = activeLanguage(requestedLanguage);
  const t = reportLabels[language];
  const pageLabel = localized(language, 'Página', 'Page', 'Page', 'Seite', 'Pagina', 'Página');
  const products = validateProducts(analysis.products);
  const marketCode = analysisMarket(analysis);
  const market = MARKETS[marketCode];
  const results = analyze(products, marketCode);
  const persistedEvidence = await fetchEvidenceForAnalysis(analysis.id);
  const wb = new ExcelJS.Workbook();
  wb.creator = BRAND_NAME; wb.title = `${BRAND_NAME} · ${t.catalogueReport} · ${market.name}`; wb.subject = BRAND_TAGLINE;
  wb.created = new Date(analysis.created_at); wb.modified = new Date();
  wb.calcProperties.fullCalcOnLoad = true;
  const summary = sheet(wb, 'Resumen', [38, 24, 24, 24], 0, pageLabel);
  const details = sheet(wb, 'Productos', [46, 17, 16, 48], 4, pageLabel);
  const technical = sheet(wb, 'Datos técnicos', [46, 32, 38, 64], 12, pageLabel);
  band(summary, 1, BRAND_DOCUMENT_TITLE, 4, true);
  band(summary, 2, `${BRAND_TAGLINE} · ${t.catalogueReport.toUpperCase()} · ${market.name}`, 4);
  body(summary, 4, [t.file, analysis.filename]); summary.mergeCells('B4:D4'); summary.getRow(4).height = 42;
  body(summary, 5, [t.analysisUtc, new Date(analysis.created_at)]); summary.getCell('B5').numFmt = 'dd/mm/yyyy hh:mm';
  header(summary, 7, [t.summary, t.products, localized(language,'Lectura','Reading','Lecture','Lesart','Lettura','Leitura'), '']);
  const count = (priority: string) => results.filter(r => r.priority === priority).length;
  const end = results.length + 4;
  body(summary, 8, [localized(language,'Total de productos','Total products','Total produits','Produkte gesamt','Totale prodotti','Total de produtos'), { formula: `COUNTA('Productos'!A5:A${end})`, result: results.length }, localized(language,'Catálogo importado','Imported catalogue','Catalogue importé','Importierter Katalog','Catalogo importato','Catálogo importado')]);
  summary.mergeCells('C8:D8'); summary.getRow(8).height = 32;
  const priorityNames = { ALTA: t.high, MEDIA: t.medium, BAJA: t.low } as const;
  for (const [i, p] of (['ALTA', 'MEDIA', 'BAJA'] as const).entries()) {
    const reading = p === 'ALTA'
      ? localized(language,'Revisar primero','Review first','Réviser en premier','Zuerst prüfen','Rivedere prima','Rever primeiro')
      : p === 'MEDIA'
        ? localized(language,'Completar campos','Complete fields','Compléter les champs','Felder vervollständigen','Completare i campi','Completar campos')
        : localized(language,'Sin campos básicos vacíos','No empty basic fields','Aucun champ de base vide','Keine leeren Grundfelder','Nessun campo base vuoto','Sem campos básicos vazios');
    body(summary, 9 + i, [`${t.priority} ${priorityNames[p]}`, { formula: `COUNTIF('Productos'!C5:C${end},"${priorityNames[p]}")`, result: count(p) }, reading]);
    summary.mergeCells(9 + i, 3, 9 + i, 4);
    summary.getRow(9 + i).height = 32;
    summary.getCell(9 + i, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: priorityColors[p][0] } };
    summary.getCell(9 + i, 1).font = { name: 'Calibri', size: 11, bold: true, color: { argb: priorityColors[p][1] } };
  }
  body(summary, 13, [`${t.averageIndicator} / 100`, { formula: `ROUND(AVERAGE('Productos'!B5:B${end}),0)`, result: Math.round(results.reduce((n, r) => n + r.score, 0) / results.length) }]);
  band(summary, 15, scope(language), 4); summary.getRow(15).height = 58;
  band(summary, 17, localized(language,
    'Productos: prioridades y campos. Evaluación regulatoria, datos técnicos, evidencia guardada y guía documental completan la trazabilidad.',
    'Products: priorities and fields. Regulatory assessment, technical data, saved evidence and documentary guide complete the traceability.',
    'Produits : priorités et champs. Évaluation réglementaire, données techniques, preuves enregistrées et guide documentaire complètent la traçabilité.',
    'Produkte: Prioritäten und Felder. Regulatorische Bewertung, technische Daten, gespeicherte Nachweise und Dokumentenleitfaden vervollständigen die Rückverfolgbarkeit.',
    'Prodotti: priorità e campi. Valutazione normativa, dati tecnici, evidenze salvate e guida documentale completano la tracciabilità.',
    'Produtos: prioridades e campos. Avaliação regulamentar, dados técnicos, evidências guardadas e guia documental completam a rastreabilidade.'), 4); summary.getRow(17).height = 66;

  band(details, 1, `${t.product}S · ${t.catalogueReport}`, 4, true);
  band(details, 2, `${t.averageIndicator} / 100. ${t.incompleteFieldsNote}`, 4);
  header(details, 4, [t.product, `${t.indicator} / 100`, t.priority, t.emptyFields]);
  results.forEach((r, i) => {
    const row = i + 5;
    body(details, row, [r.name, r.score, priorityNames[r.priority], r.missing.join('\n') || t.noneBasic]);
    details.getCell(row, 2).numFmt = '0';
    const cell = details.getCell(row, 3);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: priorityColors[r.priority][0] } };
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: priorityColors[r.priority][1] } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  details.autoFilter = `A4:D${end}`;
  details.pageSetup.printTitlesRow = '1:4';

  band(technical, 1, localized(language,'DATOS TÉCNICOS · Trazabilidad','TECHNICAL DATA · Traceability','DONNÉES TECHNIQUES · Traçabilité','TECHNISCHE DATEN · Rückverfolgbarkeit','DATI TECNICI · Tracciabilità','DADOS TÉCNICOS · Rastreabilidade'), 4, true);
  band(technical, 2, scope(language), 4);
  body(technical, 4, [t.identifier, analysis.id]); technical.mergeCells('B4:D4');
  body(technical, 5, [t.rules, analysis.rule_version]); technical.mergeCells('B5:D5');
  body(technical, 6, [t.analysisUtc, new Date(analysis.created_at)]); technical.getCell('B6').numFmt = 'dd/mm/yyyy hh:mm';
  body(technical, 7, [localized(language,'Cómo se calcula','How it is calculated','Mode de calcul','Berechnung','Come viene calcolato','Como é calculado'), localized(language,`8 puntos de base + 28 por cada campo ausente: fabricante, ${market.operatorFieldLabel.toLowerCase()} y advertencias.`,`8 base points + 28 for each missing field: manufacturer, ${market.operatorFieldLabel.toLowerCase()} and warnings.`,`8 points de base + 28 pour chaque champ manquant : fabricant, ${market.operatorFieldLabel.toLowerCase()} et avertissements.`,`8 Basispunkte + 28 für jedes fehlende Feld: Hersteller, ${market.operatorFieldLabel.toLowerCase()} und Warnhinweise.`,`8 punti base + 28 per ogni campo mancante: produttore, ${market.operatorFieldLabel.toLowerCase()} e avvertenze.`,`8 pontos base + 28 por cada campo em falta: fabricante, ${market.operatorFieldLabel.toLowerCase()} e avisos.`)]); technical.mergeCells('B7:D7'); technical.getRow(7).height = 42;
  body(technical, 8, [t.priority, localized(language,'ALTA: ≥60 · MEDIA: ≥30 y <60 · BAJA: <30. Una prioridad baja no garantiza cumplimiento.','HIGH: ≥60 · MEDIUM: ≥30 and <60 · LOW: <30. Low priority does not guarantee compliance.','HAUTE : ≥60 · MOYENNE : ≥30 et <60 · BASSE : <30. Une priorité basse ne garantit pas la conformité.','HOCH: ≥60 · MITTEL: ≥30 und <60 · NIEDRIG: <30. Niedrige Priorität garantiert keine Konformität.','ALTA: ≥60 · MEDIA: ≥30 e <60 · BASSA: <30. Una priorità bassa non garantisce conformità.','ALTA: ≥60 · MÉDIA: ≥30 e <60 · BAIXA: <30. Prioridade baixa não garante conformidade.')]); technical.mergeCells('B8:D8'); technical.getRow(8).height = 42;
  band(technical, 10, localized(language,'DATOS ORIGINALES · Los campos vacíos se conservan vacíos. Editar este archivo no actualiza la web.','ORIGINAL DATA · Empty fields remain empty. Editing this file does not update the web app.','DONNÉES ORIGINALES · Les champs vides restent vides. Modifier ce fichier ne met pas à jour l’application web.','ORIGINALDATEN · Leere Felder bleiben leer. Änderungen an dieser Datei aktualisieren die Web-App nicht.','DATI ORIGINALI · I campi vuoti restano vuoti. Modificare questo file non aggiorna l’app web.','DADOS ORIGINAIS · Os campos vazios permanecem vazios. Editar este ficheiro não atualiza a aplicação web.'), 4);
  header(technical, 12, [t.product, t.manufacturer, market.operatorFieldLabel, t.warnings]);
  products.forEach((p, i) => body(technical, i + 13, [p.name, p.manufacturer, p.responsible, p.warning]));
  technical.autoFilter = `A12:D${products.length + 12}`;

  const guide = sheet(wb, 'Guía documental', [44, 32, 34, 55, 65, 65, 60], 4, pageLabel);
  band(guide, 1, `${t.documentaryGuide} · ${t.whereToGet}`, 7, true);
  band(guide, 2, `${guideScopeFor(language)} · ${t.guide}: ${GUIDE_VERSION}`, 7);
  guide.getRow(2).height = 58;
  header(guide, 4, [t.product, t.document, localized(language,'Estado','Status','État','Status','Stato','Estado'), t.applicability, t.whereToGet, t.whatToCheck, t.officialSource]);
  let guideRow = 5;
  products.forEach(p => documentationFor(p, marketCode).forEach(action => {
    body(guide, guideRow, [p.name, action.title, action.status, action.condition, action.obtain, action.check, action.source]);
    guide.getCell(guideRow, 7).value = { text: action.source, hyperlink: action.source };
    guideRow++;
  }));
  guide.autoFilter = `A4:G${guideRow - 1}`;
  guide.pageSetup.printArea = `A1:G${guideRow - 1}`;
  guide.pageSetup.printTitlesRow = '1:4';

  const evidenceSheet = sheet(wb, 'Evidencia', [34, 58, 18, 38, 20, 52, 58], 4, pageLabel);
  band(evidenceSheet, 1, t.savedEvidence, 7, true);
  band(evidenceSheet, 2, localized(language,
    'Relaciona cada requisito con su estado, documento, página/sección, nota y URL. “Disponible” indica evidencia aportada, no certificación.',
    'Links each requirement to its status, document, page/section, note and URL. “Available” means supplied evidence, not certification.',
    'Relie chaque exigence à son état, document, page/section, note et URL. « Disponible » signifie preuve fournie, pas certification.',
    'Verknüpft jede Anforderung mit Status, Dokument, Seite/Abschnitt, Notiz und URL. „Verfügbar“ bedeutet bereitgestellter Nachweis, keine Zertifizierung.',
    'Collega ogni requisito a stato, documento, pagina/sezione, nota e URL. “Disponibile” indica evidenza fornita, non certificazione.',
    'Relaciona cada requisito com estado, documento, página/secção, nota e URL. “Disponível” significa evidência fornecida, não certificação.'), 7);
  header(evidenceSheet, 4, [t.product, t.evidence, localized(language,'Estado','Status','État','Status','Stato','Estado'), t.document, t.pageSection, t.note, t.referenceUrl]);
  let evidenceRow = 5;
  persistedEvidence.forEach(item => {
    const productName = products[item.product_index]?.name ?? `${t.product} ${item.product_index + 1}`;
    const status = item.status === 'available' ? t.available : item.status === 'not_applicable' ? t.notApplicable : t.pending;
    body(evidenceSheet, evidenceRow, [productName, item.evidence_key, status, item.source_document, item.source_page, item.note, item.source_url]);
    if (item.source_url) evidenceSheet.getCell(evidenceRow, 7).value = { text: item.source_url, hyperlink: item.source_url };
    evidenceRow++;
  });
  if (evidenceRow === 5) {
    body(evidenceSheet, 5, [localized(language,'Sin evidencia guardada','No saved evidence','Aucune preuve enregistrée','Keine gespeicherten Nachweise','Nessuna evidenza salvata','Sem evidência guardada'), localized(language,'Añade evidencia desde el panel para incluir trazabilidad en futuros informes.','Add evidence in the dashboard to include traceability in future reports.','Ajoutez des preuves dans le tableau de bord pour les inclure dans les futurs rapports.','Fügen Sie im Dashboard Nachweise hinzu, um sie in künftigen Berichten zu verfolgen.','Aggiungi evidenze dal pannello per includere la tracciabilità nei rapporti futuri.','Adicione evidências no painel para incluir rastreabilidade em relatórios futuros.'), '', '', '', '', '']);
    evidenceRow = 6;
  }
  evidenceSheet.autoFilter = `A4:G${evidenceRow - 1}`;
  evidenceSheet.pageSetup.printArea = `A1:G${evidenceRow - 1}`;
  evidenceSheet.pageSetup.printTitlesRow = '1:4';

  addRegulatoryWorksheet(wb, results);
  summary.getCell('A17').value = localized(language,
    'Incluye evaluación regulatoria y evidencia persistida. Es asistencia automatizada y trazabilidad aportada por el usuario, no certificación.',
    'Includes regulatory assessment and persisted evidence. It is automated assistance and user-provided traceability, not certification.',
    'Inclut l’évaluation réglementaire et les preuves persistées. Il s’agit d’une assistance automatisée et d’une traçabilité fournie par l’utilisateur, pas d’une certification.',
    'Enthält regulatorische Bewertung und gespeicherte Nachweise. Es handelt sich um automatisierte Unterstützung und nutzerseitige Rückverfolgbarkeit, nicht um Zertifizierung.',
    'Include valutazione normativa ed evidenze persistenti. È assistenza automatizzata e tracciabilità fornita dall’utente, non certificazione.',
    'Inclui avaliação regulamentar e evidência persistida. É assistência automatizada e rastreabilidade fornecida pelo utilizador, não certificação.');
  summary.getRow(17).height = 66;
  summary.pageSetup.fitToHeight = 1;
  summary.pageSetup.printArea = `A1:D${summary.rowCount}`;
  details.pageSetup.printArea = `A1:D${details.rowCount}`;
  technical.pageSetup.printArea = `A1:D${technical.rowCount}`;
  return wb;
}

export async function reportBytes(analysis: Analysis, requestedLanguage?: Language): Promise<Uint8Array<ArrayBuffer>> {
  const buffer = await (await buildReport(analysis, requestedLanguage)).xlsx.writeBuffer();
  return new Uint8Array(buffer);
}