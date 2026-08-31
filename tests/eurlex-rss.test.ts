import test from 'node:test';
import assert from 'node:assert/strict';
import { EURLEX_RSS_SOURCES, parseEurLexRss } from '../lib/eurlex-rss';

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>EUR-Lex</title>
<item>
<title><![CDATA[Regulation (EU) 2026/123 on batteries and packaging]]></title>
<link>https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32026R0123</link>
<description><![CDATA[New requirements for batteries, packaging and market surveillance.]]></description>
<guid>CELEX:32026R0123</guid>
<pubDate>Mon, 31 Aug 2026 06:00:00 GMT</pubDate>
</item>
<item><title>Agricultural budget allocation</title><link>https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32026R0999</link><description>Funding allocation between institutions.</description></item>
<item><title>Bad external link</title><link>https://example.com/not-official</link><description>Toy safety</description></item>
</channel></rss>`;

test('las fuentes predefinidas apuntan solo a RSS oficiales EUR-Lex', () => {
  assert.deepEqual(EURLEX_RSS_SOURCES.map(source => new URL(source.url).hostname), ['eur-lex.europa.eu','eur-lex.europa.eu','eur-lex.europa.eu']);
  assert.deepEqual(EURLEX_RSS_SOURCES.map(source => new URL(source.url).searchParams.get('rssId')), ['162','161','222']);
});

test('convierte RSS oficial en eventos relevantes y descarta ruido o enlaces externos', () => {
  const events = parseEurLexRss(rss, 'EUR-Lex · test');
  assert.equal(events.length, 1);
  assert.equal(events[0].sourceUrl, 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32026R0123');
  assert.match(events[0].officialReference ?? '', /32026R0123/);
  assert.ok(events[0].affectedKeywords?.includes('battery'));
  assert.ok(events[0].affectedKeywords?.includes('packaging'));
  assert.ok(events[0].affectedKeywords?.includes('market surveillance'));
});

test('el parser tolera entidades XML y CDATA sin introducir HTML', () => {
  const xml = '<rss><channel><item><title><![CDATA[Toys &amp; product safety]]></title><link>https://eur-lex.europa.eu/eli/reg/2026/1/oj</link><description>&lt;b&gt;Toy safety&lt;/b&gt;</description></item></channel></rss>';
  const [event] = parseEurLexRss(xml, 'EUR-Lex');
  assert.equal(event.title, 'Toys & product safety');
  assert.equal(event.summary, 'Toy safety');
  assert.ok(event.affectedKeywords?.includes('toy'));
  assert.ok(event.affectedKeywords?.includes('product safety'));
});

test('detecta familias regulatorias útiles para catálogos', () => {
  const xml = '<rss><channel><item><title>Digital product passport and CE marking</title><link>https://eur-lex.europa.eu/eli/reg/2026/2/oj</link><description>RoHS, WEEE, labelling and traceability requirements.</description></item></channel></rss>';
  const [event] = parseEurLexRss(xml, 'EUR-Lex');
  assert.ok(event.affectedKeywords?.includes('digital product passport'));
  assert.ok(event.affectedKeywords?.includes('conformity'));
  assert.ok(event.affectedKeywords?.includes('rohs'));
  assert.ok(event.affectedKeywords?.includes('weee'));
  assert.ok(event.affectedKeywords?.includes('labelling traceability'));
});
