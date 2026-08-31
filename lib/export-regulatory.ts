import ExcelJS from 'exceljs';
import type { Result } from './analysis';
import { BRAND_DOCUMENT_FOOTER, BRAND_NAME } from './brand';
import { localizeEuRegulatoryAssessment } from './eu-regulatory-i18n';
import type { Language } from './landing-i18n';
import { reportLabels } from './report-i18n';

const LANGUAGES: Language[] = ['es','en','fr','de','it','pt'];
const local = (language: Language, es: string, en: string, fr: string, de: string, it: string, pt: string) => ({ es, en, fr, de, it, pt })[language];
function activeLanguage(requested?: Language): Language {
  if (requested) return requested;
  if (typeof document !== 'undefined') {
    const candidate = document.documentElement.lang.slice(0, 2) as Language;
    if (LANGUAGES.includes(candidate)) return candidate;
  }
  return 'es';
}

export function addRegulatoryWorksheet(workbook: ExcelJS.Workbook, results: Result[], requestedLanguage?: Language) {
  const regulatory = results.filter(result => result.regulatory);
  if (!regulatory.length) return;
  const language = activeLanguage(requestedLanguage);
  const t = reportLabels[language];

  const ws = workbook.addWorksheet('Evaluación regulatoria', {
    views: [{ state: 'frozen', ySplit: 4, showGridLines: false }],
    properties: { defaultRowHeight: 24 },
  });
  ws.columns = [
    { width: 36 }, { width: 24 }, { width: 14 }, { width: 34 },
    { width: 48 }, { width: 60 }, { width: 54 }, { width: 64 },
  ];
  ws.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
  ws.headerFooter.oddFooter = `${BRAND_DOCUMENT_FOOTER} | ${local(language,'Página','Page','Page','Seite','Pagina','Página')} &P / &N`;
  ws.mergeCells('A1:H1');
  ws.getCell('A1').value = `${t.regulatoryAssessment} · ${BRAND_NAME}`;
  ws.getCell('A1').font = { bold: true, size: 18 };
  ws.mergeCells('A2:H2');
  ws.getCell('A2').value = local(language,
    'Clasificación automatizada y conservadora. Confirma categoría, características y uso previsto. No constituye certificación ni aprobación de una autoridad.',
    'Automated conservative classification. Confirm category, characteristics and intended use. This is not certification or authority approval.',
    'Classification automatisée et prudente. Confirmez la catégorie, les caractéristiques et l’usage prévu. Il ne s’agit ni d’une certification ni d’une approbation officielle.',
    'Automatisierte konservative Einstufung. Kategorie, Eigenschaften und Verwendungszweck bestätigen. Dies ist keine Zertifizierung oder behördliche Genehmigung.',
    'Classificazione automatizzata e prudente. Confermare categoria, caratteristiche e uso previsto. Non costituisce certificazione né approvazione di un’autorità.',
    'Classificação automatizada e conservadora. Confirme categoria, características e utilização prevista. Não constitui certificação nem aprovação de autoridade.');
  ws.getCell('A2').alignment = { wrapText: true, vertical: 'middle' };
  ws.getRow(2).height = 42;
  const headers = [
    t.product,
    t.candidateCategory,
    t.confidence,
    t.identifiedRules,
    local(language,'Motivo/aplicabilidad','Reason/applicability','Motif/applicabilité','Grund/Anwendbarkeit','Motivo/applicabilità','Motivo/aplicabilidade'),
    t.actionsEvidence,
    t.confirmations,
    t.officialSource,
  ];
  ws.getRow(4).values = headers;
  ws.getRow(4).font = { bold: true };
  ws.getRow(4).alignment = { wrapText: true, vertical: 'middle' };

  let row = 5;
  for (const result of regulatory) {
    const assessment = localizeEuRegulatoryAssessment(result.regulatory!, language);
    const acts = assessment.applicableActs.map(act => `${act.title} (${act.reference})`).join('\n');
    const reasons = assessment.applicableActs.map(act => `${act.reference}: ${act.reason}`).join('\n');
    const actions = assessment.obligations.map(obligation => `${obligation.title}\n${t.evidence}: ${obligation.evidence.join('; ')}`).join('\n\n');
    const sources = Array.from(new Map([
      ...assessment.applicableActs.map(act => [act.url, `${act.reference}: ${act.url}`] as const),
      ...assessment.obligations.map(obligation => [obligation.source.url, `${obligation.source.reference}: ${obligation.source.url}`] as const),
    ]).values()).join('\n');
    ws.getRow(row).values = [
      result.name,
      assessment.category,
      assessment.confidence === 'high' ? t.confidenceHigh : assessment.confidence === 'medium' ? t.confidenceMedium : t.confidenceLow,
      acts,
      reasons,
      actions,
      assessment.uncertainties.join('\n') || (assessment.requiresCategoryConfirmation
        ? local(language,'Confirmar categoría y uso previsto.','Confirm category and intended use.','Confirmer la catégorie et l’usage prévu.','Kategorie und Verwendungszweck bestätigen.','Confermare categoria e uso previsto.','Confirmar categoria e utilização prevista.')
        : local(language,'Sin alertas adicionales de clasificación.','No additional classification alerts.','Aucune alerte de classification supplémentaire.','Keine zusätzlichen Einstufungswarnungen.','Nessun ulteriore avviso di classificazione.','Sem alertas adicionais de classificação.')),
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
