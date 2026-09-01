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
  es: 'Confirmando tu acceso Unlimited…',
  en: 'Confirming your Unlimited access…',
  fr: 'Confirmation de votre accès Unlimited…',
  de: 'Unlimited-Zugang wird bestätigt…',
  it: 'Conferma dell’accesso Unlimited…',
  pt: 'A confirmar o seu acesso Unlimited…',
} as const;
const CONFIRM_TIMEOUT_MS = 20_000;
const MAX_CONFIRM_ATTEMPTS = 3;
const RETRYABLE_CONFIRM_STATUSES = new Set([409, 429, 502, 503, 504]);

class CheckoutConfirmationError extends Error {}

function retryDelay(attempt: number) {
  return Math.min(2_000, 500 * (2 ** attempt));
}

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
        for (let attempt = 0; attempt < MAX_CONFIRM_ATTEMPTS; attempt += 1) {
          if (cancelled) return;
          let response: Response;
          try {
            response = await fetch('/api/billing/confirm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId }),
              signal: controller.signal,
            });
          } catch (networkError) {
            if (controller.signal.aborted || attempt === MAX_CONFIRM_ATTEMPTS - 1) throw networkError;
            await new Promise(resolve => window.setTimeout(resolve, retryDelay(attempt)));
            continue;
          }

          let confirmed = false;
          try {
            const parsed = await response.json();
            confirmed = Boolean(parsed && typeof parsed === 'object' && !Array.isArray(parsed) && (parsed as Record<string, unknown>).confirmed === true);
          } catch {
            // Never expose parser/proxy details to customers.
          }
          if (response.ok && confirmed) {
            if (!cancelled) window.location.replace('/dashboard?checkout=success&synced=1');
            return;
          }
          if (!RETRYABLE_CONFIRM_STATUSES.has(response.status) || attempt === MAX_CONFIRM_ATTEMPTS - 1) {
            throw new CheckoutConfirmationError(billingText(language, 'paymentOpen'));
          }
          await new Promise(resolve => window.setTimeout(resolve, retryDelay(attempt)));
        }
      } catch (confirmError) {
        if (!cancelled) {
          setError(confirmError instanceof CheckoutConfirmationError ? confirmError.message : billingText(language, 'paymentOpen'));
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
