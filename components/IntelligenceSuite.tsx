'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Analysis, analyze } from '@/lib/analysis';
import { localizeEuRegulatoryAssessment } from '@/lib/eu-regulatory-i18n';
import { intelligenceCopy } from '@/lib/intelligence-i18n';
import { intelligenceSectionCopy } from '@/lib/intelligence-section-i18n';
import { platformCapabilityLabel } from '@/lib/platform-capability-i18n';
import { PLATFORM_CONNECTORS, detectPlatform } from '@/lib/platform-connectors';
import { relevantRadarChanges } from '@/lib/radar-match';
import { regulatoryReadiness, type RegulatoryEvidenceLink } from '@/lib/regulatory-twin';
import { useLanguage } from '@/lib/use-language';
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
  const { language } = useLanguage();
  const t = intelligenceCopy[language];
  const section = intelligenceSectionCopy[language];
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [evidenceRows, setEvidenceRows] = useState<EvidenceRow[]>([]);
  const [radarEvents, setRadarEvents] = useState<RadarEvent[]>([]);
  const [radarLive, setRadarLive] = useState(false);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [error, setError] = useState('');
  const [platformUrl, setPlatformUrl] = useState('');

  useEffect(() => {
    if (!question) setQuestion(t.defaultQuestion);
  }, [t.defaultQuestion, question]);

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
        if (!cancelled) setError(t.loadError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadLatest();
    return () => { cancelled = true; };
  }, [t.loadError]);

  const results = useMemo(() => analysis ? analyze(analysis.products, analysis.market_code ?? 'EU') : [], [analysis]);
  const result = results[selected];
  const product = analysis?.products[selected];
  const rawRegulatory = result?.regulatory;
  const regulatory = useMemo(() => rawRegulatory ? localizeEuRegulatoryAssessment(rawRegulatory, language) : undefined, [rawRegulatory, language]);

  const evidence = useMemo<RegulatoryEvidenceLink[]>(() => {
    if (!rawRegulatory || !regulatory) return [];
    const rowsForProduct = evidenceRows.filter(row => row.product_index === selected);
    return rawRegulatory.obligations.flatMap(rawObligation => {
      const displayed = regulatory.obligations.find(item => item.id === rawObligation.id) ?? rawObligation;
      return rawObligation.evidence.flatMap((rawTitle, index) => {
        const key = `${rawObligation.title}: ${rawTitle}`.slice(0, 120);
        const saved = rowsForProduct.find(row => row.evidence_key === key);
        if (saved?.status === 'not_applicable') return [];
        const status: RegulatoryEvidenceLink['status'] = saved?.status === 'available' ? 'supplied' : saved?.status === 'pending' ? 'needs_review' : 'missing';
        return [{ requirementId: `${rawObligation.id}-${index}`, title: displayed.evidence[index] ?? rawTitle, status, sourceName: saved?.note || undefined, sourceUrl: rawObligation.source.url }];
      });
    });
  }, [rawRegulatory, regulatory, evidenceRows, selected]);

  const readiness = regulatory ? regulatoryReadiness(evidence) : 0;
  const suppliedCount = evidence.filter(item => item.status === 'supplied').length;
  const reviewCount = evidence.filter(item => item.status === 'needs_review').length;
  const missingCount = evidence.filter(item => item.status === 'missing').length;
  const actions = regulatory?.obligations.map(item => item.title) ?? [];
  const relevantOfficialEvents = useMemo(() => product ? relevantRadarChanges(radarEvents, product, rawRegulatory?.category ?? '') : [], [radarEvents, product, rawRegulatory?.category]);
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
          language,
        }),
      });
      const body = await response.json() as { answer?: string; error?: string };
      if (!response.ok || !body.answer) throw new Error(body.error || t.aiError);
      setAnswer(body.answer);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.aiError);
    } finally { setAiBusy(false); }
  }

  const detected = platformUrl.trim() ? detectPlatform(platformUrl.trim()) : null;
  const severityLabel = (severity: 'info' | 'review' | 'action') => severity === 'action' ? t.action : severity === 'review' ? t.review : t.information;

  return <section className={styles.suite} aria-label={t.aria}>
    <div className={styles.hero}>
      <div><span className={styles.eyebrow}>{section.suiteEyebrow}</span><h2>{t.heroTitle}</h2><p>{t.heroLead}</p></div>
      <span className={styles.badge}>AI · TWIN · RADAR · CONNECT</span>
    </div>

    {loading ? <div className={styles.empty}>{t.loading}</div> : !analysis ? <div className={styles.empty}>{t.noAnalysis}</div> : <div className={styles.grid}>
      <article className={`${styles.card} ${styles.wide}`}>
        <div className={styles.cardHead}><div><h3>ImportVerifier AI</h3><p>{t.aiLead}</p></div><span className={styles.status}>{t.active}</span></div>
        <select className={styles.productSelect} value={selected} onChange={e => { setSelected(Number(e.target.value)); setAnswer(''); }} aria-label={t.productLabel}>
          {analysis.products.map((item, index) => <option value={index} key={`${item.name}-${index}`}>{item.name}</option>)}
        </select>
        <form className={styles.aiForm} onSubmit={askAi}><input className={styles.aiInput} value={question} maxLength={2000} onChange={e => setQuestion(e.target.value)} placeholder={t.questionPlaceholder} /><button className={styles.button} disabled={aiBusy || !question.trim()}>{aiBusy ? t.asking : t.ask}</button></form>
        {answer && <div className={styles.answer}>{answer}</div>}
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.disclaimer}>{t.aiDisclaimer}</div>
      </article>

      <article className={styles.card}>
        <div className={styles.cardHead}><div><h3>{section.twinTitle}</h3><p>{t.twinLead}</p></div><span className={styles.status}>{regulatory ? t.live : t.unclassified}</span></div>
        {regulatory ? <><div className={styles.meterRow}><div className={styles.meter} style={{ '--score': `${readiness}%` } as React.CSSProperties}><div className={styles.meterInner}>{readiness}%</div></div><div className={styles.facts}><div className={styles.fact}><span>{t.category}</span><strong>{regulatory.category}</strong></div><div className={styles.fact}><span>{t.confidence}</span><strong>{regulatory.confidence}</strong></div><div className={styles.fact}><span>{t.evidenceAvailable}</span><strong>{suppliedCount}</strong></div><div className={styles.fact}><span>{t.pendingReview}</span><strong>{missingCount + reviewCount}</strong></div></div></div><ul className={styles.list}>{actions.slice(0, 4).map(action => <li key={action}>{action}</li>)}</ul><div className={styles.disclaimer}>{t.readinessDisclaimer}</div></> : <div className={styles.empty}>{t.noClassification}</div>}
      </article>

      <article className={styles.card}>
        <div className={styles.cardHead}><div><h3>{section.radarTitle}</h3><p>{t.radarLead}</p></div><span className={styles.status}>{radarLive ? t.officialSources : t.radar}</span></div>
        {relevantOfficialEvents.length > 0 ? <ul className={styles.list}>{relevantOfficialEvents.slice(0, 5).map(event => <li className={styles.impact} key={event.id}><span className={styles.dot} /><div><strong>{severityLabel(event.severity)} · {event.title}</strong><br />{event.summary || event.official_reference || event.source_name}<br /><a href={event.source_url} target="_blank" rel="noopener noreferrer">{t.officialSource} ↗</a></div></li>)}</ul> : localImpacts.length ? <><ul className={styles.list}>{localImpacts.map((impact, index) => <li className={styles.impact} key={`${impact.reason}-${index}`}><span className={styles.dot} /><div><strong>{impact.severity === 'action' ? t.action : impact.severity === 'review' ? t.review : t.context}</strong><br />{impact.reason}</div></li>)}</ul><div className={styles.disclaimer}>{radarEvents.length ? t.radarNoMatch : t.radarNoEvents}</div></> : <div className={styles.empty}>{t.radarEmpty}</div>}
      </article>

      <article className={`${styles.card} ${styles.wide}`}>
        <div className={styles.cardHead}><div><h3>{section.connectTitle}</h3><p>{t.connectLead}</p></div><span className={styles.status}>3 {t.connectors}</span></div>
        <div className={styles.platforms}>{PLATFORM_CONNECTORS.map(connector => <div className={styles.platform} key={connector.id}><strong>{connector.name}</strong><small>{connector.capabilities.map(item => platformCapabilityLabel(language, item)).join(' · ')}</small><button type="button" disabled aria-label={`${t.upcomingAuthorize} ${connector.name}`}>{t.upcomingAuthorize} {connector.name}</button></div>)}</div>
        <div className={styles.urlRow}><input value={platformUrl} onChange={e => setPlatformUrl(e.target.value)} placeholder={t.platformPlaceholder} inputMode="url" autoCapitalize="none" autoCorrect="off" /><button className={styles.button} type="button" disabled={!platformUrl.trim()}>{t.detect}</button></div>
        {platformUrl.trim() && <div className={styles.detected}>{detected ? `${t.platformDetected}: ${PLATFORM_CONNECTORS.find(item => item.id === detected)?.name}. ${t.authorizationPending}` : t.unknownPlatform}</div>}
      </article>
    </div>}
  </section>;
}
