const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || 'https://importverifier.netlify.app').replace(/\/$/, '');

export default async () => {
  const secret = process.env.REGULATORY_INGEST_SECRET?.trim() || '';
  if (secret.length < 32) throw new Error('REGULATORY_INGEST_SECRET no está configurado o es demasiado corto.');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch(`${siteUrl()}/api/internal/regulatory-refresh`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
      signal: controller.signal,
    });
    const body = await response.text();
    if (!response.ok) throw new Error(`Radar refresh respondió ${response.status}: ${body.slice(0, 500)}`);
    console.log(`ImportVerifier Regulatory Radar actualizado: ${body.slice(0, 1000)}`);
  } finally {
    clearTimeout(timeout);
  }
};

export const config = {
  schedule: '17 */6 * * *',
};
