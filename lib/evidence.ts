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

const UUID = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const EVIDENCE_STATUSES = new Set<PersistedEvidenceStatus>(['available', 'pending', 'not_applicable']);

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function boundedString(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.length <= max;
}

export function isValidEvidenceUrl(value: string): boolean {
  if (!value || value.length > 1000) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:'
      && Boolean(url.hostname)
      && !url.username
      && !url.password
      && !/\s/.test(value);
  } catch {
    return false;
  }
}

export function safeEvidenceUrl(value: string | null | undefined): string {
  return typeof value === 'string' && isValidEvidenceUrl(value) ? value : '';
}

export function evidenceFromUnknown(value: unknown): PersistedEvidence | null {
  const source = record(value);
  if (!source) return null;
  if (source.id !== undefined && (typeof source.id !== 'string' || !UUID.test(source.id))) return null;
  if (source.analysis_id !== undefined && (typeof source.analysis_id !== 'string' || !UUID.test(source.analysis_id))) return null;
  if (typeof source.product_index !== 'number' || !Number.isInteger(source.product_index) || source.product_index < 0 || source.product_index >= 1000) return null;
  if (typeof source.evidence_key !== 'string' || !source.evidence_key || source.evidence_key.length > 120) return null;
  if (typeof source.status !== 'string' || !EVIDENCE_STATUSES.has(source.status as PersistedEvidenceStatus)) return null;
  if (!boundedString(source.note, 2000) || !boundedString(source.source_document, 240) || !boundedString(source.source_page, 80) || !boundedString(source.source_url, 1000)) return null;
  if (source.updated_at !== undefined && (typeof source.updated_at !== 'string' || !Number.isFinite(Date.parse(source.updated_at)))) return null;
  return {
    ...(typeof source.id === 'string' ? { id: source.id } : {}),
    ...(typeof source.analysis_id === 'string' ? { analysis_id: source.analysis_id } : {}),
    product_index: source.product_index,
    evidence_key: source.evidence_key,
    status: source.status as PersistedEvidenceStatus,
    note: source.note,
    source_document: source.source_document,
    source_page: source.source_page,
    source_url: safeEvidenceUrl(source.source_url),
    ...(typeof source.updated_at === 'string' ? { updated_at: source.updated_at } : {}),
  };
}

export function evidenceListFromUnknown(value: unknown): PersistedEvidence[] | null {
  if (!Array.isArray(value) || value.length > 10_000) return null;
  const rows: PersistedEvidence[] = [];
  for (const item of value) {
    const row = evidenceFromUnknown(item);
    if (!row) return null;
    rows.push(row);
  }
  return rows;
}

export async function fetchEvidenceForAnalysis(analysisId: string): Promise<PersistedEvidence[]> {
  if (typeof window === 'undefined' || !analysisId) return [];
  try {
    const response = await fetch(`/api/evidence?analysisId=${encodeURIComponent(analysisId)}`, { cache: 'no-store' });
    if (!response.ok) return [];
    const body = await response.json() as { evidence?: unknown };
    return evidenceListFromUnknown(body.evidence) ?? [];
  } catch {
    return [];
  }
}

export function evidenceForProduct(items: PersistedEvidence[], productIndex: number): PersistedEvidence[] {
  return items.filter(item => item.product_index === productIndex);
}
