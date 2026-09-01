import type { Language } from './landing-i18n';

export type RegulatoryChangesMessageKey = 'signIn' | 'loadError';

type Copy = Record<RegulatoryChangesMessageKey, string>;

export const regulatoryChangesCopy: Record<Language, Copy> = {
  es: { signIn: 'Inicia sesión.', loadError: 'No se puede cargar el Radar regulatorio.' },
  en: { signIn: 'Sign in.', loadError: 'The Regulatory Radar could not be loaded.' },
  fr: { signIn: 'Connectez-vous.', loadError: 'Impossible de charger le Radar réglementaire.' },
  de: { signIn: 'Melde dich an.', loadError: 'Der Regulatory Radar konnte nicht geladen werden.' },
  it: { signIn: 'Accedi.', loadError: 'Impossibile caricare il Radar normativo.' },
  pt: { signIn: 'Inicie sessão.', loadError: 'Não foi possível carregar o Radar regulamentar.' },
};

export function regulatoryChangesText(language: Language, key: RegulatoryChangesMessageKey): string {
  return regulatoryChangesCopy[language][key];
}
