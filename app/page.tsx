import Link from 'next/link';
import Brand from '@/components/Brand';
import BrandLogos from '@/components/BrandLogos';
import EURegulatoryIdentity from '@/components/EURegulatoryIdentity';
import LandingLanguagePicker from '@/components/LandingLanguagePicker';
import TrustMark from '@/components/TrustMark';
import { BRAND_NAME } from '@/lib/brand';
import { isLanguage, landingCopy, Language, localeFor } from '@/lib/landing-i18n';
import { MARKETS_BY_RANK } from '@/lib/markets';
import { FREE_TRIAL_PRODUCT_LIMIT, PERSONALIZED_PUBLIC_OFFER, UNLIMITED_PUBLIC_OFFERS } from '@/lib/plans';
import { serverLanguage } from '@/lib/server-language';

const landingExtras: Record<Language, {
  pricingEyebrow: string;
  pricingTitle: string;
  pricingLead: string;
  monthly: { label: string; badge: string; features: string[]; cta: string };
  annual: { label: string; badge: string; features: string[]; cta: string };
  lifetime: { label: string; badge: string; features: string[]; cta: string };
  custom: { label: string; badge: string; features: string[]; cta: string; body: string };
  trialProof: string;
  unlimitedProof: string;
  verifiedReview: string;
  intelligenceTitle: string;
  intelligenceLead: string;
  aiBody: string;
  twinBody: string;
  radarBody: string;
  billingFaqQuestion: string;
  billingFaqAnswer: (monthly: string, annual: string, lifetime: string, custom: string) => string;
  fairUse: string;
}> = {
  es: {
    pricingEyebrow: 'CUATRO FORMAS DE TRABAJAR', pricingTitle: 'Elige por capacidad, no por letra pequeña.', pricingLead: 'Mensual mantiene el análisis ilimitado sin IA. ImportVerifier AI se activa desde Anual. Lifetime añade acceso permanente y Personalizada incorpora adaptación técnica a tu marca.',
    monthly: { label: 'Mensual', badge: 'SIN IA', features: ['Análisis de productos ilimitados*', 'PDF y Excel con historial', 'Regulatory Twin + Radar', 'Compatible con exportaciones de Shopify, Amazon y Etsy', 'ImportVerifier AI no incluido'], cta: 'Elegir mensual' },
    annual: { label: 'Anual', badge: 'MEJOR VALOR', features: ['Todo lo del plan Mensual', 'ImportVerifier AI incluido', 'PDF y Excel con historial', 'Regulatory Twin + Radar', 'Importaciones de catálogo compatibles'], cta: 'Elegir anual' },
    lifetime: { label: 'Lifetime', badge: 'PAGO ÚNICO', features: ['Todo lo del plan Anual', 'ImportVerifier AI incluido', 'Acceso permanente', 'Sin renovación', 'Historial y exportaciones'], cta: 'Elegir Lifetime' },
    custom: { label: 'Personalizada', badge: 'A TU MARCA', body: 'Versión adaptada de ImportVerifier con trabajo técnico incluido.', features: ['ImportVerifier AI incluido', 'Personalización técnica', 'Dominio propio', 'Logo e identidad visual', 'Integración de WhatsApp'], cta: 'Crear versión personalizada' },
    trialProof: `${FREE_TRIAL_PRODUCT_LIMIT} productos gratis · sin tarjeta`, unlimitedProof: 'Continúa con análisis ilimitados desde el plan Mensual', verifiedReview: 'REVISIÓN IMPORTVERIFIER', intelligenceTitle: 'AI + Twin + Radar, en el mismo producto.', intelligenceLead: 'ImportVerifier separa el análisis determinista de la asistencia de IA para que cada plan sea claro.', aiBody: 'ImportVerifier AI incluido desde Anual.', twinBody: 'Estado regulatorio estructurado por producto.', radarBody: 'espacio Radar (monitorización oficial cuando esté activada)', billingFaqQuestion: '¿Qué cambia entre los planes?', billingFaqAnswer: (monthly, annual, lifetime, custom) => `Mensual (${monthly}) no incluye ImportVerifier AI. Anual (${annual}) sí incluye IA. Lifetime (${lifetime}) mantiene esas funciones con pago único. Personalizada (${custom}) añade dominio, logo, adaptación técnica e integración de WhatsApp.`, fairUse: '*Uso ilimitado sujeto a medidas técnicas razonables contra abuso automatizado.'
  },
  en: {
    pricingEyebrow: 'FOUR WAYS TO WORK', pricingTitle: 'Choose by capability, not fine print.', pricingLead: 'Monthly keeps unlimited analysis without AI. ImportVerifier AI starts with Annual. Lifetime adds permanent access and Custom adds technical brand adaptation.',
    monthly: { label: 'Monthly', badge: 'NO AI', features: ['Unlimited product analysis*', 'PDF and Excel history', 'Regulatory Twin + Radar', 'Compatible with Shopify, Amazon and Etsy exports', 'ImportVerifier AI not included'], cta: 'Choose monthly' },
    annual: { label: 'Annual', badge: 'BEST VALUE', features: ['Everything in Monthly', 'ImportVerifier AI included', 'PDF and Excel history', 'Regulatory Twin + Radar', 'Compatible catalogue imports'], cta: 'Choose annual' },
    lifetime: { label: 'Lifetime', badge: 'ONE-TIME', features: ['Everything in Annual', 'ImportVerifier AI included', 'Permanent access', 'No renewal', 'History and exports'], cta: 'Choose Lifetime' },
    custom: { label: 'Custom', badge: 'YOUR BRAND', body: 'A branded ImportVerifier version with technical customization included.', features: ['ImportVerifier AI included', 'Technical customization', 'Custom domain', 'Logo and visual identity', 'WhatsApp integration'], cta: 'Create custom version' },
    trialProof: `${FREE_TRIAL_PRODUCT_LIMIT} free products · no card`, unlimitedProof: 'Continue with unlimited analysis from Monthly', verifiedReview: 'IMPORTVERIFIER REVIEW', intelligenceTitle: 'AI + Twin + Radar, in one product.', intelligenceLead: 'ImportVerifier separates deterministic analysis from AI assistance so every plan remains clear.', aiBody: 'ImportVerifier AI is included from Annual.', twinBody: 'Structured regulatory status for each product.', radarBody: 'Radar workspace (official monitoring when activated)', billingFaqQuestion: 'What changes between plans?', billingFaqAnswer: (monthly, annual, lifetime, custom) => `Monthly (${monthly}) does not include ImportVerifier AI. Annual (${annual}) includes AI. Lifetime (${lifetime}) keeps those features with a one-time payment. Custom (${custom}) adds domain, logo, technical adaptation and WhatsApp integration.`, fairUse: '*Unlimited use is subject to reasonable technical safeguards against automated abuse.'
  },
  fr: {
    pricingEyebrow: 'QUATRE FORMULES', pricingTitle: 'Choisissez selon les capacités.', pricingLead: 'Mensuel conserve les analyses illimitées sans IA. ImportVerifier AI est inclus à partir d’Annuel. Lifetime ajoute un accès permanent et Personnalisée l’adaptation à votre marque.',
    monthly: { label: 'Mensuel', badge: 'SANS IA', features: ['Analyses illimitées*', 'PDF et Excel avec historique', 'Regulatory Twin + Radar', 'Exports Shopify, Amazon et Etsy compatibles', 'ImportVerifier AI non inclus'], cta: 'Choisir mensuel' },
    annual: { label: 'Annuel', badge: 'MEILLEUR CHOIX', features: ['Tout le Mensuel', 'ImportVerifier AI inclus', 'PDF et Excel', 'Regulatory Twin + Radar', 'Imports catalogue compatibles'], cta: 'Choisir annuel' },
    lifetime: { label: 'Lifetime', badge: 'PAIEMENT UNIQUE', features: ['Tout l’Annuel', 'ImportVerifier AI inclus', 'Accès permanent', 'Sans renouvellement', 'Historique et exports'], cta: 'Choisir Lifetime' },
    custom: { label: 'Personnalisée', badge: 'VOTRE MARQUE', body: 'Version ImportVerifier adaptée avec personnalisation technique.', features: ['ImportVerifier AI inclus', 'Personnalisation technique', 'Nom de domaine', 'Logo et identité visuelle', 'Intégration WhatsApp'], cta: 'Créer ma version' },
    trialProof: `${FREE_TRIAL_PRODUCT_LIMIT} produits gratuits · sans carte`, unlimitedProof: 'Poursuivez avec des analyses illimitées dès Mensuel', verifiedReview: 'REVUE IMPORTVERIFIER', intelligenceTitle: 'AI + Twin + Radar, dans un seul produit.', intelligenceLead: 'ImportVerifier sépare l’analyse déterministe de l’assistance IA pour clarifier chaque formule.', aiBody: 'ImportVerifier AI est inclus à partir d’Annuel.', twinBody: 'État réglementaire structuré par produit.', radarBody: 'Espace Radar (suivi officiel lorsqu’il est activé)', billingFaqQuestion: 'Quelles différences entre les formules ?', billingFaqAnswer: (monthly, annual, lifetime, custom) => `Mensuel (${monthly}) n’inclut pas ImportVerifier AI. Annuel (${annual}) inclut l’IA. Lifetime (${lifetime}) offre ces fonctions en paiement unique. Personnalisée (${custom}) ajoute domaine, logo, adaptation technique et WhatsApp.`, fairUse: '*Utilisation illimitée soumise à des protections techniques raisonnables.'
  },
  de: {
    pricingEyebrow: 'VIER MODELLE', pricingTitle: 'Nach Leistung wählen, nicht nach Kleingedrucktem.', pricingLead: 'Monatlich bietet unbegrenzte Analysen ohne AI. ImportVerifier AI ist ab Jährlich enthalten. Lifetime bietet dauerhaften Zugang; Individuell ergänzt Markenanpassung.',
    monthly: { label: 'Monatlich', badge: 'OHNE AI', features: ['Unbegrenzte Produktanalysen*', 'PDF und Excel', 'Regulatory Twin + Radar', 'Shopify-, Amazon- und Etsy-Exporte kompatibel', 'ImportVerifier AI nicht enthalten'], cta: 'Monatlich wählen' },
    annual: { label: 'Jährlich', badge: 'BESTER WERT', features: ['Alles aus Monatlich', 'ImportVerifier AI inklusive', 'PDF und Excel', 'Regulatory Twin + Radar', 'Kompatible Katalogimporte'], cta: 'Jährlich wählen' },
    lifetime: { label: 'Lifetime', badge: 'EINMALIG', features: ['Alles aus Jährlich', 'ImportVerifier AI inklusive', 'Dauerhafter Zugang', 'Keine Verlängerung', 'Verlauf und Exporte'], cta: 'Lifetime wählen' },
    custom: { label: 'Individuell', badge: 'IHRE MARKE', body: 'Technisch angepasste ImportVerifier-Version für Ihre Marke.', features: ['ImportVerifier AI inklusive', 'Technische Anpassung', 'Eigene Domain', 'Logo und visuelle Identität', 'WhatsApp-Integration'], cta: 'Individuelle Version erstellen' },
    trialProof: `${FREE_TRIAL_PRODUCT_LIMIT} Produkte kostenlos · keine Karte`, unlimitedProof: 'Unbegrenzte Analysen ab Monatlich', verifiedReview: 'IMPORTVERIFIER-PRÜFUNG', intelligenceTitle: 'AI + Twin + Radar in einem Produkt.', intelligenceLead: 'ImportVerifier trennt deterministische Analyse von AI-Unterstützung und hält die Tarife klar.', aiBody: 'ImportVerifier AI ist ab Jährlich enthalten.', twinBody: 'Strukturierter Regulierungsstatus pro Produkt.', radarBody: 'Radar-Arbeitsbereich (offizielle Überwachung nach Aktivierung)', billingFaqQuestion: 'Was unterscheidet die Modelle?', billingFaqAnswer: (monthly, annual, lifetime, custom) => `Monatlich (${monthly}) enthält keine ImportVerifier AI. Jährlich (${annual}) enthält AI. Lifetime (${lifetime}) bietet diese Funktionen einmalig. Individuell (${custom}) ergänzt Domain, Logo, technische Anpassung und WhatsApp.`, fairUse: '*Unbegrenzte Nutzung unter angemessenen technischen Schutzmaßnahmen.'
  },
  it: {
    pricingEyebrow: 'QUATTRO MODALITÀ', pricingTitle: 'Scegli in base alle capacità.', pricingLead: 'Mensile mantiene analisi illimitate senza IA. ImportVerifier AI è incluso da Annuale. Lifetime aggiunge accesso permanente e Personalizzata l’adattamento al brand.',
    monthly: { label: 'Mensile', badge: 'SENZA IA', features: ['Analisi prodotti illimitate*', 'PDF ed Excel', 'Regulatory Twin + Radar', 'Export Shopify, Amazon ed Etsy compatibili', 'ImportVerifier AI non incluso'], cta: 'Scegli mensile' },
    annual: { label: 'Annuale', badge: 'MIGLIOR VALORE', features: ['Tutto il Mensile', 'ImportVerifier AI incluso', 'PDF ed Excel', 'Regulatory Twin + Radar', 'Import catalogo compatibili'], cta: 'Scegli annuale' },
    lifetime: { label: 'Lifetime', badge: 'PAGAMENTO UNICO', features: ['Tutto l’Annuale', 'ImportVerifier AI incluso', 'Accesso permanente', 'Nessun rinnovo', 'Storico ed esportazioni'], cta: 'Scegli Lifetime' },
    custom: { label: 'Personalizzata', badge: 'IL TUO BRAND', body: 'Versione ImportVerifier adattata con personalizzazione tecnica.', features: ['ImportVerifier AI incluso', 'Personalizzazione tecnica', 'Dominio personalizzato', 'Logo e identità visiva', 'Integrazione WhatsApp'], cta: 'Crea versione personalizzata' },
    trialProof: `${FREE_TRIAL_PRODUCT_LIMIT} prodotti gratis · senza carta`, unlimitedProof: 'Continua con analisi illimitate dal Mensile', verifiedReview: 'REVISIONE IMPORTVERIFIER', intelligenceTitle: 'AI + Twin + Radar, nello stesso prodotto.', intelligenceLead: 'ImportVerifier separa l’analisi deterministica dall’assistenza IA per rendere chiaro ogni piano.', aiBody: 'ImportVerifier AI è incluso da Annuale.', twinBody: 'Stato normativo strutturato per prodotto.', radarBody: 'Spazio Radar (monitoraggio ufficiale quando attivato)', billingFaqQuestion: 'Cosa cambia tra i piani?', billingFaqAnswer: (monthly, annual, lifetime, custom) => `Mensile (${monthly}) non include ImportVerifier AI. Annuale (${annual}) include l’IA. Lifetime (${lifetime}) offre le stesse funzioni con pagamento unico. Personalizzata (${custom}) aggiunge dominio, logo, adattamento tecnico e WhatsApp.`, fairUse: '*Uso illimitato soggetto a protezioni tecniche ragionevoli.'
  },
  pt: {
    pricingEyebrow: 'QUATRO FORMAS', pricingTitle: 'Escolha por capacidade.', pricingLead: 'Mensal mantém análises ilimitadas sem IA. ImportVerifier AI entra a partir do Anual. Lifetime acrescenta acesso permanente e Personalizada a adaptação à marca.',
    monthly: { label: 'Mensal', badge: 'SEM IA', features: ['Análises ilimitadas*', 'PDF e Excel', 'Regulatory Twin + Radar', 'Exportações Shopify, Amazon e Etsy compatíveis', 'ImportVerifier AI não incluído'], cta: 'Escolher mensal' },
    annual: { label: 'Anual', badge: 'MELHOR VALOR', features: ['Tudo do Mensal', 'ImportVerifier AI incluído', 'PDF e Excel', 'Regulatory Twin + Radar', 'Importações de catálogo compatíveis'], cta: 'Escolher anual' },
    lifetime: { label: 'Lifetime', badge: 'PAGAMENTO ÚNICO', features: ['Tudo do Anual', 'ImportVerifier AI incluído', 'Acesso permanente', 'Sem renovação', 'Histórico e exportações'], cta: 'Escolher Lifetime' },
    custom: { label: 'Personalizada', badge: 'A SUA MARCA', body: 'Versão ImportVerifier adaptada com personalização técnica.', features: ['ImportVerifier AI incluído', 'Personalização técnica', 'Domínio próprio', 'Logótipo e identidade visual', 'Integração WhatsApp'], cta: 'Criar versão personalizada' },
    trialProof: `${FREE_TRIAL_PRODUCT_LIMIT} produtos grátis · sem cartão`, unlimitedProof: 'Continue com análises ilimitadas a partir do Mensal', verifiedReview: 'REVISÃO IMPORTVERIFIER', intelligenceTitle: 'AI + Twin + Radar, no mesmo produto.', intelligenceLead: 'ImportVerifier separa a análise determinística da assistência de IA para manter cada plano claro.', aiBody: 'ImportVerifier AI está incluído a partir do Anual.', twinBody: 'Estado regulamentar estruturado por produto.', radarBody: 'Espaço Radar (monitorização oficial quando ativada)', billingFaqQuestion: 'O que muda entre os planos?', billingFaqAnswer: (monthly, annual, lifetime, custom) => `Mensal (${monthly}) não inclui ImportVerifier AI. Anual (${annual}) inclui IA. Lifetime (${lifetime}) mantém essas funções com pagamento único. Personalizada (${custom}) acrescenta domínio, logótipo, adaptação técnica e WhatsApp.`, fairUse: '*Utilização ilimitada sujeita a proteções técnicas razoáveis.'
  },
};

export default async function Home({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const language: Language = isLanguage(params.lang) ? params.lang : await serverLanguage();
  const t = landingCopy[language];
  const extra = landingExtras[language];
  const price = (value: number) => new Intl.NumberFormat(localeFor(language), { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  const monthlyOffer = UNLIMITED_PUBLIC_OFFERS.find(offer => offer.id === 'monthly')!;
  const annualOffer = UNLIMITED_PUBLIC_OFFERS.find(offer => offer.id === 'annual')!;
  const lifetimeOffer = UNLIMITED_PUBLIC_OFFERS.find(offer => offer.id === 'lifetime')!;
  const monthlyPrice = price(monthlyOffer.priceEur);
  const annualPrice = price(annualOffer.priceEur);
  const lifetimePrice = price(lifetimeOffer.priceEur);
  const customPrice = price(PERSONALIZED_PUBLIC_OFFER.priceEur);
  const billingChoices = [
    { id: 'monthly', copy: extra.monthly, price: monthlyPrice, cadence: t.pricing.perMonth },
    { id: 'annual', copy: extra.annual, price: annualPrice, cadence: extra.annual.label.toLocaleLowerCase(localeFor(language)) },
    { id: 'lifetime', copy: extra.lifetime, price: lifetimePrice, cadence: extra.lifetime.badge.toLocaleLowerCase(localeFor(language)) },
  ] as const;

  const structuredData = {
    '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: BRAND_NAME,
    applicationCategory: 'BusinessApplication', operatingSystem: 'Web', description: t.hero.lead,
    areaServed: { '@type': 'AdministrativeArea', name: t.markets.cards.EU.name },
    offers: [
      { '@type': 'Offer', name: t.pricing.freeTitle, price: '0', priceCurrency: 'EUR', description: t.pricing.freeBody },
      { '@type': 'Offer', name: `Unlimited · ${extra.monthly.label}`, price: String(monthlyOffer.priceEur), priceCurrency: 'EUR', description: extra.pricingLead, availability: 'https://schema.org/InStock' },
      { '@type': 'Offer', name: `Unlimited · ${extra.annual.label}`, price: String(annualOffer.priceEur), priceCurrency: 'EUR', description: extra.pricingLead, availability: 'https://schema.org/InStock' },
      { '@type': 'Offer', name: `Unlimited · ${extra.lifetime.label}`, price: String(lifetimeOffer.priceEur), priceCurrency: 'EUR', description: extra.pricingLead, availability: 'https://schema.org/InStock' },
      { '@type': 'Offer', name: `ImportVerifier · ${extra.custom.label}`, price: String(PERSONALIZED_PUBLIC_OFFER.priceEur), priceCurrency: 'EUR', description: extra.custom.body, availability: 'https://schema.org/InStock' },
    ],
  };

  return <main className="shell landing-shell">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
    <nav className="nav landing-nav" aria-label={BRAND_NAME}>
      <Brand market="EU" />
      <div className="navlinks"><a className="nav-link-button" href="#como-funciona">{t.nav.how}</a><a className="nav-link-button" href="#mercados">{t.nav.markets}</a><a className="nav-link-button" href="#planes">{t.nav.pricing}</a><LandingLanguagePicker language={language} label={t.nav.language} /><Link className="btn primary nav-cta" href={`/login?lang=${language}`}>{t.nav.login}</Link></div>
    </nav>

    <section className="hero landing-hero">
      <div className="hero-copy"><EURegulatoryIdentity label={t.hero.eyebrow} detail={t.hero.independent} /><h1>{t.hero.title}</h1><p className="lead">{t.hero.lead}</p><div className="hero-actions"><Link className="btn primary hero-primary" href={`/login?lang=${language}`}>{t.hero.primary}</Link><a className="btn ghost hero-secondary" href="#producto">{t.hero.secondary}</a></div><div className="hero-offer-proof"><span>✓ {extra.trialProof}</span><span>{extra.unlimitedProof} · {monthlyPrice}/mes · {annualPrice}/año · {lifetimePrice} Lifetime</span><span>PDF + Excel</span></div><div className="trust-row" aria-label={t.hero.trust.join(', ')}>{t.hero.trust.map(item => <span key={item}>{item}</span>)}</div><p className="legal-note">{t.hero.legal}</p></div>
      <div className="hero-verified-seal" aria-label={`VERIFIED · ${extra.verifiedReview}`}><strong>VERIFIED</strong><span>{extra.verifiedReview}</span></div>
      <div className="product-preview" id="producto" aria-label={t.preview.fictional}><div className="preview-toolbar"><div><span className="preview-kicker">IMPORTVERIFIER · EUROPE</span><strong>{t.preview.file}</strong></div><span className="preview-badge">🇪🇺 {t.preview.count}</span></div><div className="preview-score-row"><div><span className="preview-label">{t.preview.incomplete}</span><div className="score">72<span>/100</span></div></div><div className="preview-summary"><strong>{t.preview.priority}</strong><p>{t.preview.summary}</p></div></div><div className="preview-list">{t.preview.products.map((product, index) => <div key={product}><span>{product}</span><span className={`pill ${index === 0 ? 'high' : index === 1 ? 'medium' : 'low'}`}>{t.preview.priorities[index]}</span></div>)}</div><div className="preview-next"><span>ImportVerifier AI</span><span>Regulatory Twin</span><span>Impact Radar</span></div><div className="preview-footer"><span>{t.preview.fictional}</span><span>{t.preview.reports}</span></div></div>
    </section>

    <section className="value-strip" aria-label={t.values.map(value => value.title).join(', ')}>{t.values.map(value => <div key={value.title}><strong>{value.title}</strong><span>{value.body}</span></div>)}</section>
    <BrandLogos group="commerce" label={t.compatibility.commerceLabel} note={t.compatibility.commerceNote} />

    <section className="section product-story" id="como-funciona"><div className="section-heading"><div className="eyebrow">{t.flow.eyebrow}</div><h2>{t.flow.title}</h2><p className="lead">{t.flow.lead}</p></div><div className="grid feature-grid">{t.flow.items.map((item, index) => <article className="card feature-card" key={item.title}><span className="step-number">{String(index + 1).padStart(2, '0')}</span><h3>{item.title}</h3><p className="muted">{item.body}</p></article>)}</div></section>

    <section className="section methodology-section"><div className="method-copy"><div className="eyebrow">IMPORTVERIFIER INTELLIGENCE</div><h2>{extra.intelligenceTitle}</h2><p className="lead">{extra.intelligenceLead}</p><div className="official-links"><a href={`https://eur-lex.europa.eu/eli/reg/2023/988/oj?locale=${language}`} target="_blank" rel="noopener noreferrer">{t.method.gpsr}</a><a href="https://single-market-economy.ec.europa.eu/single-market/goods/ce-marking/manufacturers_en" target="_blank" rel="noopener noreferrer">{t.method.ce}</a></div></div><div className="method-cards"><article><span>01</span><div><strong>ImportVerifier AI</strong><p>{extra.aiBody}</p></div></article><article><span>02</span><div><strong>Product Regulatory Twin</strong><p>{extra.twinBody}</p></div></article><article><span>03</span><div><strong>Impact Radar</strong><p>{extra.radarBody}</p></div></article></div></section>

    <section className="section market-section" id="mercados"><div className="market-heading"><div><div className="eyebrow">{t.markets.eyebrow}</div><h2>{t.markets.title}</h2></div><p>{t.markets.body}</p></div><div className="market-grid">{MARKETS_BY_RANK.map(market => { const localized = t.markets.cards[market.code]; return <article className={`market-card ${market.code === 'EU' ? 'active' : ''}`} key={market.code}><div className="market-card-top"><span className="market-card-flag" aria-hidden="true">{market.flag}</span><span className={market.code === 'EU' ? 'coverage-live' : 'coverage-next'}>{market.code === 'EU' ? t.markets.active : t.markets.preparing}</span></div><h3>{localized.name}</h3><p>{localized.promise}</p><small>#{market.rank} · {localized.volume}</small>{market.code === 'EU' ? <a href={market.sourceUrl.replace('locale=es', `locale=${language}`)} target="_blank" rel="noopener noreferrer">{t.markets.viewSource}</a> : <span>{t.markets.nextModule}</span>}</article>; })}</div></section>

    <section className="section pricing-section" id="planes">
      <div className="toprow pricing-heading"><div><div className="eyebrow">{extra.pricingEyebrow}</div><h2>{extra.pricingTitle}</h2><p className="muted">{extra.pricingLead}</p></div><div className="availability-note">{t.pricing.availability}</div></div>
      <div className="free-trial-card"><div><span>{t.pricing.freeTitle}</span><strong>{FREE_TRIAL_PRODUCT_LIMIT} {t.pricing.products}</strong><p>{t.pricing.freeBody}</p></div><Link className="btn ghost" href={`/login?lang=${language}`}>{t.pricing.freeCta}</Link></div>
      <div className="plans polished-plans global-plans">{billingChoices.map(choice => <article className={`plan ${choice.id === 'annual' ? 'featured' : ''}`} key={choice.id}><span className="plan-label">{choice.copy.badge}</span><b>Unlimited · {choice.copy.label}</b><div className="price">{choice.price}</div><span className="plan-cadence">{choice.cadence}</span><ul className="plan-features">{choice.copy.features.map(feature => <li key={feature}>✓ {feature}</li>)}</ul><Link className={`btn ${choice.id === 'annual' ? 'primary' : 'ghost'} plan-button`} href={`/login?plan=starter&billing=${choice.id}&lang=${language}`}>{choice.copy.cta}</Link></article>)}</div>
      <article className="plan personalized-plan"><span className="plan-label">{extra.custom.badge}</span><b>ImportVerifier · {extra.custom.label}</b><div className="price">{customPrice}</div><span className="plan-cadence">{extra.lifetime.badge.toLocaleLowerCase(localeFor(language))}</span><p className="muted">{extra.custom.body}</p><ul className="plan-features">{extra.custom.features.map(feature => <li key={feature}>✓ {feature}</li>)}</ul><Link className="btn primary plan-button" href={`/login?plan=starter&billing=custom&lang=${language}`}>{extra.custom.cta}</Link></article>
      <p className="pricing-honesty">{extra.fairUse} {t.pricing.honesty}</p>
      <div className="pricing-trust-grid"><BrandLogos group="payments" label={t.compatibility.paymentLabel} note={t.compatibility.paymentNote} compact /><TrustMark title={t.trust.title} detail={t.trust.detail} httpsLabel={t.trust.https} explanation={t.trust.explanation} compact /></div>
    </section>

    <section className="section faq-section"><div className="faq-heading"><div className="eyebrow">{t.faq.eyebrow}</div><h2>{t.faq.title}</h2></div><div className="faq-list">{t.faq.items.slice(0,2).map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}<details><summary>{extra.billingFaqQuestion}</summary><p>{extra.billingFaqAnswer(monthlyPrice, annualPrice, lifetimePrice, customPrice)}</p></details>{t.faq.items.slice(3,4).map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>
    <section className="final-cta"><div><div className="eyebrow">{t.final.eyebrow}</div><h2>{t.final.title}</h2><p>{t.final.body}</p></div><Link className="btn primary" href={`/login?lang=${language}`}>{t.final.cta}</Link></section>
    <BrandLogos group="infrastructure" label={t.compatibility.infrastructureLabel} note={t.compatibility.infrastructureNote} compact />
    <footer className="landing-footer"><Brand market="EU" asLink={false} /><div><a href={`https://eur-lex.europa.eu/eli/reg/2023/988/oj?locale=${language}`} target="_blank" rel="noopener noreferrer">{t.footer.sources}</a><Link href={`/privacy?lang=${language}`}>{t.footer.privacy}</Link><Link href={`/terms?lang=${language}`}>{t.footer.terms}</Link><a href="mailto:importverifier@gmail.com">{t.footer.support}</a><span>{t.footer.guidance}</span></div></footer>
  </main>;
}
