'use client';

import type { Result } from '@/lib/analysis';
import styles from './RegulatoryAssessment.module.css';

const confidenceLabel = { high: 'Alta', medium: 'Media', low: 'Baja' } as const;

export default function RegulatoryAssessment({ results }: { results: Result[] }) {
  const regulatoryResults = results.filter(result => result.regulatory);
  if (!regulatoryResults.length) return null;
  const engineVersion = regulatoryResults[0].regulatory!.engineVersion;

  return <section className={styles.assessment} aria-labelledby="regulatory-title">
    <div className={styles.heading}>
      <div>
        <span className="eyebrow">EVALUACIÓN REGULATORIA UE</span>
        <h2 id="regulatory-title">Obligaciones candidatas y evidencia necesaria</h2>
        <p className="muted">La clasificación es automatizada y conservadora. Confirma la categoría, características y uso previsto antes de concluir qué legislación aplica.</p>
      </div>
      <span className={styles.badge}>{engineVersion}</span>
    </div>

    <div className={styles.list}>
      {regulatoryResults.map((result, index) => {
        const assessment = result.regulatory!;
        return <details className={styles.product} key={`${result.name}-${index}`} open={index === 0}>
          <summary>
            <span>
              <strong>{result.name}</strong>
              <small>{assessment.category} · Confianza {confidenceLabel[assessment.confidence]}</small>
            </span>
            <span className={`${styles.status} ${assessment.requiresCategoryConfirmation ? styles.review : ''}`}>
              {assessment.requiresCategoryConfirmation ? 'Confirmar categoría' : 'Categoría probable'}
            </span>
          </summary>
          <div className={styles.body}>
            <section>
              <h3>Normativa identificada</h3>
              <ul className={styles.acts}>
                {assessment.applicableActs.map(act => <li key={`${act.reference}-${act.applicability}`}>
                  <div><strong>{act.title}</strong><span>{act.reference}</span></div>
                  <p>{act.reason}</p>
                  <a href={act.url} target="_blank" rel="noopener noreferrer">Fuente oficial ↗</a>
                </li>)}
              </ul>
            </section>

            <section>
              <h3>Acciones y evidencias</h3>
              <div className={styles.obligations}>
                {assessment.obligations.map(obligation => <article key={obligation.id}>
                  <strong>{obligation.title}</strong>
                  <p>{obligation.reason}</p>
                  <ul>{obligation.evidence.map(item => <li key={item}>{item}</li>)}</ul>
                  <a href={obligation.source.url} target="_blank" rel="noopener noreferrer">{obligation.source.reference} ↗</a>
                </article>)}
              </div>
            </section>

            {assessment.uncertainties.length > 0 && <section className={styles.uncertainty}>
              <h3>Confirmaciones necesarias</h3>
              <ul>{assessment.uncertainties.map(item => <li key={item}>{item}</li>)}</ul>
            </section>}
            <p className={styles.disclaimer}>{assessment.disclaimer}</p>
          </div>
        </details>;
      })}
    </div>
  </section>;
}
