import type { Language } from './landing-i18n';

type ReportLabels = {
  catalogueReport: string;
  file: string;
  analysisUtc: string;
  identifier: string;
  rules: string;
  guide: string;
  generatedUtc: string;
  summary: string;
  products: string;
  high: string;
  medium: string;
  low: string;
  averageIndicator: string;
  incompleteFieldsNote: string;
  howToUse: string;
  product: string;
  indicator: string;
  priority: string;
  emptyFields: string;
  noneBasic: string;
  manufacturer: string;
  warnings: string;
  notProvided: string;
  regulatoryAssessment: string;
  candidateCategory: string;
  confidence: string;
  confidenceHigh: string;
  confidenceMedium: string;
  confidenceLow: string;
  requiresConfirmation: string;
  identifiedRules: string;
  officialSource: string;
  actionsEvidence: string;
  evidence: string;
  source: string;
  confirmations: string;
  savedEvidence: string;
  available: string;
  notApplicable: string;
  pending: string;
  document: string;
  pageSection: string;
  referenceUrl: string;
  note: string;
  documentaryGuide: string;
  applicability: string;
  whereToGet: string;
  whatToCheck: string;
  advisoryAssessment: string;
};

const es: ReportLabels = {
  catalogueReport:'Informe del catálogo', file:'Archivo', analysisUtc:'Análisis (UTC)', identifier:'Identificador', rules:'Reglas', guide:'Guía', generatedUtc:'Guía generada (UTC)', summary:'RESUMEN', products:'productos', high:'Alta', medium:'Media', low:'Baja', averageIndicator:'Indicador medio', incompleteFieldsNote:'Mide campos incompletos, no riesgo legal.', howToUse:'Cómo usarlo', product:'PRODUCTO', indicator:'Indicador', priority:'Prioridad', emptyFields:'Campos vacíos', noneBasic:'Ninguno de los tres campos básicos', manufacturer:'Fabricante', warnings:'Advertencias', notProvided:'No aportado', regulatoryAssessment:'EVALUACIÓN REGULATORIA UE', candidateCategory:'Categoría candidata', confidence:'Confianza', confidenceHigh:'alta', confidenceMedium:'media', confidenceLow:'baja', requiresConfirmation:'Requiere confirmación', identifiedRules:'Normativa identificada', officialSource:'Fuente oficial', actionsEvidence:'Acciones y evidencias', evidence:'Evidencia', source:'Fuente', confirmations:'Confirmaciones necesarias', savedEvidence:'EVIDENCIA GUARDADA Y TRAZABILIDAD', available:'Disponible', notApplicable:'No aplica', pending:'Pendiente', document:'Documento', pageSection:'Página/sección', referenceUrl:'URL de referencia', note:'Nota', documentaryGuide:'GUÍA DOCUMENTAL', applicability:'Aplicabilidad', whereToGet:'Dónde conseguirlo', whatToCheck:'Qué comprobar', advisoryAssessment:'Evaluación orientativa'
};

export const reportLabels: Record<Language, ReportLabels> = {
  es,
  en:{...es,catalogueReport:'Catalogue report',file:'File',analysisUtc:'Analysis (UTC)',identifier:'Identifier',rules:'Rules',guide:'Guide',generatedUtc:'Guide generated (UTC)',summary:'SUMMARY',products:'products',high:'High',medium:'Medium',low:'Low',averageIndicator:'Average indicator',incompleteFieldsNote:'Measures incomplete fields, not legal risk.',howToUse:'How to use it',product:'PRODUCT',indicator:'Indicator',priority:'Priority',emptyFields:'Empty fields',noneBasic:'None of the three basic fields',manufacturer:'Manufacturer',warnings:'Warnings',notProvided:'Not provided',regulatoryAssessment:'EU REGULATORY ASSESSMENT',candidateCategory:'Candidate category',confidence:'Confidence',confidenceHigh:'high',confidenceMedium:'medium',confidenceLow:'low',requiresConfirmation:'Requires confirmation',identifiedRules:'Identified legislation',officialSource:'Official source',actionsEvidence:'Actions and evidence',evidence:'Evidence',source:'Source',confirmations:'Required confirmations',savedEvidence:'SAVED EVIDENCE AND TRACEABILITY',available:'Available',notApplicable:'Not applicable',pending:'Pending',document:'Document',pageSection:'Page/section',referenceUrl:'Reference URL',note:'Note',documentaryGuide:'DOCUMENTARY GUIDE',applicability:'Applicability',whereToGet:'Where to obtain it',whatToCheck:'What to verify',advisoryAssessment:'Advisory assessment'},
  fr:{...es,catalogueReport:'Rapport du catalogue',file:'Fichier',analysisUtc:'Analyse (UTC)',identifier:'Identifiant',rules:'Règles',guide:'Guide',generatedUtc:'Guide généré (UTC)',summary:'RÉSUMÉ',products:'produits',high:'Haute',medium:'Moyenne',low:'Basse',averageIndicator:'Indicateur moyen',incompleteFieldsNote:'Mesure les champs incomplets, pas le risque juridique.',howToUse:'Comment l’utiliser',product:'PRODUIT',indicator:'Indicateur',priority:'Priorité',emptyFields:'Champs vides',noneBasic:'Aucun des trois champs de base',manufacturer:'Fabricant',warnings:'Avertissements',notProvided:'Non fourni',regulatoryAssessment:'ÉVALUATION RÉGLEMENTAIRE UE',candidateCategory:'Catégorie candidate',confidence:'Confiance',confidenceHigh:'élevée',confidenceMedium:'moyenne',confidenceLow:'faible',requiresConfirmation:'Confirmation requise',identifiedRules:'Réglementation identifiée',officialSource:'Source officielle',actionsEvidence:'Actions et preuves',evidence:'Preuve',source:'Source',confirmations:'Confirmations nécessaires',savedEvidence:'PREUVES ENREGISTRÉES ET TRAÇABILITÉ',available:'Disponible',notApplicable:'Non applicable',pending:'En attente',document:'Document',pageSection:'Page/section',referenceUrl:'URL de référence',note:'Note',documentaryGuide:'GUIDE DOCUMENTAIRE',applicability:'Applicabilité',whereToGet:'Où l’obtenir',whatToCheck:'À vérifier',advisoryAssessment:'Évaluation indicative'},
  de:{...es,catalogueReport:'Katalogbericht',file:'Datei',analysisUtc:'Analyse (UTC)',identifier:'Kennung',rules:'Regeln',guide:'Leitfaden',generatedUtc:'Leitfaden erstellt (UTC)',summary:'ZUSAMMENFASSUNG',products:'Produkte',high:'Hoch',medium:'Mittel',low:'Niedrig',averageIndicator:'Durchschnittlicher Indikator',incompleteFieldsNote:'Misst unvollständige Felder, nicht das rechtliche Risiko.',howToUse:'Verwendung',product:'PRODUKT',indicator:'Indikator',priority:'Priorität',emptyFields:'Leere Felder',noneBasic:'Keines der drei Grundfelder',manufacturer:'Hersteller',warnings:'Warnhinweise',notProvided:'Nicht angegeben',regulatoryAssessment:'EU-REGULATORISCHE BEWERTUNG',candidateCategory:'Mögliche Kategorie',confidence:'Konfidenz',confidenceHigh:'hoch',confidenceMedium:'mittel',confidenceLow:'niedrig',requiresConfirmation:'Bestätigung erforderlich',identifiedRules:'Identifizierte Vorschriften',officialSource:'Offizielle Quelle',actionsEvidence:'Maßnahmen und Nachweise',evidence:'Nachweis',source:'Quelle',confirmations:'Erforderliche Bestätigungen',savedEvidence:'GESPEICHERTE NACHWEISE UND RÜCKVERFOLGBARKEIT',available:'Verfügbar',notApplicable:'Nicht anwendbar',pending:'Ausstehend',document:'Dokument',pageSection:'Seite/Abschnitt',referenceUrl:'Referenz-URL',note:'Notiz',documentaryGuide:'DOKUMENTENLEITFADEN',applicability:'Anwendbarkeit',whereToGet:'Bezugsquelle',whatToCheck:'Zu prüfen',advisoryAssessment:'Orientierende Bewertung'},
  it:{...es,catalogueReport:'Rapporto catalogo',file:'File',analysisUtc:'Analisi (UTC)',identifier:'Identificatore',rules:'Regole',guide:'Guida',generatedUtc:'Guida generata (UTC)',summary:'RIEPILOGO',products:'prodotti',high:'Alta',medium:'Media',low:'Bassa',averageIndicator:'Indicatore medio',incompleteFieldsNote:'Misura i campi incompleti, non il rischio legale.',howToUse:'Come usarlo',product:'PRODOTTO',indicator:'Indicatore',priority:'Priorità',emptyFields:'Campi vuoti',noneBasic:'Nessuno dei tre campi base',manufacturer:'Produttore',warnings:'Avvertenze',notProvided:'Non fornito',regulatoryAssessment:'VALUTAZIONE NORMATIVA UE',candidateCategory:'Categoria candidata',confidence:'Confidenza',confidenceHigh:'alta',confidenceMedium:'media',confidenceLow:'bassa',requiresConfirmation:'Richiede conferma',identifiedRules:'Normativa identificata',officialSource:'Fonte ufficiale',actionsEvidence:'Azioni ed evidenze',evidence:'Evidenza',source:'Fonte',confirmations:'Conferme necessarie',savedEvidence:'EVIDENZE SALVATE E TRACCIABILITÀ',available:'Disponibile',notApplicable:'Non applicabile',pending:'In attesa',document:'Documento',pageSection:'Pagina/sezione',referenceUrl:'URL di riferimento',note:'Nota',documentaryGuide:'GUIDA DOCUMENTALE',applicability:'Applicabilità',whereToGet:'Dove ottenerlo',whatToCheck:'Cosa verificare',advisoryAssessment:'Valutazione orientativa'},
  pt:{...es,catalogueReport:'Relatório do catálogo',file:'Ficheiro',analysisUtc:'Análise (UTC)',identifier:'Identificador',rules:'Regras',guide:'Guia',generatedUtc:'Guia gerado (UTC)',summary:'RESUMO',products:'produtos',high:'Alta',medium:'Média',low:'Baixa',averageIndicator:'Indicador médio',incompleteFieldsNote:'Mede campos incompletos, não risco jurídico.',howToUse:'Como utilizar',product:'PRODUTO',indicator:'Indicador',priority:'Prioridade',emptyFields:'Campos vazios',noneBasic:'Nenhum dos três campos básicos',manufacturer:'Fabricante',warnings:'Avisos',notProvided:'Não fornecido',regulatoryAssessment:'AVALIAÇÃO REGULATÓRIA UE',candidateCategory:'Categoria candidata',confidence:'Confiança',confidenceHigh:'alta',confidenceMedium:'média',confidenceLow:'baixa',requiresConfirmation:'Requer confirmação',identifiedRules:'Regulamentação identificada',officialSource:'Fonte oficial',actionsEvidence:'Ações e evidências',evidence:'Evidência',source:'Fonte',confirmations:'Confirmações necessárias',savedEvidence:'EVIDÊNCIA GUARDADA E RASTREABILIDADE',available:'Disponível',notApplicable:'Não aplicável',pending:'Pendente',document:'Documento',pageSection:'Página/secção',referenceUrl:'URL de referência',note:'Nota',documentaryGuide:'GUIA DOCUMENTAL',applicability:'Aplicabilidade',whereToGet:'Onde obter',whatToCheck:'O que verificar',advisoryAssessment:'Avaliação orientativa'}
};
