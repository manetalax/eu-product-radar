import type { AccountDeletionErrorCode } from './account';
import type { Language } from './landing-i18n';

type AccountCopy = {
  eyebrow: string;
  title: string;
  open: string;
  description: string;
  warningTitle: string;
  warningBody: string;
  email: string;
  confirmation: (word: string) => string;
  cancel: string;
  deleting: string;
  deleteForever: string;
  errors: Record<AccountDeletionErrorCode, string>;
};

export const accountCopy: Record<Language, AccountCopy> = {
  es: {
    eyebrow: 'CONTROL DE TUS DATOS', title: 'Eliminar cuenta y datos', open: 'Eliminar mi cuenta',
    description: 'Elimina definitivamente tu acceso, tus análisis, tu historial y el consumo asociado. Esta operación no se puede deshacer.',
    warningTitle: 'Comprueba antes de continuar', warningBody: 'Descarga primero cualquier informe que quieras conservar. Cerraremos las sesiones abiertas en todos tus dispositivos.',
    email: 'Correo de la cuenta', confirmation: word => `Escribe ${word}`, cancel: 'Cancelar', deleting: 'Eliminando de forma segura…', deleteForever: 'Eliminar cuenta definitivamente',
    errors: {
      origin_not_allowed: 'La solicitud no procede de un origen permitido.', session_expired: 'Tu sesión ha caducado. Vuelve a entrar.', invalid_confirmation: 'La confirmación de borrado no es válida.',
      email_mismatch: 'Escribe el correo exacto de tu cuenta.', confirmation_mismatch: 'Escribe BORRAR exactamente para confirmar.', delete_failed: 'No se ha podido eliminar la cuenta. Tus datos permanecen intactos; vuelve a intentarlo.',
    },
  },
  en: {
    eyebrow: 'YOUR DATA CONTROLS', title: 'Delete account and data', open: 'Delete my account',
    description: 'Permanently delete your access, analyses, history and associated usage. This action cannot be undone.',
    warningTitle: 'Check before continuing', warningBody: 'Download any reports you want to keep first. We will close open sessions on all your devices.',
    email: 'Account email', confirmation: word => `Type ${word}`, cancel: 'Cancel', deleting: 'Deleting securely…', deleteForever: 'Delete account permanently',
    errors: {
      origin_not_allowed: 'The request did not come from an allowed origin.', session_expired: 'Your session has expired. Sign in again.', invalid_confirmation: 'The deletion confirmation is invalid.',
      email_mismatch: 'Enter the exact email address for your account.', confirmation_mismatch: 'Type BORRAR exactly to confirm.', delete_failed: 'We could not delete your account. Your data remains intact; try again.',
    },
  },
  fr: {
    eyebrow: 'CONTRÔLE DE VOS DONNÉES', title: 'Supprimer le compte et les données', open: 'Supprimer mon compte',
    description: 'Supprimez définitivement votre accès, vos analyses, votre historique et l’utilisation associée. Cette action est irréversible.',
    warningTitle: 'Vérifiez avant de continuer', warningBody: 'Téléchargez d’abord les rapports que vous souhaitez conserver. Nous fermerons les sessions ouvertes sur tous vos appareils.',
    email: 'E-mail du compte', confirmation: word => `Saisissez ${word}`, cancel: 'Annuler', deleting: 'Suppression sécurisée…', deleteForever: 'Supprimer définitivement le compte',
    errors: {
      origin_not_allowed: 'La demande ne provient pas d’une origine autorisée.', session_expired: 'Votre session a expiré. Reconnectez-vous.', invalid_confirmation: 'La confirmation de suppression est invalide.',
      email_mismatch: 'Saisissez l’adresse e-mail exacte de votre compte.', confirmation_mismatch: 'Saisissez exactement BORRAR pour confirmer.', delete_failed: 'Votre compte n’a pas pu être supprimé. Vos données restent intactes ; réessayez.',
    },
  },
  de: {
    eyebrow: 'KONTROLLE ÜBER DEINE DATEN', title: 'Konto und Daten löschen', open: 'Mein Konto löschen',
    description: 'Lösche deinen Zugang, deine Analysen, deinen Verlauf und die zugehörige Nutzung endgültig. Dieser Vorgang kann nicht rückgängig gemacht werden.',
    warningTitle: 'Vor dem Fortfahren prüfen', warningBody: 'Lade zuerst alle Berichte herunter, die du behalten möchtest. Offene Sitzungen auf allen Geräten werden geschlossen.',
    email: 'E-Mail-Adresse des Kontos', confirmation: word => `${word} eingeben`, cancel: 'Abbrechen', deleting: 'Wird sicher gelöscht…', deleteForever: 'Konto endgültig löschen',
    errors: {
      origin_not_allowed: 'Die Anfrage stammt nicht von einem zulässigen Ursprung.', session_expired: 'Deine Sitzung ist abgelaufen. Melde dich erneut an.', invalid_confirmation: 'Die Löschbestätigung ist ungültig.',
      email_mismatch: 'Gib die genaue E-Mail-Adresse deines Kontos ein.', confirmation_mismatch: 'Gib zur Bestätigung exakt BORRAR ein.', delete_failed: 'Das Konto konnte nicht gelöscht werden. Deine Daten bleiben unverändert; versuche es erneut.',
    },
  },
  it: {
    eyebrow: 'CONTROLLO DEI TUOI DATI', title: 'Elimina account e dati', open: 'Elimina il mio account',
    description: 'Elimina definitivamente l’accesso, le analisi, la cronologia e l’utilizzo associato. Questa operazione non può essere annullata.',
    warningTitle: 'Controlla prima di continuare', warningBody: 'Prima scarica i report che vuoi conservare. Chiuderemo le sessioni aperte su tutti i tuoi dispositivi.',
    email: 'E-mail dell’account', confirmation: word => `Scrivi ${word}`, cancel: 'Annulla', deleting: 'Eliminazione sicura…', deleteForever: 'Elimina definitivamente l’account',
    errors: {
      origin_not_allowed: 'La richiesta non proviene da un’origine consentita.', session_expired: 'La sessione è scaduta. Accedi di nuovo.', invalid_confirmation: 'La conferma di eliminazione non è valida.',
      email_mismatch: 'Inserisci l’indirizzo e-mail esatto del tuo account.', confirmation_mismatch: 'Scrivi esattamente BORRAR per confermare.', delete_failed: 'Non è stato possibile eliminare l’account. I dati restano intatti; riprova.',
    },
  },
  pt: {
    eyebrow: 'CONTROLO DOS SEUS DADOS', title: 'Eliminar conta e dados', open: 'Eliminar a minha conta',
    description: 'Elimine definitivamente o acesso, as análises, o histórico e a utilização associada. Esta operação não pode ser anulada.',
    warningTitle: 'Verifique antes de continuar', warningBody: 'Descarregue primeiro os relatórios que pretende conservar. Encerraremos as sessões abertas em todos os seus dispositivos.',
    email: 'E-mail da conta', confirmation: word => `Escreva ${word}`, cancel: 'Cancelar', deleting: 'A eliminar em segurança…', deleteForever: 'Eliminar conta definitivamente',
    errors: {
      origin_not_allowed: 'O pedido não provém de uma origem permitida.', session_expired: 'A sua sessão expirou. Entre novamente.', invalid_confirmation: 'A confirmação de eliminação não é válida.',
      email_mismatch: 'Introduza o e-mail exato da sua conta.', confirmation_mismatch: 'Escreva exatamente BORRAR para confirmar.', delete_failed: 'Não foi possível eliminar a conta. Os seus dados permanecem intactos; tente novamente.',
    },
  },
};
