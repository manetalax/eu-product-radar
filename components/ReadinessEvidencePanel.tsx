'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Analysis } from '@/lib/analysis';
import { analyze } from '@/lib/analysis';
import { localizeEuRegulatoryAssessment } from '@/lib/eu-regulatory-i18n';
import type { Language } from '@/lib/landing-i18n';
import { localizeMarketReadiness } from '@/lib/market-readiness-i18n';
import { marketReadiness } from '@/lib/market-readiness';
import { useLanguage } from '@/lib/use-language';

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

const copy: Record<Language, Record<string, string>> = {
  es:{ aria:'Preparación para mercado y evidencia', eyebrow:'DECISIÓN Y EVIDENCIA', title:'Qué bloquea, qué revisar y qué tienes ya', filter:'Filtrar resultados', all:'Todos', blockers:'No listos', review:'Revisión', ready:'Continuar', blockerTitle:'Bloqueos', next:'Siguientes acciones', evidence:'Evidencia documental', evidenceIntro:'Marca el estado y, cuando tengas una prueba, indica el documento, página o enlace. ImportVerifier conservará esa trazabilidad en el expediente del producto.', pending:'Pendiente', available:'Disponible', na:'No aplica', document:'Documento', documentPlaceholder:'ej. Informe de ensayo.pdf', page:'Página / sección', pagePlaceholder:'ej. pág. 12', url:'URL de evidencia', note:'Nota', notePlaceholder:'Qué demuestra esta evidencia o qué queda por comprobar', saving:'Guardando trazabilidad…' },
  en:{ aria:'Market readiness and evidence', eyebrow:'DECISION AND EVIDENCE', title:'What blocks progress, what needs review and what you already have', filter:'Filter results', all:'All', blockers:'Not ready', review:'Review', ready:'Continue', blockerTitle:'Blockers', next:'Next actions', evidence:'Documentary evidence', evidenceIntro:'Set the status and, when evidence is available, identify the document, page or link. ImportVerifier will retain this traceability in the product record.', pending:'Pending', available:'Available', na:'Not applicable', document:'Document', documentPlaceholder:'e.g. Test report.pdf', page:'Page / section', pagePlaceholder:'e.g. p. 12', url:'Evidence URL', note:'Note', notePlaceholder:'What this evidence demonstrates or what still needs verification', saving:'Saving traceability…' },
  fr:{ aria:'Préparation au marché et preuves', eyebrow:'DÉCISION ET PREUVES', title:'Ce qui bloque, ce qui doit être vérifié et ce que vous avez déjà', filter:'Filtrer les résultats', all:'Tous', blockers:'Non prêts', review:'Révision', ready:'Continuer', blockerTitle:'Blocages', next:'Actions suivantes', evidence:'Preuves documentaires', evidenceIntro:'Indiquez le statut et, lorsque vous disposez d’une preuve, précisez le document, la page ou le lien. ImportVerifier conservera cette traçabilité dans le dossier produit.', pending:'En attente', available:'Disponible', na:'Non applicable', document:'Document', documentPlaceholder:'ex. Rapport d’essai.pdf', page:'Page / section', pagePlaceholder:'ex. p. 12', url:'URL de la preuve', note:'Note', notePlaceholder:'Ce que cette preuve démontre ou ce qui reste à vérifier', saving:'Enregistrement de la traçabilité…' },
  de:{ aria:'Marktreife und Nachweise', eyebrow:'ENTSCHEIDUNG UND NACHWEISE', title:'Was blockiert, was geprüft werden muss und was bereits vorliegt', filter:'Ergebnisse filtern', all:'Alle', blockers:'Nicht bereit', review:'Prüfung', ready:'Fortfahren', blockerTitle:'Blocker', next:'Nächste Maßnahmen', evidence:'Dokumentarische Nachweise', evidenceIntro:'Status festlegen und bei vorhandenem Nachweis Dokument, Seite oder Link angeben. ImportVerifier bewahrt diese Rückverfolgbarkeit in der Produktakte auf.', pending:'Ausstehend', available:'Verfügbar', na:'Nicht anwendbar', document:'Dokument', documentPlaceholder:'z. B. Prüfbericht.pdf', page:'Seite / Abschnitt', pagePlaceholder:'z. B. S. 12', url:'Nachweis-URL', note:'Notiz', notePlaceholder:'Was dieser Nachweis belegt oder was noch geprüft werden muss', saving:'Rückverfolgbarkeit wird gespeichert…' },
  it:{ aria:'Preparazione al mercato ed evidenze', eyebrow:'DECISIONE ED EVIDENZE', title:'Cosa blocca, cosa va verificato e cosa è già disponibile', filter:'Filtra risultati', all:'Tutti', blockers:'Non pronti', review:'Revisione', ready:'Continua', blockerTitle:'Blocchi', next:'Azioni successive', evidence:'Evidenza documentale', evidenceIntro:'Imposta lo stato e, quando disponi di una prova, indica documento, pagina o link. ImportVerifier conserverà questa tracciabilità nel fascicolo del prodotto.', pending:'In sospeso', available:'Disponibile', na:'Non applicabile', document:'Documento', documentPlaceholder:'es. Rapporto di prova.pdf', page:'Pagina / sezione', pagePlaceholder:'es. pag. 12', url:'URL evidenza', note:'Nota', notePlaceholder:'Cosa dimostra questa evidenza o cosa resta da verificare', saving:'Salvataggio tracciabilità…' },
  pt:{ aria:'Preparação para o mercado e evidência', eyebrow:'DECISÃO E EVIDÊNCIA', title:'O que bloqueia, o que rever e o que já existe', filter:'Filtrar resultados', all:'Todos', blockers:'Não prontos', review:'Revisão', ready:'Continuar', blockerTitle:'Bloqueios', next:'Próximas ações', evidence:'Evidência documental', evidenceIntro:'Defina o estado e, quando tiver uma prova, indique o documento, a página ou a ligação. O ImportVerifier conservará esta rastreabilidade no processo do produto.', pending:'Pendente', available:'Disponível', na:'Não aplicável', document:'Documento', documentPlaceholder:'ex. Relatório de ensaio.pdf', page:'Página / secção', pagePlaceholder:'ex. pág. 12', url:'URL da evidência', note:'Nota', notePlaceholder:'O que esta evidência demonstra ou o que falta verificar', saving:'A guardar rastreabilidade…' },
};

export default function ReadinessEvidencePanel({ analysis }: { analysis: Analysis }) {
  const { language } = useLanguage();
  const t = copy[language];
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
      product_index: productIndex, evidence_key: evidenceKey, status: 'pending', ...blankTrace,
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
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: analysis.id, productIndex, evidenceKey, status: next.status, note: next.note, sourceDocument: next.source_document, sourcePage: next.source_page, sourceUrl: next.source_url }),
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

  const items = analysis.products.map((product, index) => {
    const rawResult = results[index];
    const localizedRegulatory = rawResult.regulatory ? localizeEuRegulatoryAssessment(rawResult.regulatory, language) : undefined;
    const localizedResult = localizedRegulatory ? { ...rawResult, regulatory: localizedRegulatory } : rawResult;
    const decision = localizeMarketReadiness(marketReadiness(product, localizedResult), language);
    return { product, rawResult, localizedResult, decision, index };
  });
  const visible = items.filter(item => filter === 'all' || (filter === 'blockers' && item.decision.state === 'NOT_READY_TO_MARKET') || (filter === 'review' && item.decision.state === 'REVIEW_REQUIRED') || (filter === 'ready' && item.decision.state === 'READY_TO_CONTINUE'));

  return <section className="card content-card" aria-label={t.aria}>
    <div className="section-heading"><div><span className="eyebrow">{t.eyebrow}</span><h2>{t.title}</h2></div></div>
    <div className="format-chips" role="group" aria-label={t.filter}>
      <button onClick={() => setFilter('all')}>{t.all}</button><button onClick={() => setFilter('blockers')}>{t.blockers}</button><button onClick={() => setFilter('review')}>{t.review}</button><button onClick={() => setFilter('ready')}>{t.ready}</button>
    </div>
    {visible.map(({ product, rawResult, localizedResult, decision, index }) => <details key={`${product.name}-${index}`} open={index === 0}>
      <summary><strong>{product.name}</strong> · {decision.label}</summary>
      <div className="documentation-body">
        {decision.blockers.length > 0 && <section><h3>{t.blockerTitle}</h3><ul>{decision.blockers.map(x => <li key={x}>{x}</li>)}</ul></section>}
        <section><h3>{t.next}</h3><ul>{decision.nextActions.map(x => <li key={x}>{x}</li>)}</ul></section>
        {rawResult.regulatory && localizedResult.regulatory && <section>
          <h3>{t.evidence}</h3>
          <p className="muted">{t.evidenceIntro}</p>
          {rawResult.regulatory.obligations.flatMap(rawObligation => {
            const displayed = localizedResult.regulatory!.obligations.find(item => item.id === rawObligation.id) ?? rawObligation;
            return rawObligation.evidence.map((rawEvidence, evidenceIndex) => ({
              key: `${rawObligation.title}: ${rawEvidence}`.slice(0, 120),
              evidence: displayed.evidence[evidenceIndex] ?? rawEvidence,
            }));
          }).map(({ key, evidence }) => {
            const current = rowFor(index, key);
            const token = `${index}:${key}`;
            return <div key={key} className="card" style={{ padding: 16, marginTop: 12 }}>
              <div className="toprow"><strong>{evidence}</strong><select aria-label={`${evidence}: status`} value={current.status} onChange={event => void saveEvidence(index, key, { status: event.target.value as EvidenceStatus })}><option value="pending">{t.pending}</option><option value="available">{t.available}</option><option value="not_applicable">{t.na}</option></select></div>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10, marginTop: 12 }}>
                <label><span className="muted">{t.document}</span><input defaultValue={current.source_document} maxLength={240} placeholder={t.documentPlaceholder} onBlur={event => void saveEvidence(index, key, { source_document: event.currentTarget.value.trim() })} /></label>
                <label><span className="muted">{t.page}</span><input defaultValue={current.source_page} maxLength={80} placeholder={t.pagePlaceholder} onBlur={event => void saveEvidence(index, key, { source_page: event.currentTarget.value.trim() })} /></label>
                <label><span className="muted">{t.url}</span><input type="url" defaultValue={current.source_url} maxLength={1000} placeholder="https://…" onBlur={event => void saveEvidence(index, key, { source_url: event.currentTarget.value.trim() })} /></label>
              </div>
              <label style={{ display: 'block', marginTop: 10 }}><span className="muted">{t.note}</span><input defaultValue={current.note} maxLength={2000} placeholder={t.notePlaceholder} onBlur={event => void saveEvidence(index, key, { note: event.currentTarget.value.trim() })} /></label>
              {savingKey === token && <small className="muted">{t.saving}</small>}
            </div>;
          })}
        </section>}
      </div>
    </details>)}
  </section>;
}
