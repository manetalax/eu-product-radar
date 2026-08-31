import type { Language } from './landing-i18n';

export const PLATFORM_CAPABILITY_IDS = [
  'catalog-import',
  'catalog-refresh',
  'compliance-status-sync',
  'listing-import',
  'asin-monitoring',
  'compliance-alerts',
] as const;

export type PlatformCapabilityId = typeof PLATFORM_CAPABILITY_IDS[number];

const labels: Record<Language, Record<PlatformCapabilityId, string>> = {
  es: {
    'catalog-import': 'Importación de catálogo',
    'catalog-refresh': 'Actualización de catálogo',
    'compliance-status-sync': 'Sincronización del estado regulatorio',
    'listing-import': 'Importación de anuncios',
    'asin-monitoring': 'Seguimiento de ASIN',
    'compliance-alerts': 'Alertas regulatorias',
  },
  en: {
    'catalog-import': 'Catalogue import',
    'catalog-refresh': 'Catalogue refresh',
    'compliance-status-sync': 'Regulatory status sync',
    'listing-import': 'Listing import',
    'asin-monitoring': 'ASIN monitoring',
    'compliance-alerts': 'Regulatory alerts',
  },
  fr: {
    'catalog-import': 'Importation du catalogue',
    'catalog-refresh': 'Actualisation du catalogue',
    'compliance-status-sync': 'Synchronisation du statut réglementaire',
    'listing-import': 'Importation des annonces',
    'asin-monitoring': 'Suivi des ASIN',
    'compliance-alerts': 'Alertes réglementaires',
  },
  de: {
    'catalog-import': 'Katalogimport',
    'catalog-refresh': 'Katalogaktualisierung',
    'compliance-status-sync': 'Synchronisierung des regulatorischen Status',
    'listing-import': 'Angebotsimport',
    'asin-monitoring': 'ASIN-Überwachung',
    'compliance-alerts': 'Regulatorische Warnungen',
  },
  it: {
    'catalog-import': 'Importazione del catalogo',
    'catalog-refresh': 'Aggiornamento del catalogo',
    'compliance-status-sync': 'Sincronizzazione dello stato normativo',
    'listing-import': 'Importazione delle inserzioni',
    'asin-monitoring': 'Monitoraggio ASIN',
    'compliance-alerts': 'Avvisi normativi',
  },
  pt: {
    'catalog-import': 'Importação do catálogo',
    'catalog-refresh': 'Atualização do catálogo',
    'compliance-status-sync': 'Sincronização do estado regulatório',
    'listing-import': 'Importação de anúncios',
    'asin-monitoring': 'Monitorização de ASIN',
    'compliance-alerts': 'Alertas regulatórios',
  },
};

export function platformCapabilityLabel(language: Language, capability: string): string {
  if ((PLATFORM_CAPABILITY_IDS as readonly string[]).includes(capability)) {
    return labels[language][capability as PlatformCapabilityId];
  }
  return capability;
}
