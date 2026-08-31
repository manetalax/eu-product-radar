'use client';

import { useEffect, useState } from 'react';
import { billingText } from '@/lib/billing-i18n';
import { useLanguage } from '@/lib/use-language';

type Props = {
  checkout?: string;
  sessionId?: string;
  synced?: boolean;
};

const copy = {
  es: 'Confirmando tu suscripción Unlimited…',
  en: 'Confirming your Unlimited subscription…',
  fr: 'Confirmation de votre abonnement Unlimited…',
  de: 'Unlimited-Abonnement wird bestätigt…',
  it: 'Conferma dell’abbonamento Unlimited…',
  pt: 'A confirmar a sua subscrição Unlimited…',
} as const;
const CONFIRM_TIMEOUT_MS = 20_000;

export default function CheckoutReturnSync({ checkout, sessionId, synced = false }: Props) {
  const { language } = useLanguage();
  const [busy, setBusy] = useState(checkout === 'success' && Boolean(sessionId) && !synced);
  const [error, setError] = useState('');

  useEffect(() => {
    if (checkout !== 'success' || !sessionId || synced) return;
    let cancelled = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), CONFIRM_TIMEOUT_MS);
    void (async () => {
      try {
        const response = await fetch('/api/billing/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
          signal: controller.signal,
        });
        let body: { confirmed?: boolean; error?: string } = {};
        try { body = await response.json() as typeof body; } catch { /* Never expose parser errors to customers. */ }
        if (!response.ok || !body.confirmed) throw new Error(body.error || billingText(language, 'paymentOpen'));
        if (!cancelled) window.location.replace('/dashboard?checkout=success&synced=1');
      } catch (confirmError) {
        if (!cancelled) {
          const safeMessage = confirmError instanceof Error && confirmError.name !== 'AbortError' && !confirmError.name.includes('Syntax')
            ? confirmError.message
            : billingText(language, 'paymentOpen');
          setError(safeMessage || billingText(language, 'paymentOpen'));
          setBusy(false);
        }
      } finally {
        window.clearTimeout(timeout);
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [checkout, sessionId, synced, language]);

  useEffect(() => {
    if ((checkout !== 'success' && checkout !== 'cancelled') || (checkout === 'success' && !synced)) return;
    const timer = window.setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.delete('checkout');
      url.searchParams.delete('session_id');
      url.searchParams.delete('synced');
      window.history.replaceState(window.history.state, '', url);
    }, 750);
    return () => window.clearTimeout(timer);
  }, [checkout, synced]);

  if (!busy && !error) return null;
  return <section className="card content-card" aria-live="polite">
    {busy && <p className="muted">{copy[language]}</p>}
    {error && <p role="alert" className="message error">{error}</p>}
  </section>;
}
