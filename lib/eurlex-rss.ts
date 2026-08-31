import type { RawRegulatoryEvent } from '@/lib/regulatory-change-ingestion';

export const EURLEX_RSS_SOURCES = [
  { id: 'parliament-council-legislation', name: 'EUR-Lex · Parliament and Council legislation', url: 'https://eur-lex.europa.eu/EN/display-feed.rss?rssId=162' },
  { id: 'commission-proposals', name: 'EUR-Lex · Commission proposals', url: 'https://eur-lex.europa.eu/EN/display-feed.rss?rssId=161' },
  { id: 'official-journal-l', name: 'EUR-Lex · Official Journal L', url: 'https://eur-lex.europa.eu/EN/display-feed.rss?rssId=222' },
] as const;

const KEYWORD_RULES: Array<[RegExp, string]> = [
  [/general product safety|product safety|gpsr/i, 'product safety'],
  [/toy|toys/i, 'toy'],
  [/battery|batteries/i, 'battery'],
  [/radio equipment|wireless|bluetooth|wi-?fi/i, 'radio equipment'],
  [/electrical|low voltage/i, 'electrical'],
  [/electromagnetic|\bemc\b/i, 'emc'],
  [/machinery|machine/i, 'machinery'],
  [/medical device/i, 'medical device'],
  [/cosmetic/i, 'cosmetic'],
  [/food contact|foodstuff|food packaging/i, 'food contact'],
  [/textile/i, 'textile'],
  [/footwear/i, 'footwear'],
  [/detergent/i, 'detergent'],
  [/chemical|\breach\b|\bclp\b/i, 'chemical'],
  [/packaging|packaging waste/i, 'packaging'],
  [/ecodesign|energy label/i, 'ecodesign'],
  [/construction product/i, 'construction product'],
  [/personal protective|\bppe\b/i, 'ppe'],
  [/market surveillance/i, 'market surveillance'],
  [/consumer product/i, 'consumer product'],
  [/ce marking|conformity assessment|declaration of conformity/i, 'conformity'],
  [/digital product passport/i, 'digital product passport'],
  [/restriction of hazardous substances|\brohs\b/i, 'rohs'],
  [/waste electrical|\bweee\b/i, 'weee'],
  [/labelling|labeling|traceability/i, 'labelling traceability'],
];

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-fA-F]+);/g, (_match, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_match, decimal: string) => String.fromCodePoint(Number(decimal)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function clean(value: string): string {
  return decodeXml(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tag(block: string, name: string): string {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i'));
  return match ? clean(match[1]) : '';
}

function officialReference(guid: string, link: string, title: string): string {
  const celex = `${guid} ${link}`.match(/CELEX[:=%2F]*([0-9A-Z]{8,})/i)?.[1];
  if (celex) return `CELEX ${celex}`;
  const eli = link.match(/\/eli\/([^?#]+)/i)?.[1];
  if (eli) return `ELI ${eli}`.slice(0, 240);
  return title.match(/\b(?:Regulation|Directive|Decision)\s*\([^)]*\)\s*(?:No\s*)?[0-9/]+/i)?.[0]?.slice(0, 240) ?? '';
}

function keywords(text: string): string[] {
  return Array.from(new Set(KEYWORD_RULES.filter(([pattern]) => pattern.test(text)).map(([, keyword]) => keyword)));
}

export function parseEurLexRss(xml: string, sourceName: string): RawRegulatoryEvent[] {
  const items = [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].slice(0, 200);
  const events: RawRegulatoryEvent[] = [];
  for (const item of items) {
    const block = item[1];
    const title = tag(block, 'title');
    const link = tag(block, 'link');
    if (!title || !link) continue;
    let url: URL;
    try { url = new URL(link); } catch { continue; }
    if (url.protocol !== 'https:' || url.hostname !== 'eur-lex.europa.eu') continue;
    const description = tag(block, 'description');
    const guid = tag(block, 'guid');
    const published = tag(block, 'pubDate') || tag(block, 'dc:date');
    const affectedKeywords = keywords(`${title} ${description}`);
    if (!affectedKeywords.length) continue;
    events.push({
      sourceName,
      sourceUrl: url.toString(),
      title,
      summary: description.slice(0, 6000),
      publishedAt: published || null,
      severity: 'review',
      affectedKeywords,
      officialReference: officialReference(guid, link, title),
    });
  }
  return events;
}

export async function fetchEurLexEvents(fetchImpl: typeof fetch = fetch): Promise<RawRegulatoryEvent[]> {
  const results = await Promise.all(EURLEX_RSS_SOURCES.map(async source => {
    const response = await fetchImpl(source.url, {
      headers: { Accept: 'application/rss+xml, application/xml, text/xml;q=0.9', 'User-Agent': 'ImportVerifier-Regulatory-Radar/1.0' },
      redirect: 'follow',
      signal: AbortSignal.timeout(15_000),
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`EUR-Lex RSS ${source.id} respondió ${response.status}.`);
    const text = await response.text();
    if (text.length > 4 * 1024 * 1024) throw new Error(`EUR-Lex RSS ${source.id} supera el tamaño permitido.`);
    return parseEurLexRss(text, source.name);
  }));
  return results.flat();
}
