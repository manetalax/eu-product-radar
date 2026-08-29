'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Analysis, AnalysisSummary, analyze, MAX_FILE_BYTES, RULE_VERSION } from '@/lib/analysis';
import { parseProducts } from '@/lib/import-products';
import { createClient } from '@/lib/supabase/client';
import { ProductQuota } from '@/lib/quota';
import { documentationFor, GUIDE_SCOPE } from '@/lib/documentation';

type Tab = 'dashboard' | 'products' | 'history' | 'reports' | 'settings';
const tabs: [Tab, string, string][] = [
  ['dashboard','Resumen','Vista general'],
  ['products','Productos','Resultados del análisis'],
  ['history','Historial','Análisis guardados'],
  ['reports','Informes','Excel, PDF y documentación'],
  ['settings','Mi cuenta','Plan y seguridad']
];
const when = (value: string) => new Date(value).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });

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
  const [quota, setQuota] = useState<ProductQuota | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const pendingImport = useRef<{ fingerprint: string; id: string } | null>(null);

  const results = useMemo(() => current ? analyze(current.products) : [], [current]);
  const avg = results.length ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length) : 0;
  const highCount = results.filter(r => r.priority === 'ALTA').length;
  const quotaBlocked = quota?.remaining === 0;
  const quotaPercent = quota ? Math.min(100, Math.round((quota.used / quota.limit) * 100)) : 0;
  const firstName = email.split('@')[0].replace(/[._-]+/g, ' ');

  async function api(url: string, options?: RequestInit) {
    const response = await fetch(url, { ...options, cache: 'no-store' });
    if (response.status === 401) { window.location.replace('/login'); throw new Error('Tu sesión ha caducado.'); }
    const body = await response.json();
    if (body.quota) setQuota(body.quota);
    if (!response.ok) throw new Error(body.error || 'No se ha podido completar la operación.');
    return body;
  }

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    api(`/api/analyses?page=${page}`, { signal: controller.signal }).then(body => {
      if (!controller.signal.aborted) { setHistory(body.analyses); setHasMore(body.hasMore); setQuota(body.quota); }
    }).catch(e => {
      if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'No se puede leer el historial.');
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
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
      const { analysis, quota: updatedQuota } = await api('/api/analyses', {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({filename:file.name,products,requestId})
      });
      setQuota(updatedQuota);
      setCurrent(analysis);
      setTab('products');
      setNotice('Catálogo analizado y guardado en tu cuenta.');
      pendingImport.current = null;
      setHistory(items => [{id:analysis.id,filename:analysis.filename,created_at:analysis.created_at,rule_version:analysis.rule_version,product_count:analysis.products.length}, ...items.filter(item => item.id !== analysis.id)].slice(0,20));
      if (page !== 0) setPage(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se ha podido importar el archivo.');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  async function open(id: string) {
    setError(''); setNotice(''); setBusy(true);
    try {
      const { analysis } = await api(`/api/analyses?id=${encodeURIComponent(id)}`);
      if (analysis.rule_version !== RULE_VERSION) throw new Error('Esta versión de análisis todavía no es compatible con la aplicación.');
      setCurrent(analysis);
      setTab('products');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se puede abrir el análisis.');
    } finally { setBusy(false); }
  }

  async function exportReport(format: 'xlsx' | 'pdf' = 'xlsx') {
    if (!current || busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const bytes = format === 'pdf' ? await (await import('@/lib/export-pdf')).pdfBytes(current) : await (await import('@/lib/export-report')).reportBytes(current);
      const url = URL.createObjectURL(new Blob([bytes], { type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `eu-product-radar-${current.created_at.slice(0,10)}-${current.id.slice(0,8)}.${format}`;
      document.body.appendChild(link); link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
      setNotice(format === 'pdf' ? 'PDF preparado con resumen, fichas y guía documental.' : 'Excel preparado con Resumen, Productos, Datos técnicos y Guía documental.');
    } catch {
      setError('No se ha podido generar el informe. Vuelve a intentarlo; tu análisis sigue guardado.');
    } finally { setBusy(false); }
  }

  async function signOut() {
    setBusy(true); setError('');
    try {
      const { error } = await createClient().auth.signOut();
      if (error) throw error;
      window.location.replace('/login');
    } catch {
      setError('No se ha podido cerrar la sesión. Comprueba tu conexión y vuelve a intentarlo.');
      setBusy(false);
    }
  }

  return <main className="shell app-shell">
    <header className="toprow account-header app-header">
      <Link className="brand" href="/">EU <b>Product Radar</b></Link>
      <div className="header-actions"><span className="privacy-badge">Sesión privada</span><button className="btn ghost" disabled={busy} onClick={signOut}>Cerrar sesión</button></div>
    </header>

    <div className="dashboard premium-dashboard">
      <aside className="side premium-side">
        <div className="side-intro"><span className="side-kicker">ESPACIO DE TRABAJO</span><h2>{firstName || 'Tu cuenta'}</h2><p className="account-email">{email}</p></div>
        <nav aria-label="Secciones del panel" className="side-nav">
          {tabs.map(([id,label,description]) => <button key={id} aria-current={tab === id ? 'page' : undefined} className={tab === id ? 'active' : ''} onClick={() => { setTab(id); setNotice(''); }}><strong>{label}</strong><span>{description}</span></button>)}
        </nav>
        <div className="side-quota">
          <div className="toprow"><span>Plan gratuito</span><strong>{quota ? `${quota.remaining} libres` : '—'}</strong></div>
          <div className="quota-track" aria-label="Uso mensual"><span style={{width:`${quotaPercent}%`}} /></div>
          <small>{quota ? `${quota.used} de ${quota.limit} productos este mes` : 'Calculando uso…'}</small>
        </div>
      </aside>

      <section className="workspace" aria-busy={busy}>
        <div className="workspace-heading">
          <div><span className="eyebrow">{tabs.find(([id]) => id === tab)?.[1]}</span><h1>{tab === 'dashboard' ? `Hola, ${firstName || 'bienvenido'}` : tabs.find(([id]) => id === tab)?.[1]}</h1></div>
          {tab !== 'settings' && <button className="btn primary compact-cta" disabled={busy || loading || quotaBlocked} onClick={() => input.current?.click()}>{quotaBlocked ? 'Límite alcanzado' : 'Nuevo análisis'}</button>}
        </div>
        <p className="workspace-subtitle">{tab === 'dashboard' ? 'Detecta huecos documentales, prioriza lo importante y conserva cada análisis en un único lugar.' : tabs.find(([id]) => id === tab)?.[2]}</p>

        <div className="notice trust-notice"><strong>Qué hace el radar:</strong> detecta si faltan datos básicos de fabricante, responsable UE y advertencias. <span>No sustituye una evaluación jurídica o técnica de conformidad.</span></div>
        {error && <p role="alert" className="message error">{error}</p>}
        {notice && <p role="status" className="message success">{notice}</p>}
        <input ref={input} className="file-input" aria-label="Importar catálogo CSV o Excel" type="file" accept=".csv,.xls,.xlsx" disabled={busy || loading || quotaBlocked} onChange={e => { const file=e.target.files?.[0]; if(file) void load(file); }} />

        {(tab === 'dashboard' || tab === 'products') && <div className="card import-card premium-import">
          <div className="import-icon" aria-hidden="true">↑</div>
          <div className="import-copy"><h2>{quotaBlocked ? 'Has utilizado tu cuota de este mes' : 'Analiza un catálogo en segundos'}</h2><p>Sube un CSV, XLS o XLSX de hasta 5 MB. El archivo se analiza y se guarda en tu historial privado.</p><div className="format-chips"><span>CSV</span><span>XLS</span><span>XLSX</span><span>Máx. 5 MB</span></div></div>
          <button className="btn primary import-cta" disabled={busy || loading || quotaBlocked} onClick={() => input.current?.click()}>{busy ? 'Analizando…' : quotaBlocked ? 'Disponible el próximo mes' : 'Elegir archivo'}</button>
          <div className="quota-inline"><span>{quota ? `${quota.remaining} de ${quota.limit} productos disponibles` : 'Calculando cuota…'}</span><div className="quota-track"><span style={{width:`${quotaPercent}%`}} /></div></div>
        </div>}

        {tab === 'dashboard' && <>
          <div className="section-heading"><div><span className="eyebrow">PANORÁMICA</span><h2>{current ? 'Análisis seleccionado' : 'Tu panel está listo'}</h2></div>{current && <button className="text-button" onClick={() => setTab('products')}>Ver productos →</button>}</div>
          <div className="kpis premium-kpis">
            <div className="kpi"><span>Productos</span><strong>{results.length || '—'}</strong><small>{current ? 'en el análisis abierto' : 'sin análisis seleccionado'}</small></div>
            <div className="kpi"><span>Indicador medio</span><strong>{current ? `${avg}` : '—'}</strong><small>{current ? 'sobre 100' : 'aparecerá tras analizar'}</small></div>
            <div className="kpi"><span>Prioridad alta</span><strong>{current ? highCount : '—'}</strong><small>{current ? 'productos a revisar primero' : 'sin datos todavía'}</small></div>
            <div className="kpi"><span>Cuota mensual</span><strong>{quota ? `${quota.remaining}` : '—'}</strong><small>productos disponibles</small></div>
          </div>
          {!current ? <div className="card empty-state"><div className="empty-mark">◎</div><h3>Empieza por un catálogo pequeño</h3><p>Con unos pocos productos verás inmediatamente qué información falta y qué conviene revisar primero.</p><button className="btn primary" disabled={busy || loading || quotaBlocked} onClick={() => input.current?.click()}>Analizar mi primer catálogo</button><button className="text-button" onClick={() => setTab('history')}>O abrir un análisis anterior</button></div> : <div className="card selected-analysis"><div><span className="eyebrow">SELECCIONADO</span><h3>{current.filename}</h3><p className="muted">{when(current.created_at)} · {results.length} productos</p></div><div className="selected-actions"><button className="btn ghost" onClick={() => setTab('products')}>Ver resultados</button><button className="btn ghost" disabled={busy} onClick={() => exportReport('pdf')}>PDF</button></div></div>}
        </>}

        {tab === 'products' && <div className="card content-card">
          <div className="toprow"><div><span className="eyebrow">RESULTADOS</span><h2>{current?.filename ?? 'Sin análisis seleccionado'}</h2>{current && <p className="muted">Guardado {when(current.created_at)} · {current.rule_version}</p>}</div>{current && <div className="report-actions"><button className="btn ghost" disabled={busy} onClick={() => exportReport()}>Excel</button><button className="btn primary" disabled={busy} onClick={() => exportReport('pdf')}>PDF</button></div>}</div>
          {current ? <div className="results"><table><caption>Indicador de campos incompletos; no equivale a riesgo legal.</caption><thead><tr><th>PRODUCTO</th><th>INDICADOR</th><th>PRIORIDAD</th><th>CAMPOS VACÍOS</th></tr></thead><tbody>{results.map((r,i)=><tr key={i}><td><strong>{r.name}</strong></td><td>{r.score}/100</td><td><span className={`pill ${r.priority==='ALTA'?'high':r.priority==='MEDIA'?'medium':'low'}`}>{r.priority}</span></td><td>{r.missing.join(', ') || 'Sin campos básicos vacíos'}</td></tr>)}</tbody></table></div> : <div className="empty-state compact"><div className="empty-mark">↗</div><h3>No hay un análisis abierto</h3><p>Importa un catálogo nuevo o recupera uno de tu historial.</p><button className="btn primary" onClick={() => input.current?.click()}>Importar catálogo</button></div>}
        </div>}

        {tab === 'history' && <div className="card content-card"><div className="section-heading"><div><span className="eyebrow">ARCHIVO</span><h2>Historial de análisis</h2></div><span className="muted">Página {page+1}</span></div>{loading ? <div className="empty-state compact"><p role="status">Cargando tus análisis…</p></div> : history.length ? <ul className="history-list premium-history">{history.map(item=><li key={item.id}><div className="history-file"><span className="file-mark">▦</span><div><strong>{item.filename}</strong><p>{when(item.created_at)} · {item.product_count} productos</p></div></div><button className="btn ghost" disabled={busy} onClick={()=>open(item.id)}>Abrir</button></li>)}</ul> : <div className="empty-state"><div className="empty-mark">□</div><h3>Aquí aparecerá todo lo que analices</h3><p>Los análisis quedan vinculados a tu cuenta para que puedas volver a ellos cuando los necesites.</p><button className="btn primary" disabled={quotaBlocked} onClick={() => input.current?.click()}>Crear primer análisis</button></div>}<div className="history-pagination"><button className="btn ghost" disabled={page===0||loading||busy} onClick={()=>setPage(p=>p-1)}>← Anterior</button><button className="btn ghost" disabled={!hasMore||loading||busy} onClick={()=>setPage(p=>p+1)}>Siguiente →</button></div></div>}

        {tab === 'reports' && <><div className="card content-card"><span className="eyebrow">EXPORTACIÓN</span><h2>Informes listos para compartir</h2><p className="muted">{current ? `Estás trabajando con ${current.filename}.` : 'Abre un análisis desde el historial para activar las descargas.'}</p><div className="report-grid"><button className="report-option" disabled={!current||busy} onClick={() => exportReport()}><strong>Excel detallado</strong><span>Resumen, productos, datos técnicos y guía documental.</span><b>Descargar .xlsx →</b></button><button className="report-option" disabled={!current||busy} onClick={() => exportReport('pdf')}><strong>PDF ejecutivo</strong><span>Resumen visual, fichas por producto y fuentes oficiales.</span><b>Descargar .pdf →</b></button></div></div>{current && <div className="card content-card documentation-card"><span className="eyebrow">DOCUMENTACIÓN</span><h2>Guía por producto</h2><p className="muted">{GUIDE_SCOPE}</p>{current.products.map((p, i) => <details key={i}><summary>{p.name}</summary><div className="documentation-body">{documentationFor(p).map(a => <section key={a.title}><h3>{a.title}</h3><p><strong>{a.status}</strong> · {a.condition}</p><p><strong>Dónde conseguirlo:</strong> {a.obtain}</p><p><strong>Qué comprobar:</strong> {a.check}</p><a href={a.source} target="_blank" rel="noopener noreferrer">Consultar fuente oficial ↗</a></section>)}</div></details>)}</div>}</>}

        {tab === 'settings' && <div className="settings-grid"><div className="card content-card"><span className="eyebrow">CUENTA</span><h2>Tu perfil</h2><p className="account-email settings-email">{email}</p><Link className="btn ghost" href="/reset-password">Cambiar contraseña</Link></div><div className="card content-card"><span className="eyebrow">PLAN ACTUAL</span><h2>Gratuito</h2><div className="settings-quota"><strong>{quota?.remaining ?? '—'}</strong><span>productos disponibles este mes</span></div><div className="quota-track"><span style={{width:`${quotaPercent}%`}} /></div><p className="muted">La cuota se reinicia el primer día de cada mes. Las mejoras de plan todavía no están activadas.</p></div><div className="card content-card settings-security"><span className="eyebrow">PRIVACIDAD</span><h2>Tu información permanece separada</h2><p>Los análisis de esta cuenta no son visibles desde otras cuentas.</p><p className="muted">Evita subir datos personales innecesarios o información confidencial que no sea necesaria para analizar tus productos.</p></div></div>}
      </section>
    </div>
  </main>;
}
