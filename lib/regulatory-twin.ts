import type { MarketCode } from './markets';

export type EvidenceStatus = 'missing' | 'supplied' | 'needs_review' | 'verified_source';

export type RegulatoryEvidenceLink = {
  requirementId: string;
  title: string;
  status: EvidenceStatus;
  sourceName?: string;
  sourcePage?: number;
  excerpt?: string;
  sourceUrl?: string;
};

export type RegulatoryTwinSnapshot = {
  productId: string;
  productName: string;
  market: MarketCode;
  category: string;
  confidence: 'low' | 'medium' | 'high';
  ruleVersion: string;
  updatedAt: string;
  readiness: number;
  applicableRules: string[];
  evidence: RegulatoryEvidenceLink[];
  uncertainties: string[];
  actions: string[];
};

export function regulatoryReadiness(evidence: RegulatoryEvidenceLink[]): number {
  if (!evidence.length) return 0;
  const weights: Record<EvidenceStatus, number> = {
    missing: 0,
    supplied: 0.5,
    needs_review: 0.25,
    verified_source: 1,
  };
  return Math.round(100 * evidence.reduce((sum, item) => sum + weights[item.status], 0) / evidence.length);
}

export type RegulatoryImpact = {
  productId: string;
  productName: string;
  severity: 'info' | 'review' | 'action';
  reason: string;
  affectedRule: string;
};

export function rankRegulatoryImpacts(items: RegulatoryImpact[]) {
  const weight = { action: 3, review: 2, info: 1 } as const;
  return [...items].sort((a, b) => weight[b.severity] - weight[a.severity]);
}
