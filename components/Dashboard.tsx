'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Brand from '@/components/Brand';
import BrandLogos from '@/components/BrandLogos';
import TrustMark from '@/components/TrustMark';
import { AccountDeletionErrorCode, DELETE_ACCOUNT_CONFIRMATION } from '@/lib/account';
import { accountCopy } from '@/lib/account-i18n';
import { Analysis, AnalysisSummary, analysisMarket, analyze, MAX_FILE_BYTES, supportsRuleVersion } from '@/lib/analysis';
import type { UnlimitedBillingOption } from '@/lib/billing';
import { analysisFromUnknown, analysisSummariesFromUnknown, productQuotaFromUnknown, productsFromUnknown } from '@/lib/dashboard-api-shapes';
import { dashboardText, type DashboardCopyKey } from '@/lib/dashboard-copy-v2';
import { documentationFor } from '@/lib/documentation';
import { guideScopeFor } from '@/lib/guide-i18n';
import { formatPrice, landingCopy, localeFor } from '@/lib/landing-i18n';
import { isActiveMarketCode, MarketCode, MARKETS, MARKETS_BY_RANK } from '@/lib/markets';
import { UNLIMITED_PUBLIC_OFFERS } from '@/lib/plans';
import { ProductQuota } from '@/lib/quota';
import { reportLabels } from '@/lib/report-i18n';
import { authService } from '@/lib/services/auth-client';
import { clearPlanIntent, readPlanIntent } from '@/lib/services/plan-interest';
import { trustedStripeNavigationUrl } from '@/lib/stripe-navigation';
import { uploadCopy } from '@/lib/upload-i18n';
import { useLanguage } from '@/lib/use-language';

type Tab = 'dashboard' | 'products' | 'history' | 'reports' | 'settings';

const BILLING_CHOICE_COPY = {
  es: { monthly: 'Mensual', annual: 'Anual', lifetime: 'Lifetime', month: 'al mes', year: 'al año', oneTime: 'pago único', recommended: 'Mejor valor', choose: 'Elegir', lifetimeActive: 'Pago único confirmado. No hay renovación ni suscripción que gestionar.' },
  en: { monthly: 'Monthly', annual: 'Annual', lifetime: 'Lifetime', month: 'per month', year: 'per year', oneTime: 'one-time payment', recommended: 'Best value', choose: 'Choose', lifetimeActive: 'One-time payment confirmed. There is no renewal or subscription to manage.' },
  fr: { monthly: 'Mensuel', annual: 'Annuel', lifetime: 'Lifetime', month: 'par mois', year: 'par an', oneTime: 'paiement unique', recommended: 'Meilleur choix', choose: 'Choisir', lifetimeActive: 'Paiement unique confirmé. Aucun renouvellement ni abonnement à gérer.' },
  de: { monthly: 'Monatlich', annual: 'Jährlich', lifetime: 'Lifetime', month: 'pro Monat', year: 'pro Jahr', oneTime: 'Einmalzahlung', recommended: 'Bester Wert', choose: 'Wählen', lifetimeActive: 'Einmalzahlung bestätigt. Keine Verlängerung und kein Abonnement zu verwalten.' },
  it: { monthly: 'Mensile', annual: 'Annuale', lifetime: 'Lifetime', month: 'al mese', year: 'all’anno', oneTime: 'pagamento unico', recommended: 'Miglior valore', choose: 'Scegli', lifetimeActive: 'Pagamento unico confermato. Non ci sono rinnovi né abbonamenti da gestire.' },
  pt: { monthly: 'Mensal', annual: 'Anual', lifetime: 'Lifetime', month: 'por mês', year: 'por ano', oneTime: 'pagamento único', recommended: 'Melhor valor', choose: 'Escolher', lifetimeActive: 'Pagamento único confirmado. Não existe renovação nem subscrição para gerir.' },
} as const;

export default function Dashboard({ email }: { email: string }) {
  const { language } = useLanguage();
  const accountT = accountCopy[language];
  const reportT = reportLabels[language];
  const trustT = landingCopy[language].trust;
  const uploadT = uploadCopy[language];
  const billingChoiceT = BILLING_CHOICE_COPY[language];
  const d = (key: DashboardCopyKey, values: Record<string, string | number> = {}) => dashboardText(language, key, values);
  const tabs: [Tab, string, string][] = [
    ['dashboard', d('tabDashboard'), d('tabDashboardDesc')],
    ['products', d('tabProducts'), d('tabProductsDesc')],
    ['history', d('tabHistory'), d('tabHistoryDesc')],
    ['reports', d('tabReports'), d('tabReportsDesc')],
    ['settings', d('tabSettings'), d('tabSettingsDesc')],
  ];
  const when = (value: string) => new Date(value).toLocaleString(localeFor(language), { dateStyle: 'medium', timeStyle: 'short' });
  const marketName = (code: MarketCode) => landingCopy[language].markets.cards[code].name;

  const [tab, setTab] = useState<Tab>('dashboard');
  const [selectedMarket, setSelectedMarket] = useState<MarketCode>('EU');
  const [current, setCurrent] = useState<Analysis | null>(null);
  const [history, setHistory] = useState<AnalysisSummary[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [templateReady, setTemplateReady] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [quota, setQuota] = useState<ProductQuota | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const deleteAccountOpener = useRef<HTMLButtonElement>(null);
  const deleteEmailInput = useRef<HTMLInputElement>(null);
  const pendingImport = useRef<{ fingerprint: string; id: string } | null>(null);
  const planIntentHandled = useRef(false);

  const currentMarketCode = current ? analysisMarket(current) : selectedMarket;
  const currentMarket = MARKETS[currentMarketCode];
  const results = useMemo(() => current ? analyze(current.products, analysisMarket(current)) : [], [current]);
  const avg = results.length ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length) : 0;
  const highCount = results.filter(result => result.priority === 'ALTA').length;
  const unlimited = quota?.billing.planId === 'starter';
  const billingOption = quota?.billing.billingOption;
  const lifetimeUnlimited = unlimited && billingOption === 'lifetime';
  const recurringUnlimited = unlimited && (billingOption === 'monthly' || billingOption === 'annual');
  const free = quota?.billing.planId === 'free';
  const quotaBlocked = free && quota?.remaining === 0;
  const quotaPercent = free && quota ? Math.min(100, Math.round((quota.used / quota.limit) * 100)) : 0;
  const firstName = email.split('@')[0].replace(/[._-]+/g, ' ');
  const operatorDisplay = current?.products[0]
    ? documentationFor(current.products[0], currentMarketCode, language)[1]?.title ?? currentMarket.operatorFieldLabel
    : currentMarket.operatorFieldLabel;
  const canDeleteAccount = deleteEmail.trim().toLocaleLowerCase('en-US') === email.trim().toLocaleLowerCase('en-US')
    && deleteConfirmation === DELETE_ACCOUNT_CONFIRMATION;

  const priorityLabel = (priority: 'ALTA' | 'MEDIA' | 'BAJA') => priority === 'ALTA' ? reportT.high : priority === 'MEDIA' ? reportT.medium : reportT.low;
  const missingLabel = (value: string) => value === 'Fabricante'
    ? reportT.manufacturer
    : value === 'Seguridad/advertencias'
      ? reportT.warnings
      : value === currentMarket.operatorFieldLabel ? operatorDisplay : value;
  const billingChoiceLabel = (option: UnlimitedBillingOption) => billingChoiceT[option];
  const billingCadenceLabel = (option: UnlimitedBillingOption) => option === 'monthly' ? billingChoiceT.month : option === 'annual' ? billingChoiceT.year : billingChoiceT.oneTime;

  async function api(url: string, options?: RequestInit) {
    const response = await fetch(url, { ...options, cache: 'no-store' });
    let body: Record<string, unknown> = {};
    let validJson = false;
    try {
      const parsed = await response.json();
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        body = parsed as Record<string, unknown>;
        validJson = true;
      }
    } catch {
      // Provider/proxy parser details must never leak into customer-facing UI.
    }
    if (response.status === 401) window.location.replace(`/login?lang=${language}`);
    const responseQuota = productQuotaFromUnknown(body.quota);
    if (responseQuota) setQuota(responseQuota);
    if (!response.ok || !validJson) {
      const apiError = new Error(d('importError')) as Error & { code?: AccountDeletionErrorCode };
      if (typeof body.errorCode === 'string') apiError.code = body.errorCode as AccountDeletionErrorCode;
      throw apiError;
    }
    return body;
  }

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    api(`/api/analyses?page=${page}`, { signal: controller.signal }).then(body => {
      if (!controller.signal.aborted) {
        const analyses = analysisSummariesFromUnknown(body.analyses);
        const responseQuota = productQuotaFromUnknown(body.quota);
        if (!analyses || typeof body.hasMore !== 'boolean' || !responseQuota) throw new Error(d('historyError'));
        setHistory(analyses);
        setHasMore(body.hasMore);
        setQuota(responseQuota);
      }
    }).catch(() => {
      if (!controller.signal.aborted) setError(d('historyError'));
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [page, language]);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(event => {
      if (event === 'SIGNED_OUT') window.location.replace(`/login?lang=${language}`);
    });
    const refresh = (event: PageTransitionEvent) => { if (event.persisted) window.location.reload(); };
    window.addEventListener('pageshow', refresh);
    return () => {
      unsubscribe();
      window.removeEventListener('pageshow', refresh);
    };
  }, [language]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get('checkout');
    const synced = params.get('synced') === '1';
    if (checkout === 'success' && synced) setNotice(d('checkoutSuccess'));
    if (checkout === 'cancelled') setNotice(d('checkoutCancelled'));
  }, [language]);

  useEffect(() => {
    if (!quota || planIntentHandled.current) return;
    const intent = readPlanIntent();
    planIntentHandled.current = true;
    if (!intent) return;
    if (quota.billing.planId === 'starter') {
      clearPlanIntent();
      return;
    }
    void startCheckout(intent.billingOption);
  }, [quota?.billing.planId]);

  useEffect(() => {
    if (!deleteAccountOpen) return;
    const frame = window.requestAnimationFrame(() => deleteEmailInput.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [deleteAccountOpen]);

  async function load(file: File) {
    if (busy) return;
    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (!isActiveMarketCode(selectedMarket)) throw new Error(d('unsupportedMarket'));
      if (file.size > MAX_FILE_BYTES) throw new Error(d('fileTooLarge'));
      if (file.name.length > 120) throw new Error(d('fileNameTooLong'));
      const bytes = await file.arrayBuffer();
      let products;
      if (/\.(csv|xls|xlsx)$/i.test(file.name)) {
        products = (await import('@/lib/import-products')).parseProducts(bytes, file.name);
      } else {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error(d('fileReadError')));
          reader.onerror = () => reject(new Error(d('fileReadError')));
          reader.readAsDataURL(file);
        });
        const extracted = await api('/api/product-extraction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, mimeType: file.type || 'application/octet-stream', dataUrl }),
        });
        const extractedProducts = productsFromUnknown(extracted.products);
        if (!extractedProducts) throw new Error(d('importError'));
        products = extractedProducts;
      }
      const hash = await crypto.subtle.digest('SHA-256', bytes);
      const fingerprint = `${selectedMarket}:${file.name}:` + Array.from(new Uint8Array(hash)).map(byte => byte.toString(16).padStart(2, '0')).join('');
      const previous = pendingImport.current;
      const requestId = previous?.fingerprint === fingerprint ? previous.id : crypto.randomUUID();
      pendingImport.current = { fingerprint, id: requestId };
      const { analysis, quota: updatedQuota } = await api('/api/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, products, requestId, marketCode: selectedMarket }),
      });
      const typedAnalysis = analysisFromUnknown(analysis);
      const typedQuota = productQuotaFromUnknown(updatedQuota);
      if (!typedAnalysis || !typedQuota) throw new Error(d('importError'));
      setQuota(typedQuota);
      setCurrent(typedAnalysis);
      setTab('products');
      setNotice(d('analysisSaved', { market: marketName(selectedMarket) }));
      pendingImport.current = null;
      setHistory(items => [{
        id: typedAnalysis.id,
        filename: typedAnalysis.filename,
        created_at: typedAnalysis.created_at,
        rule_version: typedAnalysis.rule_version,
        market_code: typedAnalysis.market_code,
        product_count: typedAnalysis.products.length,
      }, ...items.filter(item => item.id !== typedAnalysis.id)].slice(0, 20));
      if (page !== 0) setPage(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : d('importError'));
    } finally {
      setBusy(false);
      setDragging(false);
      if (input.current) input.current.value = '';
      if (cameraInput.current) cameraInput.current.value = '';
    }
  }

  async function open(id: string) {
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const { analysis } = await api(`/api/analyses?id=${encodeURIComponent(id)}`);
      const typedAnalysis = analysisFromUnknown(analysis);
      if (!typedAnalysis) throw new Error(d('openError'));
      if (!supportsRuleVersion(typedAnalysis.rule_version)) throw new Error(d('unsupportedVersion'));
      setCurrent(typedAnalysis);
      setSelectedMarket(analysisMarket(typedAnalysis));
      setTab('products');
    } catch {
      setError(d('openError'));
    } finally {
      setBusy(false);
    }
  }

  async function exportReport(format: 'xlsx' | 'pdf' = 'xlsx') {
    if (!current || busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const bytes = format === 'pdf'
        ? await (await import('@/lib/export-pdf')).pdfBytes(current, language)
        : await (await import('@/lib/export-report')).reportBytes(current, language);
      const url = URL.createObjectURL(new Blob([bytes], { type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `importverifier-${analysisMarket(current).toLowerCase()}-${current.created_at.slice(0, 10)}-${current.id.slice(0, 8)}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
      setReportReady(true);
      setNotice(format === 'pdf' ? d('reportPdfReady') : d('reportExcelReady'));
    } catch {
      setError(d('reportError'));
    } finally {
      setBusy(false);
    }
  }

  function downloadTemplate() {
    const samples = {
      es: 'Producto de ejemplo,Fabricante SL,Importador Europa SL,Advertencia del modelo',
      en: 'Example product,Example Manufacturer Ltd,EU Importer Ltd,Model warning',
      fr: 'Produit exemple,Fabricant Exemple SAS,Importateur UE SAS,Avertissement du modèle',
      de: 'Beispielprodukt,Beispiel Hersteller GmbH,EU Importeur GmbH,Modellwarnung',
      it: 'Prodotto di esempio,Produttore Esempio SRL,Importatore UE SRL,Avvertenza del modello',
      pt: 'Produto de exemplo,Fabricante Exemplo Lda,Importador UE Lda,Aviso do modelo',
    } as const;
    const csv = `\uFEFFname,manufacturer,eu_operator,warning\n${samples[language]}\n`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `importverifier-eu-template-${language}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    setTemplateReady(true);
    setNotice(d('templateDownloaded'));
  }

  async function startCheckout(option: UnlimitedBillingOption = 'monthly') {
    if (unlimited) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const { url } = await api('/api/billing/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ purchaseId: 'starter', billingOption: option }) });
      const trustedUrl = trustedStripeNavigationUrl(url, 'checkout');
      if (!trustedUrl) throw new Error(d('paymentError'));
      clearPlanIntent();
      window.location.assign(trustedUrl);
    } catch {
      setError(d('paymentError'));
      setBusy(false);
    }
  }

  async function manageSubscription() {
    if (!recurringUnlimited) return;
    setBusy(true);
    setError('');
    try {
      const { url } = await api('/api/billing/portal', { method: 'POST' });
      const trustedUrl = trustedStripeNavigationUrl(url, 'portal');
      if (!trustedUrl) throw new Error(d('portalError'));
      window.location.assign(trustedUrl);
    } catch {
      setError(d('portalError'));
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    setError('');
    try {
      const { error: signOutError } = await authService.signOut();
      if (signOutError) throw signOutError;
      window.location.replace(`/login?lang=${language}`);
    } catch {
      setError(d('signOutError'));
      setBusy(false);
    }
  }

  function closeDeleteAccount() {
    setDeleteAccountOpen(false);
    setDeleteEmail('');
    setDeleteConfirmation('');
    window.requestAnimationFrame(() => deleteAccountOpener.current?.focus());
  }

  async function deleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!canDeleteAccount) {
      const emailMatches = deleteEmail.trim().toLocaleLowerCase('en-US') === email.trim().toLocaleLowerCase('en-US');
      setError(emailMatches ? accountT.errors.confirmation_mismatch : accountT.errors.email_mismatch);
      return;
    }
    setBusy(true);
    try {
      await api('/api/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: deleteEmail.trim(), confirmation: deleteConfirmation }),
      });
      window.location.replace(`/login?message=account_deleted&lang=${language}`);
    } catch (deletionError) {
      const code = deletionError instanceof Error ? (deletionError as Error & { code?: AccountDeletionErrorCode }).code : undefined;
      setError(code ? accountT.errors[code] : accountT.errors.delete_failed);
      setBusy(false);
    }
  }

  return <main className="shell app-shell">
    <header className="toprow account-header app-header">
      <Brand market={current ? currentMarketCode : undefined} />
      <div className="header-actions"><span className="privacy-badge">{d('privateSession')}</span><button className="btn ghost" disabled={busy} onClick={signOut}>{d('signOut')}</button></div>
    </header>

    <div className="dashboard premium-dashboard">
      <aside className="side premium-side">
        <div className="side-intro"><span className="side-kicker">{d('workspace')}</span><h2>{firstName || d('yourAccount')}</h2><p className="account-email">{email}</p></div>
        <nav aria-label={d('sections')} className="side-nav">
          {tabs.map(([id, label, description]) => <button key={id} aria-current={tab === id ? 'page' : undefined} className={tab === id ? 'active' : ''} onClick={() => { setTab(id); setNotice(''); }}><strong>{label}</strong><span>{description}</span></button>)}
        </nav>
        <div className="side-quota">
          <div className="toprow"><span>{d('plan')} {unlimited ? 'Unlimited' : d('free')}</span><strong>{unlimited ? d('unlimited') : quota ? d('remaining', { n: quota.remaining }) : '—'}</strong></div>
          {!unlimited && <><div className="quota-track" aria-label={d('freeUsage')}><span style={{ width: `${quotaPercent}%` }} /></div><small>{quota ? d('used', { used: quota.used, limit: quota.limit }) : d('calculating')}</small></>}
          {!unlimited && <button className="side-upgrade" onClick={() => setTab('settings')}>{d('viewUnlimited')}</button>}
        </div>
      </aside>

      <section className="workspace" aria-busy={busy}>
        <div className="workspace-heading">
          <div><span className="eyebrow">{tabs.find(([id]) => id === tab)?.[1]}</span><h1>{tab === 'dashboard' ? d('hello', { name: firstName || d('welcome') }) : tabs.find(([id]) => id === tab)?.[1]}</h1></div>
          {tab !== 'settings' && <button className="btn primary compact-cta" disabled={busy || loading || quotaBlocked} onClick={() => input.current?.click()}>{quotaBlocked ? d('freeUsed') : d('newAnalysis')}</button>}
        </div>
        <p className="workspace-subtitle">{tab === 'dashboard' ? d('dashboardSubtitle') : tabs.find(([id]) => id === tab)?.[2]}</p>

        <div className="market-rail" aria-label={d('marketCoverage')}>
          {MARKETS_BY_RANK.map(market => {
            const active = isActiveMarketCode(market.code);
            return <button key={market.code} type="button" className={`${selectedMarket === market.code ? 'selected' : ''} ${active ? '' : 'upcoming'}`} disabled={!active} onClick={() => setSelectedMarket(market.code)} aria-label={`${marketName(market.code)}: ${active ? d('available') : d('preparing')}`}>
              <span className="market-flag" aria-hidden="true">{market.flag}</span><span><strong>{market.code}</strong><small>{active ? d('available') : d('upcoming')}</small></span>
            </button>;
          })}
        </div>

        <div className="notice trust-notice"><strong>{d('euActiveTitle')}</strong> {d('euActiveBody')} <span>{d('euDisclaimer')}</span></div>
        {error && <p role="alert" className="message error">{error}</p>}
        {notice && <p role="status" className="message success">{notice}</p>}
        <input ref={input} className="file-input" aria-label={d('importAria')} type="file" accept=".csv,.xls,.xlsx,.pdf,.doc,.docx,.rtf,.odt,.txt,.md,.json,.png,.jpg,.jpeg,.webp,.heic,.heif,image/*" disabled={busy || loading || quotaBlocked} onChange={event => { const file = event.target.files?.[0]; if (file) void load(file); }} />
        <input ref={cameraInput} className="file-input" aria-label={uploadT.cameraAria} type="file" accept="image/*" capture="environment" disabled={busy || loading || quotaBlocked} onChange={event => { const file = event.target.files?.[0]; if (file) void load(file); }} />

        {(tab === 'dashboard' || tab === 'products') && <div className="card import-card premium-import" onDragEnter={event => { event.preventDefault(); if (!busy && !loading && !quotaBlocked) setDragging(true); }} onDragOver={event => event.preventDefault()} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false); }} onDrop={event => { event.preventDefault(); setDragging(false); if (busy || loading || quotaBlocked) return; const files = event.dataTransfer.files; if (files.length > 1) { setNotice(''); setError(uploadT.singleFileOnly); return; } const file = files.item(0); if (file) void load(file); }} data-dragging={dragging} aria-disabled={busy || loading || quotaBlocked}>
          <div className="import-icon" aria-hidden="true">↑</div>
          <div className="import-copy"><div className="import-title-row"><h2>{quotaBlocked ? d('quotaTitle') : d('analyzeFor', { market: marketName(selectedMarket) })}</h2><span className="market-live">{d('active')}</span></div><p>{d('importBody')}</p><div className="format-chips"><span>{d('photo')}</span><span>PDF/WORD</span><span>{d('text')}</span><span>CSV/EXCEL</span><span>{d('max5mb')}</span></div></div>
          <div className="import-actions"><button className="btn primary import-cta" disabled={busy || loading || quotaBlocked} onClick={() => input.current?.click()}>{busy ? d('analyzing') : quotaBlocked ? d('upgrade') : d('chooseFile')}</button><button className="btn ghost camera-cta" disabled={busy || loading || quotaBlocked} onClick={() => cameraInput.current?.click()}>{uploadT.takePhoto}</button><button className="text-button template-link" onClick={downloadTemplate}>{d('downloadTemplate')}</button></div>
          <div className="quota-inline"><span>{unlimited ? d('unlimitedUsage') : quota ? d('freeAvailable', { remaining: quota.remaining, limit: quota.limit }) : d('calculatingTrial')}</span>{!unlimited && <div className="quota-track"><span style={{ width: `${quotaPercent}%` }} /></div>}</div>
        </div>}
        {(tab === 'dashboard' || tab === 'products') && <BrandLogos group="commerce" label={d('commerceLabel')} note={d('commerceNote')} compact />}

        {tab === 'dashboard' && <>
          <div className="onboarding-card card"><div><span className="eyebrow">{d('onboarding')}</span><h2>{d('firstReview')}</h2></div><ol><li className="done"><span>1</span><div><strong>{d('market')}</strong><small>{d('europeSelected')}</small></div></li><li className={templateReady ? 'done' : ''}><span>2</span><div><strong>{d('template')}</strong><small>{templateReady ? d('downloaded') : d('readyDownload')}</small></div></li><li className={current ? 'done' : ''}><span>3</span><div><strong>{d('analysis')}</strong><small>{current ? d('catalogueSaved') : d('uploadCatalogue')}</small></div></li><li className={reportReady ? 'done' : ''}><span>4</span><div><strong>{d('report')}</strong><small>{reportReady ? d('exported') : 'Excel / PDF'}</small></div></li></ol></div>
          <div className="section-heading"><div><span className="eyebrow">{d('overview')}</span><h2>{current ? d('selectedAnalysis') : d('panelReady')}</h2></div>{current && <button className="text-button" onClick={() => setTab('products')}>{d('viewProducts')}</button>}</div>
          <div className="kpis premium-kpis">
            <div className="kpi"><span>{d('products')}</span><strong>{results.length || '—'}</strong><small>{current ? d('inOpenAnalysis') : d('noAnalysisSelected')}</small></div>
            <div className="kpi"><span>{d('averageIndicator')}</span><strong>{current ? avg : '—'}</strong><small>{current ? d('incomplete100') : d('afterAnalysis')}</small></div>
            <div className="kpi"><span>{d('highPriority')}</span><strong>{current ? highCount : '—'}</strong><small>{current ? d('reviewFirst') : d('noData')}</small></div>
            <div className="kpi"><span>{d('market')}</span><strong className="market-kpi">{current ? currentMarket.flag : '🇪🇺'}</strong><small>{current ? marketName(currentMarketCode) : d('europeAvailable')}</small></div>
          </div>
          {!current ? <div className="card empty-state"><div className="empty-mark">◎</div><h3>{d('smallCatalogueTitle')}</h3><p>{d('smallCatalogueBody')}</p><button className="btn primary" disabled={busy || loading || quotaBlocked} onClick={() => input.current?.click()}>{d('firstCatalogue')}</button><button className="text-button" onClick={downloadTemplate}>{d('preferTemplate')}</button></div> : <div className="card selected-analysis"><div><span className="eyebrow">{d('selected')} · {currentMarketCode}</span><h3>{current.filename}</h3><p className="muted">{when(current.created_at)} · {results.length} {d('productWord')}</p></div><div className="selected-actions"><button className="btn ghost" onClick={() => setTab('products')}>{d('viewResults')}</button><button className="btn ghost" disabled={busy} onClick={() => exportReport('pdf')}>PDF</button></div></div>}
        </>}

        {tab === 'products' && <div className="card content-card">
          <div className="toprow"><div><span className="eyebrow">{d('results')} · {currentMarketCode}</span><h2>{current?.filename ?? d('noAnalysisSelected')}</h2>{current && <p className="muted">{d('saved')} {when(current.created_at)} · {d('rules')} {current.rule_version}</p>}</div>{current && <div className="report-actions"><button className="btn ghost" disabled={busy} onClick={() => exportReport()}>Excel</button><button className="btn primary" disabled={busy} onClick={() => exportReport('pdf')}>PDF</button></div>}</div>
          {current ? <div className="results"><table><caption>{d('resultsCaption')}</caption><thead><tr><th>{d('product')}</th><th>{d('indicator')}</th><th>{d('priority')}</th><th>{d('fieldsReview')}</th></tr></thead><tbody>{results.map((result, index) => <tr key={index}><td><strong>{result.name}</strong></td><td>{result.score}/100</td><td><span className={`pill ${result.priority === 'ALTA' ? 'high' : result.priority === 'MEDIA' ? 'medium' : 'low'}`}>{priorityLabel(result.priority)}</span></td><td>{result.missing.map(missingLabel).join(', ') || d('noBasicMissing')}</td></tr>)}</tbody></table></div> : <div className="empty-state compact"><div className="empty-mark">↗</div><h3>{d('noOpenAnalysis')}</h3><p>{d('noOpenAnalysisBody')}</p><button className="btn primary" onClick={() => input.current?.click()}>{d('importCatalogue')}</button></div>}
        </div>}

        {tab === 'history' && <div className="card content-card"><div className="section-heading"><div><span className="eyebrow">{d('archive')}</span><h2>{d('analysisHistory')}</h2></div><span className="muted">{d('page', { n: page + 1 })}</span></div>{loading ? <div className="empty-state compact"><p role="status">{d('loadingHistory')}</p></div> : history.length ? <ul className="history-list premium-history">{history.map(item => { const marketCode = analysisMarket(item); const market = MARKETS[marketCode]; return <li key={item.id}><div className="history-file"><span className="file-mark">{market.flag}</span><div><strong>{item.filename}</strong><p>{when(item.created_at)} · {item.product_count} {d('productWord')} · {marketCode}</p></div></div><button className="btn ghost" disabled={busy} onClick={() => open(item.id)}>{d('open')}</button></li>; })}</ul> : <div className="empty-state"><div className="empty-mark">□</div><h3>{d('historyEmptyTitle')}</h3><p>{d('historyEmptyBody')}</p><button className="btn primary" disabled={quotaBlocked} onClick={() => input.current?.click()}>{d('createFirst')}</button></div>}<div className="history-pagination"><button className="btn ghost" disabled={page === 0 || loading || busy} onClick={() => setPage(value => value - 1)}>{d('previous')}</button><button className="btn ghost" disabled={!hasMore || loading || busy} onClick={() => setPage(value => value + 1)}>{d('next')}</button></div></div>}

        {tab === 'reports' && <><div className="card content-card"><span className="eyebrow">{d('export')} · {currentMarketCode}</span><h2>{d('reportsReady')}</h2><p className="muted">{current ? d('workingWith', { file: current.filename }) : d('openFromHistory')}</p><div className="report-grid"><button className="report-option" disabled={!current || busy} onClick={() => exportReport()}><strong>{d('detailedExcel')}</strong><span>{d('excelBody')}</span><b>{d('downloadXlsx')}</b></button><button className="report-option" disabled={!current || busy} onClick={() => exportReport('pdf')}><strong>{d('executivePdf')}</strong><span>{d('pdfBody')}</span><b>{d('downloadPdf')}</b></button></div></div>{current && <div className="card content-card documentation-card"><span className="eyebrow">{d('documentaryGuide')} · {marketName(currentMarketCode)}</span><h2>{d('whatToRequest')}</h2><p className="muted">{guideScopeFor(language)}</p>{current.products.map((product, index) => <details key={index}><summary>{product.name}</summary><div className="documentation-body">{documentationFor(product, currentMarketCode, language).map(action => <section key={action.title}><h3>{action.title}</h3><p><strong>{action.status}</strong> · {action.condition}</p><p><strong>{d('whereGet')}</strong> {action.obtain}</p><p><strong>{d('whatCheck')}</strong> {action.check}</p><a href={action.source} target="_blank" rel="noopener noreferrer">{d('officialSource')}</a></section>)}</div></details>)}</div>}</>}

        {tab === 'settings' && <div className="settings-grid">
          <div className="card content-card"><span className="eyebrow">{d('accountHeading')}</span><h2>{d('profile')}</h2><p className="account-email settings-email">{email}</p><Link className="btn ghost" href={`/reset-password?lang=${language}`}>{d('changePassword')}</Link></div>
          <div className="card content-card"><span className="eyebrow">{d('currentPlan')}</span><h2>{lifetimeUnlimited ? 'Unlimited · Lifetime' : unlimited ? 'Unlimited' : d('free')}</h2>{unlimited ? <><div className="settings-quota"><strong>∞</strong><span>{d('productWord')}</span></div><p className="muted">{d('unlimitedTechnical')}</p>{recurringUnlimited && <button className="btn ghost" disabled={busy} onClick={manageSubscription}>{d('manageSubscription')}</button>}{lifetimeUnlimited && <p className="muted">{billingChoiceT.lifetimeActive}</p>}</> : <><div className="settings-quota"><strong>{quota?.remaining ?? '—'}</strong><span>{d('ofFiveFree')}</span></div><div className="quota-track"><span style={{ width: `${quotaPercent}%` }} /></div><p className="muted">{d('freePlanBody')}</p></>}</div>
          <div className="card content-card plan-interest"><span className="eyebrow">UNLIMITED</span><h2>ImportVerifier Unlimited</h2><p>{d('unlimitedBody')}</p>{unlimited ? <p className="message success" role="status">{d('unlimitedActive')}{billingOption ? ` · ${billingChoiceLabel(billingOption)}` : ''}</p> : <div className="report-grid">{UNLIMITED_PUBLIC_OFFERS.map(offer => <button key={offer.id} className="report-option" disabled={busy} onClick={() => void startCheckout(offer.id)}><strong>{billingChoiceLabel(offer.id)}{offer.id === 'annual' ? ` · ${billingChoiceT.recommended}` : ''}</strong><span>{formatPrice(language, offer.priceEur)} · {billingCadenceLabel(offer.id)}</span><b>{billingChoiceT.choose}</b></button>)}</div>}<p className="muted">{d('stripeBody')}</p></div>
          <div className="card content-card expansion-card"><span className="eyebrow">{d('expansion')}</span><h2>{d('expansionTitle')}</h2><p>{d('expansionBody')}</p><div className="expansion-flags">{MARKETS_BY_RANK.map(market => <span key={market.code} title={marketName(market.code)}>{market.flag}</span>)}</div></div>
          <div className="card content-card settings-security"><span className="eyebrow">{d('privacy')}</span><h2>{d('privacyTitle')}</h2><p>{d('privacyBody')}</p><p className="muted">{d('privacyCaution')}</p><TrustMark title={trustT.title} detail={trustT.detail} httpsLabel={trustT.https} explanation={trustT.explanation} compact /></div>
          <div className="card content-card account-danger-zone">
            <div className="danger-zone-heading"><div><span className="eyebrow">{accountT.eyebrow}</span><h2>{accountT.title}</h2></div>{!deleteAccountOpen && <button ref={deleteAccountOpener} className="btn danger-outline" disabled={busy} onClick={() => { setDeleteAccountOpen(true); setError(''); setNotice(''); }}>{accountT.open}</button>}</div>
            <p className="muted">{accountT.description}</p>
            {deleteAccountOpen && <form className="account-delete-confirmation" onSubmit={deleteAccount}>
              <div className="delete-warning"><strong>{accountT.warningTitle}</strong><span>{accountT.warningBody}</span></div>
              <label>{accountT.email}<input ref={deleteEmailInput} type="email" required autoComplete="off" disabled={busy} value={deleteEmail} onChange={event => setDeleteEmail(event.target.value)} placeholder={email} /></label>
              <label>{accountT.confirmation(DELETE_ACCOUNT_CONFIRMATION)}<input type="text" required autoComplete="off" spellCheck={false} disabled={busy} value={deleteConfirmation} onChange={event => setDeleteConfirmation(event.target.value)} /></label>
              <div className="delete-actions"><button type="button" className="btn ghost" disabled={busy} onClick={closeDeleteAccount}>{accountT.cancel}</button><button type="submit" className="btn danger-solid" disabled={busy || !canDeleteAccount}>{busy ? accountT.deleting : accountT.deleteForever}</button></div>
            </form>}
          </div>
        </div>}
      </section>
    </div>
  </main>;
}