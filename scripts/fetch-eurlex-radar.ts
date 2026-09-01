import { fetchEurLexEvents } from '../lib/eurlex-rss';

const SITE_URL = (process.env.IMPORTVERIFIER_SITE_URL || 'https://importverifier.netlify.app').replace(/\/$/, '');
const secret = process.env.REGULATORY_INGEST_SECRET?.trim() || '';

async function main() {
  if (secret.length < 32) throw new Error('REGULATORY_INGEST_SECRET no está configurado o es demasiado corto.');
  const events = await fetchEurLexEvents();
  if (!events.length) throw new Error('EUR-Lex no devolvió eventos utilizables.');

  const ingest = await fetch(`${SITE_URL}/api/internal/regulatory-ingest`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ events: events.slice(0, 500) }),
  });
  const body = await ingest.text();
  if (!ingest.ok) throw new Error(`Ingesta ImportVerifier respondió ${ingest.status}: ${body.slice(0, 500)}`);
  console.log(`EUR-Lex Radar: ${Math.min(events.length, 500)} eventos enviados. ${body}`);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
