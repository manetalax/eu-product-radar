'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Mode = 'login' | 'signup' | 'forgot' | 'reset';
const titles: Record<Mode, string> = {
  login: 'Entrar en tu cuenta',
  signup: 'Crear cuenta',
  forgot: 'Recuperar contraseña',
  reset: 'Nueva contraseña'
};

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

function authMessage(error: { code?: string; message: string }) {
  if (error.code === 'invalid_credentials') return 'El correo o la contraseña no son correctos.';
  if (error.code === 'email_not_confirmed') return 'Confirma primero tu correo mediante el enlace que recibiste.';
  if (error.code?.includes('rate_limit') || /rate limit/i.test(error.message)) return 'Se ha alcanzado el límite temporal de intentos o correos. Espera antes de volver a intentarlo.';
  if (/not authorized|email_address_not_authorized/i.test(`${error.code} ${error.message}`)) return 'El correo aún está limitado a cuentas de prueba autorizadas. El administrador debe configurar SMTP para admitir otros correos.';
  if (error.code === 'weak_password') return 'Elige una contraseña más segura y que no hayas utilizado en otro servicio.';
  if (error.code === 'same_password') return 'La nueva contraseña debe ser distinta de la anterior.';
  return 'No se ha podido completar la operación. Revisa los datos, la conexión y vuelve a intentarlo.';
}

export default function AuthForm({ initialMode = 'login', initialMessage = '' }: { initialMode?: Mode; initialMessage?: string }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(initialMessage);

  const change = (next: Mode) => {
    setMode(next);
    setError('');
    setNotice('');
    setPassword('');
    setConfirm('');
    setShowPassword(false);
    setShowConfirm(false);
  };

  async function signInWithGoogle() {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const { data, error } = await createClient().auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`, skipBrowserRedirect: true }
      });
      if (error || !data.url) {
        setError('No se ha podido iniciar el acceso con Google. Comprueba que el proveedor está configurado en Supabase.');
        setBusy(false);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError('No se ha podido conectar con Google. Vuelve a intentarlo.');
      setBusy(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    if ((mode === 'signup' || mode === 'reset') && (password.length < 8 || password !== confirm)) {
      setError('Usa al menos 8 caracteres y escribe la misma contraseña en los dos campos.');
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) setError(authMessage(error)); else window.location.assign('/dashboard');
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: `${siteUrl}/auth/callback` } });
        if (error) setError(authMessage(error));
        else if (data.session) window.location.assign('/dashboard');
        else {
          setNotice('Si el registro puede completarse, recibirás un correo de confirmación. Revisa también spam. Si ya tenías cuenta, utiliza Entrar o Recuperar contraseña.');
          setPassword('');
          setConfirm('');
        }
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${siteUrl}/auth/callback?next=/reset-password` });
        if (error) setError(authMessage(error)); else setNotice('Si existe una cuenta autorizada con ese correo, recibirás un enlace para cambiar la contraseña.');
      } else {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) setError(authMessage(error));
        else {
          await supabase.auth.signOut();
          window.location.assign('/login?message=password_updated');
        }
      }
    } catch {
      setError('No se ha podido conectar. Comprueba tu conexión y la configuración del servicio.');
    } finally {
      setBusy(false);
    }
  }

  return <main className="shell"><section className="login card auth-card">
    <Link className="brand" href="/">EU <b>Product Radar</b></Link>
    <h1>{titles[mode]}</h1>
    <p className="muted">Tu cuenta y tus catálogos son privados. La comprobación actual detecta campos incompletos; no certifica conformidad normativa.</p>

    {(mode === 'login' || mode === 'signup') && <div className="auth-actions oauth-section">
      <button type="button" className="btn oauth-btn full" disabled={busy} onClick={signInWithGoogle}>
        <span className="oauth-icon"><GoogleIcon /></span>
        <span>{busy ? 'Conectando con Google…' : 'Continuar con Google'}</span>
      </button>
      <div className="auth-divider"><span>o continúa con correo electrónico</span></div>
    </div>}

    <form onSubmit={submit}>
      {mode !== 'reset' && <label>Correo electrónico<input required type="email" autoComplete="email" maxLength={254} value={email} disabled={busy} onChange={e => setEmail(e.target.value)} /></label>}

      {mode !== 'forgot' && <label>Contraseña
        <div className="password-field">
          <input required type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'login' ? 1 : 8} maxLength={128} value={password} disabled={busy} onChange={e => setPassword(e.target.value)} />
          <button type="button" className="password-toggle" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPassword} disabled={busy} onClick={() => setShowPassword(value => !value)}><EyeIcon hidden={showPassword} /></button>
        </div>
        {(mode === 'signup' || mode === 'reset') && <span className="field-help">Mínimo 8 caracteres.</span>}
      </label>}

      {(mode === 'signup' || mode === 'reset') && <label>Repite la contraseña
        <div className="password-field">
          <input required type={showConfirm ? 'text' : 'password'} autoComplete="new-password" minLength={8} maxLength={128} value={confirm} disabled={busy} onChange={e => setConfirm(e.target.value)} />
          <button type="button" className="password-toggle" aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showConfirm} disabled={busy} onClick={() => setShowConfirm(value => !value)}><EyeIcon hidden={showConfirm} /></button>
        </div>
      </label>}

      {error && <p className="message error" role="alert">{error}</p>}
      {notice && <p className="message success" role="status">{notice}</p>}
      <button className="btn primary full" disabled={busy}>{busy ? 'Procesando…' : mode === 'forgot' ? 'Enviar enlace' : mode === 'reset' ? 'Guardar contraseña' : mode === 'signup' ? 'Crear cuenta con correo' : 'Entrar con correo'}</button>
    </form>

    {mode !== 'reset' && <div className="auth-actions auth-secondary-actions">
      <button className="btn ghost" disabled={busy} onClick={() => change(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Crear una cuenta' : 'Ya tengo cuenta'}</button>
      {mode === 'login' && <button className="text-button" disabled={busy} onClick={() => change('forgot')}>¿Has olvidado tu contraseña?</button>}
    </div>}
    <Link className="back-link" href="/">Volver a la portada</Link>
  </section></main>;
}
