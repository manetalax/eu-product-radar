'use client';

import { useEffect, useState } from 'react';

type QuotaResponse = { quota?: { billing?: { planId?: string; planName?: string } } };

export default function UnlimitedExperience() {
  const [unlimited, setUnlimited] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/analyses?page=0', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then((body: QuotaResponse | null) => {
        if (cancelled) return;
        const active = body?.quota?.billing?.planId === 'starter';
        setUnlimited(active);
        document.body.classList.toggle('has-unlimited-plan', active);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      document.body.classList.remove('has-unlimited-plan');
    };
  }, []);

  return <>
    <style>{`
      /* The one-time audit and legacy plan ladder are no longer part of the public offer. */
      .plan-interest { display: none !important; }

      /* Never expose the internal fair-use ceiling as a customer quota. */
      body.has-unlimited-plan .side-quota .quota-track,
      body.has-unlimited-plan .side-quota small,
      body.has-unlimited-plan .side-quota .toprow strong,
      body.has-unlimited-plan .quota-inline,
      body.has-unlimited-plan .settings-quota,
      body.has-unlimited-plan .settings-grid .quota-track,
      body.has-unlimited-plan .settings-grid > .card:nth-child(2) > p.muted { display: none !important; }

      body.has-unlimited-plan .side-quota .toprow::after {
        content: 'Uso ilimitado';
        font-weight: 800;
      }
      body.has-unlimited-plan .side-quota .side-upgrade { display: none !important; }
      body.has-unlimited-plan .settings-grid > .card:nth-child(2)::after {
        content: 'Uso ilimitado de productos sujeto únicamente a protecciones técnicas razonables contra abuso automatizado.';
        display: block;
        margin-top: .8rem;
        color: var(--muted, #667085);
        font-size: .92rem;
        line-height: 1.5;
      }
    `}</style>
    {unlimited && <div role="status" className="notice trust-notice"><strong>Unlimited activo · 9,95 €/mes.</strong> Analiza sin cuota comercial de productos. Se mantienen únicamente protecciones técnicas razonables contra abuso automatizado.</div>}
  </>;
}
