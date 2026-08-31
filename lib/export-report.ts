import ExcelJS from 'exceljs';
import { documentationFor, GUIDE_SCOPE, GUIDE_VERSION } from './documentation';
import { Analysis, analysisMarket, analyze, supportsRuleVersion, validateProducts } from './analysis';
import { BRAND_DOCUMENT_FOOTER, BRAND_DOCUMENT_TITLE, BRAND_NAME, BRAND_TAGLINE } from './brand';
import { MARKETS } from './markets';
import { addRegulatoryWorksheet } from './export-regulatory';

const C = { navy: 'FF111827', purple: 'FF4F46E5', muted: 'FF64748B', pale: 'FFF1F5F9', white: 'FFFFFFFF', line: 'FFE2E8F0' };
const priorityColors = { ALTA: ['FFFEE2E2', 'FF991B1B'], MEDIA: ['FFFEF3C7', 'FF92400E'], BAJA: ['FFDCFCE7', 'FF166534'] };
const scope = 'Este informe combina un indicador de campos incompletos con una evaluación regulatoria automatizada y conservadora. No certifica conformidad normativa ni sustituye una evaluación jurídica o técnica.';

function sheet(wb: ExcelJS.Workbook, name: string, widths: number[], frozen = 0) {
  const ws = wb.addWorksheet(name, { views: [{ state: frozen ? 'frozen' : 'normal', ySplit: frozen, showGridLines: false }], properties: { defaultRowHeight: 24 } });
  ws.columns = widths.map(width => ({ width }));
  ws.pageSetup = { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: .3, right: .3, top: .4, bottom: .4, header: .2, footer: .2 } };
  ws.headerFooter.oddFooter = `${BRAND_DOCUMENT_FOOTER} | Página &P de &N`;
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

export async function buildReport(analysis: Analysis): Promise<ExcelJS.Workbook> {
  if (!supportsRuleVersion(analysis.rule_version)) throw new Error('Versión de reglas no compatible.');
  const products = validateProducts(analysis.products);
  const marketCode = analysisMarket(analysis);
  const market = MARKETS[marketCode];
  const results = analyze(products, marketCode);
  const wb = new ExcelJS.Workbook();
  wb.creator = BRAND_NAME; wb.title = `${BRAND_NAME} · Informe de preparación · ${market.name}`; wb.subject = BRAND_TAGLINE;
  wb.created = new Date(analysis.created_at); wb.modified = new Date();
  wb.calcProperties.fullCalcOnLoad = true;
  const summary = sheet(wb, 'Resumen', [38, 24, 24, 24]);
  const details = sheet(wb, 'Productos', [46, 17, 16, 48], 4);
  const technical = sheet(wb, 'Datos técnicos', [46, 32, 38, 64], 12);
  band(summary, 1, BRAND_DOCUMENT_TITLE, 4, true);
  band(summary, 2, `${BRAND_TAGLINE} · INFORME DEL CATÁLOGO · Mercado: ${market.name}`, 4);
  body(summary, 4, ['Archivo', analysis.filename]); summary.mergeCells('B4:D4'); summary.getRow(4).height = 42;
  body(summary, 5, ['Fecha del análisis (UTC)', new Date(analysis.created_at)]); summary.getCell('B5').numFmt = 'dd/mm/yyyy hh:mm';
  header(summary, 7, ['Resumen', 'Productos', 'Lectura', '']);
  const count = (priority: string) => results.filter(r => r.priority === priority).length;
  const end = results.length + 4;
  body(summary, 8, ['Total de productos', { formula: `COUNTA('Productos'!A5:A${end})`, result: results.length }, 'Catálogo importado']);
  summary.mergeCells('C8:D8'); summary.getRow(8).height = 32;
  for (const [i, p] of (['ALTA', 'MEDIA', 'BAJA'] as const).entries()) {
    body(summary, 9 + i, [`Prioridad ${p.toLowerCase()}`, { formula: `COUNTIF('Productos'!C5:C${end},"${p}")`, result: count(p) }, p === 'ALTA' ? 'Revisar primero' : p === 'MEDIA' ? 'Completar campos' : 'Sin campos básicos vacíos']);
    summary.mergeCells(9 + i, 3, 9 + i, 4);
    summary.getRow(9 + i).height = 32;
    summary.getCell(9 + i, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: priorityColors[p][0] } };
    summary.getCell(9 + i, 1).font = { name: 'Calibri', size: 11, bold: true, color: { argb: priorityColors[p][1] } };
  }
  body(summary, 13, ['Indicador medio / 100', { formula: `ROUND(AVERAGE('Productos'!B5:B${end}),0)`, result: Math.round(results.reduce((n, r) => n + r.score, 0) / results.length) }]);
  band(summary, 15, scope, 4); summary.getRow(15).height = 58;
  band(summary, 17, marketCode === 'EU' ? 'Productos: prioridades y campos. Evaluación regulatoria: categoría candidata, normativa, evidencias, incertidumbres y fuentes. Datos técnicos y guía documental completan la trazabilidad.' : 'Productos: prioridades y campos por revisar. Datos técnicos: reglas, trazabilidad y valores originales. Este archivo es una instantánea del análisis guardado.', 4); summary.getRow(17).height = 66;
  band(details, 1, 'PRODUCTOS · Revisión del catálogo', 4, true);
  band(details, 2, 'Indicador de campos incompletos / 100. La prioridad no equivale a riesgo legal. Se conserva el orden del archivo original.', 4);
  header(details, 4, ['Producto', 'Indicador / 100', 'Prioridad', 'Campos por revisar']);
  results.forEach((r, i) => {
    const row = i + 5;
    body(details, row, [r.name, r.score, r.priority, r.missing.join('\n') || 'Sin campos básicos vacíos']);
    details.getCell(row, 2).numFmt = '0';
    const cell = details.getCell(row, 3);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: priorityColors[r.priority][0] } };
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: priorityColors[r.priority][1] } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  details.autoFilter = `A4:D${end}`;
  details.pageSetup.printTitlesRow = '1:4';
  band(technical, 1, 'DATOS TÉCNICOS · Trazabilidad', 4, true);
  band(technical, 2, scope, 4);
  body(technical, 4, ['Identificador del análisis', analysis.id]); technical.mergeCells('B4:D4');
  body(technical, 5, ['Versión de reglas', analysis.rule_version]); technical.mergeCells('B5:D5');
  body(technical, 6, ['Fecha del análisis (UTC)', new Date(analysis.created_at)]); technical.getCell('B6').numFmt = 'dd/mm/yyyy hh:mm';
  body(technical, 7, ['Cómo se calcula', `8 puntos de base + 28 por cada campo ausente: fabricante, ${market.operatorFieldLabel.toLowerCase()} y advertencias.`]); technical.mergeCells('B7:D7'); technical.getRow(7).height = 42;
  body(technical, 8, ['Prioridades', 'ALTA: ≥60 · MEDIA: ≥30 y <60 · BAJA: <30. Incluso una prioridad baja no garantiza cumplimiento.']); technical.mergeCells('B8:D8'); technical.getRow(8).height = 42;
  band(technical, 10, 'DATOS ORIGINALES · Los campos vacíos se conservan vacíos. Los datos y puntuaciones corresponden al momento del análisis; editar este archivo no actualiza la web.', 4);
  header(technical, 12, ['Producto', 'Fabricante', market.operatorFieldLabel, 'Advertencias de seguridad']);
  products.forEach((p, i) => body(technical, i + 13, [p.name, p.manufacturer, p.responsible, p.warning]));
  technical.autoFilter = `A12:D${products.length + 12}`;
  for (const ws of wb.worksheets) ws.pageSetup.printArea = `A1:D${ws.rowCount}`;
  const guide = sheet(wb, 'Guía documental', [44, 32, 34, 55, 65, 65, 60], 4);
  band(guide, 1, 'GUÍA DOCUMENTAL · Qué pedir y dónde conseguirlo', 7, true);
  band(guide, 2, GUIDE_SCOPE + ' Versión: ' + GUIDE_VERSION, 7);
  guide.getRow(2).height = 58;
  header(guide, 4, ['Producto', 'Documento / dato', 'Estado', 'Cuándo aplica', 'Dónde conseguirlo', 'Qué comprobar', 'Fuente oficial']);
  let guideRow = 5;
  products.forEach(p => documentationFor(p, marketCode).forEach(action => {
    body(guide, guideRow, [p.name, action.title, action.status, action.condition, action.obtain, action.check, action.source]);
    guide.getCell(guideRow, 7).value = { text: action.source, hyperlink: action.source };
    guideRow++;
  }));
  guide.autoFilter = `A4:G${guideRow - 1}`;
  guide.pageSetup.printArea = `A1:G${guideRow - 1}`;
  guide.pageSetup.printTitlesRow = '1:4';
  addRegulatoryWorksheet(wb, results);
  summary.getCell('A17').value = marketCode === 'EU' ? 'Incluye una hoja de evaluación regulatoria con categoría candidata, normativa, obligaciones, evidencias, confirmaciones y fuentes oficiales. Es asistencia automatizada, no certificación.' : 'Productos: prioridades y campos. Datos técnicos: reglas y originales. Guía documental: qué solicitar, a quién y fuentes. Instantánea guardada; guía orientativa actual, no validación documental.';
  summary.getRow(17).height = 66;
  summary.pageSetup.fitToHeight = 1;
  return wb;
}

export async function reportBytes(analysis: Analysis): Promise<Uint8Array<ArrayBuffer>> {
  const buffer = await (await buildReport(analysis)).xlsx.writeBuffer();
  return new Uint8Array(buffer);
}
