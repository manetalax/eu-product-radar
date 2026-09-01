'use client';

import { useEffect, useState } from 'react';
import type { UnlimitedBillingOption } from '@/lib/billing';
import { productQuotaFromUnknown } from '@/lib/dashboard-api-shapes';
import { localeFor } from '@/lib/landing-i18n';
import { UNLIMITED_ANNUAL_PRICE_EUR, UNLIMITED_LIFETIME_PRICE_EUR, UNLIMITED_MONTHLY_PRICE_EUR } from '@/lib/plans';
import { trustedStripeNavigationUrl } from '@/lib/stripe-navigation';
import { useLanguage } from '@/lib/use-language';

const copy = {
  es:{ aria:'Fin de la prueba gratuita', eyebrow:'PRUEBA COMPLETADA', title:'Has utilizado tus 5 productos gratuitos.', body:'Continúa con ImportVerifier Unlimited. Elige la forma de pago que mejor encaje contigo; las tres opciones desbloquean la misma experiencia Unlimited.', benefits:['Análisis ilimitados* del catálogo','ImportVerifier AI + Regulatory Twin','PDF y Excel con historial y trazabilidad'], monthly:'Mensual', annual:'Anual · mejor valor', lifetime:'De por vida', monthlySuffix:'/mes', annualSuffix:'/año', lifetimeSuffix:'pago único', annualSave:'Ahorra 29,45 € frente a 12 meses', busy:'Abriendo pago seguro…', secure:'Pago seguro mediante Stripe', error:'No se ha podido abrir el pago.' },
  en:{ aria:'Free trial complete', eyebrow:'TRIAL COMPLETE', title:'You have used your 5 free products.', body:'Continue with ImportVerifier Unlimited. Choose the payment option that suits you; all three unlock the same Unlimited experience.', benefits:['Unlimited* catalogue analysis','ImportVerifier AI + Regulatory Twin','PDF and Excel with history and traceability'], monthly:'Monthly', annual:'Annual · best value', lifetime:'Lifetime', monthlySuffix:'/month', annualSuffix:'/year', lifetimeSuffix:'one-time payment', annualSave:'Save €29.45 versus 12 monthly payments', busy:'Opening secure checkout…', secure:'Secure Stripe checkout', error:'Unable to open checkout.' },
  fr:{ aria:'Fin de l’essai gratuit', eyebrow:'ESSAI TERMINÉ', title:'Vous avez utilisé vos 5 produits gratuits.', body:'Continuez avec ImportVerifier Unlimited. Choisissez le mode de paiement qui vous convient ; les trois options donnent le même accès Unlimited.', benefits:['Analyses illimitées* du catalogue','ImportVerifier AI + Regulatory Twin','PDF et Excel avec historique et traçabilité'], monthly:'Mensuel', annual:'Annuel · meilleur prix', lifetime:'À vie', monthlySuffix:'/mois', annualSuffix:'/an', lifetimeSuffix:'paiement unique', annualSave:'Économisez 29,45 € par rapport à 12 mensualités', busy:'Ouverture du paiement sécurisé…', secure:'Paiement sécurisé Stripe', error:'Impossible d’ouvrir le paiement.' },
  de:{ aria:'Kostenlose Testphase abgeschlossen', eyebrow:'TESTPHASE ABGESCHLOSSEN', title:'Sie haben Ihre 5 kostenlosen Produkte verwendet.', body:'Fahren Sie mit ImportVerifier Unlimited fort. Wählen Sie die passende Zahlungsart; alle drei Optionen schalten denselben Unlimited-Zugang frei.', benefits:['Unbegrenzte* Kataloganalysen','ImportVerifier AI + Regulatory Twin','PDF und Excel mit Verlauf und Nachweisführung'], monthly:'Monatlich', annual:'Jährlich · bester Wert', lifetime:'Lebenslang', monthlySuffix:'/Monat', annualSuffix:'/Jahr', lifetimeSuffix:'einmalig', annualSave:'29,45 € gegenüber 12 Monatszahlungen sparen', busy:'Sichere Zahlung wird geöffnet…', secure:'Sicherer Stripe-Checkout', error:'Die Zahlung konnte nicht geöffnet werden.' },
  it:{ aria:'Prova gratuita completata', eyebrow:'PROVA COMPLETATA', title:'Hai utilizzato i tuoi 5 prodotti gratuiti.', body:'Continua con ImportVerifier Unlimited. Scegli la modalità di pagamento più adatta; tutte e tre sbloccano la stessa esperienza Unlimited.', benefits:['Analisi illimitate* del catalogo','ImportVerifier AI + Regulatory Twin','PDF ed Excel con storico e tracciabilità'], monthly:'Mensile', annual:'Annuale · miglior valore', lifetime:'A vita', monthlySuffix:'/mese', annualSuffix:'/anno', lifetimeSuffix:'pagamento unico', annualSave:'Risparmia 29,45 € rispetto a 12 mensilità', busy:'Apertura pagamento sicuro…', secure:'Pagamento sicuro Stripe', error:'Impossibile aprire il pagamento.' },
  pt:{ aria:'Fim do teste gratuito', eyebrow:'TESTE CONCLUÍDO', title:'Utilizou os seus 5 produtos gratuitos.', body:'Continue com o ImportVerifier Unlimited. Escolha a modalidade de pagamento que preferir; as três desbloqueiam a mesma experiência Unlimited.', benefits:['Análises ilimitadas* do catálogo','ImportVerifier AI + Regulatory Twin','PDF e Excel com histórico e rastreabilidade'], monthly:'Mensal', annual:'Anual · melhor valor', lifetime:'Vitalício', monthlySuffix:'/mês', annualSuffix:'/ano', lifetimeSuffix:'pagamento único', annualSave:'Poupe 29,45 € face a 12 mensalidades', busy:'A abrir pagamento seguro…', secure:'Pagamento seguro Stripe', error:'Não foi possível abrir o pagamento.' },
} as const;

export default function FreeTrialUpgradePrompt() {
  const { language } = useLanguage();
  const t = copy[language];
  const currency = (value: number) => new Intl.NumberFormat(localeFor(language), { style:'currency', currency:'EUR', minimumFractionDigits:value % 1 ? 2 : 0, maximumFractionDigits:2 }).format(value);
  const [exhausted, setExhausted] = useState(false);
  const [busy, setBusy] = useState<UnlimitedBillingOption | null>(null);
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

  async function upgrade(billingOption: UnlimitedBillingOption) {
    if (busy) return;
    setBusy(billingOption); setError('');
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ purchaseId: 'starter', billingOption }),
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
      setBusy(null);
    }
  }

  if (!exhausted) return null;
  const options: { id: UnlimitedBillingOption; label: string; price: number; suffix: string; note?: string }[] = [
    { id:'monthly', label:t.monthly, price:UNLIMITED_MONTHLY_PRICE_EUR, suffix:t.monthlySuffix },
    { id:'annual', label:t.annual, price:UNLIMITED_ANNUAL_PRICE_EUR, suffix:t.annualSuffix, note:t.annualSave },
    { id:'lifetime', label:t.lifetime, price:UNLIMITED_LIFETIME_PRICE_EUR, suffix:t.lifetimeSuffix },
  ];

  return <section className="card content-card trial-upgrade-premium" aria-label={t.aria}>
    <div className="trial-upgrade-copy"><span className="eyebrow">{t.eyebrow}</span><h2>{t.title}</h2><p className="muted">{t.body}</p></div>
    <ul className="trial-upgrade-benefits">{t.benefits.map(benefit => <li key={benefit}>✓ {benefit}</li>)}</ul>
    <div className="trial-upgrade-options">
      {options.map(option => <button key={option.id} className={`btn ${option.id === 'annual' ? 'primary' : 'ghost'} trial-upgrade-option`} disabled={busy !== null} onClick={() => void upgrade(option.id)}>
        <span>{option.label}</span><strong>{currency(option.price)} <small>{option.suffix}</small></strong>{option.note && <small>{option.note}</small>}
      </button>)}
    </div>
    <small className="trial-upgrade-secure">{busy ? t.busy : t.secure}</small>
    {error && <p role="alert" className="message error">{error}</p>}
  </section>;
}
