import type { Language } from './landing-i18n';

export const LEGAL_COPY_UPDATED = '01/09/2026';

export function canonicalLegalBrand(value: string) {
  return value.replaceAll('Import Rules Verifier', 'ImportVerifier');
}

type CommercialTerms = {
  offerTitle: string;
  offerBody: string;
  paymentsTitle: string;
  paymentsBody: string;
};

export const commercialTerms: Record<Language, CommercialTerms> = {
  es: {
    offerTitle: 'Unlimited y modalidades de pago',
    offerBody: 'ImportVerifier Unlimited ofrece las mismas funciones mediante tres modalidades: 9,95 € al mes, 89,95 € al año o Lifetime por 149 € en un único pago. Los planes mensual y anual se renuevan automáticamente hasta su cancelación. Lifetime no es una suscripción y no tiene renovación periódica: concede acceso Unlimited mientras exista el servicio ImportVerifier y la cuenta permanezca válida, sujeto a estos términos, a las medidas razonables contra abuso y a las causas legítimas de suspensión o terminación. Lifetime no constituye una garantía de que el servicio vaya a operar indefinidamente.',
    paymentsTitle: 'Pagos, renovaciones, cancelación y Lifetime',
    paymentsBody: 'Stripe muestra el importe y las condiciones antes de confirmar el pago. La cancelación de una suscripción mensual o anual evita futuras renovaciones y mantiene el acceso pagado hasta el final del periodo ya abonado, salvo supuestos legalmente permitidos de suspensión. Lifetime se cobra una sola vez y no genera renovaciones automáticas. Los reembolsos, devoluciones, contracargos o disputas pueden suspender o revocar el acceso correspondiente cuando proceda, sin limitar los derechos irrenunciables que reconozca la normativa aplicable.',
  },
  en: {
    offerTitle: 'Unlimited and payment options',
    offerBody: 'ImportVerifier Unlimited provides the same features through three payment options: €9.95 per month, €89.95 per year, or Lifetime for a single €149 payment. Monthly and annual plans renew automatically until cancelled. Lifetime is not a subscription and has no recurring renewal: it grants Unlimited access while the ImportVerifier service exists and the account remains valid, subject to these terms, reasonable anti-abuse safeguards and legitimate suspension or termination grounds. Lifetime is not a guarantee that the service will operate indefinitely.',
    paymentsTitle: 'Payments, renewals, cancellation and Lifetime',
    paymentsBody: 'Stripe displays the amount and terms before payment is confirmed. Cancelling a monthly or annual subscription prevents future renewals and keeps paid access until the end of the already paid period, except where suspension is legally permitted. Lifetime is charged once and does not renew automatically. Refunds, reversals, chargebacks or disputes may suspend or revoke the corresponding access where appropriate, without limiting mandatory consumer rights under applicable law.',
  },
  fr: {
    offerTitle: 'Unlimited et modalités de paiement',
    offerBody: 'ImportVerifier Unlimited offre les mêmes fonctionnalités selon trois modalités : 9,95 € par mois, 89,95 € par an ou Lifetime pour un paiement unique de 149 €. Les formules mensuelle et annuelle sont renouvelées automatiquement jusqu’à résiliation. Lifetime n’est pas un abonnement et ne comporte aucun renouvellement périodique : il donne accès à Unlimited tant que le service ImportVerifier existe et que le compte reste valide, sous réserve des présentes conditions, des mesures raisonnables contre les abus et des motifs légitimes de suspension ou de résiliation. Lifetime ne garantit pas que le service fonctionnera indéfiniment.',
    paymentsTitle: 'Paiements, renouvellements, résiliation et Lifetime',
    paymentsBody: 'Stripe affiche le montant et les conditions avant confirmation du paiement. La résiliation d’un abonnement mensuel ou annuel empêche les renouvellements futurs et maintient l’accès payé jusqu’à la fin de la période déjà réglée, sauf suspension légalement permise. Lifetime est facturé une seule fois et ne se renouvelle pas automatiquement. Les remboursements, annulations de paiement, rétrofacturations ou litiges peuvent suspendre ou révoquer l’accès correspondant lorsque cela est justifié, sans limiter les droits impératifs prévus par la loi applicable.',
  },
  de: {
    offerTitle: 'Unlimited und Zahlungsoptionen',
    offerBody: 'ImportVerifier Unlimited bietet dieselben Funktionen über drei Zahlungsoptionen: 9,95 € pro Monat, 89,95 € pro Jahr oder Lifetime für eine einmalige Zahlung von 149 €. Monats- und Jahrespläne verlängern sich automatisch bis zur Kündigung. Lifetime ist kein Abonnement und hat keine regelmäßige Verlängerung: Es gewährt Unlimited-Zugang, solange der ImportVerifier-Dienst besteht und das Konto gültig bleibt, vorbehaltlich dieser Bedingungen, angemessener Missbrauchsschutzmaßnahmen und berechtigter Sperr- oder Beendigungsgründe. Lifetime ist keine Garantie dafür, dass der Dienst unbegrenzt betrieben wird.',
    paymentsTitle: 'Zahlungen, Verlängerungen, Kündigung und Lifetime',
    paymentsBody: 'Stripe zeigt Betrag und Bedingungen vor Bestätigung der Zahlung. Die Kündigung eines Monats- oder Jahresabonnements verhindert künftige Verlängerungen; der bezahlte Zugang bleibt bis zum Ende des bereits bezahlten Zeitraums bestehen, soweit keine rechtlich zulässige Sperre greift. Lifetime wird einmalig berechnet und verlängert sich nicht automatisch. Erstattungen, Rückbuchungen, Chargebacks oder Streitfälle können den zugehörigen Zugang gegebenenfalls sperren oder widerrufen, ohne zwingende Verbraucherrechte nach anwendbarem Recht einzuschränken.',
  },
  it: {
    offerTitle: 'Unlimited e modalità di pagamento',
    offerBody: 'ImportVerifier Unlimited offre le stesse funzionalità con tre modalità di pagamento: 9,95 € al mese, 89,95 € all’anno oppure Lifetime con un unico pagamento di 149 €. I piani mensile e annuale si rinnovano automaticamente fino alla cancellazione. Lifetime non è un abbonamento e non prevede rinnovi periodici: concede accesso Unlimited finché il servizio ImportVerifier esiste e l’account rimane valido, nel rispetto di questi termini, delle ragionevoli misure antiabuso e dei legittimi motivi di sospensione o cessazione. Lifetime non garantisce che il servizio operi indefinitamente.',
    paymentsTitle: 'Pagamenti, rinnovi, cancellazione e Lifetime',
    paymentsBody: 'Stripe mostra importo e condizioni prima della conferma del pagamento. La cancellazione di un abbonamento mensile o annuale impedisce rinnovi futuri e mantiene l’accesso pagato fino alla fine del periodo già corrisposto, salvo sospensioni legalmente consentite. Lifetime viene addebitato una sola volta e non si rinnova automaticamente. Rimborsi, storni, chargeback o contestazioni possono sospendere o revocare l’accesso corrispondente quando appropriato, senza limitare i diritti inderogabili previsti dalla normativa applicabile.',
  },
  pt: {
    offerTitle: 'Unlimited e modalidades de pagamento',
    offerBody: 'O ImportVerifier Unlimited disponibiliza as mesmas funcionalidades através de três modalidades: 9,95 € por mês, 89,95 € por ano ou Lifetime por um pagamento único de 149 €. Os planos mensal e anual renovam-se automaticamente até ao cancelamento. Lifetime não é uma subscrição e não tem renovação periódica: concede acesso Unlimited enquanto o serviço ImportVerifier existir e a conta permanecer válida, sujeito a estes termos, a medidas razoáveis contra abuso e a motivos legítimos de suspensão ou cessação. Lifetime não constitui garantia de que o serviço funcionará indefinidamente.',
    paymentsTitle: 'Pagamentos, renovações, cancelamento e Lifetime',
    paymentsBody: 'O Stripe apresenta o montante e as condições antes da confirmação do pagamento. O cancelamento de uma subscrição mensal ou anual impede futuras renovações e mantém o acesso pago até ao fim do período já pago, salvo suspensão legalmente permitida. Lifetime é cobrado uma única vez e não se renova automaticamente. Reembolsos, reversões, chargebacks ou disputas podem suspender ou revogar o acesso correspondente quando aplicável, sem limitar direitos imperativos previstos na legislação aplicável.',
  },
};
