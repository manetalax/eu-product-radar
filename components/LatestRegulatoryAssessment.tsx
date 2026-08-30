'use client';

import { useEffect, useMemo, useState } from 'react';
import { Analysis, analysisMarket, analyze } from '@/lib/analysis';
import RegulatoryAssessment from './RegulatoryAssessment';
import styles from './LatestRegulatoryAssessment.module.css';

export default function LatestRegulatoryAssessment() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const historyResponse = await fetch('/api/analyses?page=0', { cache: 'no-store', signal: controller.signal });
        if (!historyResponse.ok) return;
        const history = await historyResponse.json();
        const latest = history.analyses?.[0];
        if (!latest?.id || analysisMarket(latest) !== 'EU') return;
        const response = await fetch(`/api/analyses?id=${encodeURIComponent(latest.id)}`, { cache: 'no-store', signal: controller.signal });
        if (!response.ok) return;
        const body = await response.json();
        if (!controller.signal.aborted) setAnalysis(body.analysis ?? null);
      } catch {
        // The main dashboard owns user-facing API errors. This enhancement stays silent.
      }
    })();
    return () => controller.abort();
  }, []);

  const results = useMemo(() => analysis ? analyze(analysis.products, analysisMarket(analysis)) : [], [analysis]);
  if (!analysis || !results.some(result => result.regulatory)) return null;

  return <section className={styles.wrap} aria-label="Última evaluación regulatoria">
    <div className={styles.inner}>
      <div className={styles.context}><span>ÚLTIMO ANÁLISIS REGULATORIO</span><strong>{analysis.filename}</strong></div>
      <RegulatoryAssessment results={results} />
    </div>
  </section>;
}
