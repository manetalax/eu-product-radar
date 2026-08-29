export const MARKET_CODES = ['EU', 'US', 'CN', 'GB', 'JP'] as const;
export type MarketCode = typeof MARKET_CODES[number];
export const ACTIVE_MARKET_CODES = ['EU'] as const satisfies readonly MarketCode[];

export type Market = {
  code: MarketCode;
  flag: string;
  name: string;
  shortName: string;
  rank: number;
  imports2024: string;
  operatorFieldLabel: string;
  operatorLongLabel: string;
  promise: string;
  sourceLabel: string;
  sourceUrl: string;
};

export const MARKETS: Record<MarketCode, Market> = {
  US: {
    code: 'US', flag: '🇺🇸', name: 'Estados Unidos', shortName: 'EE. UU.', rank: 1,
    imports2024: '3,36 billones USD en importaciones', operatorFieldLabel: 'Importador de registro',
    operatorLongLabel: 'Importador o emisor del certificado en EE. UU.',
    promise: 'Certificación CPSC cuando aplica, trazabilidad e información del importador.',
    sourceLabel: 'CPSC · Testing & Certification', sourceUrl: 'https://www.cpsc.gov/Business--Manufacturing/Testing-Certification',
  },
  EU: {
    code: 'EU', flag: '🇪🇺', name: 'Unión Europea', shortName: 'UE', rank: 2,
    imports2024: '2,63 billones USD en importaciones extra-UE', operatorFieldLabel: 'Operador responsable UE',
    operatorLongLabel: 'Operador económico responsable en la UE',
    promise: 'GPSR, operador responsable, advertencias y marcado CE cuando aplica.',
    sourceLabel: 'EUR-Lex · Reglamento (UE) 2023/988', sourceUrl: 'https://eur-lex.europa.eu/eli/reg/2023/988/oj?locale=es',
  },
  CN: {
    code: 'CN', flag: '🇨🇳', name: 'China', shortName: 'China', rank: 3,
    imports2024: '2,59 billones USD en importaciones', operatorFieldLabel: 'Importador en China',
    operatorLongLabel: 'Importador u operador responsable en China',
    promise: 'Etiquetado local, información del importador y CCC cuando el producto está en catálogo.',
    sourceLabel: 'Aduanas de China · CCC', sourceUrl: 'https://www.customs.gov.cn/customs/2023-04/28/article_2025121223300582639.html',
  },
  GB: {
    code: 'GB', flag: '🇬🇧', name: 'Reino Unido', shortName: 'Reino Unido', rank: 4,
    imports2024: '816.000 M$ en importaciones', operatorFieldLabel: 'Importador en GB',
    operatorLongLabel: 'Importador o persona responsable en Gran Bretaña',
    promise: 'Seguridad general, datos del importador y marcado UKCA o CE según el producto.',
    sourceLabel: 'GOV.UK · Product safety', sourceUrl: 'https://www.gov.uk/guidance/product-safety-law-compliance-advice-for-manufacturers-and-importers',
  },
  JP: {
    code: 'JP', flag: '🇯🇵', name: 'Japón', shortName: 'Japón', rank: 5,
    imports2024: '743.000 M$ en importaciones', operatorFieldLabel: 'Importador en Japón',
    operatorLongLabel: 'Importador o empresa notificante en Japón',
    promise: 'Clasificación del producto, obligaciones del importador y marca PSE cuando aplica.',
    sourceLabel: 'METI · Product Safety', sourceUrl: 'https://www.meti.go.jp/english/policy/economy/consumer/product_safety/pslpg_procedure/index.html',
  },
};

export const MARKETS_BY_RANK = [...MARKET_CODES].sort((a, b) => MARKETS[a].rank - MARKETS[b].rank).map(code => MARKETS[code]);

export function isMarketCode(value: unknown): value is MarketCode {
  return typeof value === 'string' && (MARKET_CODES as readonly string[]).includes(value);
}

export function isActiveMarketCode(value: unknown): value is typeof ACTIVE_MARKET_CODES[number] {
  return isMarketCode(value) && (ACTIVE_MARKET_CODES as readonly string[]).includes(value);
}

export function marketCodeOrEu(value: unknown): MarketCode {
  return isMarketCode(value) ? value : 'EU';
}
