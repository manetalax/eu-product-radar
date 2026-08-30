import { Product, validateProducts } from './analysis';

export type ProductInputKind = 'spreadsheet' | 'text' | 'document' | 'image';

export type ExtractedProduct = {
  name?: unknown;
  manufacturer?: unknown;
  responsible?: unknown;
  warning?: unknown;
  description?: unknown;
  materials?: unknown;
  intendedUse?: unknown;
  audience?: unknown;
  power?: unknown;
  connectivity?: unknown;
  composition?: unknown;
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

export function normalizeExtractedProducts(payload: ProductIngestionPayload): Product[] {
  const normalized = payload.products.map(product => ({
    name: asText(product.name),
    manufacturer: asText(product.manufacturer),
    responsible: asText(product.responsible),
    warning: asText(product.warning),
    description: asText(product.description),
    materials: asText(product.materials),
    intendedUse: asText(product.intendedUse),
    audience: asText(product.audience),
    power: asText(product.power),
    connectivity: asText(product.connectivity),
    composition: asText(product.composition),
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
