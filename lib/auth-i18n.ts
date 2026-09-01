import type { Language } from './landing-i18n';

export type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';
export type AuthErrorKey =
  | 'invalidCredentials' | 'emailNotConfirmed' | 'rateLimit' | 'notAuthorized'
  | 'weakPassword' | 'samePassword' | 'generic' | 'googleConfig'
  | 'googleConnection' | 'passwordMismatch' | 'connection';
export type AuthNoticeKey = 'password_updated' | 'account_deleted' | 'link_error' | 'signupConfirmation' | 'forgotEmail';
export type LoginNoticeKey = Extract<AuthNoticeKey, 'password_updated' | 'account_deleted' | 'link_error'>;

type AuthCopy = {
  language: string;
  titles: Record<AuthMode, string>;
  intro: string;
  selectedPlan: (plan: string) => string;
  selectedPlanHelp: string;
  googleConnecting: string;
  googleContinue: string;
  emailDivider: string;
  email: string;
  password: string;
  confirmPassword: string;
  showPassword: string;
  hidePassword: string;
  minimumPassword: string;
  processing: string;
  sendLink: string;
  savePassword: string;
  createWithEmail: string;
  signInWithEmail: string;
  createAccount: string;
  haveAccount: string;
  forgotPassword: string;
  back: string;
  errors: Record<AuthErrorKey, string>;
  notices: Record<AuthNoticeKey, string>;
};

export const authCopy: Record<Language, AuthCopy> = {
  es: {
    language: 'Idioma', titles: { login: 'Entrar en tu cuenta', signup: 'Crear cuenta', forgot: 'Recuperar contraseña', reset: 'Nueva contraseña' },
    intro: 'Tu cuenta y tus catálogos son privados. La comprobación detecta campos incompletos; no certifica conformidad normativa.',
    selectedPlan: plan => `${plan} seleccionado.`, selectedPlanHelp: 'Primero crea tu cuenta o entra. Solo registraremos tu interés; no se activa ningún cobro.',
    googleConnecting: 'Conectando con Google…', googleContinue: 'Continuar con Google', emailDivider: 'o continúa con correo electrónico',
    email: 'Correo electrónico', password: 'Contraseña', confirmPassword: 'Repite la contraseña', showPassword: 'Mostrar contraseña', hidePassword: 'Ocultar contraseña', minimumPassword: 'Mínimo 8 caracteres.',
    processing: 'Procesando…', sendLink: 'Enviar enlace', savePassword: 'Guardar contraseña', createWithEmail: 'Crear cuenta con correo', signInWithEmail: 'Entrar con correo',
    createAccount: 'Crear una cuenta', haveAccount: 'Ya tengo cuenta', forgotPassword: '¿Has olvidado tu contraseña?', back: 'Volver a la portada',
    errors: {
      invalidCredentials: 'El correo o la contraseña no son correctos.', emailNotConfirmed: 'Confirma primero tu correo mediante el enlace que recibiste.',
      rateLimit: 'Se ha alcanzado el límite temporal de intentos o correos. Espera antes de volver a intentarlo.', notAuthorized: 'El correo aún está limitado a cuentas de prueba autorizadas. El administrador debe configurar SMTP para admitir otros correos.',
      weakPassword: 'Elige una contraseña más segura y que no hayas utilizado en otro servicio.', samePassword: 'La nueva contraseña debe ser distinta de la anterior.',
      generic: 'No se ha podido completar la operación. Revisa los datos, la conexión y vuelve a intentarlo.', googleConfig: 'No se ha podido iniciar el acceso con Google. Comprueba que el proveedor está configurado en Supabase.',
      googleConnection: 'No se ha podido conectar con Google. Vuelve a intentarlo.', passwordMismatch: 'Usa al menos 8 caracteres y escribe la misma contraseña en los dos campos.',
      connection: 'No se ha podido conectar. Comprueba tu conexión y la configuración del servicio.',
    },
    notices: {
      password_updated: 'Contraseña actualizada. Entra con tu nueva contraseña.', account_deleted: 'Tu cuenta, tus análisis y tu historial se han eliminado definitivamente.',
      link_error: 'El enlace no es válido o ha caducado. Solicita otro enlace. Con el correo predeterminado, ábrelo en el mismo navegador donde lo solicitaste.',
      signupConfirmation: 'Si el registro puede completarse, recibirás un correo de confirmación. Revisa también spam. Si ya tenías cuenta, utiliza Entrar o Recuperar contraseña.',
      forgotEmail: 'Si existe una cuenta autorizada con ese correo, recibirás un enlace para cambiar la contraseña.',
    },
  },
  en: {
    language: 'Language', titles: { login: 'Sign in to your account', signup: 'Create an account', forgot: 'Reset your password', reset: 'Choose a new password' },
    intro: 'Your account and catalogues are private. The current check identifies missing fields; it does not certify regulatory compliance.',
    selectedPlan: plan => `${plan} selected.`, selectedPlanHelp: 'Create an account or sign in first. We will only record your interest; no payment will be activated.',
    googleConnecting: 'Connecting to Google…', googleContinue: 'Continue with Google', emailDivider: 'or continue with email',
    email: 'Email address', password: 'Password', confirmPassword: 'Confirm password', showPassword: 'Show password', hidePassword: 'Hide password', minimumPassword: 'At least 8 characters.',
    processing: 'Processing…', sendLink: 'Send reset link', savePassword: 'Save password', createWithEmail: 'Create account with email', signInWithEmail: 'Sign in with email',
    createAccount: 'Create an account', haveAccount: 'I already have an account', forgotPassword: 'Forgot your password?', back: 'Back to the home page',
    errors: {
      invalidCredentials: 'The email address or password is incorrect.', emailNotConfirmed: 'Confirm your email first using the link we sent you.',
      rateLimit: 'The temporary limit for attempts or emails has been reached. Wait before trying again.', notAuthorized: 'Email access is still limited to authorised test accounts. The administrator must configure SMTP before other addresses can be used.',
      weakPassword: 'Choose a stronger password that you have not used on another service.', samePassword: 'Your new password must be different from the previous one.',
      generic: 'We could not complete the operation. Check your details and connection, then try again.', googleConfig: 'Google sign-in could not start. Check that the provider is configured in Supabase.',
      googleConnection: 'We could not connect to Google. Try again.', passwordMismatch: 'Use at least 8 characters and enter the same password in both fields.',
      connection: 'We could not connect. Check your connection and the service configuration.',
    },
    notices: {
      password_updated: 'Password updated. Sign in with your new password.', account_deleted: 'Your account, analyses and history have been permanently deleted.',
      link_error: 'This link is invalid or has expired. Request a new one. With the default email service, open it in the same browser where you requested it.',
      signupConfirmation: 'If registration can be completed, you will receive a confirmation email. Check your spam folder too. If you already have an account, use Sign in or Reset your password.',
      forgotEmail: 'If an authorised account exists for that email, you will receive a password reset link.',
    },
  },
  fr: {
    language: 'Langue', titles: { login: 'Connectez-vous à votre compte', signup: 'Créer un compte', forgot: 'Réinitialiser le mot de passe', reset: 'Nouveau mot de passe' },
    intro: 'Votre compte et vos catalogues sont privés. Le contrôle repère les champs manquants ; il ne certifie pas la conformité réglementaire.',
    selectedPlan: plan => `${plan} sélectionné.`, selectedPlanHelp: 'Créez d’abord votre compte ou connectez-vous. Nous enregistrerons uniquement votre intérêt ; aucun paiement ne sera activé.',
    googleConnecting: 'Connexion à Google…', googleContinue: 'Continuer avec Google', emailDivider: 'ou continuer avec votre adresse e-mail',
    email: 'Adresse e-mail', password: 'Mot de passe', confirmPassword: 'Confirmez le mot de passe', showPassword: 'Afficher le mot de passe', hidePassword: 'Masquer le mot de passe', minimumPassword: '8 caractères minimum.',
    processing: 'Traitement…', sendLink: 'Envoyer le lien', savePassword: 'Enregistrer le mot de passe', createWithEmail: 'Créer le compte par e-mail', signInWithEmail: 'Se connecter par e-mail',
    createAccount: 'Créer un compte', haveAccount: 'J’ai déjà un compte', forgotPassword: 'Mot de passe oublié ?', back: 'Retour à l’accueil',
    errors: {
      invalidCredentials: 'L’adresse e-mail ou le mot de passe est incorrect.', emailNotConfirmed: 'Confirmez d’abord votre adresse e-mail avec le lien reçu.',
      rateLimit: 'La limite temporaire de tentatives ou d’e-mails a été atteinte. Patientez avant de réessayer.', notAuthorized: 'L’accès par e-mail reste limité aux comptes de test autorisés. L’administrateur doit configurer SMTP pour accepter d’autres adresses.',
      weakPassword: 'Choisissez un mot de passe plus sûr, jamais utilisé sur un autre service.', samePassword: 'Le nouveau mot de passe doit être différent de l’ancien.',
      generic: 'L’opération n’a pas pu aboutir. Vérifiez vos informations et votre connexion, puis réessayez.', googleConfig: 'La connexion Google n’a pas pu démarrer. Vérifiez la configuration du fournisseur dans Supabase.',
      googleConnection: 'Impossible de se connecter à Google. Réessayez.', passwordMismatch: 'Utilisez au moins 8 caractères et saisissez le même mot de passe dans les deux champs.',
      connection: 'Connexion impossible. Vérifiez votre connexion et la configuration du service.',
    },
    notices: {
      password_updated: 'Mot de passe mis à jour. Connectez-vous avec votre nouveau mot de passe.', account_deleted: 'Votre compte, vos analyses et votre historique ont été définitivement supprimés.',
      link_error: 'Ce lien est invalide ou a expiré. Demandez-en un nouveau. Avec le service e-mail par défaut, ouvrez-le dans le navigateur où vous l’avez demandé.',
      signupConfirmation: 'Si l’inscription peut aboutir, vous recevrez un e-mail de confirmation. Vérifiez aussi les spams. Si vous avez déjà un compte, utilisez Connexion ou Réinitialiser le mot de passe.',
      forgotEmail: 'Si un compte autorisé existe pour cette adresse, vous recevrez un lien de réinitialisation.',
    },
  },
  de: {
    language: 'Sprache', titles: { login: 'Bei deinem Konto anmelden', signup: 'Konto erstellen', forgot: 'Passwort zurücksetzen', reset: 'Neues Passwort' },
    intro: 'Dein Konto und deine Kataloge sind privat. Die Prüfung erkennt fehlende Felder; sie zertifiziert keine regulatorische Konformität.',
    selectedPlan: plan => `${plan} ausgewählt.`, selectedPlanHelp: 'Erstelle zuerst ein Konto oder melde dich an. Wir erfassen nur dein Interesse; es wird keine Zahlung aktiviert.',
    googleConnecting: 'Verbindung mit Google…', googleContinue: 'Mit Google fortfahren', emailDivider: 'oder mit E-Mail fortfahren',
    email: 'E-Mail-Adresse', password: 'Passwort', confirmPassword: 'Passwort wiederholen', showPassword: 'Passwort anzeigen', hidePassword: 'Passwort ausblenden', minimumPassword: 'Mindestens 8 Zeichen.',
    processing: 'Wird verarbeitet…', sendLink: 'Link senden', savePassword: 'Passwort speichern', createWithEmail: 'Konto mit E-Mail erstellen', signInWithEmail: 'Mit E-Mail anmelden',
    createAccount: 'Konto erstellen', haveAccount: 'Ich habe bereits ein Konto', forgotPassword: 'Passwort vergessen?', back: 'Zurück zur Startseite',
    errors: {
      invalidCredentials: 'E-Mail-Adresse oder Passwort ist falsch.', emailNotConfirmed: 'Bestätige zuerst deine E-Mail-Adresse über den zugesandten Link.',
      rateLimit: 'Das vorübergehende Limit für Versuche oder E-Mails wurde erreicht. Warte, bevor du es erneut versuchst.', notAuthorized: 'Der E-Mail-Zugang ist noch auf autorisierte Testkonten beschränkt. Für andere Adressen muss der Administrator SMTP konfigurieren.',
      weakPassword: 'Wähle ein stärkeres Passwort, das du bei keinem anderen Dienst verwendet hast.', samePassword: 'Das neue Passwort muss sich vom bisherigen unterscheiden.',
      generic: 'Der Vorgang konnte nicht abgeschlossen werden. Prüfe deine Angaben und die Verbindung und versuche es erneut.', googleConfig: 'Die Google-Anmeldung konnte nicht gestartet werden. Prüfe die Anbieter-Konfiguration in Supabase.',
      googleConnection: 'Die Verbindung mit Google ist fehlgeschlagen. Versuche es erneut.', passwordMismatch: 'Verwende mindestens 8 Zeichen und gib in beiden Feldern dasselbe Passwort ein.',
      connection: 'Verbindung fehlgeschlagen. Prüfe deine Verbindung und die Dienstkonfiguration.',
    },
    notices: {
      password_updated: 'Passwort aktualisiert. Melde dich mit deinem neuen Passwort an.', account_deleted: 'Dein Konto, deine Analysen und dein Verlauf wurden endgültig gelöscht.',
      link_error: 'Dieser Link ist ungültig oder abgelaufen. Fordere einen neuen an. Öffne ihn beim Standard-E-Mail-Dienst in demselben Browser, in dem du ihn angefordert hast.',
      signupConfirmation: 'Wenn die Registrierung abgeschlossen werden kann, erhältst du eine Bestätigungs-E-Mail. Prüfe auch den Spam-Ordner. Wenn du bereits ein Konto hast, nutze Anmelden oder Passwort zurücksetzen.',
      forgotEmail: 'Wenn für diese Adresse ein autorisiertes Konto existiert, erhältst du einen Link zum Zurücksetzen des Passworts.',
    },
  },
  it: {
    language: 'Lingua', titles: { login: 'Accedi al tuo account', signup: 'Crea un account', forgot: 'Recupera la password', reset: 'Nuova password' },
    intro: 'Il tuo account e i tuoi cataloghi sono privati. Il controllo rileva i campi mancanti; non certifica la conformità normativa.',
    selectedPlan: plan => `${plan} selezionato.`, selectedPlanHelp: 'Prima crea un account o accedi. Registreremo solo il tuo interesse; non verrà attivato alcun pagamento.',
    googleConnecting: 'Connessione a Google…', googleContinue: 'Continua con Google', emailDivider: 'oppure continua con l’e-mail',
    email: 'Indirizzo e-mail', password: 'Password', confirmPassword: 'Ripeti la password', showPassword: 'Mostra password', hidePassword: 'Nascondi password', minimumPassword: 'Almeno 8 caratteri.',
    processing: 'Elaborazione…', sendLink: 'Invia il link', savePassword: 'Salva password', createWithEmail: 'Crea account con e-mail', signInWithEmail: 'Accedi con e-mail',
    createAccount: 'Crea un account', haveAccount: 'Ho già un account', forgotPassword: 'Hai dimenticato la password?', back: 'Torna alla home',
    errors: {
      invalidCredentials: 'L’indirizzo e-mail o la password non sono corretti.', emailNotConfirmed: 'Prima conferma l’indirizzo e-mail tramite il link ricevuto.',
      rateLimit: 'È stato raggiunto il limite temporaneo di tentativi o e-mail. Attendi prima di riprovare.', notAuthorized: 'L’accesso e-mail è ancora limitato agli account di prova autorizzati. L’amministratore deve configurare SMTP per accettare altri indirizzi.',
      weakPassword: 'Scegli una password più sicura che non hai usato su altri servizi.', samePassword: 'La nuova password deve essere diversa da quella precedente.',
      generic: 'Non è stato possibile completare l’operazione. Controlla i dati e la connessione, quindi riprova.', googleConfig: 'Non è stato possibile avviare l’accesso con Google. Controlla la configurazione del provider in Supabase.',
      googleConnection: 'Non è stato possibile connettersi a Google. Riprova.', passwordMismatch: 'Usa almeno 8 caratteri e inserisci la stessa password in entrambi i campi.',
      connection: 'Connessione non riuscita. Controlla la connessione e la configurazione del servizio.',
    },
    notices: {
      password_updated: 'Password aggiornata. Accedi con la nuova password.', account_deleted: 'Il tuo account, le analisi e la cronologia sono stati eliminati definitivamente.',
      link_error: 'Il link non è valido o è scaduto. Richiedine un altro. Con il servizio e-mail predefinito, aprilo nello stesso browser in cui lo hai richiesto.',
      signupConfirmation: 'Se la registrazione può essere completata, riceverai un’e-mail di conferma. Controlla anche lo spam. Se hai già un account, usa Accedi o Recupera la password.',
      forgotEmail: 'Se esiste un account autorizzato per questa e-mail, riceverai un link per cambiare la password.',
    },
  },
  pt: {
    language: 'Idioma', titles: { login: 'Entre na sua conta', signup: 'Criar conta', forgot: 'Recuperar palavra-passe', reset: 'Nova palavra-passe' },
    intro: 'A sua conta e os seus catálogos são privados. A verificação deteta campos em falta; não certifica conformidade regulamentar.',
    selectedPlan: plan => `${plan} selecionado.`, selectedPlanHelp: 'Primeiro, crie uma conta ou entre. Apenas registaremos o seu interesse; não será ativado qualquer pagamento.',
    googleConnecting: 'A ligar ao Google…', googleContinue: 'Continuar com Google', emailDivider: 'ou continuar com e-mail',
    email: 'Endereço de e-mail', password: 'Palavra-passe', confirmPassword: 'Repita a palavra-passe', showPassword: 'Mostrar palavra-passe', hidePassword: 'Ocultar palavra-passe', minimumPassword: 'Mínimo de 8 caracteres.',
    processing: 'A processar…', sendLink: 'Enviar ligação', savePassword: 'Guardar palavra-passe', createWithEmail: 'Criar conta com e-mail', signInWithEmail: 'Entrar com e-mail',
    createAccount: 'Criar uma conta', haveAccount: 'Já tenho conta', forgotPassword: 'Esqueceu-se da palavra-passe?', back: 'Voltar à página inicial',
    errors: {
      invalidCredentials: 'O e-mail ou a palavra-passe estão incorretos.', emailNotConfirmed: 'Confirme primeiro o e-mail através da ligação que recebeu.',
      rateLimit: 'Foi atingido o limite temporário de tentativas ou e-mails. Aguarde antes de tentar novamente.', notAuthorized: 'O acesso por e-mail ainda está limitado a contas de teste autorizadas. O administrador deve configurar SMTP para admitir outros endereços.',
      weakPassword: 'Escolha uma palavra-passe mais segura e que não tenha usado noutro serviço.', samePassword: 'A nova palavra-passe tem de ser diferente da anterior.',
      generic: 'Não foi possível concluir a operação. Verifique os dados e a ligação e tente novamente.', googleConfig: 'Não foi possível iniciar o acesso com Google. Verifique a configuração do fornecedor no Supabase.',
      googleConnection: 'Não foi possível ligar ao Google. Tente novamente.', passwordMismatch: 'Use pelo menos 8 caracteres e introduza a mesma palavra-passe nos dois campos.',
      connection: 'Não foi possível estabelecer ligação. Verifique a sua ligação e a configuração do serviço.',
    },
    notices: {
      password_updated: 'Palavra-passe atualizada. Entre com a nova palavra-passe.', account_deleted: 'A sua conta, análises e histórico foram eliminados definitivamente.',
      link_error: 'A ligação não é válida ou expirou. Peça outra. Com o serviço de e-mail predefinido, abra-a no mesmo navegador em que a pediu.',
      signupConfirmation: 'Se o registo puder ser concluído, receberá um e-mail de confirmação. Verifique também o spam. Se já tinha conta, use Entrar ou Recuperar palavra-passe.',
      forgotEmail: 'Se existir uma conta autorizada com esse e-mail, receberá uma ligação para alterar a palavra-passe.',
    },
  },
};

export function authErrorKey(error: { code?: string; message: string }): AuthErrorKey {
  if (error.code === 'invalid_credentials') return 'invalidCredentials';
  if (error.code === 'email_not_confirmed') return 'emailNotConfirmed';
  if (error.code?.includes('rate_limit') || /rate limit/i.test(error.message)) return 'rateLimit';
  if (/not authorized|email_address_not_authorized/i.test(`${error.code} ${error.message}`)) return 'notAuthorized';
  if (error.code === 'weak_password') return 'weakPassword';
  if (error.code === 'same_password') return 'samePassword';
  return 'generic';
}

export function isLoginNoticeKey(value: unknown): value is LoginNoticeKey {
  return value === 'password_updated' || value === 'account_deleted' || value === 'link_error';
}
