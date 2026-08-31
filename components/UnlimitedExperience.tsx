'use client';

import { useEffect, useState } from 'react';
import { localeFor } from '@/lib/landing-i18n';
import { UNLIMITED_PLAN } from '@/lib/plans';
import { useLanguage } from '@/lib/use-language';

type QuotaResponse = { quota?: { billing?: { planId?: string } } };

const copy = {
  es: { active:'Unlimited activo', period:'mes', body:'Analiza sin cuota comercial de productos. Se mantienen únicamente protecciones técnicas razonables contra abuso automatizado.' },
  en: { active:'Unlimited active', period:'month', body:'Analyze without a commercial product quota. Only reasonable technical safeguards against automated abuse remain.' },
  fr: { active:'Unlimited actif', period:'mois', body:'Analysez sans quota commercial de produits. Seules des protections techniques raisonnables contre les abus automatisés restent en place.' },
  de: { active:'Unlimited aktiv', period:'Monat', body:'Analysieren Sie ohne kommerzielles Produktlimit. Es gelten nur angemessene technische Schutzmaßnahmen gegen automatisierten Missbrauch.' },
  it: { active:'Unlimited attivo', period:'mese', body:'Analizza senza un limite commerciale di prodotti. Restano solo ragionevoli protezioni tecniche contro gli abusi automatizzati.' },
  pt: { active:'Unlimited ativo', period:'mês', body:'Analise sem quota comercial de produtos. Mantêm-se apenas proteções técnicas razoáveis contra abuso automatizado.' },
} as const;

export default function UnlimitedExperience() {
  const { language } = useLanguage();
  const [unlimited, setUnlimited] = useState(false);
  const price = new Intl.NumberFormat(localeFor(language), { style:'currency', currency:'EUR', minimumFractionDigits:2, maximumFractionDigits:2 }).format(UNLIMITED_PLAN.monthlyPriceEur);

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
  const t = copy[language];
  return <div role="status" className="notice trust-notice"><strong>{t.active} · {price}/{t.period}.</strong> {t.body}</div>;
}
