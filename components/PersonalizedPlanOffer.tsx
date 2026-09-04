'use client';

import { useState } from 'react';
import { PERSONALIZED_PUBLIC_OFFER } from '@/lib/plans';
import { formatPrice } from '@/lib/landing-i18n';
import { trustedStripeNavigationUrl } from '@/lib/stripe-navigation';
import { useLanguage } from '@/lib/use-language';

const COPY = {
  es: { eyebrow: 'PERSONALIZADA', title: 'Tu ImportVerifier, adaptado a tu marca.', body: 'Pago único con acceso permanente y trabajo técnico de personalización.', features: ['ImportVerifier AI incluido', 'Personalización técnica de la plataforma', 'Dominio propio', 'Logo e identidad visual', 'Integración de WhatsApp'], cta: 'Crear mi versión personalizada', error: 'No se pudo abrir el pago seguro. Inténtalo de nuevo.' },
  en: { eyebrow: 'CUSTOM', title: 'Your ImportVerifier, adapted to your brand.', body: 'One-time payment with permanent access and technical customization work.', features: ['ImportVerifier AI included', 'Technical platform customization', 'Custom domain', 'Logo and visual identity', 'WhatsApp integration'], cta: 'Create my custom version', error: 'Secure checkout could not be opened. Please try again.' },
  fr: { eyebrow: 'PERSONNALISÉE', title: 'Votre ImportVerifier, adapté à votre marque.', body: 'Paiement unique avec accès permanent et personnalisation technique.', features: ['ImportVerifier AI inclus', 'Personnalisation technique de la plateforme', 'Nom de domaine', 'Logo et identité visuelle', 'Intégration WhatsApp'], cta: 'Créer ma version personnalisée', error: 'Impossible d’ouvrir le paiement sécurisé. Réessayez.' },
  de: { eyebrow: 'INDIVIDUELL', title: 'Ihr ImportVerifier, an Ihre Marke angepasst.', body: 'Einmalzahlung mit dauerhaftem Zugang und technischer Individualisierung.', features: ['ImportVerifier AI inklusive', 'Technische Plattformanpassung', 'Eigene Domain', 'Logo und visuelle Identität', 'WhatsApp-Integration'], cta: 'Individuelle Version erstellen', error: 'Der sichere Checkout konnte nicht geöffnet werden.' },
  it: { eyebrow: 'PERSONALIZZATA', title: 'Il tuo ImportVerifier, adattato al tuo brand.', body: 'Pagamento unico con accesso permanente e personalizzazione tecnica.', features: ['ImportVerifier AI incluso', 'Personalizzazione tecnica della piattaforma', 'Dominio personalizzato', 'Logo e identità visiva', 'Integrazione WhatsApp'], cta: 'Crea la mia versione personalizzata', error: 'Impossibile aprire il pagamento sicuro. Riprova.' },
  pt: { eyebrow: 'PERSONALIZADA', title: 'O seu ImportVerifier, adaptado à sua marca.', body: 'Pagamento único com acesso permanente e personalização técnica.', features: ['ImportVerifier AI incluído', 'Personalização técnica da plataforma', 'Domínio próprio', 'Logótipo e identidade visual', 'Integração WhatsApp'], cta: 'Criar a minha versão personalizada', error: 'Não foi possível abrir o pagamento seguro. Tente novamente.' },
} as const;

export default function PersonalizedPlanOffer() {
  const { language } = useLanguage();
  const t = COPY[language];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function checkout() {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseId: 'starter', billingOption: 'custom' }),
      });
      const body = await response.json().catch(() => ({}));
      const url = trustedStripeNavigationUrl(body?.url, 'checkout');
      if (!response.ok || !url) throw new Error('checkout_failed');
      window.location.assign(url);
    } catch {
      setError(t.error);
      setBusy(false);
    }
  }

  return <section className="iv-personalized" aria-labelledby="personalized-plan-title">
    <style>{`
      .iv-personalized{width:min(1180px,calc(100% - 24px));margin:18px auto;padding:22px;border:1px solid rgba(15,23,42,.12);border-radius:24px;background:linear-gradient(135deg,#fff,#f8fafc);box-shadow:0 18px 50px rgba(15,23,42,.08)}
      .iv-personalized-grid{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(260px,.8fr);gap:24px;align-items:center}.iv-personalized small{font-weight:800;letter-spacing:.12em;color:#475569}.iv-personalized h2{margin:6px 0 8px;font-size:clamp(24px,3vw,38px)}.iv-personalized p{color:#475569;margin:0}.iv-personalized ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 16px;padding-left:18px;margin:16px 0 0}.iv-personalized-price{display:flex;flex-direction:column;gap:10px;padding:18px;border-radius:18px;background:#0f172a;color:#fff}.iv-personalized-price strong{font-size:30px}.iv-personalized-price span{font-size:12px;opacity:.8}.iv-personalized-price button{border:0;border-radius:12px;padding:12px 14px;font-weight:800;background:#fff;color:#0f172a}.iv-personalized-error{color:#b91c1c!important;font-size:13px}.iv-personalized-price button:disabled{opacity:.65}
      @media(max-width:760px){.iv-personalized-grid{grid-template-columns:1fr}.iv-personalized ul{grid-template-columns:1fr}.iv-personalized{padding:18px}}
    `}</style>
    <div className="iv-personalized-grid">
      <div><small>{t.eyebrow}</small><h2 id="personalized-plan-title">{t.title}</h2><p>{t.body}</p><ul>{t.features.map(feature => <li key={feature}>{feature}</li>)}</ul></div>
      <div className="iv-personalized-price"><span>ImportVerifier Personalizada · pago único</span><strong>{formatPrice(language, PERSONALIZED_PUBLIC_OFFER.priceEur)}</strong><button type="button" disabled={busy} onClick={() => void checkout()}>{busy ? '…' : t.cta}</button>{error && <p className="iv-personalized-error" role="alert">{error}</p>}</div>
    </div>
  </section>;
}
