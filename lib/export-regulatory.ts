import ExcelJS from 'exceljs';
import type { Result } from './analysis';

export function addRegulatoryWorksheet(workbook: ExcelJS.Workbook, results: Result[]) {
  const regulatory = results.filter(result => result.regulatory);
  if (!regulatory.length) return;

  const ws = workbook.addWorksheet('Evaluación regulatoria', {
    views: [{ state: 'frozen', ySplit: 4, showGridLines: false }],
    properties: { defaultRowHeight: 24 },
  });
  ws.columns = [
    { width: 36 }, { width: 24 }, { width: 14 }, { width: 34 },
    { width: 48 }, { width: 60 }, { width: 54 }, { width: 64 },
  ];
  ws.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
  ws.mergeCells('A1:H1');
  ws.getCell('A1').value = 'EVALUACIÓN REGULATORIA UE · Import Rules Verifier';
  ws.getCell('A1').font = { bold: true, size: 18 };
  ws.mergeCells('A2:H2');
  ws.getCell('A2').value = 'Clasificación automatizada y conservadora. Confirma categoría, características y uso previsto. No constituye certificación ni aprobación de una autoridad.';
  ws.getCell('A2').alignment = { wrapText: true, vertical: 'middle' };
  ws.getRow(2).height = 42;
  const headers = ['Producto', 'Categoría candidata', 'Confianza', 'Normativa', 'Motivo/aplicabilidad', 'Acciones y evidencias', 'Confirmaciones necesarias', 'Fuente oficial'];
  ws.getRow(4).values = headers;
  ws.getRow(4).font = { bold: true };
  ws.getRow(4).alignment = { wrapText: true, vertical: 'middle' };

  let row = 5;
  for (const result of regulatory) {
    const assessment = result.regulatory!;
    const acts = assessment.applicableActs.map(act => `${act.title} (${act.reference})`).join('\n');
    const reasons = assessment.applicableActs.map(act => `${act.reference}: ${act.reason}`).join('\n');
    const actions = assessment.obligations.map(obligation => `${obligation.title}\nEvidencia: ${obligation.evidence.join('; ')}`).join('\n\n');
    const sources = Array.from(new Map([
      ...assessment.applicableActs.map(act => [act.url, `${act.reference}: ${act.url}`] as const),
      ...assessment.obligations.map(obligation => [obligation.source.url, `${obligation.source.reference}: ${obligation.source.url}`] as const),
    ]).values()).join('\n');
    ws.getRow(row).values = [
      result.name,
      assessment.category,
      assessment.confidence === 'high' ? 'Alta' : assessment.confidence === 'medium' ? 'Media' : 'Baja',
      acts,
      reasons,
      actions,
      assessment.uncertainties.join('\n') || (assessment.requiresCategoryConfirmation ? 'Confirmar categoría y uso previsto.' : 'Sin alertas adicionales de clasificación.'),
      sources,
    ];
    ws.getRow(row).eachCell(cell => { cell.alignment = { wrapText: true, vertical: 'top' }; });
    ws.getRow(row).height = Math.min(360, Math.max(54, 18 * Math.max(3, actions.split('\n').length, acts.split('\n').length)));
    row++;
  }
  ws.autoFilter = `A4:H${row - 1}`;
  ws.pageSetup.printTitlesRow = '1:4';
  ws.pageSetup.printArea = `A1:H${row - 1}`;
}
