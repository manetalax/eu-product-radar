import { createHash } from 'node:crypto';

export type RegulatorySeverity = 'info' | 'review' | 'action';

export type RawRegulatoryEvent = {
  sourceName: string;
  sourceUrl: string;
  title: string;
  summary?: string;
  publishedAt?: string | null;
  effectiveAt?: string | null;
  severity?: RegulatorySeverity;
  affectedKeywords?: string[];
  officialReference?: string;
};

export type NormalizedRegulatoryEvent = {
  fingerprint: string;
  source_name: string;
  source_url: string;
  title: string;
  summary: string;
  published_at: string | null;
  effective_at: string | null;
  severity: RegulatorySeverity;
  affected_keywords: string[];
  official_reference: string;
  active: true;
  last_seen_at: string;
};

const OFFICIAL_HOSTS = [
  'eur-lex.europa.eu',
  'ec.europa.eu',
  'commission.europa.eu',
  'webgate.ec.europa.eu',
] as const;

function compact(value: unknown, max: number): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '';
}

function isoOrNull(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function officialUrl(value: unknown): string {
  const raw = compact(value, 2000);
  if (!raw) throw new Error('Falta la URL oficial del evento regulatorio.');
  const url = new URL(raw);
  if (url.protocol !== 'https:' || !OFFICIAL_HOSTS.some(host => url.hostname === host || url.hostname.endsWith(`.${host}`))) {
    throw new Error('La fuente regulatoria no pertenece a un dominio oficial UE permitido.');
  }
  url.hash = '';
  return url.toString();
}

export function normalizeRegulatoryEvent(input: RawRegulatoryEvent, now = new Date()): NormalizedRegulatoryEvent {
  const sourceName = compact(input.sourceName, 160);
  const sourceUrl = officialUrl(input.sourceUrl);
  const title = compact(input.title, 500);
  if (!sourceName || !title) throw new Error('La fuente y el título del evento regulatorio son obligatorios.');

  const summary = compact(input.summary, 6000);
  const officialReference = compact(input.officialReference, 240);
  const keywords = Array.from(new Set((input.affectedKeywords ?? [])
    .map(item => compact(item, 80).toLocaleLowerCase('en-US'))
    .filter(Boolean)))
    .slice(0, 40);
  const severity: RegulatorySeverity = input.severity === 'action' || input.severity === 'info' ? input.severity : 'review';
  const publishedAt = isoOrNull(input.publishedAt);
  const effectiveAt = isoOrNull(input.effectiveAt);

  const fingerprintMaterial = [sourceUrl, title.toLocaleLowerCase('en-US'), officialReference.toLocaleLowerCase('en-US'), publishedAt ?? ''].join('|');
  const fingerprint = createHash('sha256').update(fingerprintMaterial).digest('hex');

  return {
    fingerprint,
    source_name: sourceName,
    source_url: sourceUrl,
    title,
    summary,
    published_at: publishedAt,
    effective_at: effectiveAt,
    severity,
    affected_keywords: keywords,
    official_reference: officialReference,
    active: true,
    last_seen_at: now.toISOString(),
  };
}

export function normalizeRegulatoryEvents(inputs: RawRegulatoryEvent[], now = new Date()): NormalizedRegulatoryEvent[] {
  const byFingerprint = new Map<string, NormalizedRegulatoryEvent>();
  for (const input of inputs.slice(0, 500)) {
    const event = normalizeRegulatoryEvent(input, now);
    byFingerprint.set(event.fingerprint, event);
  }
  return [...byFingerprint.values()];
}
