'use client';

import Link from 'next/link';
import Brand from '@/components/Brand';
import BrandLogos from '@/components/BrandLogos';
import EURegulatoryIdentity from '@/components/EURegulatoryIdentity';
import TrustMark from '@/components/TrustMark';
import { BRAND_NAME } from '@/lib/brand';
import { formatPrice, formatProductCount, landingCopy, Language, LANGUAGE_OPTIONS } from '@/lib/landing-i18n';
import { MARKETS_BY_RANK } from '@/lib/markets';
import { FREE_TRIAL_PRODUCT_LIMIT, ONE_TIME_AUDIT, PLANS } from '@/lib/plans';
import { useLanguage } from '@/lib/use-language';

const auditCopy: Record<Language, { badge: string; title: string; cadence: string; body: string; cta: string }> = {
  es: { badge: 'PAGO ÚNICO', title: 'Auditoría profesional', cadence: 'sin suscripción', body: 'Un catálogo de hasta 30 productos con informe PDF y Excel.', cta: 'Auditar mi catálogo' },
  en: { badge: 'ONE-TIME PAYMENT', title: 'Professional audit', cadence: 'no subscription', body: 'One catalogue of up to 30 products with PDF and Excel reports.', cta: 'Audit my catalogue' },
  fr: { badge: 'PAIEMENT UNIQUE', title: 'Audit professionnel', cadence: 'sans abonnement', body: 'Un catalogue de 30 produits maximum avec rapports PDF et Excel.', cta: 'Auditer mon catalogue' },
  de: { badge: 'EINMALZAHLUNG', title: 'Professionelle Prüfung', cadence: 'ohne Abonnement', body: 'Ein Katalog mit bis zu 30 Produkten inklusive PDF- und Excel-Bericht.', cta: 'Katalog prüfen lassen' },
  it: { badge: 'PAGAMENTO UNICO', title: 'Audit professionale', cadence: 'senza abbonamento', body: 'Un catalogo fino a 30 prodotti con report PDF ed Excel.', cta: 'Verifica il mio catalogo' },
  pt: { badge: 'PAGAMENTO ÚNICO', title: 'Auditoria profissional', cadence: 'sem subscrição', body: 'Um catálogo até 30 produtos com relatórios PDF e Excel.', cta: 'Auditar o meu catálogo' },
};

export default function Home() {
  const { language, setLanguage } = useLanguage();
  const t = landingCopy[language];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: BRAND_NAME,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: t.hero.lead,
    areaServed: { '@type': 'AdministrativeArea', name: 'European Union' },
    offers: [
      { '@type': 'Offer', name: t.pricing.freeTitle, price: '0', priceCurrency: 'EUR', description: formatProductCount(language, FREE_TRIAL_PRODUCT_LIMIT) },
      { '@type': 'Offer', name: auditCopy[language].title, price: String(ONE_TIME_AUDIT.priceEur), priceCurrency: 'EUR', description: auditCopy[language].body, availability: 'https://schema.org/InStock' },
      ...PLANS.map(plan => ({
        '@type': 'Offer', name: plan.name, price: String(plan.monthlyPriceEur), priceCurrency: 'EUR',
        description: `${t.pricing.upTo} ${formatProductCount(language, plan.monthlyProductLimit)} ${t.pricing.perMonth}`,
        availability: 'https://schema.org/InStock',
      })),
    ],
    featureList: t.values.map(value => `${value.title}: ${value.body}`),
  };

  return <main className="shell landing-shell">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />

    <nav className="nav landing-nav" aria-label={BRAND_NAME}>
      <Brand market="EU" />
      <div className="navlinks">
        <button className="nav-link-button" onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}>{t.nav.how}</button>
        <button className="nav-link-button" onClick={() => document.getElementById('mercados')?.scrollIntoView({ behavior: 'smooth' })}>{t.nav.markets}</button>
        <button className="nav-link-button" onClick={() => document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' })}>{t.nav.pricing}</button>
        <label className="language-picker">
          <span className="sr-only">{t.nav.language}</span>
          <select value={language} aria-label={t.nav.language} onChange={event => setLanguage(event.target.value as Language)}>
            {LANGUAGE_OPTIONS.map(option => <option key={option.code} value={option.code}>{option.shortLabel}</option>)}
          </select>
        </label>
        <Link className="btn primary nav-cta" href={`/login?lang=${language}`}>{t.nav.login}</Link>
      </div>
    </nav>

    <section className="hero landing-hero">
      <div className="hero-copy">
        <EURegulatoryIdentity label={t.hero.eyebrow} detail={t.hero.independent} />
        <h1>{t.hero.title}</h1>
        <p className="lead">{t.hero.lead}</p>
        <div className="hero-actions">
          <Link className="btn primary hero-primary" href="/dashboard">{t.hero.primary}</Link>
          <button className="btn ghost hero-secondary" onClick={() => document.getElementById('producto')?.scrollIntoView({ behavior: 'smooth' })}>{t.hero.secondary}</button>
        </div>
        <div className="trust-row" aria-label={t.hero.trust.join(', ')}>{t.hero.trust.map(item => <span key={item}>{item}</span>)}</div>
        <p className="legal-note">{t.hero.legal}</p>
      </div>

      <div className="product-preview" id="producto" aria-label={t.preview.fictional}>
        <div className="preview-toolbar"><div><span className="preview-kicker">{t.preview.kicker}</span><strong>{t.preview.file}</strong></div><span className="preview-badge">🇪🇺 {t.preview.count}</span></div>
        <div className="preview-score-row"><div><span className="preview-label">{t.preview.incomplete}</span><div className="score">72<span>/100</span></div></div><div className="preview-summary"><strong>{t.preview.priority}</strong><p>{t.preview.summary}</p></div></div>
        <div className="preview-list">{t.preview.products.map((product, index) => <div key={product}><span>{product}</span><span className={`pill ${index === 0 ? 'high' : index === 1 ? 'medium' : 'low'}`}>{t.preview.priorities[index]}</span></div>)}</div>
        <div className="preview-next">{t.preview.next.map(item => <span key={item}>{item}</span>)}</div>
        <div className="preview-footer"><span>{t.preview.fictional}</span><span>{t.preview.reports}</span></div>
      </div>
    </section>

    <section className="value-strip" aria-label={t.values.map(value => value.title).join(', ')}>{t.values.map(value => <div key={value.title}><strong>{value.title}</strong><span>{value.body}</span></div>)}</section>

    <BrandLogos group="commerce" label={t.compatibility.commerceLabel} note={t.compatibility.commerceNote} />

    <section className="section product-story" id="como-funciona">
      <div className="section-heading"><div className="eyebrow">{t.flow.eyebrow}</div><h2>{t.flow.title}</h2><p className="lead">{t.flow.lead}</p></div>
      <div className="grid feature-grid">{t.flow.items.map((item, index) => <article className="card feature-card" key={item.title}><span className="step-number">{String(index + 1).padStart(2, '0')}</span><h3>{item.title}</h3><p className="muted">{item.body}</p></article>)}</div>
    </section>

    <section className="section market-section" id="mercados">
      <div className="market-heading"><div><div className="eyebrow">{t.markets.eyebrow}</div><h2>{t.markets.title}</h2></div><p>{t.markets.body}</p></div>
      <div className="market-grid">{MARKETS_BY_RANK.map(market => {
        const localized = t.markets.cards[market.code];
        return <article className={`market-card ${market.code === 'EU' ? 'active' : ''}`} key={market.code}>
          <div className="market-card-top"><span className="market-card-flag" aria-hidden="true">{market.flag}</span><span className={market.code === 'EU' ? 'coverage-live' : 'coverage-next'}>{market.code === 'EU' ? t.markets.active : t.markets.preparing}</span></div>
          <h3>{localized.name}</h3><p>{localized.promise}</p><small>#{market.rank} · {localized.volume}</small>
          {market.code === 'EU' ? <a href={market.sourceUrl.replace('locale=es', `locale=${language}`)} target="_blank" rel="noopener noreferrer">{t.markets.viewSource}</a> : <span>{t.markets.nextModule}</span>}
        </article>;
      })}</div>
      <p className="market-source"><a href="https://www.wto.org/english/res_e/booksp_e/trade_outlook25_e.pdf" target="_blank" rel="noopener noreferrer">{t.markets.source}</a></p>
    </section>

    <section className="section methodology-section">
      <div className="method-copy"><div className="eyebrow">{t.method.eyebrow}</div><h2>{t.method.title}</h2><p className="lead">{t.method.lead}</p><div className="official-links"><a href={`https://eur-lex.europa.eu/eli/reg/2023/988/oj?locale=${language}`} target="_blank" rel="noopener noreferrer">{t.method.gpsr}</a><a href="https://single-market-economy.ec.europa.eu/single-market/goods/ce-marking/manufacturers_en" target="_blank" rel="noopener noreferrer">{t.method.ce}</a></div></div>
      <div className="method-cards">{t.method.items.map((item, index) => <article key={item.title}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{item.title}</strong><p>{item.body}</p></div></article>)}</div>
    </section>

    <section className="section pricing-section" id="planes">
      <div className="toprow pricing-heading"><div><div className="eyebrow">{t.pricing.eyebrow}</div><h2>{t.pricing.title}</h2><p className="muted">{t.pricing.lead}</p></div><div className="availability-note">{t.pricing.availability}</div></div>
      <div className="free-trial-card"><div><span>{t.pricing.freeTitle}</span><strong>{formatProductCount(language, FREE_TRIAL_PRODUCT_LIMIT)}</strong><p>{t.pricing.freeBody}</p></div><Link className="btn ghost" href={`/login?lang=${language}`}>{t.pricing.freeCta}</Link></div>
      <article className="free-trial-card one-time-audit-card">
        <div><span>{auditCopy[language].badge}</span><strong>{auditCopy[language].title} · {formatPrice(language, ONE_TIME_AUDIT.priceEur)}</strong><p>{auditCopy[language].body} · {auditCopy[language].cadence}.</p></div>
        <Link className="btn primary" href={`/login?plan=audit&lang=${language}`}>{auditCopy[language].cta}</Link>
      </article>
      <div className="plans polished-plans global-plans">{PLANS.map(plan => <article className={`plan ${plan.featured ? 'featured' : ''}`} key={plan.id}>
        {plan.featured && <span className="plan-label">{t.pricing.recommended}</span>}
        <b>{plan.name}</b><div className="price">{formatPrice(language, plan.monthlyPriceEur)}</div><span className="plan-cadence">{t.pricing.perMonth}</span>
        <p className="plan-limit">{t.pricing.upTo} {formatProductCount(language, plan.monthlyProductLimit)}</p><p className="muted">{t.pricing.descriptions[plan.id]}</p>
        <Link className={plan.featured ? 'btn primary plan-button' : 'btn ghost plan-button'} href={`/login?plan=${plan.id}&lang=${language}`}>{t.pricing.reserve} {plan.name}</Link>
      </article>)}</div>
      <p className="pricing-honesty">{t.pricing.honesty}</p>
      <div className="pricing-trust-grid">
        <BrandLogos group="payments" label={t.compatibility.paymentLabel} note={t.compatibility.paymentNote} compact />
        <TrustMark title={t.trust.title} detail={t.trust.detail} httpsLabel={t.trust.https} explanation={t.trust.explanation} compact />
      </div>
    </section>

    <section className="section faq-section"><div className="faq-heading"><div className="eyebrow">{t.faq.eyebrow}</div><h2>{t.faq.title}</h2></div><div className="faq-list">{t.faq.items.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>

    <section className="final-cta"><div><div className="eyebrow">{t.final.eyebrow}</div><h2>{t.final.title}</h2><p>{t.final.body}</p></div><Link className="btn primary" href={`/login?lang=${language}`}>{t.final.cta}</Link></section>

    <BrandLogos group="infrastructure" label={t.compatibility.infrastructureLabel} note={t.compatibility.infrastructureNote} compact />

    <footer className="landing-footer"><Brand market="EU" asLink={false} /><div><a href={`https://eur-lex.europa.eu/eli/reg/2023/988/oj?locale=${language}`} target="_blank" rel="noopener noreferrer">{t.footer.sources}</a><span>{t.footer.privacy}</span><span>{t.footer.guidance}</span></div></footer>
  </main>;
}
