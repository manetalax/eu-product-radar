import { Product, validateProducts } from './analysis';

export type ProductInputKind = 'spreadsheet' | 'text' | 'document' | 'image';

export type ExtractedProduct = {
  name?: unknown;
  manufacturer?: unknown;
  responsible?: unknown;
  warning?: unknown;
};

export type ProductIngestionPayload = {
  kind: ProductInputKind;
  sourceName: string;
  products: ExtractedProduct[];
};

function asText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

/**
 * Normalizes product candidates extracted from any supported input surface
 * into the single Product contract consumed by the regulatory pipeline.
 *
 * Spreadsheet parsing can keep using parseProducts directly. Future text,
 * document and image adapters should only be responsible for extraction and
 * should pass their candidates through this function before analysis/storage.
 */
export function normalizeExtractedProducts(payload: ProductIngestionPayload): Product[] {
  const normalized = payload.products.map(product => ({
    name: asText(product.name),
    manufacturer: asText(product.manufacturer),
    responsible: asText(product.responsible),
    warning: asText(product.warning),
  }));

  return validateProducts(normalized);
}

export function defaultSourceName(kind: ProductInputKind): string {
  switch (kind) {
    case 'text': return 'Texto introducido';
    case 'document': return 'Documento';
    case 'image': return 'Imagen';
    case 'spreadsheet': return 'Hoja de cálculo';
  }
}
