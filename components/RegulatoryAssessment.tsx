'use client';

import type { Result } from '@/lib/analysis';

const confidenceLabel = { high: 'Alta', medium: 'Media', low: 'Baja' } as const;

export default function RegulatoryAssessment({ results }: { results: Result[] }) {
  const regulatoryResults = results.filter(result => result.regulatory);
  if (!regulatoryResults.length) return null;

  return <section className="regulatory-assessment" aria-labelledby="regulatory-title">
    <div className="section-heading regulatory-heading">
      <div>
        <span className="eyebrow">EVALUACIÓN REGULATORIA UE</span>
        <h2 id="regulatory-title">Obligaciones candidatas y evidencia necesaria</h2>
        <p className="muted">La clasificación es automatizada y conservadora. Confirma la categoría, características y uso previsto antes de concluir qué legislación aplica.</p>
      </div>
      <span className="regulatory-engine-badge">Motor UE · v3</span>
    </div>

    <div className="regulatory-list">
      {regulatoryResults.map((result, index) => {
        const assessment = result.regulatory!;
        return <details className="regulatory-product" key={`${result.name}-${index}`} open={index === 0}>
          <summary>
            <span>
              <strong>{result.name}</strong>
              <small>{assessment.category} · Confianza {confidenceLabel[assessment.confidence]}</small>
            </span>
            <span className={assessment.requiresCategoryConfirmation ? 'regulatory-status needs-review' : 'regulatory-status'}>
              {assessment.requiresCategoryConfirmation ? 'Confirmar categoría' : 'Categoría probable'}
            </span>
          </summary>
          <div className="regulatory-body">
            <section>
              <h3>Normativa identificada</h3>
              <ul className="regulatory-acts">
                {assessment.applicableActs.map(act => <li key={`${act.reference}-${act.applicability}`}>
                  <div><strong>{act.title}</strong><span>{act.reference}</span></div>
                  <p>{act.reason}</p>
                  <a href={act.url} target="_blank" rel="noopener noreferrer">Fuente oficial ↗</a>
                </li>)}
              </ul>
            </section>

            <section>
              <h3>Acciones y evidencias</h3>
              <div className="regulatory-obligations">
                {assessment.obligations.map(obligation => <article key={obligation.id}>
                  <strong>{obligation.title}</strong>
                  <p>{obligation.reason}</p>
                  <ul>{obligation.evidence.map(item => <li key={item}>{item}</li>)}</ul>
                  <a href={obligation.source.url} target="_blank" rel="noopener noreferrer">{obligation.source.reference} ↗</a>
                </article>)}
              </div>
            </section>

            {assessment.uncertainties.length > 0 && <section className="regulatory-uncertainty">
              <h3>Confirmaciones necesarias</h3>
              <ul>{assessment.uncertainties.map(item => <li key={item}>{item}</li>)}</ul>
            </section>}
            <p className="regulatory-disclaimer">{assessment.disclaimer}</p>
          </div>
        </details>;
      })}
    </div>
  </section>;
}
