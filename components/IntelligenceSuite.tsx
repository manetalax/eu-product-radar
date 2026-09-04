'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Analysis, analyze } from '@/lib/analysis';
import { localizeEuRegulatoryAssessment } from '@/lib/eu-regulatory-i18n';
import { intelligenceCopy } from '@/lib/intelligence-i18n';
import { intelligenceSectionCopy } from '@/lib/intelligence-section-i18n';
import { platformCapabilityLabel } from '@/lib/platform-capability-i18n';
import { PLATFORM_CONNECTORS, detectPlatform } from '@/lib/platform-connectors';
import { relevantRadarChanges } from '@/lib/radar-match';
import { reportLabels } from '@/lib/report-i18n';
import { regulatoryReadiness, type RegulatoryEvidenceLink } from '@/lib/regulatory-twin';
import { useLanguage } from '@/lib/use-language';
import styles from './IntelligenceSuite.module.css';

type HistoryItem = { id: string; filename: string; product_count: number };
type EvidenceRow = { product_index: number; evidence_key: string; status: 'available' | 'pending' | 'not_applicable'; note?: string };
type RadarEvent = { id: string; source_name: string; source_url: string; title: string; summary: string; published_at: string | null; effective_at: string | null; severity: 'info' | 'review' | 'action'; affected_keywords: string[]; official_reference: string; last_seen_at: string };
type JsonObject = Record<string, unknown>;

const PLAN_COPY = {
  es: { aiLocked: 'ImportVerifier AI está incluido desde el plan Anual.', aiUpgrade: 'Anual, Lifetime y Personalizada incluyen IA.', urlHint: 'Pega la URL de tu tienda o catálogo para identificar la plataforma y preparar la conexión/importación.', detect: 'Preparar conexión', ready: 'URL reconocida. La conexión/importación queda preparada para este conector.' },
  en: { aiLocked: 'ImportVerifier AI is included from the Annual plan.', aiUpgrade: 'Annual, Lifetime and Custom include AI.', urlHint: 'Paste your store or catalogue URL to identify the platform and prepare the connection/import.', detect: 'Prepare connection', ready: 'URL recognised. The connection/import is ready for this connector.' },
  fr: { aiLocked: 'ImportVerifier AI est inclus à partir du forfait Annuel.', aiUpgrade: 'Annuel, Lifetime et Personnalisée incluent l’IA.', urlHint: 'Collez l’URL de votre boutique ou catalogue pour identifier la plateforme et préparer la connexion/import.', detect: 'Préparer la connexion', ready: 'URL reconnue. La connexion/import est prête pour ce connecteur.' },
  de: { aiLocked: 'ImportVerifier AI ist ab dem Jahrestarif enthalten.', aiUpgrade: 'Jährlich, Lifetime und Individuell enthalten AI.', urlHint: 'Füge die URL deines Shops oder Katalogs ein, um die Plattform zu erkennen und Verbindung/Import vorzubereiten.', detect: 'Verbindung vorbereiten', ready: 'URL erkannt. Verbindung/Import ist für diesen Connector vorbereitet.' },
  it: { aiLocked: 'ImportVerifier AI è incluso dal piano Annuale.', aiUpgrade: 'Annuale, Lifetime e Personalizzata includono l’IA.', urlHint: 'Incolla l’URL del negozio o catalogo per identificare la piattaforma e preparare connessione/importazione.', detect: 'Prepara connessione', ready: 'URL riconosciuto. Connessione/importazione pronta per questo connettore.' },
  pt: { aiLocked: 'ImportVerifier AI está incluído a partir do plano Anual.', aiUpgrade: 'Anual, Lifetime e Personalizada incluem IA.', urlHint: 'Cole o URL da loja ou catálogo para identificar a plataforma e preparar a ligação/importação.', detect: 'Preparar ligação', ready: 'URL reconhecido. A ligação/importação está preparada para este conector.' },
} as const;

async function jsonObject(response: Response): Promise<JsonObject> {
  try {
    const parsed = await response.json();
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as JsonObject : {};
  } catch { return {}; }
}

export default function IntelligenceSuite() {
  const { language } = useLanguage();
  const t = intelligenceCopy[language];
  const section = intelligenceSectionCopy[language];
  const report = reportLabels[language];
  const planCopy = PLAN_COPY[language];
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [evidenceRows, setEvidenceRows] = useState<EvidenceRow[]>([]);
  const [radarEvents, setRadarEvents] = useState<RadarEvent[]>([]);
  const [radarLive, setRadarLive] = useState(false);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiAccess, setAiAccess] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [aiError, setAiError] = useState('');
  const [platformUrl, setPlatformUrl] = useState('');
  const [connectionPrepared, setConnectionPrepared] = useState(false);

  useEffect(() => { if (!question) setQuestion(t.defaultQuestion); }, [t.defaultQuestion, question]);

  useEffect(() => {
    let cancelled = false;
    async function loadLatest() {
      try {
        const [historyResponse, radarResponse] = await Promise.all([
          fetch('/api/analyses?page=0', { cache: 'no-store' }),
          fetch('/api/regulatory-changes?limit=12', { cache: 'no-store' }),
        ]);
        if (radarResponse.ok) {
          const radarBody = await jsonObject(radarResponse);
          if (!cancelled) { setRadarEvents(Array.isArray(radarBody.events) ? radarBody.events as RadarEvent[] : []); setRadarLive(Boolean(radarBody.live)); }
        }
        if (!historyResponse.ok) throw new Error('history_request_failed');
        const historyBody = await jsonObject(historyResponse);
        const quota = historyBody.quota && typeof historyBody.quota === 'object' ? historyBody.quota as JsonObject : null;
        const billing = quota?.billing && typeof quota.billing === 'object' ? quota.billing as JsonObject : null;
        const option = typeof billing?.billingOption === 'string' ? billing.billingOption : null;
        const permanent = billing?.status === 'lifetime';
        if (!cancelled) setAiAccess(permanent || option === 'annual' || option === 'lifetime' || option === 'custom');
        const analyses = Array.isArray(historyBody.analyses) ? historyBody.analyses as HistoryItem[] : [];
        const latest = analyses[0];
        if (!latest || cancelled || typeof latest.id !== 'string') return;
        const detailResponse = await fetch(`/api/analyses?id=${encodeURIComponent(latest.id)}`, { cache: 'no-store' });
        if (!detailResponse.ok) throw new Error('analysis_request_failed');
        const detailBody = await jsonObject(detailResponse);
        const latestAnalysis = detailBody.analysis as Analysis | undefined;
        if (!latestAnalysis || typeof latestAnalysis !== 'object' || typeof latestAnalysis.id !== 'string' || !Array.isArray(latestAnalysis.products) || cancelled) return;
        setAnalysis(latestAnalysis);
        const evidenceResponse = await fetch(`/api/evidence?analysisId=${encodeURIComponent(latestAnalysis.id)}`, { cache: 'no-store' });
        if (evidenceResponse.ok) {
          const evidenceBody = await jsonObject(evidenceResponse);
          if (!cancelled) setEvidenceRows(Array.isArray(evidenceBody.evidence) ? evidenceBody.evidence as EvidenceRow[] : []);
        }
      } catch { if (!cancelled) setLoadError(t.loadError); }
      finally { if (!cancelled) setLoading(false); }
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
  const localImpacts = useMemo(() => regulatory ? [...regulatory.uncertainties.map(reason => ({ severity: 'review' as const, reason })), ...regulatory.applicableActs.slice(0, 4).map(act => ({ severity: act.applicability === 'baseline' ? 'info' as const : 'action' as const, reason: `${act.reference}: ${act.reason}` }))].slice(0, 6) : [], [regulatory]);

  async function askAi(event: FormEvent) {
    event.preventDefault();
    if (!aiAccess) { setAiError(planCopy.aiLocked); return; }
    if (!analysis || !product || !result || !question.trim() || aiBusy) return;
    setAiBusy(true); setAnswer(''); setAiError('');
    try {
      const response = await fetch('/api/regulatory-agent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: question.trim(), analysisId: analysis.id, productIndex: selected, language }) });
      const body = await jsonObject(response);
      if (!response.ok || typeof body.answer !== 'string' || !body.answer.trim()) throw new Error(t.aiError);
      setAnswer(body.answer);
    } catch {
      setAiError(t.aiError);
    }
    finally { setAiBusy(false); }
  }

  const detected = platformUrl.trim() ? detectPlatform(platformUrl.trim()) : null;
  const severityLabel = (severity: 'info' | 'review' | 'action') => severity === 'action' ? t.action : severity === 'review' ? t.review : t.information;
  const confidenceLabel = (confidence: 'high' | 'medium' | 'low') => confidence === 'high' ? report.confidenceHigh : confidence === 'medium' ? report.confidenceMedium : report.confidenceLow;

  return <section className={styles.suite} aria-label={t.aria} aria-busy={loading}>
    <div className={styles.hero}><div><span className={styles.eyebrow}>{section.suiteEyebrow}</span><h2>{t.heroTitle}</h2><p>{t.heroLead}</p></div><span className={styles.badge}>AI · TWIN · RADAR · CONNECT</span></div>
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{loading ? t.loading : ''}</p>
    {loadError && <div className={styles.error} role="alert">{loadError}</div>}
    {loading ? <div className={styles.empty}>{t.loading}</div> : loadError ? null : !analysis ? <div className={styles.empty}>{t.noAnalysis}</div> : <div className={styles.grid}>
      <article className={`${styles.card} ${styles.wide}`} aria-busy={aiBusy}>
        <div className={styles.cardHead}><div><h3>ImportVerifier AI</h3><p>{aiAccess ? t.aiLead : planCopy.aiUpgrade}</p></div><span className={styles.status}>{aiAccess ? t.active : 'ANUAL+'}</span></div>
        <select className={styles.productSelect} value={selected} disabled={aiBusy || !aiAccess} onChange={e => { setSelected(Number(e.target.value)); setAnswer(''); }} aria-label={t.productLabel}>{analysis.products.map((item, index) => <option value={index} key={`${item.name}-${index}`}>{item.name}</option>)}</select>
        <form className={styles.aiForm} onSubmit={askAi}><input className={styles.aiInput} value={question} disabled={aiBusy || !aiAccess} maxLength={2000} onChange={e => setQuestion(e.target.value)} placeholder={aiAccess ? t.questionPlaceholder : planCopy.aiLocked} /><button className={styles.button} disabled={aiBusy || !question.trim() || !aiAccess}>{aiBusy ? t.asking : t.ask}</button></form>
        {!aiAccess && <div className={styles.disclaimer}>{planCopy.aiLocked}</div>}
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{aiBusy ? t.asking : answer}</p>
        {answer && <div className={styles.answer}>{answer}</div>}{aiError && <div className={styles.error} role="alert">{aiError}</div>}{aiAccess && <div className={styles.disclaimer}>{t.aiDisclaimer}</div>}
      </article>

      <article className={styles.card}><div className={styles.cardHead}><div><h3>{section.twinTitle}</h3><p>{t.twinLead}</p></div><span className={styles.status}>{regulatory ? t.live : t.unclassified}</span></div>{regulatory ? <><div className={styles.meterRow}><div className={styles.meter} style={{ '--score': `${readiness}%` } as React.CSSProperties}><div className={styles.meterInner}>{readiness}%</div></div><div className={styles.facts}><div className={styles.fact}><span>{t.category}</span><strong>{regulatory.category}</strong></div><div className={styles.fact}><span>{t.confidence}</span><strong>{confidenceLabel(regulatory.confidence)}</strong></div><div className={styles.fact}><span>{t.evidenceAvailable}</span><strong>{suppliedCount}</strong></div><div className={styles.fact}><span>{t.pendingReview}</span><strong>{missingCount + reviewCount}</strong></div></div></div><ul className={styles.list}>{actions.slice(0, 4).map(action => <li key={action}>{action}</li>)}</ul><div className={styles.disclaimer}>{t.readinessDisclaimer}</div></> : <div className={styles.empty}>{t.noClassification}</div>}</article>

      <article className={styles.card}><div className={styles.cardHead}><div><h3>{section.radarTitle}</h3><p>{t.radarLead}</p></div><span className={styles.status}>{radarLive ? t.officialSources : t.radar}</span></div>{relevantOfficialEvents.length > 0 ? <ul className={styles.list}>{relevantOfficialEvents.slice(0, 5).map(event => <li className={styles.impact} key={event.id}><span className={styles.dot} /><div><strong>{severityLabel(event.severity)} · {event.title}</strong><br />{event.summary || event.official_reference || event.source_name}{event.source_url ? <><br /><a href={event.source_url} target="_blank" rel="noopener noreferrer">{t.officialSource} ↗</a></> : null}</div></li>)}</ul> : localImpacts.length ? <><ul className={styles.list}>{localImpacts.map((impact, index) => <li className={styles.impact} key={`${impact.reason}-${index}`}><span className={styles.dot} /><div><strong>{impact.severity === 'action' ? t.action : impact.severity === 'review' ? t.review : t.context}</strong><br />{impact.reason}</div></li>)}</ul><div className={styles.disclaimer}>{radarEvents.length ? t.radarNoMatch : t.radarNoEvents}</div></> : <div className={styles.empty}>{t.radarEmpty}</div>}</article>

      <article className={`${styles.card} ${styles.wide}`}>
        <div className={styles.cardHead}><div><h3>{section.connectTitle}</h3><p>{planCopy.urlHint}</p></div><span className={styles.status}>URL · {PLATFORM_CONNECTORS.length} {t.connectors}</span></div>
        <div className={styles.platforms}>{PLATFORM_CONNECTORS.map(connector => <div className={styles.platform} key={connector.id}><strong>{connector.name}</strong><small>{connector.capabilities.map(item => platformCapabilityLabel(language, item)).join(' · ')}</small><button type="button" disabled aria-label={`${t.upcomingAuthorize} ${connector.name}`}>{t.upcomingAuthorize} {connector.name}</button></div>)}</div>
        <div className={styles.urlRow}><input value={platformUrl} onChange={e => { setPlatformUrl(e.target.value); setConnectionPrepared(false); }} placeholder={t.platformPlaceholder} inputMode="url" autoCapitalize="none" autoCorrect="off" /><button className={styles.button} type="button" disabled={!platformUrl.trim() || !detected} onClick={() => setConnectionPrepared(true)}>{planCopy.detect}</button></div>
        {platformUrl.trim() && <div className={styles.detected}>{detected ? `${t.platformDetected}: ${PLATFORM_CONNECTORS.find(item => item.id === detected)?.name}. ${connectionPrepared ? planCopy.ready : t.authorizationPending}` : t.unknownPlatform}</div>}
      </article>
    </div>}
  </section>;
}
