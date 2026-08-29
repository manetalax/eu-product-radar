'use client';

import Link from 'next/link';
import Brand from '@/components/Brand';
import { MARKETS_BY_RANK } from '@/lib/markets';

const plans = [
  { name: 'Gratis', price: '0 €', cadence: 'para siempre', limit: '5 productos al mes', detail: 'Prueba el flujo completo con historial privado e informes.', cta: 'Empezar gratis', href: '/login' },
  { name: 'Pro', price: '19 €', cadence: 'al mes', limit: 'Hasta 100 productos', detail: 'Para catálogos pequeños que necesitan revisiones frecuentes.', cta: 'Reservar Pro', href: '/login?plan=pro', featured: true },
  { name: 'Business', price: '49 €', cadence: 'al mes', limit: 'Hasta 500 productos', detail: 'Para importadores con más referencias y ritmo operativo.', cta: 'Reservar Business', href: '/login?plan=business' },
  { name: 'Auditoría', price: '29 €', cadence: 'pago único', limit: 'Una revisión puntual', detail: 'Para quien prefiere empezar por un catálogo concreto.', cta: 'Reservar auditoría', href: '/login?plan=audit' },
];

const faqs = [
  ['¿Product Radar certifica que un producto cumple?', 'No. Detecta información básica incompleta, organiza prioridades y señala fuentes oficiales. La conformidad exacta depende del producto y puede exigir una evaluación técnica o jurídica.'],
  ['¿Qué necesito para empezar?', 'Un CSV o Excel con nombre, fabricante, operador responsable en la UE y advertencias de seguridad. Puedes descargar una plantilla dentro de tu cuenta.'],
  ['¿Qué ocurre con mis catálogos?', 'Cada análisis queda asociado a tu cuenta y separado de otras cuentas. Recomendamos no subir datos personales ni secretos comerciales innecesarios.'],
  ['¿Por qué Europa es el único mercado activo?', 'Porque preferimos una cobertura europea útil y verificable antes de activar otros países. La plataforma ya separa reglas, fuentes e informes por mercado.'],
  ['¿Cuándo estarán disponibles los planes de pago?', 'La apertura será gradual. Puedes registrar tu interés sin activar cobros; te avisaremos antes de cualquier contratación.'],
];

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Product Radar',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'Plataforma para detectar información incompleta y preparar catálogos de producto para el mercado europeo.',
  areaServed: { '@type': 'AdministrativeArea', name: 'European Union' },
  offers: [
    { '@type': 'Offer', name: 'Gratis', price: '0', priceCurrency: 'EUR', description: '5 productos al mes' },
    { '@type': 'Offer', name: 'Pro', price: '19', priceCurrency: 'EUR', description: 'Hasta 100 productos al mes', availability: 'https://schema.org/PreOrder' },
    { '@type': 'Offer', name: 'Business', price: '49', priceCurrency: 'EUR', description: 'Hasta 500 productos al mes', availability: 'https://schema.org/PreOrder' },
  ],
  featureList: ['Importación CSV y Excel', 'Indicador explicable', 'Guía documental europea', 'Informes Excel y PDF', 'Historial privado'],
};

export default function Home() {
  return <main className="shell landing-shell">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
    <nav className="nav landing-nav">
      <Brand />
      <div className="navlinks">
        <button className="nav-link-button" onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}>Cómo funciona</button>
        <button className="nav-link-button" onClick={() => document.getElementById('mercados')?.scrollIntoView({ behavior: 'smooth' })}>Mercados</button>
        <button className="nav-link-button" onClick={() => document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' })}>Precios</button>
        <Link className="btn primary nav-cta" href="/login">Entrar</Link>
      </div>
    </nav>

    <section className="hero landing-hero">
      <div className="hero-copy">
        <div className="eyebrow hero-eyebrow"><span className="status-dot" />EUROPA ACTIVA · PLATAFORMA GLOBAL</div>
        <h1>Tu catálogo europeo, preparado antes de vender.</h1>
        <p className="lead">Encuentra información incompleta, convierte cada alerta en una tarea y conserva la evidencia en informes claros. Un flujo diseñado para importadores que no quieren improvisar.</p>
        <div className="hero-actions">
          <Link className="btn primary hero-primary" href="/dashboard">Analizar 5 productos gratis</Link>
          <button className="btn ghost hero-secondary" onClick={() => document.getElementById('producto')?.scrollIntoView({ behavior: 'smooth' })}>Ver cómo funciona</button>
        </div>
        <div className="trust-row" aria-label="Características principales">
          <span>Sin tarjeta</span><span>Plantilla incluida</span><span>Excel y PDF</span><span>Historial privado</span>
        </div>
        <p className="legal-note">Herramienta orientativa. No certifica conformidad ni sustituye asesoramiento profesional.</p>
      </div>

      <div className="product-preview" id="producto" aria-label="Ejemplo de resultado">
        <div className="preview-toolbar"><div><span className="preview-kicker">PRODUCT RADAR · EUROPA</span><strong>catalogo-ejemplo.xlsx</strong></div><span className="preview-badge">🇪🇺 12 productos</span></div>
        <div className="preview-score-row"><div><span className="preview-label">Campos incompletos</span><div className="score">72<span>/100</span></div></div><div className="preview-summary"><strong>3 requieren atención prioritaria</strong><p>Fabricante, operador responsable y advertencias concentran los principales huecos.</p></div></div>
        <div className="preview-list">
          <div><span>Auriculares inalámbricos</span><span className="pill high">ALTA</span></div>
          <div><span>Lámpara LED portátil</span><span className="pill medium">MEDIA</span></div>
          <div><span>Botella térmica</span><span className="pill low">BAJA</span></div>
        </div>
        <div className="preview-next"><span>Qué pedir</span><span>Dónde conseguirlo</span><span>Fuente oficial</span></div>
        <div className="preview-footer"><span>Ejemplo ilustrativo · datos ficticios</span><span>Informe Excel + PDF</span></div>
      </div>
    </section>

    <section className="value-strip" aria-label="Ventajas"><div><strong>Importa</strong><span>CSV, XLS o XLSX</span></div><div><strong>Prioriza</strong><span>Detecta campos incompletos</span></div><div><strong>Documenta</strong><span>Guía y fuentes oficiales</span></div><div><strong>Exporta</strong><span>Informes trazables</span></div></section>

    <section className="section product-story" id="como-funciona">
      <div className="section-heading"><div className="eyebrow">UN FLUJO, TRES PASOS</div><h2>De catálogo incierto a un plan de trabajo.</h2><p className="lead">Menos tiempo adivinando qué falta. Más claridad sobre qué revisar, qué pedir al proveedor y cómo dejar constancia.</p></div>
      <div className="grid feature-grid">
        <article className="card feature-card"><span className="step-number">01</span><h3>Empieza con una estructura correcta</h3><p className="muted">Descarga la plantilla o importa tu archivo. Validamos formatos, tamaño y campos antes de guardar nada.</p></article>
        <article className="card feature-card"><span className="step-number">02</span><h3>Ve primero lo importante</h3><p className="muted">Cada producto recibe un indicador explicable y una prioridad basada en los campos que faltan.</p></article>
        <article className="card feature-card"><span className="step-number">03</span><h3>Convierte el aviso en evidencia</h3><p className="muted">Consulta qué documentación puede aplicar, su fuente oficial y exporta una instantánea con trazabilidad.</p></article>
      </div>
    </section>

    <section className="section market-section" id="mercados">
      <div className="market-heading"><div><div className="eyebrow">ARQUITECTURA INTERNACIONAL</div><h2>Europa hoy. El mundo, mercado a mercado.</h2></div><p>Una sola marca y una sola cuenta. Cada destino tendrá su propio módulo de reglas, documentación, fuentes y versiones, sin duplicar la web ni fragmentar tus catálogos.</p></div>
      <div className="market-grid">{MARKETS_BY_RANK.map(market => <article className={`market-card ${market.code === 'EU' ? 'active' : ''}`} key={market.code}><div className="market-card-top"><span className="market-card-flag" aria-hidden="true">{market.flag}</span><span className={market.code === 'EU' ? 'coverage-live' : 'coverage-next'}>{market.code === 'EU' ? 'ACTIVO' : 'EN PREPARACIÓN'}</span></div><h3>{market.name}</h3><p>{market.promise}</p><small>N.º {market.rank} · {market.imports2024}</small>{market.code === 'EU' ? <a href={market.sourceUrl} target="_blank" rel="noopener noreferrer">Ver fuente regulatoria ↗</a> : <span>Próximo módulo</span>}</article>)}</div>
      <p className="market-source">Orden por importaciones de mercancías en 2024, considerando la UE como un único mercado: <a href="https://www.wto.org/english/res_e/booksp_e/trade_outlook25_e.pdf" target="_blank" rel="noopener noreferrer">Global Trade Outlook 2025, OMC ↗</a></p>
    </section>

    <section className="section methodology-section">
      <div className="method-copy"><div className="eyebrow">CONFIANZA SIN HUMO</div><h2>Explicable por diseño.</h2><p className="lead">Sabes qué se ha comprobado, con qué versión y qué queda fuera del alcance. Cada informe conserva el archivo, la fecha, el mercado y las reglas utilizadas.</p><div className="official-links"><a href="https://eur-lex.europa.eu/eli/reg/2023/988/oj?locale=es" target="_blank" rel="noopener noreferrer">Reglamento GPSR · EUR-Lex ↗</a><a href="https://single-market-economy.ec.europa.eu/single-market/goods/ce-marking/manufacturers_en" target="_blank" rel="noopener noreferrer">Marcado CE · Comisión Europea ↗</a></div></div>
      <div className="method-cards"><article><span>01</span><div><strong>Regla visible</strong><p>8 puntos de base y 28 por cada campo básico vacío. La prioridad no equivale a riesgo legal.</p></div></article><article><span>02</span><div><strong>Datos sin adornos</strong><p>Un dato presente queda “aportado; sin verificar”. Nunca lo convertimos en una certificación ficticia.</p></div></article><article><span>03</span><div><strong>Historial reproducible</strong><p>Los análisis anteriores conservan su versión y siguen abriéndose aunque el producto evolucione.</p></div></article></div>
    </section>

    <section className="section" id="planes">
      <div className="toprow pricing-heading"><div><div className="eyebrow">PRECIOS CLAROS</div><h2>Empieza gratis. Escala cuando aporte valor.</h2><p className="muted">El plan gratuito incluye el flujo completo con 5 productos al mes. Los planes de pago abrirán de forma gradual.</p></div><div className="availability-note">Sin cargos durante la reserva</div></div>
      <div className="plans polished-plans global-plans">{plans.map(plan => <article className={`plan ${plan.featured ? 'featured' : ''}`} key={plan.name}>{plan.featured && <span className="plan-label">RECOMENDADO</span>}<b>{plan.name}</b><div className="price">{plan.price}</div><span className="plan-cadence">{plan.cadence}</span><p className="plan-limit">{plan.limit}</p><p className="muted">{plan.detail}</p><Link className={plan.featured ? 'btn primary plan-button' : 'btn ghost plan-button'} href={plan.href}>{plan.cta}</Link></article>)}</div>
      <p className="pricing-honesty">Reservar un plan solo registra interés. No activa una suscripción, no solicita tarjeta y no genera ningún cargo.</p>
    </section>

    <section className="section faq-section"><div className="faq-heading"><div className="eyebrow">PREGUNTAS FRECUENTES</div><h2>Antes de subir tu catálogo.</h2></div><div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>

    <section className="final-cta"><div><div className="eyebrow">EMPIEZA CON CINCO PRODUCTOS</div><h2>La mejor prueba es tu propio catálogo.</h2><p>Sin tarjeta. Con plantilla, historial e informes desde el primer análisis.</p></div><Link className="btn primary" href="/login">Crear cuenta gratis</Link></section>

    <footer className="landing-footer"><Brand asLink={false} /><div><a href="https://eur-lex.europa.eu/eli/reg/2023/988/oj?locale=es" target="_blank" rel="noopener noreferrer">Fuentes oficiales</a><span>Privacidad por cuenta</span><span>Información orientativa · 2026</span></div></footer>
  </main>;
}
