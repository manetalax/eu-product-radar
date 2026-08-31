'use client';

import { useEffect, useState } from 'react';
import { productQuotaFromUnknown } from '@/lib/dashboard-api-shapes';
import { localeFor } from '@/lib/landing-i18n';
import { UNLIMITED_PLAN } from '@/lib/plans';
import { trustedStripeNavigationUrl } from '@/lib/stripe-navigation';
import { useLanguage } from '@/lib/use-language';

const copy = {
  es:{ aria:'Fin de la prueba gratuita', eyebrow:'PRUEBA COMPLETADA', title:'Has utilizado tus 5 productos gratuitos.', body:'Ya has visto el resultado. Continúa analizando tu catálogo sin cuota comercial de productos con ImportVerifier Unlimited por {price} al mes.', benefits:['Análisis ilimitados* del catálogo','ImportVerifier AI + Regulatory Twin','PDF y Excel con historial y trazabilidad'], idle:'Continuar con Unlimited · {price}/mes', busy:'Abriendo pago seguro…', secure:'Pago seguro mediante Stripe · facturación mensual', error:'No se ha podido abrir el pago.' },
  en:{ aria:'Free trial complete', eyebrow:'TRIAL COMPLETE', title:'You have used your 5 free products.', body:'You have seen the result. Keep analysing your catalogue without a commercial product quota with ImportVerifier Unlimited for {price} per month.', benefits:['Unlimited* catalogue analysis','ImportVerifier AI + Regulatory Twin','PDF and Excel with history and traceability'], idle:'Continue with Unlimited · {price}/month', busy:'Opening secure checkout…', secure:'Secure Stripe checkout · monthly billing', error:'Unable to open checkout.' },
  fr:{ aria:'Fin de l’essai gratuit', eyebrow:'ESSAI TERMINÉ', title:'Vous avez utilisé vos 5 produits gratuits.', body:'Vous avez vu le résultat. Continuez à analyser votre catalogue sans quota commercial avec ImportVerifier Unlimited pour {price} par mois.', benefits:['Analyses illimitées* du catalogue','ImportVerifier AI + Regulatory Twin','PDF et Excel avec historique et traçabilité'], idle:'Continuer avec Unlimited · {price}/mois', busy:'Ouverture du paiement sécurisé…', secure:'Paiement sécurisé Stripe · facturation mensuelle', error:'Impossible d’ouvrir le paiement.' },
  de:{ aria:'Kostenlose Testphase abgeschlossen', eyebrow:'TESTPHASE ABGESCHLOSSEN', title:'Sie haben Ihre 5 kostenlosen Produkte verwendet.', body:'Sie haben das Ergebnis gesehen. Analysieren Sie Ihren Katalog mit ImportVerifier Unlimited für {price} pro Monat ohne kommerzielles Produktlimit weiter.', benefits:['Unbegrenzte* Kataloganalysen','ImportVerifier AI + Regulatory Twin','PDF und Excel mit Verlauf und Nachweisführung'], idle:'Mit Unlimited fortfahren · {price}/Monat', busy:'Sichere Zahlung wird geöffnet…', secure:'Sicherer Stripe-Checkout · monatliche Abrechnung', error:'Die Zahlung konnte nicht geöffnet werden.' },
  it:{ aria:'Prova gratuita completata', eyebrow:'PROVA COMPLETATA', title:'Hai utilizzato i tuoi 5 prodotti gratuiti.', body:'Hai visto il risultato. Continua ad analizzare il catalogo senza un limite commerciale di prodotti con ImportVerifier Unlimited a {price} al mese.', benefits:['Analisi illimitate* del catalogo','ImportVerifier AI + Regulatory Twin','PDF ed Excel con storico e tracciabilità'], idle:'Continua con Unlimited · {price}/mese', busy:'Apertura pagamento sicuro…', secure:'Pagamento sicuro Stripe · fatturazione mensile', error:'Impossibile aprire il pagamento.' },
  pt:{ aria:'Fim do teste gratuito', eyebrow:'TESTE CONCLUÍDO', title:'Utilizou os seus 5 produtos gratuitos.', body:'Já viu o resultado. Continue a analisar o catálogo sem quota comercial de produtos com o ImportVerifier Unlimited por {price} por mês.', benefits:['Análises ilimitadas* do catálogo','ImportVerifier AI + Regulatory Twin','PDF e Excel com histórico e rastreabilidade'], idle:'Continuar com Unlimited · {price}/mês', busy:'A abrir pagamento seguro…', secure:'Pagamento seguro Stripe · faturação mensal', error:'Não foi possível abrir o pagamento.' },
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
      .then(async response => {
        if (!response.ok) return null;
        try {
          const parsed = await response.json();
          return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
        } catch {
          return null;
        }
      })
      .then(body => {
        if (cancelled) return;
        const quota = productQuotaFromUnknown(body?.quota);
        setExhausted(quota?.billing.planId === 'free' && quota.remaining === 0);
      })
      .catch(() => { if (!cancelled) setExhausted(false); });
    return () => { cancelled = true; };
  }, []);

  async function upgrade() {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ purchaseId: 'starter' }),
      });
      let body: Record<string, unknown> = {};
      try {
        const parsed = await response.json();
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) body = parsed as Record<string, unknown>;
      } catch {
        // Parser/proxy details are intentionally not exposed to customers.
      }
      const navigationUrl = trustedStripeNavigationUrl(body.url, 'checkout');
      if (!response.ok || !navigationUrl) throw new Error(t.error);
      window.location.assign(navigationUrl);
    } catch {
      setError(t.error);
      setBusy(false);
    }
  }

  if (!exhausted) return null;
  return <section className="card content-card trial-upgrade-premium" aria-label={t.aria}>
    <div className="trial-upgrade-copy"><span className="eyebrow">{t.eyebrow}</span><h2>{t.title}</h2><p className="muted">{render(t.body)}</p></div>
    <ul className="trial-upgrade-benefits">{t.benefits.map(benefit => <li key={benefit}>✓ {benefit}</li>)}</ul>
    <div className="trial-upgrade-action"><button className="btn primary" disabled={busy} onClick={() => void upgrade()}>{busy ? t.busy : render(t.idle)}</button><small>{t.secure}</small></div>
    {error && <p role="alert" className="message error">{error}</p>}
  </section>;
}
