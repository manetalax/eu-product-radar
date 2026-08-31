import type { Language } from './landing-i18n';
import type { MarketReadinessDecision } from './market-readiness';

const exact: Record<string, Record<Exclude<Language, 'es'>, string>> = {
  'Falta identificar al fabricante.': {
    en:'Manufacturer identification is missing.', fr:'L’identification du fabricant est manquante.', de:'Die Herstelleridentifikation fehlt.', it:'Manca l’identificazione del fabbricante.', pt:'Falta a identificação do fabricante.'
  },
  'Falta determinar el operador económico responsable en la UE cuando proceda.': {
    en:'The responsible EU economic operator still needs to be identified where applicable.', fr:'L’opérateur économique responsable dans l’UE doit encore être identifié lorsque cela s’applique.', de:'Der verantwortliche Wirtschaftsakteur in der EU muss, soweit erforderlich, noch bestimmt werden.', it:'Occorre ancora identificare l’operatore economico responsabile nell’UE quando applicabile.', pt:'Ainda é necessário identificar o operador económico responsável na UE, quando aplicável.'
  },
  'No se han aportado advertencias o instrucciones de seguridad.': {
    en:'No warnings or safety instructions have been supplied.', fr:'Aucun avertissement ni instruction de sécurité n’a été fourni.', de:'Es wurden keine Warnhinweise oder Sicherheitsanweisungen bereitgestellt.', it:'Non sono state fornite avvertenze o istruzioni di sicurezza.', pt:'Não foram fornecidos avisos ou instruções de segurança.'
  },
  'La categoría regulatoria necesita confirmación con más características o uso previsto.': {
    en:'The regulatory category needs confirmation using additional characteristics or intended-use information.', fr:'La catégorie réglementaire doit être confirmée à l’aide de caractéristiques supplémentaires ou de l’usage prévu.', de:'Die regulatorische Kategorie muss anhand weiterer Merkmale oder des Verwendungszwecks bestätigt werden.', it:'La categoria normativa deve essere confermata con ulteriori caratteristiche o informazioni sull’uso previsto.', pt:'A categoria regulamentar precisa de confirmação com características adicionais ou informação sobre a utilização prevista.'
  },
  'Completar los datos de trazabilidad obligatorios antes de comercializar.': {
    en:'Complete mandatory traceability data before placing the product on the market.', fr:'Compléter les données de traçabilité obligatoires avant la mise sur le marché.', de:'Pflichtangaben zur Rückverfolgbarkeit vor dem Inverkehrbringen vervollständigen.', it:'Completare i dati obbligatori di tracciabilità prima dell’immissione sul mercato.', pt:'Completar os dados obrigatórios de rastreabilidade antes da colocação no mercado.'
  },
  'Confirmar categoría, uso previsto y legislación sectorial aplicable.': {
    en:'Confirm the category, intended use and applicable sector legislation.', fr:'Confirmer la catégorie, l’usage prévu et la législation sectorielle applicable.', de:'Kategorie, Verwendungszweck und anwendbare sektorale Vorschriften bestätigen.', it:'Confermare categoria, uso previsto e normativa settoriale applicabile.', pt:'Confirmar a categoria, a utilização prevista e a legislação setorial aplicável.'
  },
  'No faltan los campos básicos de trazabilidad y no se ha detectado una incertidumbre crítica con los datos disponibles.': {
    en:'No basic traceability fields are missing and no critical uncertainty has been detected from the available data.', fr:'Aucun champ de traçabilité de base ne manque et aucune incertitude critique n’a été détectée à partir des données disponibles.', de:'Es fehlen keine grundlegenden Rückverfolgbarkeitsangaben und anhand der verfügbaren Daten wurde keine kritische Unsicherheit festgestellt.', it:'Non mancano i campi base di tracciabilità e dai dati disponibili non emerge alcuna incertezza critica.', pt:'Não faltam campos básicos de rastreabilidade e não foi detetada qualquer incerteza crítica com os dados disponíveis.'
  },
  'Continuar con la verificación documental y técnica específica antes de comercializar.': {
    en:'Continue with product-specific documentary and technical verification before placing it on the market.', fr:'Poursuivre la vérification documentaire et technique spécifique au produit avant sa mise sur le marché.', de:'Vor dem Inverkehrbringen mit der produktspezifischen dokumentarischen und technischen Prüfung fortfahren.', it:'Proseguire con la verifica documentale e tecnica specifica prima dell’immissione sul mercato.', pt:'Continuar com a verificação documental e técnica específica antes da colocação no mercado.'
  },
};

const labels: Record<MarketReadinessDecision['state'], Record<Language, string>> = {
  NOT_READY_TO_MARKET: { es:'No listo para comercializar', en:'Not ready for market', fr:'Pas prêt pour la mise sur le marché', de:'Nicht bereit für das Inverkehrbringen', it:'Non pronto per il mercato', pt:'Não pronto para colocação no mercado' },
  REVIEW_REQUIRED: { es:'Revisión necesaria', en:'Review required', fr:'Révision nécessaire', de:'Prüfung erforderlich', it:'Revisione necessaria', pt:'Revisão necessária' },
  READY_TO_CONTINUE: { es:'Apto para continuar la revisión', en:'Ready to continue review', fr:'Prêt à poursuivre l’examen', de:'Bereit zur weiteren Prüfung', it:'Pronto per proseguire la revisione', pt:'Pronto para continuar a revisão' },
};

function text(value: string, language: Language) {
  return language === 'es' ? value : exact[value]?.[language] ?? value;
}

export function localizeMarketReadiness(decision: MarketReadinessDecision, language: Language): MarketReadinessDecision {
  if (language === 'es') return decision;
  return {
    ...decision,
    label: labels[decision.state][language],
    reasons: decision.reasons.map(value => text(value, language)),
    blockers: decision.blockers.map(value => text(value, language)),
    nextActions: decision.nextActions.map(value => text(value, language)),
  };
}
