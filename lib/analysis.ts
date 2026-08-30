import { MarketCode, MARKETS, marketCodeOrEu } from './markets';
import { assessEuRegulatory, EuRegulatoryAssessment } from './eu-regulatory-engine';

export const LEGACY_RULE_VERSION = 'missing-fields-v1';
export const RULE_VERSION = 'market-readiness-v2';
export const SUPPORTED_RULE_VERSIONS = [LEGACY_RULE_VERSION, RULE_VERSION] as const;
export const MAX_PRODUCTS = 1000;
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export type Product = { name: string; manufacturer: string; responsible: string; warning: string };
export type Result = {
  name: string;
  score: number;
  priority: 'ALTA' | 'MEDIA' | 'BAJA';
  missing: string[];
  regulatory?: EuRegulatoryAssessment;
};
export type Analysis = { id: string; filename: string; created_at: string; rule_version: string; market_code?: MarketCode; products: Product[] };
export type AnalysisSummary = Omit<Analysis, 'products'> & { product_count: number };

export function supportsRuleVersion(value: unknown): boolean {
  return typeof value === 'string' && (SUPPORTED_RULE_VERSIONS as readonly string[]).includes(value);
}

export function analysisMarket(analysis: Pick<Analysis, 'market_code'>): MarketCode {
  return marketCodeOrEu(analysis.market_code);
}

export function validateProducts(input: unknown): Product[] {
  if (!Array.isArray(input) || input.length === 0) throw new Error('El archivo no contiene productos.');
  if (input.length > MAX_PRODUCTS) throw new Error(`El límite de esta primera versión es de ${MAX_PRODUCTS} productos por archivo.`);
  return input.map((row, i) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error(`La fila ${i + 2} no es válida.`);
    const product = {} as Product;
    for (const key of ['name', 'manufacturer', 'responsible', 'warning'] as const) {
      if (typeof row[key] !== 'string' || row[key].length > 1000) throw new Error(`Revisa el campo ${key} de la fila ${i + 2}: máximo 1000 caracteres.`);
      product[key] = row[key].trim();
    }
    if (!product.name) throw new Error(`Falta el nombre del producto en la fila ${i + 2}.`);
    return product;
  });
}

export function analyze(products: Product[], marketCode: MarketCode = 'EU'): Result[] {
  const operatorLabel = MARKETS[marketCode].operatorFieldLabel;
  return products.map(p => {
    const missing: string[] = [];
    if (!p.manufacturer.trim()) missing.push('Fabricante');
    if (!p.responsible.trim()) missing.push(operatorLabel);
    if (!p.warning.trim()) missing.push('Seguridad/advertencias');
    const score = 8 + missing.length * 28;
    return {
      name: p.name,
      score,
      priority: score >= 60 ? 'ALTA' : score >= 30 ? 'MEDIA' : 'BAJA',
      missing,
      regulatory: marketCode === 'EU' ? assessEuRegulatory(p) : undefined,
    };
  });
}
