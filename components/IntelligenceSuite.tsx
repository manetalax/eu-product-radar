'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Analysis, analyze } from '@/lib/analysis';
import { PLATFORM_CONNECTORS, detectPlatform } from '@/lib/platform-connectors';
import { relevantRadarChanges } from '@/lib/radar-match';
import { regulatoryReadiness, type RegulatoryEvidenceLink } from '@/lib/regulatory-twin';
import styles from './IntelligenceSuite.module.css';

type HistoryItem = { id: string; filename: string; product_count: number };
type EvidenceRow = { product_index: number; evidence_key: string; status: 'available' | 'pending' | 'not_applicable'; note?: string };
type RadarEvent = {
  id: string;
  source_name: string;
  source_url: string;
  title: string;
  summary: string;
  published_at: string | null;
  effective_at: string | null;
  severity: 'info' | 'review' | 'action';
  affected_keywords: string[];
  official_reference: string;
  last_seen_at: string;
};

export default function IntelligenceSuite() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [evidenceRows, setEvidenceRows] = useState<EvidenceRow[]>([]);
  const [radarEvents, setRadarEvents] = useState<RadarEvent[]>([]);
  const [radarLive, setRadarLive] = useState(false);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('¿Qué me falta para poder avanzar con este producto?');
  const [answer, setAnswer] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [error, setError] = useState('');
  const [platformUrl, setPlatformUrl] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadLatest() {
      try {
        const [historyResponse, radarResponse] = await Promise.all([
          fetch('/api/analyses?page=0', { cache: 'no-store' }),
          fetch('/api/regulatory-changes?limit=12', { cache: 'no-store' }),
        ]);
        if (radarResponse.ok) {
          const radarBody = await radarResponse.json() as { events?: RadarEvent[]; live?: boolean };
          if (!cancelled) {
            setRadarEvents(Array.isArray(radarBody.events) ? radarBody.events : []);
            setRadarLive(Boolean(radarBody.live));
          }
        }
        const historyBody = await historyResponse.json() as { analyses?: HistoryItem[] };
        const latest = historyBody.analyses?.[0];
        if (!latest || cancelled) return;
        const detailResponse = await fetch(`/api/analyses?id=${encodeURIComponent(latest.id)}`, { cache: 'no-store' });
        const detailBody = await detailResponse.json() as { analysis?: Analysis };
        if (!detailBody.analysis || cancelled) return;
        setAnalysis(detailBody.analysis);
        const evidenceResponse = await fetch(`/api/evidence?analysisId=${encodeURIComponent(detailBody.analysis.id)}`, { cache: 'no-store' });
        if (evidenceResponse.ok) {
          const evidenceBody = await evidenceResponse.json() as { evidence?: EvidenceRow[] };
          if (!cancelled) setEvidenceRows(evidenceBody.evidence ?? []);
        }
      } catch {
        if (!cancelled) setError('No se ha podido cargar la capa de inteligencia. El resto del panel sigue disponible.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadLatest();
    return () => { cancelled = true; };
  }, []);

  const results = useMemo(() => analysis ? analyze(analysis.products, analysis.market_code ?? 'EU') : [], [analysis]);
  const result = results[selected];
  const product = analysis?.products[selected];
  const regulatory = result?.regulatory;

  const evidence = useMemo<RegulatoryEvidenceLink[]>(() => {
    if (!regulatory) return [];
    const rowsForProduct = evidenceRows.filter(row => row.product_index === selected);
    return regulatory.obligations.flatMap(obligation => obligation.evidence.flatMap((title, index) => {
      const key = `${obligation.title}: ${title}`.slice(0, 120);
      const saved = rowsForProduct.find(row => row.evidence_key === key);
      if (saved?.status === 'not_applicable') return [];
      const status: RegulatoryEvidenceLink['status'] = saved?.status === 'available' ? 'supplied' : saved?.status === 'pending' ? 'needs_review' : 'missing';
      return [{ requirementId: `${obligation.id}-${index}`, title, status, sourceName: saved?.note || undefined, sourceUrl: obligation.source.url }];
    }));
  }, [regulatory, evidenceRows, selected]);

  const readiness = regulatory ? regulatoryReadiness(evidence) : 0;
  const suppliedCount = evidence.filter(item => item.status === 'supplied').length;
  const reviewCount = evidence.filter(item => item.status === 'needs_review').length;
  const missingCount = evidence.filter(item => item.status === 'missing').length;
  const actions = regulatory?.obligations.map(item => item.title) ?? [];
  const relevantOfficialEvents = useMemo(() => product ? relevantRadarChanges(radarEvents, product, regulatory?.category ?? '') : [], [radarEvents, product, regulatory?.category]);
  const localImpacts = useMemo(() => {
    if (!regulatory) return [];
    return [
      ...regulatory.uncertainties.map(reason => ({ severity: 'review' as const, reason })),
      ...regulatory.applicableActs.slice(0, 4).map(act => ({ severity: act.applicability === 'baseline' ? 'info' as const : 'action' as const, reason: `${act.reference}: ${act.reason}` })),
    ].slice(0, 6);
  }, [regulatory]);

  async function askAi(event: FormEvent) {
    event.preventDefault();
    if (!analysis || !product || !result || !question.trim() || aiBusy) return;
    setAiBusy(true); setAnswer(''); setError('');
    try {
      const response = await fetch('/api/regulatory-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          analysisId: analysis.id,
          productIndex: selected,
          language: navigator.language || 'es',
        }),
      });
      const body = await response.json() as { answer?: string; error?: string };
      if (!response.ok || !body.answer) throw new Error(body.error || 'No se ha podido consultar ImportVerifier AI.');
      setAnswer(body.answer);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se ha podido consultar ImportVerifier AI.');
    } finally { setAiBusy(false); }
  }

  const detected = platformUrl.trim() ? detectPlatform(platformUrl.trim()) : null;

  return <section className={styles.suite} aria-label="ImportVerifier Intelligence Suite">
    <div className={styles.hero}>
      <div><span className={styles.eyebrow}>IMPORTVERIFIER INTELLIGENCE SUITE</span><h2>Una capa inteligente sobre cada producto.</h2><p>Pregunta, entiende el estado regulatorio, prioriza cambios y prepara conexiones con tus canales de venta desde un único lugar.</p></div>
      <span className={styles.badge}>AI · TWIN · RADAR · CONNECT</span>
    </div>

    {loading ? <div className={styles.empty}>Preparando la inteligencia de tu último análisis…</div> : !analysis ? <div className={styles.empty}>Crea tu primer análisis para activar ImportVerifier AI, Regulatory Twin e Impact Radar.</div> : <div className={styles.grid}>
      <article className={`${styles.card} ${styles.wide}`}>
        <div className={styles.cardHead}><div><h3>ImportVerifier AI</h3><p>Asistente regulatorio contextual. Responde a partir de tu producto, reglas y evidencias guardadas en tu cuenta.</p></div><span className={styles.status}>ACTIVO</span></div>
        <select className={styles.productSelect} value={selected} onChange={e => { setSelected(Number(e.target.value)); setAnswer(''); }} aria-label="Producto para consultar">
          {analysis.products.map((item, index) => <option value={index} key={`${item.name}-${index}`}>{item.name}</option>)}
        </select>
        <form className={styles.aiForm} onSubmit={askAi}><input className={styles.aiInput} value={question} maxLength={2000} onChange={e => setQuestion(e.target.value)} placeholder="Pregunta qué falta, qué pedir al proveedor o por qué aplica una norma…" /><button className={styles.button} disabled={aiBusy || !question.trim()}>{aiBusy ? 'Analizando…' : 'Preguntar a ImportVerifier AI'}</button></form>
        {answer && <div className={styles.answer}>{answer}</div>}
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.disclaimer}>El contexto se reconstruye en el servidor desde tu análisis y evidencia guardada. Asistencia orientativa; ImportVerifier no emite certificaciones ni sustituye evaluación jurídica o técnica especializada.</div>
      </article>

      <article className={styles.card}>
        <div className={styles.cardHead}><div><h3>Product Regulatory Twin</h3><p>Gemelo regulatorio vivo del producto seleccionado.</p></div><span className={styles.status}>{regulatory ? 'VIVO' : 'SIN CLASIFICAR'}</span></div>
        {regulatory ? <><div className={styles.meterRow}><div className={styles.meter} style={{ '--score': `${readiness}%` } as React.CSSProperties}><div className={styles.meterInner}>{readiness}%</div></div><div className={styles.facts}><div className={styles.fact}><span>Categoría</span><strong>{regulatory.category}</strong></div><div className={styles.fact}><span>Confianza</span><strong>{regulatory.confidence}</strong></div><div className={styles.fact}><span>Evidencia disponible</span><strong>{suppliedCount}</strong></div><div className={styles.fact}><span>Pendiente / revisar</span><strong>{missingCount + reviewCount}</strong></div></div></div><ul className={styles.list}>{actions.slice(0, 4).map(action => <li key={action}>{action}</li>)}</ul><div className={styles.disclaimer}>El readiness refleja el estado de evidencia guardado por el usuario; no equivale a una certificación de conformidad.</div></> : <div className={styles.empty}>No hay una clasificación regulatoria disponible para este producto.</div>}
      </article>

      <article className={styles.card}>
        <div className={styles.cardHead}><div><h3>Regulatory Impact Radar</h3><p>Prioriza cambios oficiales que coinciden con las características del producto seleccionado.</p></div><span className={styles.status}>{radarLive ? 'FUENTES OFICIALES' : 'RADAR'}</span></div>
        {relevantOfficialEvents.length > 0 ? <ul className={styles.list}>{relevantOfficialEvents.slice(0, 5).map(event => <li className={styles.impact} key={event.id}><span className={styles.dot} /><div><strong>{event.severity === 'action' ? 'Acción' : event.severity === 'review' ? 'Revisar' : 'Información'} · {event.title}</strong><br />{event.summary || event.official_reference || event.source_name}<br /><a href={event.source_url} target="_blank" rel="noopener noreferrer">Fuente oficial ↗</a></div></li>)}</ul> : localImpacts.length ? <><ul className={styles.list}>{localImpacts.map((impact, index) => <li className={styles.impact} key={`${impact.reason}-${index}`}><span className={styles.dot} /><div><strong>{impact.severity === 'action' ? 'Acción' : impact.severity === 'review' ? 'Revisar' : 'Contexto'}</strong><br />{impact.reason}</div></li>)}</ul><div className={styles.disclaimer}>{radarEvents.length ? 'Hay cambios oficiales guardados, pero ninguno coincide todavía con las palabras clave del producto seleccionado.' : 'Todavía no hay eventos regulatorios oficiales persistidos; estos puntos proceden del análisis actual del producto.'}</div></> : <div className={styles.empty}>Sin cambios oficiales relevantes ni impactos destacados para este producto.</div>}
      </article>

      <article className={`${styles.card} ${styles.wide}`}>
        <div className={styles.cardHead}><div><h3>Connect</h3><p>Base de integración preparada para importar catálogos y refrescar su estado desde las principales plataformas.</p></div><span className={styles.status}>3 CONECTORES</span></div>
        <div className={styles.platforms}>{PLATFORM_CONNECTORS.map(connector => <div className={styles.platform} key={connector.id}><strong>{connector.name}</strong><small>{connector.capabilities.map(item => item.replaceAll('-', ' ')).join(' · ')}</small><button type="button" disabled aria-label={`${connector.name} pendiente de autorización oficial`}>Próximamente · Autorizar {connector.name}</button></div>)}</div>
        <div className={styles.urlRow}><input value={platformUrl} onChange={e => setPlatformUrl(e.target.value)} placeholder="Pega una URL HTTPS de Shopify, Amazon o Etsy para detectar la plataforma" /><button className={styles.button} type="button" disabled={!platformUrl.trim()}>Detectar</button></div>
        {platformUrl.trim() && <div className={styles.detected}>{detected ? `Plataforma detectada: ${PLATFORM_CONNECTORS.find(item => item.id === detected)?.name}. La autorización se activará cuando la integración oficial esté configurada.` : 'No se ha reconocido una URL HTTPS compatible.'}</div>}
      </article>
    </div>}
  </section>;
}
