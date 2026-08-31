'use client';

import Link from 'next/link';
import Brand from '@/components/Brand';
import BrandLogos from '@/components/BrandLogos';
import EURegulatoryIdentity from '@/components/EURegulatoryIdentity';
import TrustMark from '@/components/TrustMark';
import { BRAND_NAME } from '@/lib/brand';
import { landingCopy, Language, LANGUAGE_OPTIONS, localeFor } from '@/lib/landing-i18n';
import { MARKETS_BY_RANK } from '@/lib/markets';
import { FREE_TRIAL_PRODUCT_LIMIT, UNLIMITED_PLAN } from '@/lib/plans';
import { useLanguage } from '@/lib/use-language';

const unlimitedCopy: Record<Language, { title: string; body: string; features: string[]; cta: string; fairUse: string }> = {
  es: { title: 'Unlimited', body: 'Una sola suscripción. Analiza todo tu catálogo, usa ImportVerifier AI y genera informes sin contar productos.', features: ['Análisis de productos ilimitados*', 'ImportVerifier AI', 'PDF y Excel con tu historial', 'Regulatory Twin + espacio Radar (monitorización oficial cuando esté activada)', 'Compatible con exportaciones de Shopify, Amazon y Etsy'], cta: 'Elegir Unlimited', fairUse: '*Uso ilimitado sujeto a medidas técnicas razonables contra abuso automatizado.' },
  en: { title: 'Unlimited', body: 'One subscription. Analyse your whole catalogue, use ImportVerifier AI and generate reports without counting products.', features: ['Unlimited product analysis*', 'ImportVerifier AI', 'PDF and Excel with history', 'Regulatory Twin + Radar workspace (official monitoring when activated)', 'Compatible with Shopify, Amazon and Etsy exports'], cta: 'Choose Unlimited', fairUse: '*Unlimited use subject to reasonable technical safeguards against automated abuse.' },
  fr: { title: 'Unlimited', body: 'Un seul abonnement. Analysez tout votre catalogue, utilisez ImportVerifier AI et générez des rapports sans compter les produits.', features: ['Analyses de produits illimitées*', 'ImportVerifier AI', 'PDF et Excel avec historique', 'Regulatory Twin + espace Radar (surveillance officielle lorsqu’elle est activée)', 'Compatible avec les exports Shopify, Amazon et Etsy'], cta: 'Choisir Unlimited', fairUse: '*Utilisation illimitée soumise à des protections techniques raisonnables contre les abus automatisés.' },
  de: { title: 'Unlimited', body: 'Ein Abo. Analysiere deinen gesamten Katalog, nutze ImportVerifier AI und erstelle Berichte ohne Produktzählung.', features: ['Unbegrenzte Produktanalysen*', 'ImportVerifier AI', 'PDF und Excel mit Verlauf', 'Regulatory Twin + Radar-Arbeitsbereich (offizielle Überwachung nach Aktivierung)', 'Kompatibel mit Exporten aus Shopify, Amazon und Etsy'], cta: 'Unlimited wählen', fairUse: '*Unbegrenzte Nutzung unter angemessenen technischen Schutzmaßnahmen gegen automatisierten Missbrauch.' },
  it: { title: 'Unlimited', body: 'Un solo abbonamento. Analizza l’intero catalogo, usa ImportVerifier AI e genera report senza contare i prodotti.', features: ['Analisi prodotti illimitata*', 'ImportVerifier AI', 'PDF ed Excel con storico', 'Regulatory Twin + area Radar (monitoraggio ufficiale quando attivato)', 'Compatibile con le esportazioni Shopify, Amazon ed Etsy'], cta: 'Scegli Unlimited', fairUse: '*Uso illimitato soggetto a ragionevoli protezioni tecniche contro gli abusi automatizzati.' },
  pt: { title: 'Unlimited', body: 'Uma única subscrição. Analisa todo o catálogo, usa o ImportVerifier AI e gera relatórios sem contar produtos.', features: ['Análises de produtos ilimitadas*', 'ImportVerifier AI', 'PDF e Excel com histórico', 'Regulatory Twin + área Radar (monitorização oficial quando ativada)', 'Compatível com exportações do Shopify, Amazon e Etsy'], cta: 'Escolher Unlimited', fairUse: '*Utilização ilimitada sujeita a proteções técnicas razoáveis contra abuso automatizado.' },
};

const landingExtras: Record<Language, {
  previewKicker: string;
  intelligenceEyebrow: string;
  intelligenceTitle: string;
  intelligenceLead: string;
  aiBody: string;
  twinBody: string;
  radarBody: string;
  pricingEyebrow: string;
  pricingTitle: (price: string) => string;
  planLabel: string;
}> = {
  es: { previewKicker: 'IMPORTVERIFIER AI · EUROPA', intelligenceEyebrow: 'IMPORTVERIFIER INTELLIGENCE', intelligenceTitle: 'AI + Twin + Radar, en el mismo producto.', intelligenceLead: 'Pregunta a ImportVerifier AI, conserva un gemelo regulatorio por producto y prioriza impactos sin abandonar tu catálogo.', aiBody: 'Pregunta qué falta, por qué puede aplicar una norma y qué pedir al proveedor.', twinBody: 'Estado vivo por producto: categoría, reglas, evidencias, incertidumbres y acciones.', radarBody: 'Prioriza los cambios y obligaciones que merecen revisión antes que el resto.', pricingEyebrow: 'UN PLAN. TODO INCLUIDO.', pricingTitle: price => `${price} al mes.`, planLabel: 'TODO INCLUIDO' },
  en: { previewKicker: 'IMPORTVERIFIER AI · EUROPE', intelligenceEyebrow: 'IMPORTVERIFIER INTELLIGENCE', intelligenceTitle: 'AI + Twin + Radar in one product.', intelligenceLead: 'Ask ImportVerifier AI, keep a regulatory twin for each product and prioritise impacts without leaving your catalogue.', aiBody: 'Ask what is missing, why a rule may apply and what to request from the supplier.', twinBody: 'A living product state: category, rules, evidence, uncertainties and actions.', radarBody: 'Prioritise the changes and obligations that deserve review first.', pricingEyebrow: 'ONE PLAN. EVERYTHING INCLUDED.', pricingTitle: price => `${price} per month.`, planLabel: 'EVERYTHING INCLUDED' },
  fr: { previewKicker: 'IMPORTVERIFIER AI · EUROPE', intelligenceEyebrow: 'IMPORTVERIFIER INTELLIGENCE', intelligenceTitle: 'AI + Twin + Radar dans un seul produit.', intelligenceLead: 'Interrogez ImportVerifier AI, conservez un jumeau réglementaire par produit et priorisez les impacts sans quitter votre catalogue.', aiBody: 'Demandez ce qui manque, pourquoi une règle peut s’appliquer et quoi demander au fournisseur.', twinBody: 'Un état vivant par produit : catégorie, règles, preuves, incertitudes et actions.', radarBody: 'Priorisez les changements et obligations qui doivent être examinés en premier.', pricingEyebrow: 'UN SEUL PLAN. TOUT INCLUS.', pricingTitle: price => `${price} par mois.`, planLabel: 'TOUT INCLUS' },
  de: { previewKicker: 'IMPORTVERIFIER AI · EUROPA', intelligenceEyebrow: 'IMPORTVERIFIER INTELLIGENCE', intelligenceTitle: 'AI + Twin + Radar in einem Produkt.', intelligenceLead: 'Frage ImportVerifier AI, führe für jedes Produkt einen regulatorischen Zwilling und priorisiere Auswirkungen direkt im Katalog.', aiBody: 'Frage, was fehlt, warum eine Vorschrift gelten könnte und was beim Lieferanten anzufordern ist.', twinBody: 'Lebender Produktstatus: Kategorie, Regeln, Nachweise, Unsicherheiten und Maßnahmen.', radarBody: 'Priorisiere Änderungen und Pflichten, die zuerst geprüft werden sollten.', pricingEyebrow: 'EIN PLAN. ALLES ENTHALTEN.', pricingTitle: price => `${price} pro Monat.`, planLabel: 'ALLES ENTHALTEN' },
  it: { previewKicker: 'IMPORTVERIFIER AI · EUROPA', intelligenceEyebrow: 'IMPORTVERIFIER INTELLIGENCE', intelligenceTitle: 'AI + Twin + Radar in un unico prodotto.', intelligenceLead: 'Chiedi a ImportVerifier AI, mantieni un gemello normativo per ogni prodotto e dai priorità agli impatti senza uscire dal catalogo.', aiBody: 'Chiedi cosa manca, perché una norma può applicarsi e cosa richiedere al fornitore.', twinBody: 'Stato vivo per prodotto: categoria, regole, evidenze, incertezze e azioni.', radarBody: 'Dai priorità ai cambiamenti e agli obblighi da verificare per primi.', pricingEyebrow: 'UN PIANO. TUTTO INCLUSO.', pricingTitle: price => `${price} al mese.`, planLabel: 'TUTTO INCLUSO' },
  pt: { previewKicker: 'IMPORTVERIFIER AI · EUROPA', intelligenceEyebrow: 'IMPORTVERIFIER INTELLIGENCE', intelligenceTitle: 'AI + Twin + Radar num único produto.', intelligenceLead: 'Pergunte ao ImportVerifier AI, mantenha um gémeo regulamentar por produto e priorize impactos sem sair do catálogo.', aiBody: 'Pergunte o que falta, porque uma regra pode aplicar-se e o que pedir ao fornecedor.', twinBody: 'Estado vivo por produto: categoria, regras, evidências, incertezas e ações.', radarBody: 'Priorize as alterações e obrigações que devem ser revistas primeiro.', pricingEyebrow: 'UM PLANO. TUDO INCLUÍDO.', pricingTitle: price => `${price} por mês.`, planLabel: 'TUDO INCLUÍDO' },
};

export default function Home() {
  const { language, setLanguage } = useLanguage();
  const t = landingCopy[language];
  const unlimited = unlimitedCopy[language];
  const extra = landingExtras[language];
  const price = new Intl.NumberFormat(localeFor(language), { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(UNLIMITED_PLAN.monthlyPriceEur);

  const structuredData = {
    '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: BRAND_NAME,
    applicationCategory: 'BusinessApplication', operatingSystem: 'Web', description: t.hero.lead,
    areaServed: { '@type': 'AdministrativeArea', name: t.markets.cards.EU.name },
    offers: [
      { '@type': 'Offer', name: t.pricing.freeTitle, price: '0', priceCurrency: 'EUR', description: t.pricing.freeBody },
      { '@type': 'Offer', name: unlimited.title, price: String(UNLIMITED_PLAN.monthlyPriceEur), priceCurrency: 'EUR', description: unlimited.body, availability: 'https://schema.org/InStock' },
    ],
    featureList: [...t.values.map(value => `${value.title}: ${value.body}`), ...unlimited.features],
  };

  return <main className="shell landing-shell">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
    <nav className="nav landing-nav" aria-label={BRAND_NAME}>
      <Brand market="EU" />
      <div className="navlinks">
        <button className="nav-link-button" onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}>{t.nav.how}</button>
        <button className="nav-link-button" onClick={() => document.getElementById('mercados')?.scrollIntoView({ behavior: 'smooth' })}>{t.nav.markets}</button>
        <button className="nav-link-button" onClick={() => document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' })}>{t.nav.pricing}</button>
        <label className="language-picker"><span className="sr-only">{t.nav.language}</span><select value={language} aria-label={t.nav.language} onChange={event => setLanguage(event.target.value as Language)}>{LANGUAGE_OPTIONS.map(option => <option key={option.code} value={option.code}>{option.shortLabel}</option>)}</select></label>
        <Link className="btn primary nav-cta" href={`/login?lang=${language}`}>{t.nav.login}</Link>
      </div>
    </nav>

    <section className="hero landing-hero">
      <div className="hero-copy">
        <EURegulatoryIdentity label={t.hero.eyebrow} detail={t.hero.independent} />
        <h1>{t.hero.title}</h1><p className="lead">{t.hero.lead}</p>
        <div className="hero-actions"><Link className="btn primary hero-primary" href={`/login?lang=${language}`}>{t.hero.primary}</Link><button className="btn ghost hero-secondary" onClick={() => document.getElementById('producto')?.scrollIntoView({ behavior: 'smooth' })}>{t.hero.secondary}</button></div>
        <div className="trust-row" aria-label={t.hero.trust.join(', ')}>{t.hero.trust.map(item => <span key={item}>{item}</span>)}</div><p className="legal-note">{t.hero.legal}</p>
      </div>
      <div className="product-preview" id="producto" aria-label={t.preview.fictional}>
        <div className="preview-toolbar"><div><span className="preview-kicker">{extra.previewKicker}</span><strong>{t.preview.file}</strong></div><span className="preview-badge">🇪🇺 {t.preview.count}</span></div>
        <div className="preview-score-row"><div><span className="preview-label">{t.preview.incomplete}</span><div className="score">72<span>/100</span></div></div><div className="preview-summary"><strong>{t.preview.priority}</strong><p>{t.preview.summary}</p></div></div>
        <div className="preview-list">{t.preview.products.map((product, index) => <div key={product}><span>{product}</span><span className={`pill ${index === 0 ? 'high' : index === 1 ? 'medium' : 'low'}`}>{t.preview.priorities[index]}</span></div>)}</div>
        <div className="preview-next"><span>ImportVerifier AI</span><span>Regulatory Twin</span><span>Impact Radar</span></div><div className="preview-footer"><span>{t.preview.fictional}</span><span>{t.preview.reports}</span></div>
      </div>
    </section>

    <section className="value-strip" aria-label={t.values.map(value => value.title).join(', ')}>{t.values.map(value => <div key={value.title}><strong>{value.title}</strong><span>{value.body}</span></div>)}</section>
    <BrandLogos group="commerce" label={t.compatibility.commerceLabel} note={t.compatibility.commerceNote} />

    <section className="section product-story" id="como-funciona">
      <div className="section-heading"><div className="eyebrow">{t.flow.eyebrow}</div><h2>{t.flow.title}</h2><p className="lead">{t.flow.lead}</p></div>
      <div className="grid feature-grid">{t.flow.items.map((item, index) => <article className="card feature-card" key={item.title}><span className="step-number">{String(index + 1).padStart(2, '0')}</span><h3>{item.title}</h3><p className="muted">{item.body}</p></article>)}</div>
    </section>

    <section className="section methodology-section">
      <div className="method-copy"><div className="eyebrow">{extra.intelligenceEyebrow}</div><h2>{extra.intelligenceTitle}</h2><p className="lead">{extra.intelligenceLead}</p><div className="official-links"><a href={`https://eur-lex.europa.eu/eli/reg/2023/988/oj?locale=${language}`} target="_blank" rel="noopener noreferrer">{t.method.gpsr}</a><a href="https://single-market-economy.ec.europa.eu/single-market/goods/ce-marking/manufacturers_en" target="_blank" rel="noopener noreferrer">{t.method.ce}</a></div></div>
      <div className="method-cards"><article><span>01</span><div><strong>ImportVerifier AI</strong><p>{extra.aiBody}</p></div></article><article><span>02</span><div><strong>Product Regulatory Twin</strong><p>{extra.twinBody}</p></div></article><article><span>03</span><div><strong>Impact Radar</strong><p>{extra.radarBody}</p></div></article></div>
    </section>

    <section className="section market-section" id="mercados">
      <div className="market-heading"><div><div className="eyebrow">{t.markets.eyebrow}</div><h2>{t.markets.title}</h2></div><p>{t.markets.body}</p></div>
      <div className="market-grid">{MARKETS_BY_RANK.map(market => { const localized = t.markets.cards[market.code]; return <article className={`market-card ${market.code === 'EU' ? 'active' : ''}`} key={market.code}><div className="market-card-top"><span className="market-card-flag" aria-hidden="true">{market.flag}</span><span className={market.code === 'EU' ? 'coverage-live' : 'coverage-next'}>{market.code === 'EU' ? t.markets.active : t.markets.preparing}</span></div><h3>{localized.name}</h3><p>{localized.promise}</p><small>#{market.rank} · {localized.volume}</small>{market.code === 'EU' ? <a href={market.sourceUrl.replace('locale=es', `locale=${language}`)} target="_blank" rel="noopener noreferrer">{t.markets.viewSource}</a> : <span>{t.markets.nextModule}</span>}</article>; })}</div>
    </section>

    <section className="section pricing-section" id="planes">
      <div className="toprow pricing-heading"><div><div className="eyebrow">{extra.pricingEyebrow}</div><h2>{extra.pricingTitle(price)}</h2><p className="muted">{unlimited.body}</p></div><div className="availability-note">{t.pricing.availability}</div></div>
      <div className="free-trial-card"><div><span>{t.pricing.freeTitle}</span><strong>{FREE_TRIAL_PRODUCT_LIMIT} {t.pricing.products}</strong><p>{t.pricing.freeBody}</p></div><Link className="btn ghost" href={`/login?lang=${language}`}>{t.pricing.freeCta}</Link></div>
      <div className="plans polished-plans global-plans"><article className="plan featured"><span className="plan-label">{extra.planLabel}</span><b>{unlimited.title}</b><div className="price">{price}</div><span className="plan-cadence">{t.pricing.perMonth}</span><ul className="plan-features">{unlimited.features.map(feature => <li key={feature}>✓ {feature}</li>)}</ul><Link className="btn primary plan-button" href={`/login?plan=starter&lang=${language}`}>{unlimited.cta}</Link></article></div>
      <p className="pricing-honesty">{unlimited.fairUse} {t.pricing.honesty}</p>
      <div className="pricing-trust-grid"><BrandLogos group="payments" label={t.compatibility.paymentLabel} note={t.compatibility.paymentNote} compact /><TrustMark title={t.trust.title} detail={t.trust.detail} httpsLabel={t.trust.https} explanation={t.trust.explanation} compact /></div>
    </section>

    <section className="section faq-section"><div className="faq-heading"><div className="eyebrow">{t.faq.eyebrow}</div><h2>{t.faq.title}</h2></div><div className="faq-list">{t.faq.items.slice(0,4).map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>
    <section className="final-cta"><div><div className="eyebrow">{t.final.eyebrow}</div><h2>{t.final.title}</h2><p>{t.final.body}</p></div><Link className="btn primary" href={`/login?lang=${language}`}>{t.final.cta}</Link></section>
    <BrandLogos group="infrastructure" label={t.compatibility.infrastructureLabel} note={t.compatibility.infrastructureNote} compact />
    <footer className="landing-footer"><Brand market="EU" asLink={false} /><div><a href={`https://eur-lex.europa.eu/eli/reg/2023/988/oj?locale=${language}`} target="_blank" rel="noopener noreferrer">{t.footer.sources}</a><Link href={`/privacy?lang=${language}`}>{t.footer.privacy}</Link><Link href={`/terms?lang=${language}`}>{t.footer.terms}</Link><a href="mailto:importverifier@gmail.com">{t.footer.support}</a><span>{t.footer.guidance}</span></div></footer>
  </main>;
}