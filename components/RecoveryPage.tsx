'use client';

import { useEffect, useMemo, useState } from 'react';

type Language = 'es' | 'en' | 'fr' | 'de' | 'it' | 'pt';
type RecoveryMode = 'error' | 'global' | 'not-found';

const supported = new Set<Language>(['es', 'en', 'fr', 'de', 'it', 'pt']);

const copy: Record<Language, {
  errorTitle: string;
  errorBody: string;
  notFoundTitle: string;
  notFoundBody: string;
  retry: string;
  home: string;
  label: string;
}> = {
  es: { errorTitle: 'Algo no ha salido como debía', errorBody: 'ImportVerifier ha detenido esta operación de forma segura. Puedes intentarlo de nuevo o volver al inicio.', notFoundTitle: 'Esta página no existe', notFoundBody: 'El enlace puede haber cambiado o ya no estar disponible. Tu cuenta y tus análisis no se han modificado.', retry: 'Intentar de nuevo', home: 'Volver al inicio', label: 'Recuperación segura' },
  en: { errorTitle: 'Something did not complete as expected', errorBody: 'ImportVerifier stopped this operation safely. You can try again or return to the home page.', notFoundTitle: 'This page does not exist', notFoundBody: 'The link may have changed or may no longer be available. Your account and analyses have not been modified.', retry: 'Try again', home: 'Back to home', label: 'Safe recovery' },
  fr: { errorTitle: 'Une opération ne s’est pas déroulée comme prévu', errorBody: 'ImportVerifier a interrompu cette opération en toute sécurité. Vous pouvez réessayer ou revenir à l’accueil.', notFoundTitle: 'Cette page n’existe pas', notFoundBody: 'Le lien a peut-être changé ou n’est plus disponible. Votre compte et vos analyses n’ont pas été modifiés.', retry: 'Réessayer', home: 'Retour à l’accueil', label: 'Récupération sécurisée' },
  de: { errorTitle: 'Etwas ist nicht wie erwartet abgeschlossen worden', errorBody: 'ImportVerifier hat diesen Vorgang sicher beendet. Du kannst es erneut versuchen oder zur Startseite zurückkehren.', notFoundTitle: 'Diese Seite existiert nicht', notFoundBody: 'Der Link wurde möglicherweise geändert oder ist nicht mehr verfügbar. Dein Konto und deine Analysen wurden nicht verändert.', retry: 'Erneut versuchen', home: 'Zur Startseite', label: 'Sichere Wiederherstellung' },
  it: { errorTitle: 'Qualcosa non si è concluso come previsto', errorBody: 'ImportVerifier ha interrotto questa operazione in modo sicuro. Puoi riprovare o tornare alla pagina iniziale.', notFoundTitle: 'Questa pagina non esiste', notFoundBody: 'Il link potrebbe essere cambiato o non essere più disponibile. Il tuo account e le tue analisi non sono stati modificati.', retry: 'Riprova', home: 'Torna all’inizio', label: 'Ripristino sicuro' },
  pt: { errorTitle: 'Algo não foi concluído como esperado', errorBody: 'O ImportVerifier interrompeu esta operação de forma segura. Pode tentar novamente ou voltar à página inicial.', notFoundTitle: 'Esta página não existe', notFoundBody: 'A ligação pode ter mudado ou já não estar disponível. A sua conta e as suas análises não foram alteradas.', retry: 'Tentar novamente', home: 'Voltar ao início', label: 'Recuperação segura' },
};

function detectLanguage(): Language {
  if (typeof document !== 'undefined') {
    const htmlLanguage = document.documentElement.lang.slice(0, 2).toLowerCase() as Language;
    if (supported.has(htmlLanguage)) return htmlLanguage;
    const pathLanguage = window.location.pathname.split('/').filter(Boolean)[0]?.slice(0, 2).toLowerCase() as Language;
    if (supported.has(pathLanguage)) return pathLanguage;
  }
  if (typeof navigator !== 'undefined') {
    const browserLanguage = navigator.language.slice(0, 2).toLowerCase() as Language;
    if (supported.has(browserLanguage)) return browserLanguage;
  }
  return 'en';
}

export default function RecoveryPage({ mode, reset }: { mode: RecoveryMode; reset?: () => void }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => setLanguage(detectLanguage()), []);

  const text = copy[language];
  const homeHref = useMemo(() => `/${language}`, [language]);
  const missing = mode === 'not-found';

  return <main className="shell">
    <section className="login card" role={missing ? undefined : 'alert'} aria-live={missing ? undefined : 'assertive'}>
      <p className="eyebrow">{text.label}</p>
      <h1>{missing ? text.notFoundTitle : text.errorTitle}</h1>
      <p className="lead">{missing ? text.notFoundBody : text.errorBody}</p>
      <div className="auth-actions">
        {!missing && <button className="btn primary full" type="button" onClick={() => {
          if (reset) reset();
          else window.location.reload();
        }}>{text.retry}</button>}
        <a className="btn ghost full" href={homeHref}>{text.home}</a>
      </div>
    </section>
  </main>;
}
