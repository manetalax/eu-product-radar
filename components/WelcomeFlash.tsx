'use client';

import { useEffect, useState } from 'react';
import { Language } from '@/lib/landing-i18n';
import { useLanguage } from '@/lib/use-language';

const welcomeCopy: Record<Language, { title: string; detail: string; close: string }> = {
  es: { title: 'Cuenta creada correctamente', detail: 'Tu correo ha sido confirmado. Ya puedes utilizar ImportVerifier.', close: 'Cerrar mensaje' },
  en: { title: 'Account created successfully', detail: 'Your email has been confirmed. You can now use ImportVerifier.', close: 'Close message' },
  fr: { title: 'Compte créé avec succès', detail: 'Votre adresse e-mail a été confirmée. Vous pouvez maintenant utiliser ImportVerifier.', close: 'Fermer le message' },
  de: { title: 'Konto erfolgreich erstellt', detail: 'Deine E-Mail-Adresse wurde bestätigt. Du kannst ImportVerifier jetzt verwenden.', close: 'Nachricht schließen' },
  it: { title: 'Account creato correttamente', detail: 'La tua email è stata confermata. Ora puoi utilizzare ImportVerifier.', close: 'Chiudi messaggio' },
  pt: { title: 'Conta criada com sucesso', detail: 'O seu e-mail foi confirmado. Já pode utilizar o ImportVerifier.', close: 'Fechar mensagem' },
};

export default function WelcomeFlash({ show }: { show: boolean }) {
  const { language } = useLanguage();
  const t = welcomeCopy[language];
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (!show) return;
    const timer = window.setTimeout(() => setVisible(false), 5000);
    const url = new URL(window.location.href);
    url.searchParams.delete('welcome');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    return () => window.clearTimeout(timer);
  }, [show]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        width: 'min(92vw, 560px)',
        background: '#ffffff',
        border: '1px solid #d1fadf',
        borderRadius: 16,
        boxShadow: '0 18px 50px rgba(16, 24, 40, 0.16)',
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 30,
          height: 30,
          borderRadius: 999,
          background: '#dcfae6',
          color: '#067647',
          display: 'grid',
          placeItems: 'center',
          fontWeight: 900,
          flex: '0 0 auto',
        }}
      >
        ✓
      </div>
      <div style={{ flex: 1 }}>
        <strong style={{ display: 'block', marginBottom: 3 }}>{t.title}</strong>
        <span style={{ color: '#475467', lineHeight: 1.45 }}>{t.detail}</span>
      </div>
      <button
        type="button"
        aria-label={t.close}
        onClick={() => setVisible(false)}
        style={{
          border: 0,
          background: 'transparent',
          color: '#667085',
          cursor: 'pointer',
          fontSize: 22,
          lineHeight: 1,
          padding: 2,
        }}
      >
        ×
      </button>
    </div>
  );
}
