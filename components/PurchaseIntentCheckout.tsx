'use client';

import { useEffect, useRef, useState } from 'react';
import { billingText } from '@/lib/billing-i18n';
import { clearPlanIntent, readPlanIntent } from '@/lib/services/plan-interest';
import { useLanguage } from '@/lib/use-language';

const copy = {
  es: { continuing: 'Continuando al pago seguro de Unlimited…', dismiss: 'Cerrar' },
  en: { continuing: 'Continuing to secure Unlimited checkout…', dismiss: 'Dismiss' },
  fr: { continuing: 'Redirection vers le paiement sécurisé Unlimited…', dismiss: 'Fermer' },
  de: { continuing: 'Weiter zur sicheren Unlimited-Zahlung…', dismiss: 'Schließen' },
  it: { continuing: 'Proseguimento al pagamento sicuro Unlimited…', dismiss: 'Chiudi' },
  pt: { continuing: 'A continuar para o pagamento seguro Unlimited…', dismiss: 'Fechar' },
} as const;

export default function PurchaseIntentCheckout() {
  const { language } = useLanguage();
  const started = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const intent = readPlanIntent();
    if (!intent) return;
    clearPlanIntent();
    if (intent !== 'starter') return;

    setBusy(true);
    void (async () => {
      try {
        const response = await fetch('/api/billing/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ purchaseId: 'starter' }),
        });
        const body = await response.json() as { url?: string; error?: string };
        if (!response.ok || !body.url) throw new Error(body.error || billingText(language, 'paymentOpen'));
        window.location.assign(body.url);
      } catch (checkoutError) {
        setError(checkoutError instanceof Error ? checkoutError.message : billingText(language, 'paymentOpen'));
        setBusy(false);
      }
    })();
  }, [language]);

  if (dismissed || (!busy && !error)) return null;
  const t = copy[language];
  return <section className="card content-card" aria-live="polite">
    {busy && <p className="muted">{t.continuing}</p>}
    {error && <><p role="alert" className="message error">{error}</p><button type="button" className="btn ghost" onClick={() => setDismissed(true)}>{t.dismiss}</button></>}
  </section>;
}
