'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Brand from '@/components/Brand';
import BrandLogos from '@/components/BrandLogos';
import TrustMark from '@/components/TrustMark';
import { AccountDeletionErrorCode, DELETE_ACCOUNT_CONFIRMATION } from '@/lib/account';
import { accountCopy } from '@/lib/account-i18n';
import { Analysis, AnalysisSummary, analysisMarket, analyze, MAX_FILE_BYTES, supportsRuleVersion } from '@/lib/analysis';
import { ProductQuota } from '@/lib/quota';
import { documentationFor, GUIDE_SCOPE } from '@/lib/documentation';
import { isActiveMarketCode, MarketCode, MARKETS, MARKETS_BY_RANK } from '@/lib/markets';
import { formatPrice, formatProductCount, landingCopy } from '@/lib/landing-i18n';
import { PlanId, PLANS, PLANS_BY_ID } from '@/lib/plans';
import { authService } from '@/lib/services/auth-client';
import { clearPlanIntent, readPlanIntent } from '@/lib/services/plan-interest';
import { useLanguage } from '@/lib/use-language';

type Tab = 'dashboard' | 'products' | 'history' | 'reports' | 'settings';
const tabs: [Tab, string, string][] = [
  ['dashboard', 'Resumen', 'Vista general'],
  ['products', 'Productos', 'Resultados del análisis'],
  ['history', 'Historial', 'Análisis guardados'],
  ['reports', 'Informes', 'Excel, PDF y documentación'],
  ['settings', 'Mi cuenta', 'Plan, privacidad y seguridad'],
];
const when = (value: string) => new Date(value).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });

export default function Dashboard({ email }: { email: string }) {
  const { language } = useLanguage();
  const accountT = accountCopy[language];
  const [tab, setTab] = useState<Tab>('dashboard');
  const [selectedMarket, setSelectedMarket] = useState<MarketCode>('EU');
  const [current, setCurrent] = useState<Analysis | null>(null);
  const [history, setHistory] = useState<AnalysisSummary[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [templateReady, setTemplateReady] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [quota, setQuota] = useState<ProductQuota | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const pendingImport = useRef<{ fingerprint: string; id: string } | null>(null);

  const currentMarketCode = current ? analysisMarket(current) : selectedMarket;
  const currentMarket = MARKETS[currentMarketCode];
  const results = useMemo(() => current ? analyze(current.products, analysisMarket(current)) : [], [current]);
  const avg = results.length ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length) : 0;
  const highCount = results.filter(result => result.priority === 'ALTA').length;
  const quotaBlocked = quota?.remaining === 0;
  const quotaPercent = quota ? Math.min(100, Math.round((quota.used / quota.limit) * 100)) : 0;
  const firstName = email.split('@')[0].replace(/[._-]+/g, ' ');
  const canDeleteAccount = deleteEmail.trim().toLocaleLowerCase('en-US') === email.trim().toLocaleLowerCase('en-US')
    && deleteConfirmation === DELETE_ACCOUNT_CONFIRMATION;

  async function api(url: string, options?: RequestInit) {
    const response = await fetch(url, { ...options, cache: 'no-store' });
    const body = await response.json();
    if (response.status === 401) {
      window.location.replace(`/login?lang=${language}`);
    }
    if (body.quota) setQuota(body.quota);
    if (!response.ok) {
      const apiError = new Error(body.error || body.errorCode || 'No se ha podido completar la operación.') as Error & { code?: AccountDeletionErrorCode };
      if (body.errorCode) apiError.code = body.errorCode as AccountDeletionErrorCode;
      throw apiError;
    }
    return body;
  }

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    api(`/api/analyses?page=${page}`, { signal: controller.signal }).then(body => {
      if (!controller.signal.aborted) {
        setHistory(body.analyses);
        setHasMore(body.hasMore);
        setQuota(body.quota);
      }
    }).catch(e => {
      if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'No se puede leer el historial.');
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [page]);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(event => {
      if (event === 'SIGNED_OUT') window.location.replace('/login');
    });
    const refresh = (event: PageTransitionEvent) => { if (event.persisted) window.location.reload(); };
    window.addEventListener('pageshow', refresh);
    return () => {
      unsubscribe();
      window.removeEventListener('pageshow', refresh);
    };
  }, []);

  useEffect(() => {
    const planId = readPlanIntent();
    const checkout = new URLSearchParams(window.location.search).get('checkout');
    if (checkout === 'success') setNotice('Pago recibido. Stripe está confirmando tu plan; la cuota se actualizará automáticamente.');
    if (checkout === 'cancelled') setNotice('No se ha realizado ningún cobro. Puedes elegir un plan cuando quieras.');
    if (planId) void startCheckout(planId);
  }, []);

  async function load(file: File) {
    if (busy) return;
    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (!isActiveMarketCode(selectedMarket)) throw new Error('Este mercado todavía está en preparación.');
      if (file.size > MAX_FILE_BYTES) throw new Error('El archivo supera el límite de 5 MB.');
      if (file.name.length > 120) throw new Error('Acorta el nombre del archivo a 120 caracteres como máximo.');
      const bytes = await file.arrayBuffer();
      const products = (await import('@/lib/import-products')).parseProducts(bytes, file.name);
      const hash = await crypto.subtle.digest('SHA-256', bytes);
      const fingerprint = `${selectedMarket}:${file.name}:` + Array.from(new Uint8Array(hash)).map(byte => byte.toString(16).padStart(2, '0')).join('');
      const previous = pendingImport.current;
      const requestId = previous?.fingerprint === fingerprint ? previous.id : crypto.randomUUID();
      pendingImport.current = { fingerprint, id: requestId };
      const { analysis, quota: updatedQuota } = await api('/api/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, products, requestId, marketCode: selectedMarket }),
      });
      setQuota(updatedQuota);
      setCurrent(analysis);
      setTab('products');
      setNotice(`Catálogo analizado para ${MARKETS[selectedMarket].name} y guardado en tu cuenta.`);
      pendingImport.current = null;
      setHistory(items => [{
        id: analysis.id,
        filename: analysis.filename,
        created_at: analysis.created_at,
        rule_version: analysis.rule_version,
        market_code: analysis.market_code,
        product_count: analysis.products.length,
      }, ...items.filter(item => item.id !== analysis.id)].slice(0, 20));
      if (page !== 0) setPage(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se ha podido importar el archivo.');
    } finally {
      setBusy(false);
      setDragging(false);
      if (input.current) input.current.value = '';
    }
  }

  async function open(id: string) {
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const { analysis } = await api(`/api/analyses?id=${encodeURIComponent(id)}`);
      if (!supportsRuleVersion(analysis.rule_version)) throw new Error('Esta versión de análisis todavía no es compatible con la aplicación.');
      setCurrent(analysis);
      setSelectedMarket(analysisMarket(analysis));
      setTab('products');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se puede abrir el análisis.');
    } finally {
      setBusy(false);
    }
  }

  async function exportReport(format: 'xlsx' | 'pdf' = 'xlsx') {
    if (!current || busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const bytes = format === 'pdf'
        ? await (await import('@/lib/export-pdf')).pdfBytes(current)
        : await (await import('@/lib/export-report')).reportBytes(current);
      const url = URL.createObjectURL(new Blob([bytes], { type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `import-rules-verifier-${analysisMarket(current).toLowerCase()}-${current.created_at.slice(0, 10)}-${current.id.slice(0, 8)}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
      setReportReady(true);
      setNotice(format === 'pdf' ? 'PDF preparado con resumen, fichas y fuentes oficiales.' : 'Excel preparado con resumen, datos originales, trazabilidad y guía documental.');
    } catch {
      setError('No se ha podido generar el informe. Vuelve a intentarlo; tu análisis sigue guardado.');
    } finally {
      setBusy(false);
    }
  }

  function downloadTemplate() {
    const csv = '\uFEFFnombre,fabricante,operador_mercado,advertencias_seguridad\nProducto de ejemplo,Fabricante SL,Importador Europa SL,Advertencia del modelo\n';
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla-import-rules-verifier-europa.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setTemplateReady(true);
    setNotice('Plantilla de Europa descargada. Sustituye el ejemplo por tus productos y conserva los cuatro encabezados.');
  }

  async function startCheckout(planId: PlanId) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const { url } = await api('/api/billing/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId }) });
      clearPlanIntent();
      window.location.assign(url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'No se ha podido abrir el pago.');
      setBusy(false);
    }
  }

  async function manageSubscription() {
    setBusy(true);
    setError('');
    try {
      const { url } = await api('/api/billing/portal', { method: 'POST' });
      window.location.assign(url);
    } catch (portalError) {
      setError(portalError instanceof Error ? portalError.message : 'No se ha podido abrir la gestión del plan.');
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    setError('');
    try {
      const { error: signOutError } = await authService.signOut();
      if (signOutError) throw signOutError;
      window.location.replace('/login');
    } catch {
      setError('No se ha podido cerrar la sesión. Comprueba tu conexión y vuelve a intentarlo.');
      setBusy(false);
    }
  }

  function closeDeleteAccount() {
    setDeleteAccountOpen(false);
    setDeleteEmail('');
    setDeleteConfirmation('');
  }

  async function deleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!canDeleteAccount) {
      const emailMatches = deleteEmail.trim().toLocaleLowerCase('en-US') === email.trim().toLocaleLowerCase('en-US');
      setError(emailMatches ? accountT.errors.confirmation_mismatch : accountT.errors.email_mismatch);
      return;
    }
    setBusy(true);
    try {
      await api('/api/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: deleteEmail.trim(), confirmation: deleteConfirmation }),
      });
      window.location.replace(`/login?message=account_deleted&lang=${language}`);
    } catch (deletionError) {
      const code = deletionError instanceof Error ? (deletionError as Error & { code?: AccountDeletionErrorCode }).code : undefined;
      setError(code ? accountT.errors[code] : accountT.errors.delete_failed);
      setBusy(false);
    }
  }

  return <main className="shell app-shell">
    <header className="toprow account-header app-header">
      <Brand market={current ? currentMarketCode : undefined} />
      <div className="header-actions"><span className="privacy-badge">Sesión privada</span><button className="btn ghost" disabled={busy} onClick={signOut}>Cerrar sesión</button></div>
    </header>

    <div className="dashboard premium-dashboard">
      <aside className="side premium-side">
        <div className="side-intro"><span className="side-kicker">ESPACIO DE TRABAJO</span><h2>{firstName || 'Tu cuenta'}</h2><p className="account-email">{email}</p></div>
        <nav aria-label="Secciones del panel" className="side-nav">
          {tabs.map(([id, label, description]) => <button key={id} aria-current={tab === id ? 'page' : undefined} className={tab === id ? 'active' : ''} onClick={() => { setTab(id); setNotice(''); }}><strong>{label}</strong><span>{description}</span></button>)}
        </nav>
        <div className="side-quota">
          <div className="toprow"><span>Plan {quota?.billing.planName ?? '—'}</span><strong>{quota ? `${quota.remaining} libres` : '—'}</strong></div>
          <div className="quota-track" aria-label="Uso mensual"><span style={{ width: `${quotaPercent}%` }} /></div>
          <small>{quota ? `${quota.used} de ${quota.limit} productos este mes` : 'Calculando uso…'}</small>
          <button className="side-upgrade" onClick={() => setTab('settings')}>Ver planes →</button>
        </div>
      </aside>

      <section className="workspace" aria-busy={busy}>
        <div className="workspace-heading">
          <div><span className="eyebrow">{tabs.find(([id]) => id === tab)?.[1]}</span><h1>{tab === 'dashboard' ? `Hola, ${firstName || 'bienvenido'}` : tabs.find(([id]) => id === tab)?.[1]}</h1></div>
          {tab !== 'settings' && <button className="btn primary compact-cta" disabled={busy || loading || quotaBlocked} onClick={() => input.current?.click()}>{quotaBlocked ? 'Límite alcanzado' : 'Nuevo análisis'}</button>}
        </div>
        <p className="workspace-subtitle">{tab === 'dashboard' ? 'Prepara tu catálogo europeo, prioriza la información incompleta y conserva una trazabilidad clara.' : tabs.find(([id]) => id === tab)?.[2]}</p>

        <div className="market-rail" aria-label="Cobertura por mercado">
          {MARKETS_BY_RANK.map(market => {
            const active = isActiveMarketCode(market.code);
            return <button key={market.code} type="button" className={`${selectedMarket === market.code ? 'selected' : ''} ${active ? '' : 'upcoming'}`} disabled={!active} onClick={() => setSelectedMarket(market.code)} aria-label={`${market.name}: ${active ? 'disponible' : 'en preparación'}`}>
              <span className="market-flag" aria-hidden="true">{market.flag}</span><span><strong>{market.shortName}</strong><small>{active ? 'Disponible' : 'Próximamente'}</small></span>
            </button>;
          })}
        </div>

        <div className="notice trust-notice"><strong>Europa activa:</strong> el radar detecta campos básicos incompletos y genera una guía basada en fuentes oficiales. <span>No certifica conformidad ni sustituye una evaluación jurídica o técnica.</span></div>
        {error && <p role="alert" className="message error">{error}</p>}
        {notice && <p role="status" className="message success">{notice}</p>}
        <input ref={input} className="file-input" aria-label="Importar catálogo CSV o Excel" type="file" accept=".csv,.xls,.xlsx" disabled={busy || loading || quotaBlocked} onChange={event => { const file = event.target.files?.[0]; if (file) void load(file); }} />

        {(tab === 'dashboard' || tab === 'products') && <div className="card import-card premium-import" onDragEnter={event => { event.preventDefault(); setDragging(true); }} onDragOver={event => event.preventDefault()} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false); }} onDrop={event => { event.preventDefault(); setDragging(false); const file = event.dataTransfer.files?.[0]; if (file) void load(file); }} data-dragging={dragging}>
          <div className="import-icon" aria-hidden="true">↑</div>
          <div className="import-copy"><div className="import-title-row"><h2>{quotaBlocked ? 'Has utilizado tu cuota de este mes' : `Analiza para ${MARKETS[selectedMarket].name}`}</h2><span className="market-live">ACTIVO</span></div><p>Arrastra o sube un CSV, XLS o XLSX de hasta 5 MB. Conservaremos el análisis en tu historial privado.</p><div className="format-chips"><span>CSV</span><span>XLS</span><span>XLSX</span><span>Máx. 5 MB</span></div></div>
          <div className="import-actions"><button className="btn primary import-cta" disabled={busy || loading || quotaBlocked} onClick={() => input.current?.click()}>{busy ? 'Analizando…' : quotaBlocked ? 'Disponible el próximo mes' : 'Elegir archivo'}</button><button className="text-button template-link" onClick={downloadTemplate}>Descargar plantilla</button></div>
          <div className="quota-inline"><span>{quota ? `${quota.remaining} de ${quota.limit} productos disponibles` : 'Calculando cuota…'}</span><div className="quota-track"><span style={{ width: `${quotaPercent}%` }} /></div></div>
        </div>}
        {(tab === 'dashboard' || tab === 'products') && <BrandLogos group="commerce" label="Compatible con exportaciones de" note="Importa CSV o Excel; los campos disponibles dependen de cada exportación y los conectores directos siguen en preparación." compact />}

        {tab === 'dashboard' && <>
          <div className="onboarding-card card"><div><span className="eyebrow">PUESTA EN MARCHA</span><h2>Tu primera revisión, sin dudas.</h2></div><ol><li className="done"><span>1</span><div><strong>Mercado</strong><small>Europa seleccionada</small></div></li><li className={templateReady ? 'done' : ''}><span>2</span><div><strong>Plantilla</strong><small>{templateReady ? 'Descargada' : 'Lista para descargar'}</small></div></li><li className={current ? 'done' : ''}><span>3</span><div><strong>Análisis</strong><small>{current ? 'Catálogo guardado' : 'Sube tu catálogo'}</small></div></li><li className={reportReady ? 'done' : ''}><span>4</span><div><strong>Informe</strong><small>{reportReady ? 'Exportado' : 'Excel o PDF'}</small></div></li></ol></div>
          <div className="section-heading"><div><span className="eyebrow">PANORÁMICA</span><h2>{current ? 'Análisis seleccionado' : 'Tu panel está listo'}</h2></div>{current && <button className="text-button" onClick={() => setTab('products')}>Ver productos →</button>}</div>
          <div className="kpis premium-kpis">
            <div className="kpi"><span>Productos</span><strong>{results.length || '—'}</strong><small>{current ? 'en el análisis abierto' : 'sin análisis seleccionado'}</small></div>
            <div className="kpi"><span>Indicador medio</span><strong>{current ? avg : '—'}</strong><small>{current ? 'campos incompletos / 100' : 'aparecerá tras analizar'}</small></div>
            <div className="kpi"><span>Prioridad alta</span><strong>{current ? highCount : '—'}</strong><small>{current ? 'productos a revisar primero' : 'sin datos todavía'}</small></div>
            <div className="kpi"><span>Mercado</span><strong className="market-kpi">{current ? currentMarket.flag : '🇪🇺'}</strong><small>{current ? currentMarket.name : 'Europa disponible'}</small></div>
          </div>
          {!current ? <div className="card empty-state"><div className="empty-mark">◎</div><h3>Empieza por un catálogo pequeño</h3><p>Con unos pocos productos verás qué información básica falta, qué pedir al proveedor y dónde comprobar las fuentes.</p><button className="btn primary" disabled={busy || loading || quotaBlocked} onClick={() => input.current?.click()}>Analizar mi primer catálogo</button><button className="text-button" onClick={downloadTemplate}>Prefiero usar la plantilla</button></div> : <div className="card selected-analysis"><div><span className="eyebrow">SELECCIONADO · {currentMarket.shortName}</span><h3>{current.filename}</h3><p className="muted">{when(current.created_at)} · {results.length} productos</p></div><div className="selected-actions"><button className="btn ghost" onClick={() => setTab('products')}>Ver resultados</button><button className="btn ghost" disabled={busy} onClick={() => exportReport('pdf')}>PDF</button></div></div>}
        </>}

        {tab === 'products' && <div className="card content-card">
          <div className="toprow"><div><span className="eyebrow">RESULTADOS · {currentMarket.shortName}</span><h2>{current?.filename ?? 'Sin análisis seleccionado'}</h2>{current && <p className="muted">Guardado {when(current.created_at)} · reglas {current.rule_version}</p>}</div>{current && <div className="report-actions"><button className="btn ghost" disabled={busy} onClick={() => exportReport()}>Excel</button><button className="btn primary" disabled={busy} onClick={() => exportReport('pdf')}>PDF</button></div>}</div>
          {current ? <div className="results"><table><caption>Indicador de campos incompletos; no equivale a riesgo legal ni a una certificación.</caption><thead><tr><th>PRODUCTO</th><th>INDICADOR</th><th>PRIORIDAD</th><th>CAMPOS POR REVISAR</th></tr></thead><tbody>{results.map((result, index) => <tr key={index}><td><strong>{result.name}</strong></td><td>{result.score}/100</td><td><span className={`pill ${result.priority === 'ALTA' ? 'high' : result.priority === 'MEDIA' ? 'medium' : 'low'}`}>{result.priority}</span></td><td>{result.missing.join(', ') || 'Sin campos básicos vacíos'}</td></tr>)}</tbody></table></div> : <div className="empty-state compact"><div className="empty-mark">↗</div><h3>No hay un análisis abierto</h3><p>Importa un catálogo nuevo o recupera uno de tu historial.</p><button className="btn primary" onClick={() => input.current?.click()}>Importar catálogo</button></div>}
        </div>}

        {tab === 'history' && <div className="card content-card"><div className="section-heading"><div><span className="eyebrow">ARCHIVO</span><h2>Historial de análisis</h2></div><span className="muted">Página {page + 1}</span></div>{loading ? <div className="empty-state compact"><p role="status">Cargando tus análisis…</p></div> : history.length ? <ul className="history-list premium-history">{history.map(item => { const market = MARKETS[analysisMarket(item)]; return <li key={item.id}><div className="history-file"><span className="file-mark">{market.flag}</span><div><strong>{item.filename}</strong><p>{when(item.created_at)} · {item.product_count} productos · {market.shortName}</p></div></div><button className="btn ghost" disabled={busy} onClick={() => open(item.id)}>Abrir</button></li>; })}</ul> : <div className="empty-state"><div className="empty-mark">□</div><h3>Aquí aparecerá todo lo que analices</h3><p>Los análisis quedan vinculados a tu cuenta para que puedas volver a ellos cuando los necesites.</p><button className="btn primary" disabled={quotaBlocked} onClick={() => input.current?.click()}>Crear primer análisis</button></div>}<div className="history-pagination"><button className="btn ghost" disabled={page === 0 || loading || busy} onClick={() => setPage(value => value - 1)}>← Anterior</button><button className="btn ghost" disabled={!hasMore || loading || busy} onClick={() => setPage(value => value + 1)}>Siguiente →</button></div></div>}

        {tab === 'reports' && <><div className="card content-card"><span className="eyebrow">EXPORTACIÓN · {currentMarket.shortName}</span><h2>Informes listos para trabajar</h2><p className="muted">{current ? `Estás trabajando con ${current.filename}.` : 'Abre un análisis desde el historial para activar las descargas.'}</p><div className="report-grid"><button className="report-option" disabled={!current || busy} onClick={() => exportReport()}><strong>Excel detallado</strong><span>Resumen, productos, datos originales, reglas y guía documental.</span><b>Descargar .xlsx →</b></button><button className="report-option" disabled={!current || busy} onClick={() => exportReport('pdf')}><strong>PDF ejecutivo</strong><span>Resumen, fichas por producto y fuentes oficiales.</span><b>Descargar .pdf →</b></button></div></div>{current && <div className="card content-card documentation-card"><span className="eyebrow">GUÍA DOCUMENTAL · {currentMarket.name}</span><h2>Qué pedir y qué comprobar</h2><p className="muted">{GUIDE_SCOPE}</p>{current.products.map((product, index) => <details key={index}><summary>{product.name}</summary><div className="documentation-body">{documentationFor(product, currentMarketCode).map(action => <section key={action.title}><h3>{action.title}</h3><p><strong>{action.status}</strong> · {action.condition}</p><p><strong>Dónde conseguirlo:</strong> {action.obtain}</p><p><strong>Qué comprobar:</strong> {action.check}</p><a href={action.source} target="_blank" rel="noopener noreferrer">Consultar fuente oficial ↗</a></section>)}</div></details>)}</div>}</>}

        {tab === 'settings' && <div className="settings-grid">
          <div className="card content-card"><span className="eyebrow">CUENTA</span><h2>Tu perfil</h2><p className="account-email settings-email">{email}</p><Link className="btn ghost" href="/reset-password">Cambiar contraseña</Link></div>
          <div className="card content-card"><span className="eyebrow">PLAN ACTUAL</span><h2>{quota?.billing.planName ?? 'Cargando…'}</h2><div className="settings-quota"><strong>{quota?.remaining ?? '—'}</strong><span>productos disponibles este mes</span></div><div className="quota-track"><span style={{ width: `${quotaPercent}%` }} /></div><p className="muted">{quota ? `${quota.limit} productos al mes. La cuota se reinicia el primer día de cada mes.` : 'Consultando tu suscripción…'}</p>{quota?.billing.planId !== 'free' && <button className="btn ghost" disabled={busy} onClick={manageSubscription}>Gestionar suscripción</button>}</div>
          <div className="card content-card plan-interest"><span className="eyebrow">SUSCRIPCIONES</span><h2>Elige el plan que necesitas</h2><div className="mini-plans">{PLANS.map(plan => <button className={plan.featured ? 'featured' : ''} key={plan.id} disabled={busy || quota?.billing.planId === plan.id} onClick={() => startCheckout(plan.id)}><span>{plan.name}{plan.featured ? ' · Recomendado' : ''}</span><strong>{formatPrice('es', plan.monthlyPriceEur)}/mes</strong><small>{quota?.billing.planId === plan.id ? 'Plan actual' : `${landingCopy.es.pricing.upTo} ${formatProductCount('es', plan.monthlyProductLimit)}`}</small></button>)}</div><p className="muted">Pago seguro con Stripe. Puedes consultar facturas, cambiar el método de pago o cancelar desde el portal de cliente.</p></div>
          <div className="card content-card expansion-card"><span className="eyebrow">EXPANSIÓN INTERNACIONAL</span><h2>Un núcleo, cada mercado como módulo.</h2><p>Europa está activa. EE. UU., China, Reino Unido y Japón son los siguientes destinos preparados en la arquitectura.</p><div className="expansion-flags">{MARKETS_BY_RANK.map(market => <span key={market.code} title={market.name}>{market.flag}</span>)}</div></div>
          <div className="card content-card settings-security"><span className="eyebrow">PRIVACIDAD</span><h2>Tu información permanece separada</h2><p>Los análisis de esta cuenta no son visibles desde otras cuentas.</p><p className="muted">Evita subir datos personales innecesarios o información confidencial que no sea necesaria para analizar tus productos.</p><TrustMark title="IRV Trust Mark" detail="Comprobaciones internas de transparencia" httpsLabel="Conexión HTTPS segura" explanation="Sello interno de Import Rules Verifier. No es una certificación externa ni acredita la conformidad de un producto." compact /></div>
          <div className="card content-card account-danger-zone">
            <div className="danger-zone-heading"><div><span className="eyebrow">{accountT.eyebrow}</span><h2>{accountT.title}</h2></div>{!deleteAccountOpen && <button className="btn danger-outline" disabled={busy} onClick={() => { setDeleteAccountOpen(true); setError(''); setNotice(''); }}>{accountT.open}</button>}</div>
            <p className="muted">{accountT.description}</p>
            {deleteAccountOpen && <form className="account-delete-confirmation" onSubmit={deleteAccount}>
              <div className="delete-warning"><strong>{accountT.warningTitle}</strong><span>{accountT.warningBody}</span></div>
              <label>{accountT.email}<input type="email" required autoComplete="off" disabled={busy} value={deleteEmail} onChange={event => setDeleteEmail(event.target.value)} placeholder={email} /></label>
              <label>{accountT.confirmation(DELETE_ACCOUNT_CONFIRMATION)}<input type="text" required autoComplete="off" spellCheck={false} disabled={busy} value={deleteConfirmation} onChange={event => setDeleteConfirmation(event.target.value)} /></label>
              <div className="delete-actions"><button type="button" className="btn ghost" disabled={busy} onClick={closeDeleteAccount}>{accountT.cancel}</button><button type="submit" className="btn danger-solid" disabled={busy || !canDeleteAccount}>{busy ? accountT.deleting : accountT.deleteForever}</button></div>
            </form>}
          </div>
        </div>}
      </section>
    </div>
  </main>;
}
