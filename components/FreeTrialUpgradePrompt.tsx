'use client';

import { useEffect, useState } from 'react';
import { localeFor } from '@/lib/landing-i18n';
import { UNLIMITED_PLAN } from '@/lib/plans';
import { useLanguage } from '@/lib/use-language';

type QuotaResponse = { quota?: { remaining?: number; billing?: { planId?: string } } };

const copy = {
  es:{ aria:'Fin de la prueba gratuita', eyebrow:'PRUEBA COMPLETADA', title:'Has utilizado tus 5 productos gratuitos.', body:'Continúa analizando sin cuota comercial de productos con ImportVerifier Unlimited por {price} al mes.', idle:'Activar Unlimited · {price}/mes', busy:'Abriendo pago seguro…', error:'No se ha podido abrir el pago.' },
  en:{ aria:'Free trial complete', eyebrow:'TRIAL COMPLETE', title:'You have used your 5 free products.', body:'Continue analyzing without a commercial product quota with ImportVerifier Unlimited for {price} per month.', idle:'Activate Unlimited · {price}/month', busy:'Opening secure checkout…', error:'Unable to open checkout.' },
  fr:{ aria:'Fin de l’essai gratuit', eyebrow:'ESSAI TERMINÉ', title:'Vous avez utilisé vos 5 produits gratuits.', body:'Continuez à analyser sans quota commercial de produits avec ImportVerifier Unlimited pour {price} par mois.', idle:'Activer Unlimited · {price}/mois', busy:'Ouverture du paiement sécurisé…', error:'Impossible d’ouvrir le paiement.' },
  de:{ aria:'Kostenlose Testphase abgeschlossen', eyebrow:'TESTPHASE ABGESCHLOSSEN', title:'Sie haben Ihre 5 kostenlosen Produkte verwendet.', body:'Analysieren Sie mit ImportVerifier Unlimited für {price} pro Monat ohne kommerzielles Produktlimit weiter.', idle:'Unlimited aktivieren · {price}/Monat', busy:'Sichere Zahlung wird geöffnet…', error:'Die Zahlung konnte nicht geöffnet werden.' },
  it:{ aria:'Prova gratuita completata', eyebrow:'PROVA COMPLETATA', title:'Hai utilizzato i tuoi 5 prodotti gratuiti.', body:'Continua ad analizzare senza un limite commerciale di prodotti con ImportVerifier Unlimited a {price} al mese.', idle:'Attiva Unlimited · {price}/mese', busy:'Apertura pagamento sicuro…', error:'Impossibile aprire il pagamento.' },
  pt:{ aria:'Fim do teste gratuito', eyebrow:'TESTE CONCLUÍDO', title:'Utilizou os seus 5 produtos gratuitos.', body:'Continue a analisar sem quota comercial de produtos com o ImportVerifier Unlimited por {price} por mês.', idle:'Ativar Unlimited · {price}/mês', busy:'A abrir pagamento seguro…', error:'Não foi possível abrir o pagamento.' },
} as const;

export default function FreeTrialUpgradePrompt() {
  const { language } = useLanguage();
  const t = copy[language];
  const price = new Intl.NumberFormat(localeFor(language), { style:'currency', currency:'EUR', minimumFractionDigits:2, maximumFractionDigits:2 }).format(UNLIMITED_PLAN.monthlyPriceEur);
  const render = (value: string) => value.replace('{price}', price);
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
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ purchaseId: 'starter' }),
      });
      const body = await response.json() as { url?: string; error?: string };
      if (!response.ok || !body.url) throw new Error(body.error || t.error);
      window.location.assign(body.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.error);
      setBusy(false);
    }
  }

  if (!exhausted) return null;
  return <section className="card content-card" aria-label={t.aria}>
    <span className="eyebrow">{t.eyebrow}</span>
    <h2>{t.title}</h2>
    <p className="muted">{render(t.body)}</p>
    <button className="btn primary" disabled={busy} onClick={() => void upgrade()}>{busy ? t.busy : render(t.idle)}</button>
    {error && <p role="alert" className="message error">{error}</p>}
  </section>;
}
