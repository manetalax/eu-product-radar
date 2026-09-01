import type { Language } from './landing-i18n';

export type RegulatoryAgentMessageKey =
  | 'origin' | 'signIn' | 'invalidRequest' | 'question' | 'productInvalid' | 'rateLimit'
  | 'analysisLoad' | 'analysisMissing' | 'productMissing' | 'evidenceLoad' | 'radarLoad'
  | 'assistantFailure' | 'disclaimer';

type Copy = Record<RegulatoryAgentMessageKey, string>;

const es: Copy = {
  origin:'Origen de solicitud no permitido.',
  signIn:'Inicia sesión para usar el asistente regulatorio.',
  invalidRequest:'Solicitud no válida.',
  question:'Escribe una pregunta de hasta 2.000 caracteres.',
  productInvalid:'El producto seleccionado no es válido.',
  rateLimit:'Hay demasiadas consultas seguidas. Vuelve a intentarlo más tarde.',
  analysisLoad:'No se ha podido cargar el análisis.',
  analysisMissing:'Análisis no encontrado.',
  productMissing:'El producto seleccionado no existe en este análisis.',
  evidenceLoad:'No se ha podido cargar la evidencia del producto.',
  radarLoad:'No se ha podido cargar el contexto regulatorio oficial.',
  assistantFailure:'No se ha podido consultar el asistente.',
  disclaimer:'Asistencia regulatoria orientativa. No constituye certificación, dictamen jurídico ni aprobación de una autoridad.',
};

export const regulatoryAgentCopy: Record<Language, Copy> = {
  es,
  en:{...es,origin:'Request origin is not allowed.',signIn:'Sign in to use the regulatory assistant.',invalidRequest:'Invalid request.',question:'Enter a question of up to 2,000 characters.',productInvalid:'The selected product is invalid.',rateLimit:'Too many requests have been made in a short period. Try again later.',analysisLoad:'The analysis could not be loaded.',analysisMissing:'Analysis not found.',productMissing:'The selected product does not exist in this analysis.',evidenceLoad:'The product evidence could not be loaded.',radarLoad:'The official regulatory context could not be loaded.',assistantFailure:'The assistant could not be queried.',disclaimer:'Regulatory guidance only. This is not certification, legal advice or approval by an authority.'},
  fr:{...es,origin:'Origine de la requête non autorisée.',signIn:'Connectez-vous pour utiliser l’assistant réglementaire.',invalidRequest:'Requête non valide.',question:'Saisissez une question de 2 000 caractères maximum.',productInvalid:'Le produit sélectionné n’est pas valide.',rateLimit:'Trop de requêtes ont été effectuées en peu de temps. Réessayez plus tard.',analysisLoad:'Impossible de charger l’analyse.',analysisMissing:'Analyse introuvable.',productMissing:'Le produit sélectionné n’existe pas dans cette analyse.',evidenceLoad:'Impossible de charger les preuves du produit.',radarLoad:'Impossible de charger le contexte réglementaire officiel.',assistantFailure:'Impossible d’interroger l’assistant.',disclaimer:'Orientation réglementaire uniquement. Il ne s’agit ni d’une certification, ni d’un avis juridique, ni d’une approbation d’une autorité.'},
  de:{...es,origin:'Anfrageursprung ist nicht zulässig.',signIn:'Melden Sie sich an, um den regulatorischen Assistenten zu verwenden.',invalidRequest:'Ungültige Anfrage.',question:'Geben Sie eine Frage mit höchstens 2.000 Zeichen ein.',productInvalid:'Das ausgewählte Produkt ist ungültig.',rateLimit:'Es wurden zu viele Anfragen in kurzer Zeit gestellt. Versuchen Sie es später erneut.',analysisLoad:'Die Analyse konnte nicht geladen werden.',analysisMissing:'Analyse nicht gefunden.',productMissing:'Das ausgewählte Produkt ist in dieser Analyse nicht vorhanden.',evidenceLoad:'Die Nachweise des Produkts konnten nicht geladen werden.',radarLoad:'Der offizielle regulatorische Kontext konnte nicht geladen werden.',assistantFailure:'Der Assistent konnte nicht abgefragt werden.',disclaimer:'Nur regulatorische Orientierung. Dies ist weder Zertifizierung noch Rechtsberatung oder behördliche Genehmigung.'},
  it:{...es,origin:'Origine della richiesta non consentita.',signIn:'Accedi per usare l’assistente normativo.',invalidRequest:'Richiesta non valida.',question:'Inserisci una domanda di massimo 2.000 caratteri.',productInvalid:'Il prodotto selezionato non è valido.',rateLimit:'Sono state effettuate troppe richieste in poco tempo. Riprova più tardi.',analysisLoad:'Impossibile caricare l’analisi.',analysisMissing:'Analisi non trovata.',productMissing:'Il prodotto selezionato non esiste in questa analisi.',evidenceLoad:'Impossibile caricare le evidenze del prodotto.',radarLoad:'Impossibile caricare il contesto normativo ufficiale.',assistantFailure:'Impossibile interrogare l’assistente.',disclaimer:'Solo orientamento normativo. Non costituisce certificazione, consulenza legale o approvazione di un’autorità.'},
  pt:{...es,origin:'Origem do pedido não permitida.',signIn:'Inicie sessão para utilizar o assistente regulamentar.',invalidRequest:'Pedido inválido.',question:'Introduza uma pergunta com até 2.000 caracteres.',productInvalid:'O produto selecionado não é válido.',rateLimit:'Foram efetuados demasiados pedidos num curto período. Tente novamente mais tarde.',analysisLoad:'Não foi possível carregar a análise.',analysisMissing:'Análise não encontrada.',productMissing:'O produto selecionado não existe nesta análise.',evidenceLoad:'Não foi possível carregar a evidência do produto.',radarLoad:'Não foi possível carregar o contexto regulamentar oficial.',assistantFailure:'Não foi possível consultar o assistente.',disclaimer:'Apenas orientação regulamentar. Não constitui certificação, aconselhamento jurídico nem aprovação de uma autoridade.'},
};

export function regulatoryAgentText(language: Language, key: RegulatoryAgentMessageKey): string {
  return regulatoryAgentCopy[language][key];
}
