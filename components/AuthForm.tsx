'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Mode = 'login' | 'signup' | 'forgot' | 'reset';
const titles: Record<Mode, string> = { login: 'Entrar en tu cuenta', signup: 'Crear cuenta', forgot: 'Recuperar contraseña', reset: 'Nueva contraseña' };
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(initialMessage);
  const change = (next: Mode) => { setMode(next); setError(''); setNotice(''); setPassword(''); setConfirm(''); };
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setNotice('');
    if ((mode === 'signup' || mode === 'reset') && (password.length < 12 || password !== confirm)) { setError('Usa al menos 12 caracteres y escribe la misma contraseña en los dos campos.'); return; }
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
        else { setNotice('Si el registro puede completarse, recibirás un correo de confirmación. Revisa también spam. Si ya tenías cuenta, utiliza Entrar o Recuperar contraseña.'); setPassword(''); setConfirm(''); }
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${siteUrl}/auth/callback?next=/reset-password` });
        if (error) setError(authMessage(error)); else setNotice('Si existe una cuenta autorizada con ese correo, recibirás un enlace para cambiar la contraseña.');
      } else {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) setError(authMessage(error)); else { await supabase.auth.signOut(); window.location.assign('/login?message=password_updated'); }
      }
    } catch { setError('No se ha podido conectar. Comprueba tu conexión y la configuración del servicio.'); }
    finally { setBusy(false); }
  }
  return <main className="shell"><section className="login card">
    <Link className="brand" href="/">EU <b>Product Radar</b></Link><h1>{titles[mode]}</h1>
    <p className="muted">Tu cuenta y tus catálogos son privados. La comprobación actual detecta campos incompletos; no certifica conformidad normativa.</p>
    <form onSubmit={submit}>
      {mode !== 'reset' && <label>Correo electrónico<input required type="email" autoComplete="email" maxLength={254} value={email} disabled={busy} onChange={e => setEmail(e.target.value)} /></label>}
      {mode !== 'forgot' && <label>Contraseña<input required type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'login' ? 1 : 12} maxLength={128} value={password} disabled={busy} onChange={e => setPassword(e.target.value)} /></label>}
      {(mode === 'signup' || mode === 'reset') && <label>Repite la contraseña<input required type="password" autoComplete="new-password" minLength={12} maxLength={128} value={confirm} disabled={busy} onChange={e => setConfirm(e.target.value)} /></label>}
      {error && <p className="message error" role="alert">{error}</p>}{notice && <p className="message success" role="status">{notice}</p>}
      <button className="btn primary full" disabled={busy}>{busy ? 'Procesando…' : mode === 'forgot' ? 'Enviar enlace' : mode === 'reset' ? 'Guardar contraseña' : titles[mode]}</button>
    </form>
    {mode !== 'reset' && <div className="auth-actions"><button className="btn ghost" disabled={busy} onClick={() => change(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Crear una cuenta' : 'Ya tengo cuenta'}</button>{mode === 'login' && <button className="text-button" disabled={busy} onClick={() => change('forgot')}>He olvidado mi contraseña</button>}</div>}
    <Link href="/">Volver a la portada</Link>
  </section></main>;
}
