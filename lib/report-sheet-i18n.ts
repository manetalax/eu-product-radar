import type { Language } from './landing-i18n';

export type ReportSheetNames = {
  summary: string;
  products: string;
  technical: string;
  guide: string;
  evidence: string;
  regulatory: string;
};

export const reportSheetNames: Record<Language, ReportSheetNames> = {
  es: { summary:'Resumen', products:'Productos', technical:'Datos técnicos', guide:'Guía documental', evidence:'Evidencia', regulatory:'Evaluación regulatoria' },
  en: { summary:'Summary', products:'Products', technical:'Technical data', guide:'Documentary guide', evidence:'Evidence', regulatory:'Regulatory assessment' },
  fr: { summary:'Résumé', products:'Produits', technical:'Données techniques', guide:'Guide documentaire', evidence:'Preuves', regulatory:'Évaluation réglementaire' },
  de: { summary:'Zusammenfassung', products:'Produkte', technical:'Technische Daten', guide:'Dokumentenleitfaden', evidence:'Nachweise', regulatory:'Regulatorische Bewertung' },
  it: { summary:'Riepilogo', products:'Prodotti', technical:'Dati tecnici', guide:'Guida documentale', evidence:'Evidenze', regulatory:'Valutazione normativa' },
  pt: { summary:'Resumo', products:'Produtos', technical:'Dados técnicos', guide:'Guia documental', evidence:'Evidência', regulatory:'Avaliação regulamentar' },
};

export function quoteWorksheet(name: string): string {
  return `'${name.replaceAll("'", "''")}'`;
}
