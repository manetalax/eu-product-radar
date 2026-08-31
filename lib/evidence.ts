export type PersistedEvidenceStatus = 'available' | 'pending' | 'not_applicable';

export type PersistedEvidence = {
  id?: string;
  analysis_id?: string;
  product_index: number;
  evidence_key: string;
  status: PersistedEvidenceStatus;
  note: string;
  source_document: string;
  source_page: string;
  source_url: string;
  updated_at?: string;
};

export async function fetchEvidenceForAnalysis(analysisId: string): Promise<PersistedEvidence[]> {
  if (typeof window === 'undefined' || !analysisId) return [];
  try {
    const response = await fetch(`/api/evidence?analysisId=${encodeURIComponent(analysisId)}`, { cache: 'no-store' });
    if (!response.ok) return [];
    const body = await response.json() as { evidence?: PersistedEvidence[] };
    return Array.isArray(body.evidence) ? body.evidence : [];
  } catch {
    return [];
  }
}

export function evidenceForProduct(items: PersistedEvidence[], productIndex: number): PersistedEvidence[] {
  return items.filter(item => item.product_index === productIndex);
}
