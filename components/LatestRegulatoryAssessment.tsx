'use client';

import { useEffect, useMemo, useState } from 'react';
import { Analysis, analysisMarket, analyze } from '@/lib/analysis';
import { analysisFromUnknown, analysisSummariesFromUnknown } from '@/lib/dashboard-api-shapes';
import { useLanguage } from '@/lib/use-language';
import RegulatoryAssessment from './RegulatoryAssessment';
import ReadinessEvidencePanel from './ReadinessEvidencePanel';
import styles from './LatestRegulatoryAssessment.module.css';

const copy = {
  es: { aria:'Última evaluación regulatoria', eyebrow:'ÚLTIMO ANÁLISIS REGULATORIO' },
  en: { aria:'Latest regulatory assessment', eyebrow:'LATEST REGULATORY ANALYSIS' },
  fr: { aria:'Dernière évaluation réglementaire', eyebrow:'DERNIÈRE ANALYSE RÉGLEMENTAIRE' },
  de: { aria:'Neueste Regulierungsbewertung', eyebrow:'NEUESTE REGULIERUNGSANALYSE' },
  it: { aria:'Ultima valutazione normativa', eyebrow:'ULTIMA ANALISI NORMATIVA' },
  pt: { aria:'Última avaliação regulamentar', eyebrow:'ÚLTIMA ANÁLISE REGULAMENTAR' },
} as const;

function jsonRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

async function trustedJsonObject(response: Response): Promise<Record<string, unknown> | null> {
  if (!response.ok) return null;
  try {
    return jsonRecord(await response.json());
  } catch {
    return null;
  }
}

export default function LatestRegulatoryAssessment() {
  const { language } = useLanguage();
  const t = copy[language];
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const historyResponse = await fetch('/api/analyses?page=0', { cache: 'no-store', signal: controller.signal });
        const historyBody = await trustedJsonObject(historyResponse);
        if (!historyBody) return;
        const summaries = analysisSummariesFromUnknown(historyBody.analyses);
        const latest = summaries?.[0];
        if (!latest?.id || analysisMarket(latest) !== 'EU') return;

        const response = await fetch(`/api/analyses?id=${encodeURIComponent(latest.id)}`, { cache: 'no-store', signal: controller.signal });
        const body = await trustedJsonObject(response);
        const validated = body ? analysisFromUnknown(body.analysis) : null;
        if (!validated || analysisMarket(validated) !== 'EU') return;
        if (!controller.signal.aborted) setAnalysis(validated);
      } catch {
        // The main dashboard owns user-facing API errors. This enhancement stays silent.
      }
    })();
    return () => controller.abort();
  }, []);

  const results = useMemo(() => analysis ? analyze(analysis.products, analysisMarket(analysis)) : [], [analysis]);
  if (!analysis || !results.some(result => result.regulatory)) return null;

  return <section className={styles.wrap} aria-label={t.aria}>
    <div className={styles.inner}>
      <div className={styles.context}><span>{t.eyebrow}</span><strong>{analysis.filename}</strong></div>
      <RegulatoryAssessment results={results} />
      <ReadinessEvidencePanel analysis={analysis} />
    </div>
  </section>;
}
