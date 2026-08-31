'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Analysis } from '@/lib/analysis';
import { analyze } from '@/lib/analysis';
import { marketReadiness } from '@/lib/market-readiness';

type EvidenceStatus = 'available' | 'pending' | 'not_applicable';
type EvidenceRow = {
  id?: string;
  product_index: number;
  evidence_key: string;
  status: EvidenceStatus;
  note: string;
  source_document: string;
  source_page: string;
  source_url: string;
};

const blankTrace = { note: '', source_document: '', source_page: '', source_url: '' };

export default function ReadinessEvidencePanel({ analysis }: { analysis: Analysis }) {
  const results = useMemo(() => analyze(analysis.products, 'EU'), [analysis]);
  const [rows, setRows] = useState<EvidenceRow[]>([]);
  const [filter, setFilter] = useState<'all' | 'blockers' | 'review' | 'ready'>('all');
  const [savingKey, setSavingKey] = useState('');

  useEffect(() => {
    fetch(`/api/evidence?analysisId=${encodeURIComponent(analysis.id)}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(body => { if (body?.evidence) setRows(body.evidence); })
      .catch(() => {});
  }, [analysis.id]);

  function rowFor(productIndex: number, evidenceKey: string): EvidenceRow {
    return rows.find(row => row.product_index === productIndex && row.evidence_key === evidenceKey) ?? {
      product_index: productIndex,
      evidence_key: evidenceKey,
      status: 'pending',
      ...blankTrace,
    };
  }

  async function saveEvidence(productIndex: number, evidenceKey: string, patch: Partial<EvidenceRow>) {
    const existing = rowFor(productIndex, evidenceKey);
    const next: EvidenceRow = { ...existing, ...patch, product_index: productIndex, evidence_key: evidenceKey };
    const token = `${productIndex}:${evidenceKey}`;
    setRows(current => [...current.filter(row => !(row.product_index === productIndex && row.evidence_key === evidenceKey)), next]);
    setSavingKey(token);
    try {
      const response = await fetch('/api/evidence', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId: analysis.id,
          productIndex,
          evidenceKey,
          status: next.status,
          note: next.note,
          sourceDocument: next.source_document,
          sourcePage: next.source_page,
          sourceUrl: next.source_url,
        }),
      });
      if (response.ok) {
        const body = await response.json();
        setRows(current => [...current.filter(row => !(row.product_index === productIndex && row.evidence_key === evidenceKey)), body.evidence]);
      } else {
        setRows(current => [...current.filter(row => !(row.product_index === productIndex && row.evidence_key === evidenceKey)), existing]);
      }
    } finally {
      setSavingKey(current => current === token ? '' : current);
    }
  }

  const items = analysis.products.map((product, index) => ({ product, result: results[index], decision: marketReadiness(product, results[index]), index }));
  const visible = items.filter(item => filter === 'all' || (filter === 'blockers' && item.decision.state === 'NOT_READY_TO_MARKET') || (filter === 'review' && item.decision.state === 'REVIEW_REQUIRED') || (filter === 'ready' && item.decision.state === 'READY_TO_CONTINUE'));

  return <section className="card content-card" aria-label="Preparación para mercado y evidencia">
    <div className="section-heading"><div><span className="eyebrow">DECISIÓN Y EVIDENCIA</span><h2>Qué bloquea, qué revisar y qué tienes ya</h2></div></div>
    <div className="format-chips" role="group" aria-label="Filtrar resultados">
      <button onClick={() => setFilter('all')}>Todos</button><button onClick={() => setFilter('blockers')}>No listos</button><button onClick={() => setFilter('review')}>Revisión</button><button onClick={() => setFilter('ready')}>Continuar</button>
    </div>
    {visible.map(({ product, result, decision, index }) => <details key={`${product.name}-${index}`} open={index === 0}>
      <summary><strong>{product.name}</strong> · {decision.label}</summary>
      <div className="documentation-body">
        {decision.blockers.length > 0 && <section><h3>Bloqueos</h3><ul>{decision.blockers.map(x => <li key={x}>{x}</li>)}</ul></section>}
        <section><h3>Siguientes acciones</h3><ul>{decision.nextActions.map(x => <li key={x}>{x}</li>)}</ul></section>
        {result.regulatory && <section>
          <h3>Evidencia documental</h3>
          <p className="muted">Marca el estado y, cuando tengas una prueba, indica el documento, página o enlace. ImportVerifier conservará esa trazabilidad en el expediente del producto.</p>
          {result.regulatory.obligations.flatMap(obligation => obligation.evidence.map(evidence => ({ obligation: obligation.title, evidence }))).map(({ obligation, evidence }) => {
            const key = `${obligation}: ${evidence}`.slice(0, 120);
            const current = rowFor(index, key);
            const token = `${index}:${key}`;
            return <div key={key} className="card" style={{ padding: 16, marginTop: 12 }}>
              <div className="toprow"><strong>{evidence}</strong><select value={current.status} onChange={event => void saveEvidence(index, key, { status: event.target.value as EvidenceStatus })}><option value="pending">Pendiente</option><option value="available">Disponible</option><option value="not_applicable">No aplica</option></select></div>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10, marginTop: 12 }}>
                <label><span className="muted">Documento</span><input defaultValue={current.source_document} maxLength={240} placeholder="ej. Informe de ensayo.pdf" onBlur={event => void saveEvidence(index, key, { source_document: event.currentTarget.value.trim() })} /></label>
                <label><span className="muted">Página / sección</span><input defaultValue={current.source_page} maxLength={80} placeholder="ej. pág. 12" onBlur={event => void saveEvidence(index, key, { source_page: event.currentTarget.value.trim() })} /></label>
                <label><span className="muted">URL de evidencia</span><input type="url" defaultValue={current.source_url} maxLength={1000} placeholder="https://…" onBlur={event => void saveEvidence(index, key, { source_url: event.currentTarget.value.trim() })} /></label>
              </div>
              <label style={{ display: 'block', marginTop: 10 }}><span className="muted">Nota</span><input defaultValue={current.note} maxLength={2000} placeholder="Qué demuestra esta evidencia o qué queda por comprobar" onBlur={event => void saveEvidence(index, key, { note: event.currentTarget.value.trim() })} /></label>
              {savingKey === token && <small className="muted">Guardando trazabilidad…</small>}
            </div>;
          })}
        </section>}
      </div>
    </details>)}
  </section>;
}
