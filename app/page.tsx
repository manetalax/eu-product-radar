'use client';
import { useState } from 'react';
import { copy, Lang, langs } from '@/lib/i18n';
import DemoDashboard from '@/components/DemoDashboard';
import Link from 'next/link';

const plans=[
 {n:'Free',p:'0 €',l:'5 productos/mes',d:'Para probar el radar'},
 {n:'Starter',p:'19 €/mes',l:'100 productos',d:'Para vendedores pequeños'},
 {n:'Pro',p:'49 €/mes',l:'1.000 productos',d:'Historial e informes'},
 {n:'Business',p:'149 €/mes',l:'10.000 productos',d:'Equipos y mayor volumen'},
 {n:'Agency',p:'Personalizado',l:'Multi-cliente',d:'Agencias y consultoras'}
];
export default function Home(){
 const [lang,setLang]=useState<Lang>('es'); const [view,setView]=useState<'home'|'dashboard'>('home'); const t=copy[lang];
 if(view==='dashboard') return <DemoDashboard lang={lang} onHome={()=>setView('home')}/>;
 return <main className="shell">
  <nav className="nav"><div className="brand">EU <b>Product Radar</b></div><div className="navlinks"><button className="btn ghost" onClick={()=>document.getElementById('planes')?.scrollIntoView({behavior:'smooth'})}>{t.plans}</button><select value={lang} onChange={e=>setLang(e.target.value as Lang)}>{langs.map(x=><option key={x} value={x}>{x.toUpperCase()}</option>)}</select><Link className="btn primary" href="/login">{t.login}</Link></div></nav>
  <section className="hero"><div><div className="eyebrow">{t.tag}</div><h1>{t.title}</h1><p className="lead">{t.lead}</p><div style={{display:'flex',gap:10,flexWrap:'wrap'}}><Link className="btn primary" href="/dashboard">{t.scan}</Link><button className="btn ghost" onClick={()=>setView('dashboard')}>{t.demo}</button></div><p className="muted">Orientativo: no certifica conformidad ni sustituye asesoramiento profesional.</p></div><div className="card"><div className="muted">EJEMPLO ILUSTRATIVO · DATOS FICTICIOS</div><div className="score">72</div><p><b>12 productos</b> requieren revisión prioritaria.</p><div className="notice">Primera comprobación: campos de fabricante, responsable UE y advertencias. No es una evaluación normativa.</div></div></section>
  <section className="grid"><div className="card"><h3>01 · Importa</h3><p className="muted">CSV y Excel. Arquitectura preparada para Shopify, Amazon, eBay, Etsy y WooCommerce.</p></div><div className="card"><h3>02 · Prioriza</h3><p className="muted">Indicador de campos incompletos y detalle de los datos ausentes.</p></div><div className="card"><h3>03 · Actúa</h3><p className="muted">Historial privado de tus análisis e informes descargables.</p></div></section>
  <section className="section" id="planes"><div className="toprow"><div><div className="eyebrow">PRECIOS</div><h2>Planes para cada volumen</h2></div><div className="notice">Planes previstos · cobros todavía no disponibles</div></div><div className="plans">{plans.map((x,i)=><div className={'plan '+(i===2?'featured':'')} key={x.n}><b>{x.n}</b><div className="price">{x.p}</div><p>{x.l}</p><p className="muted">{x.d}</p><Link className="btn ghost" href="/login">Crear cuenta de prueba</Link></div>)}</div></section>
  <footer className="muted" style={{padding:'40px 0',textAlign:'center'}}>EU Product Radar · Acceso inicial de pruebas 2026</footer>
 </main>
}
