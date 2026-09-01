import type { BillingStatus } from './billing';
import type { Language } from './landing-i18n';

export const FREE_ACCOUNT_PRODUCT_LIMIT = 5;

export type ProductQuota = {
  limit: number;
  used: number;
  remaining: number;
  periodStart: string;
  billing: BillingStatus;
};

export function productQuota(used: number, _now = new Date(), billing: BillingStatus = { planId: 'free', planName: 'Gratis', status: null, productLimit: FREE_ACCOUNT_PRODUCT_LIMIT, currentPeriodEnd: null, cancelAtPeriodEnd: false, billingOption: null }): ProductQuota {
  const safeUsed = Number.isFinite(used) && used > 0 ? Math.floor(used) : 0;
  const paid = billing.planId !== 'free';
  return {
    limit: billing.productLimit,
    used: safeUsed,
    remaining: paid ? billing.productLimit : Math.max(0, billing.productLimit - safeUsed),
    periodStart: billing.planId === 'free' ? 'lifetime' : 'subscription',
    billing,
  };
}

export function quotaExceededMessage(incomingProducts: number, quota: ProductQuota, language: Language = 'es'): string {
  const free = {
    es:`Tu prueba gratuita incluye 5 productos en total por cuenta. Este archivo contiene ${incomingProducts} y te quedan ${quota.remaining}. No se ha guardado ningún producto.`,
    en:`Your free trial includes 5 products in total per account. This file contains ${incomingProducts} and you have ${quota.remaining} left. No products have been saved.`,
    fr:`Votre essai gratuit comprend 5 produits au total par compte. Ce fichier en contient ${incomingProducts} et il vous en reste ${quota.remaining}. Aucun produit n’a été enregistré.`,
    de:`Ihre kostenlose Testversion umfasst insgesamt 5 Produkte pro Konto. Diese Datei enthält ${incomingProducts}; Ihnen bleiben ${quota.remaining}. Es wurden keine Produkte gespeichert.`,
    it:`La prova gratuita include 5 prodotti totali per account. Questo file ne contiene ${incomingProducts} e te ne restano ${quota.remaining}. Nessun prodotto è stato salvato.`,
    pt:`O teste gratuito inclui 5 produtos no total por conta. Este ficheiro contém ${incomingProducts} e restam ${quota.remaining}. Nenhum produto foi guardado.`,
  } as const;
  const technical = {
    es:'La solicitud supera una protección técnica del servicio. Divide el catálogo en archivos más pequeños y vuelve a intentarlo.',
    en:'The request exceeds a technical service safeguard. Split the catalogue into smaller files and try again.',
    fr:'La demande dépasse une protection technique du service. Divisez le catalogue en fichiers plus petits et réessayez.',
    de:'Die Anfrage überschreitet eine technische Schutzgrenze des Dienstes. Teilen Sie den Katalog in kleinere Dateien und versuchen Sie es erneut.',
    it:'La richiesta supera una protezione tecnica del servizio. Dividi il catalogo in file più piccoli e riprova.',
    pt:'O pedido excede uma proteção técnica do serviço. Divida o catálogo em ficheiros mais pequenos e tente novamente.',
  } as const;
  if (quota.billing.planId === 'free') return free[language];
  return technical[language];
}
