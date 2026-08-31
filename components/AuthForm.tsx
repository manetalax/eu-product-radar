'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import Brand from '@/components/Brand';
import TrustMark from '@/components/TrustMark';
import { authCopy, authErrorKey, AuthErrorKey, AuthMode, AuthNoticeKey, LoginNoticeKey } from '@/lib/auth-i18n';
import { landingCopy, Language, LANGUAGE_OPTIONS } from '@/lib/landing-i18n';
import { PurchaseId, purchaseName } from '@/lib/plans';
import { IMPORTVERIFIER_PRODUCTION_URL } from '@/lib/release-config';
import { authService } from '@/lib/services/auth-client';
import { planInterestMetadata, savePlanIntent } from '@/lib/services/plan-interest';
import { useLanguage } from '@/lib/use-language';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M21.6 12.23c0-.68-.06-1.33-.17-1.96H12v3.71h5.39a4.61 4.61 0 0 1-2 3.03v2.52h3.23c1.89-1.74 2.98-4.3 2.98-7.3Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.45l-3.23-2.52c-.9.6-2.04.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.06v2.6A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.86A5.98 5.98 0 0 1 6.07 12c0-.65.11-1.28.32-1.86v-2.6H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.46l3.33-2.6Z" />
      <path fill="#EA4335" d="M12 5.98c1.47 0 2.8.5 3.84 1.48l2.88-2.88C16.95 2.91 14.69 2 12 2A10 10 0 0 0 3.06 7.54l3.33 2.6c.79-2.37 3-4.16 5.61-4.16Z" />
    </svg>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return hidden ? (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.3A10.6 10.6 0 0 1 12 4c5.5 0 9 5.2 9 8a8.8 8.8 0 0 1-2 3.8M6.2 6.2C4.2 7.6 3 10 3 12c0 2.8 3.5 8 9 8a9.8 9.8 0 0 0 4.1-.9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M3 12c0-2.8 3.5-8 9-8s9 5.2 9 8-3.5 8-9 8-9-5.2-9-8Z" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
  );
}

export default function AuthForm({ initialMode = 'login', initialMessageKey, requestedPlan }: { initialMode?: AuthMode; initialMessageKey?: LoginNoticeKey; requestedPlan?: PurchaseId }) {
  const { language, setLanguage } = useLanguage();
  const t = authCopy[language];
  const trust = landingCopy[language].trust;
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorKey, setErrorKey] = useState<AuthErrorKey | null>(null);
  const [noticeKey, setNoticeKey] = useState<AuthNoticeKey | null>(initialMessageKey ?? null);

  const change = (next: AuthMode) => {
    setMode(next);
    setErrorKey(null);
    setNoticeKey(null);
    setPassword('');
    setConfirm('');
    setShowPassword(false);
    setShowConfirm(false);
  };

  const callbackUrl = (next?: string) => {
    const currentOrigin = window.location.origin;
    const localDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const origin = localDevelopment ? currentOrigin : IMPORTVERIFIER_PRODUCTION_URL;
    const params = new URLSearchParams({ lang: language });
    if (next) params.set('next', next);
    return `${origin}/auth/callback?${params.toString()}`;
  };

  async function signInWithGoogle() {
    setBusy(true);
    setErrorKey(null);
    setNoticeKey(null);
    try {
      if (requestedPlan) savePlanIntent(requestedPlan);
      const { data, error } = await authService.signInWithOAuth(callbackUrl());
      if (error || !data.url) {
        setErrorKey('googleConfig');
        setBusy(false);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setErrorKey('googleConnection');
      setBusy(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorKey(null);
    setNoticeKey(null);
    if ((mode === 'signup' || mode === 'reset') && (password.length < 8 || password !== confirm)) {
      setErrorKey('passwordMismatch');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'login') {
        const { error } = await authService.signInWithPassword(email.trim(), password);
        if (error) setErrorKey(authErrorKey(error));
        else {
          if (requestedPlan) savePlanIntent(requestedPlan);
          window.location.assign('/dashboard');
        }
      } else if (mode === 'signup') {
        const { data, error } = await authService.signUp(email.trim(), password, callbackUrl(), requestedPlan ? planInterestMetadata(requestedPlan) : undefined);
        if (error) setErrorKey(authErrorKey(error));
        else if (data.session) window.location.assign('/dashboard');
        else {
          if (requestedPlan) savePlanIntent(requestedPlan);
          setNoticeKey('signupConfirmation');
          setPassword('');
          setConfirm('');
        }
      } else if (mode === 'forgot') {
        const { error } = await authService.resetPasswordForEmail(email.trim(), callbackUrl('/reset-password'));
        if (error) setErrorKey(authErrorKey(error)); else setNoticeKey('forgotEmail');
      } else {
        const { error } = await authService.updatePassword(password);
        if (error) setErrorKey(authErrorKey(error));
        else {
          await authService.signOut();
          window.location.assign(`/login?message=password_updated&lang=${language}`);
        }
      }
    } catch {
      setErrorKey('connection');
    } finally {
      setBusy(false);
    }
  }

  return <main className="shell"><section className="login card auth-card">
    <div className="auth-brand-row">
      <Brand market="EU" />
      <label className="language-picker auth-language-picker">
        <span className="sr-only">{t.language}</span>
        <select value={language} aria-label={t.language} disabled={busy} onChange={event => setLanguage(event.target.value as Language)}>
          {LANGUAGE_OPTIONS.map(option => <option key={option.code} value={option.code}>{option.label}</option>)}
        </select>
      </label>
    </div>
    <h1>{t.titles[mode]}</h1>
    {requestedPlan && (mode === 'login' || mode === 'signup') && <p className="plan-intent-note"><strong>{t.selectedPlan(purchaseName(requestedPlan))}</strong> {t.selectedPlanHelp}</p>}
    <p className="muted">{t.intro}</p>

    {(mode === 'login' || mode === 'signup') && <div className="auth-actions oauth-section">
      <button type="button" className="btn oauth-btn full" disabled={busy} onClick={signInWithGoogle}>
        <span className="oauth-icon"><GoogleIcon /></span>
        <span>{busy ? t.googleConnecting : t.googleContinue}</span>
      </button>
      <div className="auth-divider"><span>{t.emailDivider}</span></div>
    </div>}

    <form onSubmit={submit}>
      {mode !== 'reset' && <label>{t.email}<input required type="email" autoComplete="email" maxLength={254} value={email} disabled={busy} onChange={e => setEmail(e.target.value)} /></label>}

      {mode !== 'forgot' && <label>{t.password}
        <div className="password-field">
          <input required type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'login' ? 1 : 8} maxLength={128} value={password} disabled={busy} onChange={e => setPassword(e.target.value)} />
          <button type="button" className="password-toggle" aria-label={showPassword ? t.hidePassword : t.showPassword} aria-pressed={showPassword} disabled={busy} onClick={() => setShowPassword(value => !value)}><EyeIcon hidden={showPassword} /></button>
        </div>
        {(mode === 'signup' || mode === 'reset') && <span className="field-help">{t.minimumPassword}</span>}
      </label>}

      {(mode === 'signup' || mode === 'reset') && <label>{t.confirmPassword}
        <div className="password-field">
          <input required type={showConfirm ? 'text' : 'password'} autoComplete="new-password" minLength={8} maxLength={128} value={confirm} disabled={busy} onChange={e => setConfirm(e.target.value)} />
          <button type="button" className="password-toggle" aria-label={showConfirm ? t.hidePassword : t.showPassword} aria-pressed={showConfirm} disabled={busy} onClick={() => setShowConfirm(value => !value)}><EyeIcon hidden={showConfirm} /></button>
        </div>
      </label>}

      {errorKey && <p className="message error" role="alert">{t.errors[errorKey]}</p>}
      {noticeKey && <p className="message success" role="status">{t.notices[noticeKey]}</p>}
      <button className="btn primary full" disabled={busy}>{busy ? t.processing : mode === 'forgot' ? t.sendLink : mode === 'reset' ? t.savePassword : mode === 'signup' ? t.createWithEmail : t.signInWithEmail}</button>
    </form>

    {mode !== 'reset' && <div className="auth-actions auth-secondary-actions">
      <button className="btn ghost" disabled={busy} onClick={() => change(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? t.createAccount : t.haveAccount}</button>
      {mode === 'login' && <button className="text-button" disabled={busy} onClick={() => change('forgot')}>{t.forgotPassword}</button>}
    </div>}
    <TrustMark title={trust.title} detail={trust.detail} httpsLabel={trust.https} explanation={trust.explanation} compact />
    <Link className="back-link" href={`/?lang=${language}`}>{t.back}</Link>
  </section></main>;
}