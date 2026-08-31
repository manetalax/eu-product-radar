import type { MarketCode } from './markets';

const OFFICIAL_REGULATORY_HOSTS = [
  'eur-lex.europa.eu',
  'ec.europa.eu',
  'commission.europa.eu',
  'webgate.ec.europa.eu',
] as const;

const MARKET_GUIDANCE_HOSTS: Record<MarketCode, readonly string[]> = {
  EU: [
    'eur-lex.europa.eu',
    'single-market-economy.ec.europa.eu',
    'europa.eu',
  ],
  US: ['www.cpsc.gov'],
  CN: ['www.customs.gov.cn'],
  GB: ['www.gov.uk'],
  JP: ['www.meti.go.jp'],
};

function safeHttpsUrlForHosts(value: unknown, allowedHosts: readonly string[], allowSubdomains: boolean): string {
  if (typeof value !== 'string' || !value || value.length > 2000 || /\s/.test(value)) return '';
  try {
    const url = new URL(value);
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.port ||
      !url.hostname ||
      !allowedHosts.some(host => url.hostname === host || (allowSubdomains && url.hostname.endsWith(`.${host}`)))
    ) return '';
    url.hash = '';
    return url.toString();
  } catch {
    return '';
  }
}

export function safeOfficialRegulatoryUrl(value: unknown): string {
  return safeHttpsUrlForHosts(value, OFFICIAL_REGULATORY_HOSTS, true);
}

export function requireOfficialRegulatoryUrl(value: unknown): string {
  const safe = safeOfficialRegulatoryUrl(value);
  if (!safe) throw new Error('La fuente regulatoria no pertenece a un dominio oficial UE permitido o no es una URL HTTPS segura.');
  return safe;
}

export function safeMarketGuidanceUrl(value: unknown, marketCode: MarketCode): string {
  return safeHttpsUrlForHosts(value, MARKET_GUIDANCE_HOSTS[marketCode], false);
}

export function requireMarketGuidanceUrl(value: unknown, marketCode: MarketCode): string {
  const safe = safeMarketGuidanceUrl(value, marketCode);
  if (!safe) throw new Error(`La fuente de guía ${marketCode} no pertenece al dominio oficial permitido o no es una URL HTTPS segura.`);
  return safe;
}
