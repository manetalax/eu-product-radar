'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Analysis, AnalysisSummary, analyze, MAX_FILE_BYTES, RULE_VERSION } from '@/lib/analysis';
import { parseProducts } from '@/lib/import-products';
import { createClient } from '@/lib/supabase/client';

type Tab = 'dashboard' | 'products' | 'history' | 'reports' | 'settings';
const tabs: [Tab, string][] = [['dashboard','Resumen'],['products','Productos'],['history','Historial'],['reports','Informes'],['settings','Mi cuenta']];
const when = (value: string) => new Date(value).toLocaleString('es-ES');
export default function Dashboard({ email }: { email: string }) {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [current, setCurrent] = useState<Analysis | null>(null);
  const [history, setHistory] = useState<AnalysisSummary[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const pendingImport = useRef<{ fingerprint: string; id: string } | null>(null);
  const results = useMemo(() => current ? analyze(current.products) : [], [current]);
  const avg = results.length ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length) : 0;
  async function api(url: string, options?: RequestInit) {
    const response = await fetch(url, { ...options, cache: 'no-store' });
    if (response.status === 401) { window.location.replace('/login'); throw new Error('Tu sesión ha caducado.'); }
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'No se ha podido completar la operación.');
    return body;
  }
  useEffect(() => {
    const controller = new AbortController(); setLoading(true);
    api(`/api/analyses?page=${page}`, { signal: controller.signal }).then(body => {
      if (!controller.signal.aborted) { setHistory(body.analyses); setHasMore(body.hasMore); }
    }).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'No se puede leer el historial.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page]);
  useEffect(() => {
    const { data: { subscription } } = createClient().auth.onAuthStateChange(event => { if (event === 'SIGNED_OUT') window.location.replace('/login'); });
    const refresh = (event: PageTransitionEvent) => { if (event.persisted) window.location.reload(); };
    window.addEventListener('pageshow', refresh);
    return () => { subscription.unsubscribe(); window.removeEventListener('pageshow', refresh); };
  }, []);
  async function load(file: File) {
    if (busy) return;
    setError(''); setNotice(''); setBusy(true);
    try {
      if (file.size > MAX_FILE_BYTES) throw new Error('El archivo supera el límite de 5 MB.');
      if (file.name.length > 120) throw new Error('Acorta el nombre del archivo a 120 caracteres como máximo.');
      const bytes = await file.arrayBuffer();
      const products = parseProducts(bytes, file.name);
      const hash = await crypto.subtle.digest('SHA-256', bytes);
      const fingerprint = file.name + ':' + Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
      const previous = pendingImport.current;
      const requestId = previous?.fingerprint === fingerprint ? previous.id : crypto.randomUUID();
      pendingImport.current = { fingerprint, id: requestId };
      const { analysis } = await api('/api/analyses', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({filename:file.name,products,requestId}) });
      setCurrent(analysis); setTab('products'); setNotice('Análisis guardado en tu cuenta.'); pendingImport.current = null;
      setHistory(items => [{id:analysis.id,filename:analysis.filename,created_at:analysis.created_at,rule_version:analysis.rule_version,product_count:analysis.products.length}, ...items.filter(item => item.id !== analysis.id)].slice(0,20));
      if (page !== 0) setPage(0);
    } catch (e) { setError(e instanceof Error ? e.message : 'No se ha podido importar el archivo.'); }
    finally { setBusy(false); if (input.current) input.current.value = ''; }
  }
  async function open(id: string) {
    setError(''); setNotice(''); setBusy(true);
    try {
      const { analysis } = await api(`/api/analyses?id=${encodeURIComponent(id)}`);
      if (analysis.rule_version !== RULE_VERSION) throw new Error('Esta versión de análisis todavía no es compatible con la aplicación.');
      setCurrent(analysis); setTab('products');
    } catch (e) { setError(e instanceof Error ? e.message : 'No se puede abrir el análisis.'); }
    finally { setBusy(false); }
  }
  async function exportReport() {
    if (!current || busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const { reportBytes } = await import('@/lib/export-report');
      const bytes = await reportBytes(current);
      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const link = document.createElement('a');
      link.href = url; link.download = `eu-product-radar-${current.created_at.slice(0,10)}-${current.id.slice(0,8)}.xlsx`;
      document.body.appendChild(link); link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
      setNotice('Informe preparado con las hojas Resumen, Productos y Datos técnicos.');
    } catch { setError('No se ha podido generar el informe. Vuelve a intentarlo; tu análisis sigue guardado.'); }
    finally { setBusy(false); }
  }
  async function signOut() {
    setBusy(true); setError('');
    try { const { error } = await createClient().auth.signOut(); if (error) throw error; window.location.replace('/login'); }
    catch { setError('No se ha podido cerrar la sesión. Comprueba tu conexión y vuelve a intentarlo.'); setBusy(false); }
  }
  return <main className="shell">
    <header className="toprow account-header"><Link className="brand" href="/">EU <b>Product Radar</b></Link><button className="btn ghost" disabled={busy} onClick={signOut}>Cerrar sesión</button></header>
    <div className="dashboard"><aside className="side"><h2>Tu espacio</h2><p className="account-email">{email}</p><nav aria-label="Secciones del panel">{tabs.map(([id,label]) => <button key={id} aria-current={tab === id ? 'page' : undefined} className={tab === id ? 'active' : ''} onClick={() => { setTab(id); setNotice(''); }}>{label}</button>)}</nav></aside>
    <section className="workspace" aria-busy={busy}>
      <div className="notice">Primera versión: comprobamos si constan fabricante, responsable UE y advertencias. No verificamos su contenido ni determinamos qué obligaciones se aplican a cada producto.</div>
      {error && <p role="alert" className="message error">{error}</p>}{notice && <p role="status" className="message success">{notice}</p>}
      <input ref={input} className="file-input" aria-label="Importar catálogo CSV o Excel" type="file" accept=".csv,.xls,.xlsx" disabled={busy} onChange={e => { const file=e.target.files?.[0]; if(file) void load(file); }} />
      {(tab === 'dashboard' || tab === 'products') && <div className="card import-card"><div className="toprow"><div><h2>Importar y guardar catálogo</h2><p className="muted">CSV UTF-8, XLS o XLSX · Hasta 5 MB y 1.000 productos por archivo.</p></div><button className="btn primary" disabled={busy} onClick={() => input.current?.click()}>{busy ? 'Procesando…' : 'Selecciona CSV o Excel'}</button></div><p className="muted">Columnas: nombre, fabricante, responsable_ue, advertencias_seguridad. Los campos vacíos generan avisos.</p></div>}
      {tab === 'dashboard' && <><h2>{current ? 'Análisis seleccionado' : 'Empieza con tu primer catálogo'}</h2><div className="kpis"><div className="kpi">Productos<strong>{results.length}</strong></div><div className="kpi">Indicador medio<strong>{current ? `${avg}/100` : '—'}</strong></div><div className="kpi">Prioridad alta<strong>{results.filter(r=>r.priority==='ALTA').length}</strong></div><div className="kpi">Cuenta<strong>Pruebas</strong></div></div><p className="muted">{current ? `${current.filename} · ${when(current.created_at)}` : 'No hay productos de ejemplo en tu cuenta. Importa un archivo o abre un análisis del historial.'}</p></>}
      {tab === 'products' && <div className="card"><div className="toprow"><div><h2>{current?.filename ?? 'Sin análisis seleccionado'}</h2>{current && <p className="muted">Guardado: {when(current.created_at)} · {current.rule_version}</p>}</div><button className="btn ghost" disabled={!current || busy} onClick={exportReport}>Descargar informe Excel</button></div>{current ? <div className="results"><table><caption>Indicador de campos incompletos: no equivale a riesgo legal.</caption><thead><tr><th>PRODUCTO</th><th>INDICADOR</th><th>PRIORIDAD</th><th>CAMPOS VACÍOS</th></tr></thead><tbody>{results.map((r,i)=><tr key={i}><td>{r.name}</td><td>{r.score}/100</td><td><span className={`pill ${r.priority==='ALTA'?'high':r.priority==='MEDIA'?'medium':'low'}`}>{r.priority}</span></td><td>{r.missing.join(', ') || 'Sin campos básicos vacíos'}</td></tr>)}</tbody></table></div> : <p>Importa tu catálogo o abre uno desde el historial.</p>}</div>}
      {tab === 'history' && <div className="card"><h2>Tu historial</h2>{loading ? <p role="status">Cargando análisis…</p> : history.length ? <ul className="history-list">{history.map(item=><li key={item.id}><div><strong>{item.filename}</strong><p className="muted">{when(item.created_at)} · {item.product_count} productos</p></div><button className="btn ghost" disabled={busy} onClick={()=>open(item.id)}>Abrir</button></li>)}</ul> : <p>Todavía no hay análisis guardados en esta página.</p>}<div className="toprow"><button className="btn ghost" disabled={page===0||loading||busy} onClick={()=>setPage(p=>p-1)}>Anterior</button><span>Página {page+1}</span><button className="btn ghost" disabled={!hasMore||loading||busy} onClick={()=>setPage(p=>p+1)}>Siguiente</button></div></div>}
      {tab === 'reports' && <div className="card"><h2>Informes</h2><p>{current ? `Informe de ${current.filename}. Incluye los campos importados, avisos, fecha y versión de reglas.` : 'Abre un análisis desde el historial para descargar su informe.'}</p><button className="btn primary" disabled={!current||busy} onClick={exportReport}>Descargar informe Excel</button></div>}
      {tab === 'settings' && <div className="card"><h2>Mi cuenta</h2><p className="account-email">{email}</p><p>Acceso de pruebas sin cobros. Los planes comerciales todavía no están activados.</p><p><Link href="/reset-password">Cambiar mi contraseña</Link></p><p className="muted">Los análisis solo son accesibles para tu cuenta. No subas datos personales innecesarios ni información confidencial durante esta fase de pruebas.</p></div>}
    </section></div>
  </main>;
}
