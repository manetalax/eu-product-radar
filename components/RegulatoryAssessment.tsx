'use client';

import type { Result } from '@/lib/analysis';
import { localizeEuRegulatoryAssessment } from '@/lib/eu-regulatory-i18n';
import type { Language } from '@/lib/landing-i18n';
import { useLanguage } from '@/lib/use-language';
import styles from './RegulatoryAssessment.module.css';

const copy: Record<Language, {
  aria: string; eyebrow: string; title: string; intro: string; confidence: string;
  high: string; medium: string; low: string; confirm: string; probable: string;
  rules: string; officialSource: string; actions: string; confirmations: string;
}> = {
  es: { aria:'Evaluación regulatoria UE', eyebrow:'EVALUACIÓN REGULATORIA UE', title:'Obligaciones candidatas y evidencia necesaria', intro:'La clasificación es automatizada y conservadora. Confirma la categoría, características y uso previsto antes de concluir qué legislación aplica.', confidence:'Confianza', high:'Alta', medium:'Media', low:'Baja', confirm:'Confirmar categoría', probable:'Categoría probable', rules:'Normativa identificada', officialSource:'Fuente oficial', actions:'Acciones y evidencias', confirmations:'Confirmaciones necesarias' },
  en: { aria:'EU regulatory assessment', eyebrow:'EU REGULATORY ASSESSMENT', title:'Candidate obligations and required evidence', intro:'Classification is automated and conservative. Confirm the category, characteristics and intended use before concluding which legislation applies.', confidence:'Confidence', high:'High', medium:'Medium', low:'Low', confirm:'Confirm category', probable:'Likely category', rules:'Identified legislation', officialSource:'Official source', actions:'Actions and evidence', confirmations:'Required confirmations' },
  fr: { aria:'Évaluation réglementaire UE', eyebrow:'ÉVALUATION RÉGLEMENTAIRE UE', title:'Obligations candidates et preuves requises', intro:'La classification est automatisée et prudente. Confirmez la catégorie, les caractéristiques et l’usage prévu avant de conclure sur la législation applicable.', confidence:'Confiance', high:'Élevée', medium:'Moyenne', low:'Faible', confirm:'Confirmer la catégorie', probable:'Catégorie probable', rules:'Réglementation identifiée', officialSource:'Source officielle', actions:'Actions et preuves', confirmations:'Confirmations nécessaires' },
  de: { aria:'EU-Regulierungsbewertung', eyebrow:'EU-REGULIERUNGSBEWERTUNG', title:'Mögliche Pflichten und erforderliche Nachweise', intro:'Die Einstufung erfolgt automatisiert und konservativ. Kategorie, Eigenschaften und Verwendungszweck bestätigen, bevor die anwendbaren Vorschriften abschließend bestimmt werden.', confidence:'Konfidenz', high:'Hoch', medium:'Mittel', low:'Niedrig', confirm:'Kategorie bestätigen', probable:'Wahrscheinliche Kategorie', rules:'Ermittelte Vorschriften', officialSource:'Offizielle Quelle', actions:'Maßnahmen und Nachweise', confirmations:'Erforderliche Bestätigungen' },
  it: { aria:'Valutazione normativa UE', eyebrow:'VALUTAZIONE NORMATIVA UE', title:'Obblighi candidati ed evidenze necessarie', intro:'La classificazione è automatizzata e prudente. Confermare categoria, caratteristiche e uso previsto prima di concludere quale normativa si applica.', confidence:'Affidabilità', high:'Alta', medium:'Media', low:'Bassa', confirm:'Confermare categoria', probable:'Categoria probabile', rules:'Normativa identificata', officialSource:'Fonte ufficiale', actions:'Azioni ed evidenze', confirmations:'Conferme necessarie' },
  pt: { aria:'Avaliação regulamentar UE', eyebrow:'AVALIAÇÃO REGULAMENTAR UE', title:'Obrigações candidatas e evidência necessária', intro:'A classificação é automatizada e conservadora. Confirme a categoria, as características e a utilização prevista antes de concluir que legislação se aplica.', confidence:'Confiança', high:'Alta', medium:'Média', low:'Baixa', confirm:'Confirmar categoria', probable:'Categoria provável', rules:'Legislação identificada', officialSource:'Fonte oficial', actions:'Ações e evidências', confirmations:'Confirmações necessárias' },
};

export default function RegulatoryAssessment({ results }: { results: Result[] }) {
  const { language } = useLanguage();
  const t = copy[language];
  const regulatoryResults = results.filter(result => result.regulatory);
  if (!regulatoryResults.length) return null;
  const engineVersion = regulatoryResults[0].regulatory!.engineVersion;
  const confidenceLabel = { high: t.high, medium: t.medium, low: t.low } as const;

  return <section className={styles.assessment} aria-labelledby="regulatory-title" aria-label={t.aria}>
    <div className={styles.heading}>
      <div>
        <span className="eyebrow">{t.eyebrow}</span>
        <h2 id="regulatory-title">{t.title}</h2>
        <p className="muted">{t.intro}</p>
      </div>
      <span className={styles.badge}>{engineVersion}</span>
    </div>

    <div className={styles.list}>
      {regulatoryResults.map((result, index) => {
        const assessment = localizeEuRegulatoryAssessment(result.regulatory!, language);
        return <details className={styles.product} key={`${result.name}-${index}`} open={index === 0}>
          <summary>
            <span>
              <strong>{result.name}</strong>
              <small>{assessment.category} · {t.confidence} {confidenceLabel[assessment.confidence]}</small>
            </span>
            <span className={`${styles.status} ${assessment.requiresCategoryConfirmation ? styles.review : ''}`}>
              {assessment.requiresCategoryConfirmation ? t.confirm : t.probable}
            </span>
          </summary>
          <div className={styles.body}>
            <section>
              <h3>{t.rules}</h3>
              <ul className={styles.acts}>
                {assessment.applicableActs.map(act => <li key={`${act.reference}-${act.applicability}`}>
                  <div><strong>{act.title}</strong><span>{act.reference}</span></div>
                  <p>{act.reason}</p>
                  <a href={act.url} target="_blank" rel="noopener noreferrer">{t.officialSource} ↗</a>
                </li>)}
              </ul>
            </section>

            <section>
              <h3>{t.actions}</h3>
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
              <h3>{t.confirmations}</h3>
              <ul>{assessment.uncertainties.map(item => <li key={item}>{item}</li>)}</ul>
            </section>}
            <p className={styles.disclaimer}>{assessment.disclaimer}</p>
          </div>
        </details>;
      })}
    </div>
  </section>;
}
