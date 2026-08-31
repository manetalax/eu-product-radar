const FEED_URL = 'https://eur-lex.europa.eu/EN/display-feed.rss?rssId=162';
const SITE_URL = (process.env.IMPORTVERIFIER_SITE_URL || 'https://importverifier.netlify.app').replace(/\/$/, '');
const secret = process.env.REGULATORY_INGEST_SECRET?.trim() || '';

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tag(item: string, name: string) {
  const match = item.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i'));
  return match ? decodeXml(match[1]) : '';
}

function keywords(text: string) {
  const haystack = text.toLocaleLowerCase('en-US');
  const dictionary = [
    'product safety', 'consumer', 'toy', 'children', 'electrical', 'radio', 'battery', 'batteries',
    'packaging', 'textile', 'footwear', 'chemical', 'cosmetic', 'food contact', 'machinery', 'medical device',
    'import', 'market surveillance', 'labelling', 'labeling', 'traceability', 'conformity', 'ce marking', 'gpsr',
  ];
  return dictionary.filter(term => haystack.includes(term)).slice(0, 20);
}

function parseFeed(xml: string) {
  const items = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];
  return items.slice(0, 100).flatMap(item => {
    const title = tag(item, 'title');
    const link = tag(item, 'link');
    if (!title || !link) return [];
    let url: URL;
    try { url = new URL(link); } catch { return []; }
    if (url.protocol !== 'https:' || url.hostname !== 'eur-lex.europa.eu') return [];
    const description = tag(item, 'description');
    const publishedAt = tag(item, 'pubDate') || tag(item, 'dc:date');
    const officialReference = tag(item, 'guid');
    const combined = `${title} ${description}`;
    return [{
      sourceName: 'EUR-Lex',
      sourceUrl: url.toString(),
      title,
      summary: description.slice(0, 6000),
      publishedAt: publishedAt || null,
      severity: 'review' as const,
      affectedKeywords: keywords(combined),
      officialReference: officialReference.slice(0, 240),
    }];
  });
}

async function main() {
  if (secret.length < 32) throw new Error('REGULATORY_INGEST_SECRET no está configurado o es demasiado corto.');
  const response = await fetch(FEED_URL, { headers: { 'User-Agent': 'ImportVerifier-Regulatory-Radar/1.0', Accept: 'application/rss+xml, application/xml, text/xml' } });
  if (!response.ok) throw new Error(`EUR-Lex RSS respondió ${response.status}.`);
  const events = parseFeed(await response.text());
  if (!events.length) throw new Error('EUR-Lex RSS no devolvió eventos utilizables.');

  const ingest = await fetch(`${SITE_URL}/api/internal/regulatory-ingest`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ events }),
  });
  const body = await ingest.text();
  if (!ingest.ok) throw new Error(`Ingesta ImportVerifier respondió ${ingest.status}: ${body.slice(0, 500)}`);
  console.log(`EUR-Lex Radar: ${events.length} eventos enviados. ${body}`);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
