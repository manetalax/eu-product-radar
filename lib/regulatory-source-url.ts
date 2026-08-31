const OFFICIAL_REGULATORY_HOSTS = [
  'eur-lex.europa.eu',
  'ec.europa.eu',
  'commission.europa.eu',
  'webgate.ec.europa.eu',
] as const;

export function safeOfficialRegulatoryUrl(value: unknown): string {
  if (typeof value !== 'string' || !value || value.length > 2000 || /\s/.test(value)) return '';
  try {
    const url = new URL(value);
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.port ||
      !url.hostname ||
      !OFFICIAL_REGULATORY_HOSTS.some(host => url.hostname === host || url.hostname.endsWith(`.${host}`))
    ) return '';
    url.hash = '';
    return url.toString();
  } catch {
    return '';
  }
}

export function requireOfficialRegulatoryUrl(value: unknown): string {
  const safe = safeOfficialRegulatoryUrl(value);
  if (!safe) throw new Error('La fuente regulatoria no pertenece a un dominio oficial UE permitido o no es una URL HTTPS segura.');
  return safe;
}
