'use client';

import { useEffect, useState } from 'react';

type QuotaResponse = { quota?: { remaining?: number; billing?: { planId?: string } } };

export default function FreeTrialUpgradePrompt() {
  const [exhausted, setExhausted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/analyses?page=0', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then((body: QuotaResponse | null) => {
        if (!cancelled) setExhausted(body?.quota?.billing?.planId === 'free' && body?.quota?.remaining === 0);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  async function upgrade() {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseId: 'starter' }),
      });
      const body = await response.json() as { url?: string; error?: string };
      if (!response.ok || !body.url) throw new Error(body.error || 'No se ha podido abrir el pago.');
      window.location.assign(body.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se ha podido abrir el pago.');
      setBusy(false);
    }
  }

  if (!exhausted) return null;
  return <section className="card content-card" aria-label="Fin de la prueba gratuita">
    <span className="eyebrow">PRUEBA COMPLETADA</span>
    <h2>Has utilizado tus 5 productos gratuitos.</h2>
    <p className="muted">Continúa analizando sin cuota comercial de productos con ImportVerifier Unlimited por 9,95 €/mes.</p>
    <button className="btn primary" disabled={busy} onClick={() => void upgrade()}>{busy ? 'Abriendo pago seguro…' : 'Activar Unlimited · 9,95 €/mes'}</button>
    {error && <p role="alert" className="message error">{error}</p>}
  </section>;
}
