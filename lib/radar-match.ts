import type { Product } from './analysis';
import { safeOfficialRegulatoryUrl } from './regulatory-source-url';

export type RadarChange = {
  id: string;
  title: string;
  summary: string;
  affected_keywords: string[];
  official_reference?: string;
  source_url?: string;
};

const normalize = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

export function radarMatchScore(change: RadarChange, product: Product, category = ''): number {
  const haystack = normalize([
    product.name,
    product.description,
    product.materials,
    product.intendedUse,
    product.audience,
    product.power,
    product.connectivity,
    product.composition,
    category,
  ].filter(Boolean).join(' '));

  const keywords = change.affected_keywords.map(normalize).filter(Boolean);
  if (!keywords.length) return 0;
  let score = 0;
  for (const keyword of keywords) {
    if (haystack.includes(keyword)) score += keyword.includes(' ') ? 3 : 2;
  }
  return score;
}

export function relevantRadarChanges<T extends RadarChange>(changes: T[], product: Product, category = ''): T[] {
  return changes
    .map(change => ({
      change: {
        ...change,
        ...(typeof change.source_url === 'string' ? { source_url: safeOfficialRegulatoryUrl(change.source_url) } : {}),
      } as T,
      score: radarMatchScore(change, product, category),
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.change);
}
