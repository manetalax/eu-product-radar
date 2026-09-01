'use client';

import { useEffect, useState } from 'react';
import type { UnlimitedBillingOption } from '@/lib/billing';
import { productQuotaFromUnknown } from '@/lib/dashboard-api-shapes';
import { localeFor } from '@/lib/landing-i18n';
import { UNLIMITED_ANNUAL_PRICE_EUR, UNLIMITED_LIFETIME_PRICE_EUR, UNLIMITED_MONTHLY_PRICE_EUR } from '@/lib/plans';
import { useLanguage } from '@/lib/use-language';

const copy = {
  es: { active:'Unlimited activo', month:'al mes', year:'al año', lifetime:'Lifetime · pago único', legacy:'Plan Unlimited activo', body:'Analiza sin cuota comercial de productos. Se mantienen únicamente protecciones técnicas razonables contra abuso automatizado.' },
  en: { active:'Unlimited active', month:'per month', year:'per year', lifetime:'Lifetime · one-time payment', legacy:'Unlimited plan active', body:'Analyze without a commercial product quota. Only reasonable technical safeguards against automated abuse remain.' },
  fr: { active:'Unlimited actif', month:'par mois', year:'par an', lifetime:'Lifetime · paiement unique', legacy:'Plan Unlimited actif', body:'Analysez sans quota commercial de produits. Seules des protections techniques raisonnables contre les abus automatisés restent en place.' },
  de: { active:'Unlimited aktiv', month:'pro Monat', year:'pro Jahr', lifetime:'Lifetime · Einmalzahlung', legacy:'Unlimited-Plan aktiv', body:'Analysieren Sie ohne kommerzielles Produktlimit. Es gelten nur angemessene technische Schutzmaßnahmen gegen automatisierten Missbrauch.' },
  it: { active:'Unlimited attivo', month:'al mese', year:'all’anno', lifetime:'Lifetime · pagamento unico', legacy:'Piano Unlimited attivo', body:'Analizza senza un limite commerciale di prodotti. Restano solo ragionevoli protezioni tecniche contro gli abusi automatizzati.' },
  pt: { active:'Unlimited ativo', month:'por mês', year:'por ano', lifetime:'Lifetime · pagamento único', legacy:'Plano Unlimited ativo', body:'Analise sem quota comercial de produtos. Mantêm-se apenas proteções técnicas razoáveis contra abuso automatizado.' },
} as const;

type DisplayBilling = UnlimitedBillingOption | 'legacy' | null;

export default function UnlimitedExperience() {
  const { language } = useLanguage();
  const [billing, setBilling] = useState<DisplayBilling>(null);

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
        if (quota?.billing.planId !== 'starter') return setBilling(null);
        setBilling(quota.billing.billingOption ?? 'legacy');
      })
      .catch(() => { if (!cancelled) setBilling(null); });
    return () => { cancelled = true; };
  }, []);

  if (!billing) return null;
  const t = copy[language];
  const formatPrice = (amount: number) => new Intl.NumberFormat(localeFor(language), { style:'currency', currency:'EUR', minimumFractionDigits:2, maximumFractionDigits:2 }).format(amount);
  const billingLabel = billing === 'monthly'
    ? `${formatPrice(UNLIMITED_MONTHLY_PRICE_EUR)} ${t.month}`
    : billing === 'annual'
      ? `${formatPrice(UNLIMITED_ANNUAL_PRICE_EUR)} ${t.year}`
      : billing === 'lifetime'
        ? `${formatPrice(UNLIMITED_LIFETIME_PRICE_EUR)} · ${t.lifetime}`
        : t.legacy;

  return <div role="status" className="notice trust-notice"><strong>{t.active} · {billingLabel}.</strong> {t.body}</div>;
}
