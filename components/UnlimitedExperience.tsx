'use client';

import { useEffect, useState } from 'react';

type QuotaResponse = { quota?: { billing?: { planId?: string } } };

export default function UnlimitedExperience() {
  const [unlimited, setUnlimited] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/analyses?page=0', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then((body: QuotaResponse | null) => {
        if (!cancelled) setUnlimited(body?.quota?.billing?.planId === 'starter');
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!unlimited) return null;
  return <div role="status" className="notice trust-notice"><strong>Unlimited activo · 9,95 €/mes.</strong> Analiza sin cuota comercial de productos. Se mantienen únicamente protecciones técnicas razonables contra abuso automatizado.</div>;
}
