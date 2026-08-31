export const PLATFORM_IDS = ['shopify', 'amazon', 'etsy'] as const;
export type PlatformId = typeof PLATFORM_IDS[number];

export type PlatformConnector = {
  id: PlatformId;
  name: string;
  status: 'foundation' | 'ready';
  capabilities: readonly string[];
  domains: readonly string[];
};

export const PLATFORM_CONNECTORS: readonly PlatformConnector[] = [
  {
    id: 'shopify',
    name: 'Shopify',
    status: 'foundation',
    capabilities: ['catalog-import', 'catalog-refresh', 'compliance-status-sync'],
    domains: ['myshopify.com', 'shopify.com'],
  },
  {
    id: 'amazon',
    name: 'Amazon',
    status: 'foundation',
    capabilities: ['listing-import', 'asin-monitoring', 'compliance-alerts'],
    domains: ['amazon.es', 'amazon.de', 'amazon.fr', 'amazon.it', 'amazon.nl', 'amazon.pl', 'amazon.se', 'amazon.com'],
  },
  {
    id: 'etsy',
    name: 'Etsy',
    status: 'foundation',
    capabilities: ['listing-import', 'catalog-refresh', 'compliance-status-sync'],
    domains: ['etsy.com'],
  },
] as const;

function hostnameMatches(hostname: string, domain: string) {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

export function detectPlatform(input: string): PlatformId | null {
  if (typeof input !== 'string' || input.length === 0 || /\s/.test(input)) return null;

  let url: URL;
  try { url = new URL(input); }
  catch { return null; }

  if (url.protocol !== 'https:' || url.username || url.password || !url.hostname) return null;

  const hostname = url.hostname.toLowerCase();
  return PLATFORM_CONNECTORS.find(connector => connector.domains.some(domain => hostnameMatches(hostname, domain)))?.id ?? null;
}

export function platformConnector(id: PlatformId): PlatformConnector {
  return PLATFORM_CONNECTORS.find(connector => connector.id === id)!;
}

export type ExternalProductCandidate = {
  externalId: string;
  name: string;
  url?: string;
  imageUrl?: string;
  description?: string;
  manufacturer?: string;
  warning?: string;
  metadata?: Record<string, string>;
};

export type PlatformCatalogPage = {
  platform: PlatformId;
  products: ExternalProductCandidate[];
  nextCursor?: string;
};

export interface CatalogConnectorAdapter {
  platform: PlatformId;
  importCatalog(cursor?: string): Promise<PlatformCatalogPage>;
}

// Marketplace-specific OAuth/API adapters implement this interface. Keeping the
// boundary here prevents platform credentials and vendor schemas from leaking into
// the regulatory engine or persisted analysis model.
