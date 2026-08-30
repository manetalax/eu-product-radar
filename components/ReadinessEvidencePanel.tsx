'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Analysis } from '@/lib/analysis';
import { analyze } from '@/lib/analysis';
import { marketReadiness } from '@/lib/market-readiness';

type EvidenceRow = { id?: string; product_index: number; evidence_key: string; status: 'available' | 'pending' | 'not_applicable'; note: string };

export default function ReadinessEvidencePanel({ analysis }: { analysis: Analysis }) {
  const results = useMemo(() => analyze(analysis.products, 'EU'), [analysis]);
  const [rows, setRows] = useState<EvidenceRow[]>([]);
  const [filter, setFilter] = useState<'all' | 'blockers' | 'review' | 'ready'>('all');

  useEffect(() => {
    fetch(`/api/evidence?analysisId=${encodeURIComponent(analysis.id)}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null).then(body => { if (body?.evidence) setRows(body.evidence); }).catch(() => {});
  }, [analysis.id]);

  async function setEvidence(productIndex: number, evidenceKey: string, status: EvidenceRow['status']) {
    const existing = rows.find(row => row.product_index === productIndex && row.evidence_key === evidenceKey);
    const optimistic: EvidenceRow = { product_index: productIndex, evidence_key: evidenceKey, status, note: existing?.note ?? '' };
    setRows(current => [...current.filter(row => !(row.product_index === productIndex && row.evidence_key === evidenceKey)), optimistic]);
    const response = await fetch('/api/evidence', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ analysisId: analysis.id, productIndex, evidenceKey, status, note: optimistic.note }) });
    if (response.ok) {
      const body = await response.json();
      setRows(current => [...current.filter(row => !(row.product_index === productIndex && row.evidence_key === evidenceKey)), body.evidence]);
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
        {result.regulatory && <section><h3>Evidencia documental</h3>{result.regulatory.obligations.flatMap(obligation => obligation.evidence.map(evidence => ({ obligation: obligation.title, evidence }))).map(({ obligation, evidence }) => {
          const key = `${obligation}: ${evidence}`.slice(0, 120);
          const current = rows.find(row => row.product_index === index && row.evidence_key === key)?.status ?? 'pending';
          return <div key={key} className="toprow"><span>{evidence}</span><select value={current} onChange={event => void setEvidence(index, key, event.target.value as EvidenceRow['status'])}><option value="pending">Pendiente</option><option value="available">Disponible</option><option value="not_applicable">No aplica</option></select></div>;
        })}</section>}
      </div>
    </details>)}
  </section>;
}
