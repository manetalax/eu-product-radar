import type { Language } from './landing-i18n';

const GUIDE_SCOPE_BY_LANGUAGE: Record<Language, string> = {
  es: 'Guía orientativa: un campo vacío no demuestra incumplimiento. No se han recibido ni validado documentos. Los requisitos exactos dependen de la categoría, características, mercado de venta y papel del operador.',
  en: 'Guidance only: an empty field does not prove non-compliance. No documents have been received or validated. Exact requirements depend on the category, characteristics, sales market and operator role.',
  fr: 'Guide indicatif : un champ vide ne prouve pas une non-conformité. Aucun document n’a été reçu ni validé. Les exigences exactes dépendent de la catégorie, des caractéristiques, du marché de vente et du rôle de l’opérateur.',
  de: 'Orientierungshilfe: Ein leeres Feld beweist keine Nichtkonformität. Es wurden keine Dokumente erhalten oder validiert. Die genauen Anforderungen hängen von Kategorie, Eigenschaften, Absatzmarkt und Rolle des Wirtschaftsakteurs ab.',
  it: 'Guida orientativa: un campo vuoto non dimostra una non conformità. Non sono stati ricevuti né validati documenti. I requisiti esatti dipendono dalla categoria, dalle caratteristiche, dal mercato di vendita e dal ruolo dell’operatore.',
  pt: 'Guia orientativo: um campo vazio não demonstra incumprimento. Não foram recebidos nem validados documentos. Os requisitos exatos dependem da categoria, características, mercado de venda e papel do operador.',
};

export function guideScopeFor(language: Language): string {
  return GUIDE_SCOPE_BY_LANGUAGE[language];
}

export const guideScopeByLanguage = GUIDE_SCOPE_BY_LANGUAGE;
