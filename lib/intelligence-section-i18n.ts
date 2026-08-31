import type { Language } from './landing-i18n';

export type IntelligenceSectionCopy = {
  suiteEyebrow: string;
  twinTitle: string;
  radarTitle: string;
  connectTitle: string;
};

export const intelligenceSectionCopy: Record<Language, IntelligenceSectionCopy> = {
  es: {
    suiteEyebrow: 'SUITE DE INTELIGENCIA IMPORTVERIFIER',
    twinTitle: 'Gemelo Regulatorio del Producto',
    radarTitle: 'Radar de Impacto Regulatorio',
    connectTitle: 'Conexiones',
  },
  en: {
    suiteEyebrow: 'IMPORTVERIFIER INTELLIGENCE SUITE',
    twinTitle: 'Product Regulatory Twin',
    radarTitle: 'Regulatory Impact Radar',
    connectTitle: 'Connect',
  },
  fr: {
    suiteEyebrow: 'SUITE INTELLIGENCE IMPORTVERIFIER',
    twinTitle: 'Jumeau réglementaire du produit',
    radarTitle: 'Radar d’impact réglementaire',
    connectTitle: 'Connexions',
  },
  de: {
    suiteEyebrow: 'IMPORTVERIFIER INTELLIGENCE-SUITE',
    twinTitle: 'Regulatorischer Produktzwilling',
    radarTitle: 'Radar für regulatorische Auswirkungen',
    connectTitle: 'Verbindungen',
  },
  it: {
    suiteEyebrow: 'SUITE INTELLIGENCE IMPORTVERIFIER',
    twinTitle: 'Gemello normativo del prodotto',
    radarTitle: 'Radar dell’impatto normativo',
    connectTitle: 'Connessioni',
  },
  pt: {
    suiteEyebrow: 'SUITE DE INTELIGÊNCIA IMPORTVERIFIER',
    twinTitle: 'Gémeo regulatório do produto',
    radarTitle: 'Radar de impacto regulatório',
    connectTitle: 'Ligações',
  },
};
