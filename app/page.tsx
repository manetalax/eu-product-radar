'use client';
import { useState } from 'react';
import { copy, Lang, langs } from '@/lib/i18n';
import DemoDashboard from '@/components/DemoDashboard';
import Link from 'next/link';

const plans = [
  { n: 'Free', p: '0 €', l: '5 productos/mes', d: 'Para descubrir cómo funciona.' },
  { n: 'Starter', p: '19 €/mes', l: '100 productos', d: 'Para catálogos pequeños y frecuentes.' },
  { n: 'Pro', p: '49 €/mes', l: '1.000 productos', d: 'Para operaciones con más volumen.' },
  { n: 'Business', p: '149 €/mes', l: '10.000 productos', d: 'Para equipos y catálogos amplios.' },
  { n: 'Agency', p: 'Personalizado', l: 'Multi-cliente', d: 'Para agencias y consultoras.' }
];

export default function Home() {
  const [lang, setLang] = useState<Lang>('es');
  const [view, setView] = useState<'home' | 'dashboard'>('home');
  const t = copy[lang];

  if (view === 'dashboard') return <DemoDashboard lang={lang} onHome={() => setView('home')} />;

  return <main className="shell landing-shell">
    <nav className="nav landing-nav">
      <Link className="brand" href="/" aria-label="EU Product Radar, inicio">EU <b>Product Radar</b></Link>
      <div className="navlinks">
        <button className="nav-link-button" onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}>Cómo funciona</button>
        <button className="nav-link-button" onClick={() => document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' })}>{t.plans}</button>
        <label className="language-picker" aria-label="Idioma"><span className="sr-only">Idioma</span><select value={lang} onChange={e => setLang(e.target.value as Lang)}>{langs.map(x => <option key={x} value={x}>{x.toUpperCase()}</option>)}</select></label>
        <Link className="btn primary nav-cta" href="/login">{t.login}</Link>
      </div>
    </nav>

    <section className="hero landing-hero">
      <div className="hero-copy">
        <div className="eyebrow hero-eyebrow"><span className="status-dot" />{t.tag}</div>
        <h1>{t.title}</h1>
        <p className="lead">{t.lead}</p>
        <div className="hero-actions">
          <Link className="btn primary hero-primary" href="/dashboard">{t.scan}</Link>
          <button className="btn ghost hero-secondary" onClick={() => setView('dashboard')}>{t.demo}</button>
        </div>
        <div className="trust-row" aria-label="Características principales">
          <span>Sin tarjeta</span><span>5 productos gratis al mes</span><span>Excel y PDF</span><span>Historial privado</span>
        </div>
        <p className="legal-note">Herramienta orientativa para detectar información incompleta. No certifica conformidad ni sustituye asesoramiento profesional.</p>
      </div>

      <div className="product-preview" aria-label="Ejemplo de resultado">
        <div className="preview-toolbar"><div><span className="preview-kicker">ANÁLISIS DE CATÁLOGO</span><strong>catalogo-ejemplo.xlsx</strong></div><span className="preview-badge">12 productos</span></div>
        <div className="preview-score-row"><div><span className="preview-label">Indicador medio</span><div className="score">72<span>/100</span></div></div><div className="preview-summary"><strong>3 requieren atención prioritaria</strong><p>Fabricante, responsable en la UE y advertencias concentran los principales campos incompletos.</p></div></div>
        <div className="preview-list">
          <div><span>Auriculares inalámbricos</span><span className="pill high">ALTA</span></div>
          <div><span>Lámpara LED portátil</span><span className="pill medium">MEDIA</span></div>
          <div><span>Botella térmica</span><span className="pill low">BAJA</span></div>
        </div>
        <div className="preview-footer"><span>Ejemplo ilustrativo · datos ficticios</span><span>Informe disponible en Excel y PDF</span></div>
      </div>
    </section>

    <section className="value-strip" aria-label="Ventajas"><div><strong>Importa</strong><span>CSV, XLS o XLSX</span></div><div><strong>Prioriza</strong><span>Detecta campos incompletos</span></div><div><strong>Documenta</strong><span>Guía y fuentes oficiales</span></div><div><strong>Exporta</strong><span>Informes Excel y PDF</span></div></section>

    <section className="section product-story" id="como-funciona">
      <div className="section-heading"><div className="eyebrow">UN FLUJO, TRES PASOS</div><h2>De catálogo a acciones concretas.</h2><p className="lead">Menos tiempo buscando qué falta. Más claridad sobre qué revisar y dónde conseguir la documentación.</p></div>
      <div className="grid feature-grid">
        <article className="card feature-card"><span className="step-number">01</span><h3>Sube tu catálogo</h3><p className="muted">Importa un CSV o Excel. Conservamos los datos originales y analizamos los campos relevantes.</p></article>
        <article className="card feature-card"><span className="step-number">02</span><h3>Ve primero lo importante</h3><p className="muted">Cada producto recibe un indicador y una prioridad para que sepas dónde empezar.</p></article>
        <article className="card feature-card"><span className="step-number">03</span><h3>Convierte el aviso en tarea</h3><p className="muted">Consulta qué documentación puede hacer falta, dónde obtenerla y descarga un informe listo para trabajar.</p></article>
      </div>
    </section>

    <section className="section" id="planes">
      <div className="toprow pricing-heading"><div><div className="eyebrow">PRECIOS</div><h2>Empieza pequeño. Escala cuando lo necesites.</h2><p className="muted">El plan gratuito ya permite probar el flujo completo con hasta 5 productos al mes.</p></div><div className="availability-note">Los planes de pago se activarán próximamente.</div></div>
      <div className="plans polished-plans">{plans.map((x, i) => <article className={'plan ' + (i === 2 ? 'featured' : '')} key={x.n}>{i === 2 && <span className="plan-label">MÁS EQUILIBRADO</span>}<b>{x.n}</b><div className="price">{x.p}</div><p className="plan-limit">{x.l}</p><p className="muted">{x.d}</p><Link className={i === 0 ? 'btn primary plan-button' : 'btn ghost plan-button'} href="/login">{i === 0 ? 'Empezar gratis' : 'Crear cuenta'}</Link></article>)}</div>
    </section>

    <section className="final-cta"><div><div className="eyebrow">EMPIEZA CON CINCO PRODUCTOS</div><h2>La mejor forma de entenderlo es verlo con tu propio catálogo.</h2></div><Link className="btn primary" href="/login">Crear cuenta gratis</Link></section>

    <footer className="landing-footer"><span>EU Product Radar</span><span>Información orientativa · 2026</span></footer>
  </main>;
}
