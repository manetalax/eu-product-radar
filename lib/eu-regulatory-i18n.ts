import type { Language } from './landing-i18n';
import type { EuRegulatoryAssessment, RegulatoryObligation } from './eu-regulatory-engine';

const categoryCopy: Record<string, Record<Exclude<Language,'es'>, string>> = {
  'Juguete': { en:'Toy', fr:'Jouet', de:'Spielzeug', it:'Giocattolo', pt:'Brinquedo' },
  'Equipo radioeléctrico': { en:'Radio equipment', fr:'Équipement radioélectrique', de:'Funkanlage', it:'Apparecchiatura radio', pt:'Equipamento de rádio' },
  'Equipo eléctrico': { en:'Electrical equipment', fr:'Équipement électrique', de:'Elektrisches Gerät', it:'Apparecchiatura elettrica', pt:'Equipamento elétrico' },
  'Batería o producto con batería': { en:'Battery or battery-powered product', fr:'Batterie ou produit avec batterie', de:'Batterie oder Produkt mit Batterie', it:'Batteria o prodotto con batteria', pt:'Bateria ou produto com bateria' },
  'Equipo de protección individual': { en:'Personal protective equipment', fr:'Équipement de protection individuelle', de:'Persönliche Schutzausrüstung', it:'Dispositivo di protezione individuale', pt:'Equipamento de proteção individual' },
  'Producto cosmético': { en:'Cosmetic product', fr:'Produit cosmétique', de:'Kosmetisches Mittel', it:'Prodotto cosmetico', pt:'Produto cosmético' },
  'Posible producto sanitario': { en:'Possible medical device', fr:'Dispositif médical possible', de:'Mögliches Medizinprodukt', it:'Possibile dispositivo medico', pt:'Possível dispositivo médico' },
  'Posible maquinaria': { en:'Possible machinery', fr:'Machine possible', de:'Mögliche Maschine', it:'Possibile macchina', pt:'Possível máquina' },
  'Producto textil': { en:'Textile product', fr:'Produit textile', de:'Textilerzeugnis', it:'Prodotto tessile', pt:'Produto têxtil' },
  'Calzado': { en:'Footwear', fr:'Chaussures', de:'Schuhe', it:'Calzature', pt:'Calçado' },
  'Artículo en contacto con alimentos': { en:'Food-contact article', fr:'Article au contact des aliments', de:'Lebensmittelkontaktartikel', it:'Articolo a contatto con alimenti', pt:'Artigo em contacto com alimentos' },
  'Detergente o producto de limpieza': { en:'Detergent or cleaning product', fr:'Détergent ou produit de nettoyage', de:'Wasch- oder Reinigungsmittel', it:'Detergente o prodotto per la pulizia', pt:'Detergente ou produto de limpeza' },
  'Sustancia o mezcla química': { en:'Chemical substance or mixture', fr:'Substance ou mélange chimique', de:'Chemischer Stoff oder Gemisch', it:'Sostanza o miscela chimica', pt:'Substância ou mistura química' },
  'Mueble o artículo de mobiliario': { en:'Furniture or furnishing article', fr:'Meuble ou article d’ameublement', de:'Möbel oder Einrichtungsgegenstand', it:'Mobile o articolo di arredamento', pt:'Móvel ou artigo de mobiliário' },
  'Producto infantil no clasificado aún como juguete': { en:'Children’s product not yet classified as a toy', fr:'Produit pour enfants non encore classé comme jouet', de:'Kinderprodukt, noch nicht als Spielzeug eingestuft', it:'Prodotto per bambini non ancora classificato come giocattolo', pt:'Produto infantil ainda não classificado como brinquedo' },
  'Envase o producto de embalaje': { en:'Packaging or packaging product', fr:'Emballage ou produit d’emballage', de:'Verpackung oder Verpackungsprodukt', it:'Imballaggio o prodotto di imballaggio', pt:'Embalagem ou produto de embalagem' },
  'Producto de consumo — categoría por confirmar': { en:'Consumer product — category to be confirmed', fr:'Produit de consommation — catégorie à confirmer', de:'Verbraucherprodukt — Kategorie zu bestätigen', it:'Prodotto di consumo — categoria da confermare', pt:'Produto de consumo — categoria a confirmar' },
};

type L = Exclude<Language,'es'>;
type TextSet = Record<L,string>;

const text = {
  baselineReason: {
    en:'Horizontal consumer-product safety framework, without prejudice to more specific sector rules and their precise scope.',
    fr:'Cadre horizontal de sécurité des produits de consommation, sans préjudice des règles sectorielles plus spécifiques et de leur champ exact.',
    de:'Horizontaler Sicherheitsrahmen für Verbraucherprodukte, unbeschadet spezifischerer sektoraler Vorschriften und ihres genauen Anwendungsbereichs.',
    it:'Quadro orizzontale di sicurezza dei prodotti di consumo, fatte salve norme settoriali più specifiche e il loro preciso ambito di applicazione.',
    pt:'Quadro horizontal de segurança dos produtos de consumo, sem prejuízo de regras setoriais mais específicas e do seu âmbito exato.',
  },
  candidateReason: {
    en:'Candidate rule based on the preliminary category “{category}”; confirm it against product characteristics and intended use.',
    fr:'Règle candidate fondée sur la catégorie préliminaire « {category} » ; confirmez-la à partir des caractéristiques et de l’usage prévu.',
    de:'Mögliche Vorschrift aufgrund der vorläufigen Kategorie „{category}“; anhand der Produkteigenschaften und des Verwendungszwecks bestätigen.',
    it:'Norma candidata basata sulla categoria preliminare “{category}”; confermarla in base alle caratteristiche e all’uso previsto.',
    pt:'Regra candidata com base na categoria preliminar «{category}»; confirme-a com as características e a utilização prevista.',
  },
  uncertainty: {
    en:'Confirm the candidate category, intended use, technical characteristics and any exclusions before relying on this assessment.',
    fr:'Confirmez la catégorie candidate, l’usage prévu, les caractéristiques techniques et les éventuelles exclusions avant de vous appuyer sur cette évaluation.',
    de:'Vor Nutzung dieser Bewertung die mögliche Kategorie, den Verwendungszweck, die technischen Eigenschaften und etwaige Ausnahmen bestätigen.',
    it:'Confermare la categoria candidata, l’uso previsto, le caratteristiche tecniche e le eventuali esclusioni prima di fare affidamento su questa valutazione.',
    pt:'Confirme a categoria candidata, a utilização prevista, as características técnicas e eventuais exclusões antes de se basear nesta avaliação.',
  },
  disclaimer: {
    en:'Automated regulatory-assistance assessment. It is not certification, approval by an EU authority or legal advice. Final applicability depends on the product’s characteristics, intended purpose, composition, risks, application dates and specific market.',
    fr:'Évaluation automatisée d’assistance réglementaire. Elle ne constitue ni une certification, ni une approbation d’une autorité de l’UE, ni un conseil juridique. L’applicabilité finale dépend des caractéristiques, de la destination, de la composition, des risques, des dates d’application et du marché précis du produit.',
    de:'Automatisierte regulatorische Unterstützungsbewertung. Sie ist weder Zertifizierung noch Genehmigung einer EU-Behörde oder Rechtsberatung. Die endgültige Anwendbarkeit hängt von Eigenschaften, Verwendungszweck, Zusammensetzung, Risiken, Anwendungsdaten und dem konkreten Markt des Produkts ab.',
    it:'Valutazione automatizzata di assistenza normativa. Non costituisce certificazione, approvazione di un’autorità UE o consulenza legale. L’applicabilità finale dipende da caratteristiche, destinazione d’uso, composizione, rischi, date di applicazione e mercato specifico del prodotto.',
    pt:'Avaliação automatizada de assistência regulamentar. Não constitui certificação, aprovação de uma autoridade da UE nem aconselhamento jurídico. A aplicabilidade final depende das características, finalidade prevista, composição, riscos, datas de aplicação e mercado específico do produto.',
  },
} satisfies Record<string, TextSet>;

const baseObligationCopy: Record<string, Record<L,{title:string;reason:string;evidence:string[]}>> = {
  'identify-applicable-rules': {
    en:{title:'Identify all applicable rules before placing the product on the market',reason:'A product may be subject to horizontal and sector-specific legislation at the same time.',evidence:['Product description and intended use','Classification/category','List of applicable acts and standards']},
    fr:{title:'Identifier toutes les règles applicables avant la mise sur le marché',reason:'Un produit peut relever simultanément de la législation horizontale et sectorielle.',evidence:['Description et usage prévu','Classification/catégorie','Liste des actes et normes applicables']},
    de:{title:'Alle anwendbaren Vorschriften vor dem Inverkehrbringen bestimmen',reason:'Ein Produkt kann gleichzeitig horizontalen und sektorspezifischen Vorschriften unterliegen.',evidence:['Produktbeschreibung und Verwendungszweck','Einstufung/Kategorie','Liste anwendbarer Rechtsakte und Normen']},
    it:{title:'Individuare tutte le norme applicabili prima dell’immissione sul mercato',reason:'Un prodotto può essere soggetto contemporaneamente a normativa orizzontale e settoriale.',evidence:['Descrizione e uso previsto','Classificazione/categoria','Elenco di atti e norme applicabili']},
    pt:{title:'Identificar todas as regras aplicáveis antes da colocação no mercado',reason:'Um produto pode estar sujeito simultaneamente a legislação horizontal e setorial.',evidence:['Descrição e utilização prevista','Classificação/categoria','Lista de atos e normas aplicáveis']},
  },
  traceability: {
    en:{title:'Check product and economic-operator identification and traceability',reason:'EU marketing rules require information that identifies the product and the responsible economic operators where applicable.',evidence:['Product/batch/serial identifier','Manufacturer name and address','EU-established economic operator where applicable']},
    fr:{title:'Vérifier l’identification et la traçabilité du produit et des opérateurs économiques',reason:'Les règles de mise sur le marché de l’UE exigent des informations permettant d’identifier le produit et les opérateurs économiques responsables lorsqu’ils sont requis.',evidence:['Identifiant produit/lot/série','Nom et adresse du fabricant','Opérateur économique établi dans l’UE si applicable']},
    de:{title:'Identifikation und Rückverfolgbarkeit von Produkt und Wirtschaftsakteuren prüfen',reason:'EU-Vermarktungsvorschriften verlangen Angaben zur Identifizierung des Produkts und der verantwortlichen Wirtschaftsakteure, soweit anwendbar.',evidence:['Produkt-/Chargen-/Serienkennung','Name und Anschrift des Herstellers','In der EU niedergelassener Wirtschaftsakteur, soweit erforderlich']},
    it:{title:'Verificare identificazione e tracciabilità del prodotto e degli operatori economici',reason:'Le regole UE di commercializzazione richiedono informazioni che identifichino il prodotto e gli operatori economici responsabili quando applicabile.',evidence:['Identificativo prodotto/lotto/serie','Nome e indirizzo del fabbricante','Operatore economico stabilito nell’UE quando applicabile']},
    pt:{title:'Verificar identificação e rastreabilidade do produto e dos operadores económicos',reason:'As regras de comercialização da UE exigem informação que identifique o produto e os operadores económicos responsáveis quando aplicável.',evidence:['Identificador do produto/lote/série','Nome e endereço do fabricante','Operador económico estabelecido na UE quando aplicável']},
  },
  'safety-information': {
    en:{title:'Check instructions and safety information',reason:'Warnings and instructions must be appropriate to the product, its risks and the destination market.',evidence:['Manual/instructions','Warnings','Languages required by destination Member States']},
    fr:{title:'Vérifier les instructions et les informations de sécurité',reason:'Les avertissements et instructions doivent être adaptés au produit, à ses risques et au marché de destination.',evidence:['Manuel/instructions','Avertissements','Langues exigées par les États membres de destination']},
    de:{title:'Anleitungen und Sicherheitsinformationen prüfen',reason:'Warnhinweise und Anleitungen müssen zum Produkt, seinen Risiken und dem Zielmarkt passen.',evidence:['Handbuch/Anleitungen','Warnhinweise','Von den Zielmitgliedstaaten verlangte Sprachen']},
    it:{title:'Verificare istruzioni e informazioni di sicurezza',reason:'Avvertenze e istruzioni devono essere adeguate al prodotto, ai rischi e al mercato di destinazione.',evidence:['Manuale/istruzioni','Avvertenze','Lingue richieste dagli Stati membri di destinazione']},
    pt:{title:'Verificar instruções e informações de segurança',reason:'Os avisos e instruções devem ser adequados ao produto, aos seus riscos e ao mercado de destino.',evidence:['Manual/instruções','Avisos','Idiomas exigidos pelos Estados-Membros de destino']},
  },
  'technical-evidence': {
    en:{title:'Collect technical evidence of safety and compliance',reason:'Documentation should support the applicable obligations and allow a response to market-surveillance requests.',evidence:['Risk assessment','Relevant tests/certificates','Technical file or documentation where sector legislation requires it']},
    fr:{title:'Rassembler les preuves techniques de sécurité et de conformité',reason:'La documentation doit étayer les obligations applicables et permettre de répondre à la surveillance du marché.',evidence:['Évaluation des risques','Essais/certificats pertinents','Dossier ou documentation technique lorsque la législation sectorielle l’exige']},
    de:{title:'Technische Nachweise für Sicherheit und Konformität zusammenstellen',reason:'Die Dokumentation soll die anwendbaren Pflichten belegen und Antworten auf Marktüberwachungsanfragen ermöglichen.',evidence:['Risikobewertung','Relevante Prüfungen/Zertifikate','Technische Unterlagen, soweit sektorspezifisch vorgeschrieben']},
    it:{title:'Raccogliere evidenze tecniche di sicurezza e conformità',reason:'La documentazione deve supportare gli obblighi applicabili e consentire di rispondere alla vigilanza del mercato.',evidence:['Valutazione dei rischi','Prove/certificati pertinenti','Fascicolo o documentazione tecnica ove richiesto dalla normativa settoriale']},
    pt:{title:'Reunir evidência técnica de segurança e conformidade',reason:'A documentação deve sustentar as obrigações aplicáveis e permitir responder à fiscalização do mercado.',evidence:['Avaliação de riscos','Ensaios/certificados relevantes','Dossier ou documentação técnica quando exigida pela legislação setorial']},
  },
  'missing-manufacturer': {
    en:{title:'Complete manufacturer information',reason:'The catalogue does not provide an identifiable manufacturer.',evidence:['Legal name','Postal address/contact']},
    fr:{title:'Compléter les informations du fabricant',reason:'Le catalogue ne fournit pas de fabricant identifiable.',evidence:['Dénomination légale','Adresse postale/contact']},
    de:{title:'Herstellerangaben vervollständigen',reason:'Der Katalog enthält keinen identifizierbaren Hersteller.',evidence:['Rechtlicher Name','Postanschrift/Kontakt']},
    it:{title:'Completare i dati del fabbricante',reason:'Il catalogo non indica un fabbricante identificabile.',evidence:['Denominazione legale','Indirizzo postale/contatto']},
    pt:{title:'Completar informação do fabricante',reason:'O catálogo não apresenta um fabricante identificável.',evidence:['Nome legal','Endereço postal/contacto']},
  },
  'missing-eu-operator': {
    en:{title:'Determine the responsible EU economic operator where applicable',reason:'The catalogue does not provide the applicable responsible operator/importer/responsible person.',evidence:['Legal name','EU address','Exact role']},
    fr:{title:'Déterminer l’opérateur économique responsable dans l’UE si applicable',reason:'Le catalogue n’indique pas l’opérateur/importateur/personne responsable applicable.',evidence:['Dénomination légale','Adresse dans l’UE','Rôle exact']},
    de:{title:'Verantwortlichen EU-Wirtschaftsakteur bestimmen, soweit erforderlich',reason:'Der Katalog enthält keinen anwendbaren verantwortlichen Akteur/Importeur/verantwortliche Person.',evidence:['Rechtlicher Name','EU-Anschrift','Genaue Rolle']},
    it:{title:'Determinare l’operatore economico responsabile nell’UE quando applicabile',reason:'Il catalogo non indica l’operatore/importatore/persona responsabile applicabile.',evidence:['Denominazione legale','Indirizzo UE','Ruolo esatto']},
    pt:{title:'Determinar o operador económico responsável na UE quando aplicável',reason:'O catálogo não apresenta o operador/importador/pessoa responsável aplicável.',evidence:['Nome legal','Endereço na UE','Função exata']},
  },
  'missing-warnings': {
    en:{title:'Review safety warnings and instructions',reason:'The catalogue does not provide safety warnings.',evidence:['Warnings','Safe-use instructions','Destination-market language']},
    fr:{title:'Examiner les avertissements et instructions de sécurité',reason:'Le catalogue ne fournit pas d’avertissements de sécurité.',evidence:['Avertissements','Instructions d’utilisation sûre','Langue du marché de destination']},
    de:{title:'Sicherheitswarnungen und Anleitungen prüfen',reason:'Der Katalog enthält keine Sicherheitswarnungen.',evidence:['Warnhinweise','Anleitungen zur sicheren Verwendung','Sprache des Zielmarktes']},
    it:{title:'Verificare avvertenze e istruzioni di sicurezza',reason:'Il catalogo non contiene avvertenze di sicurezza.',evidence:['Avvertenze','Istruzioni per uso sicuro','Lingua del mercato di destinazione']},
    pt:{title:'Rever avisos e instruções de segurança',reason:'O catálogo não apresenta avisos de segurança.',evidence:['Avisos','Instruções de utilização segura','Idioma do mercado de destino']},
  },
};

const genericSector: Record<L,{title:string;reason:string;evidence:string[]}> = {
  en:{title:'Review sector-specific obligations',reason:'The candidate sector legislation may impose additional product-specific requirements. Confirm scope before relying on this assessment.',evidence:['Applicable technical documentation','Relevant tests or assessments','Required labelling/instructions','Economic-operator records where applicable']},
  fr:{title:'Examiner les obligations sectorielles',reason:'La législation sectorielle candidate peut imposer des exigences supplémentaires propres au produit. Confirmez le champ d’application avant de vous appuyer sur cette évaluation.',evidence:['Documentation technique applicable','Essais ou évaluations pertinents','Étiquetage/instructions requis','Données des opérateurs économiques si applicable']},
  de:{title:'Sektorspezifische Pflichten prüfen',reason:'Die mögliche sektorale Regelung kann zusätzliche produktspezifische Anforderungen enthalten. Den Anwendungsbereich vor Nutzung dieser Bewertung bestätigen.',evidence:['Anwendbare technische Unterlagen','Relevante Prüfungen oder Bewertungen','Erforderliche Kennzeichnung/Anleitungen','Unterlagen zu Wirtschaftsakteuren, soweit erforderlich']},
  it:{title:'Verificare gli obblighi settoriali',reason:'La normativa settoriale candidata può imporre ulteriori requisiti specifici del prodotto. Confermare l’ambito prima di fare affidamento su questa valutazione.',evidence:['Documentazione tecnica applicabile','Prove o valutazioni pertinenti','Etichettatura/istruzioni richieste','Registri degli operatori economici quando applicabile']},
  pt:{title:'Rever obrigações setoriais',reason:'A legislação setorial candidata pode impor requisitos adicionais específicos do produto. Confirme o âmbito antes de se basear nesta avaliação.',evidence:['Documentação técnica aplicável','Ensaios ou avaliações relevantes','Rotulagem/instruções exigidas','Registos dos operadores económicos quando aplicável']},
};

const ceCopy: Record<L,{title:string;reason:string;evidence:string[]}> = {
  en:{title:'Check whether CE marking, conformity assessment and an EU declaration of conformity are required',reason:'CE marking must only be used where applicable sector legislation requires it; it is not an approval issued by the EU.',evidence:['Conformity-assessment procedure','EU declaration of conformity','Technical documentation','Correct CE marking where required']},
  fr:{title:'Vérifier si le marquage CE, l’évaluation de conformité et la déclaration UE de conformité sont requis',reason:'Le marquage CE ne doit être utilisé que lorsque la législation sectorielle applicable l’exige ; il ne s’agit pas d’une approbation délivrée par l’UE.',evidence:['Procédure d’évaluation de conformité','Déclaration UE de conformité','Documentation technique','Marquage CE correct si requis']},
  de:{title:'Prüfen, ob CE-Kennzeichnung, Konformitätsbewertung und EU-Konformitätserklärung erforderlich sind',reason:'Die CE-Kennzeichnung darf nur verwendet werden, wenn die anwendbare sektorale Regelung sie verlangt; sie ist keine Genehmigung der EU.',evidence:['Konformitätsbewertungsverfahren','EU-Konformitätserklärung','Technische Unterlagen','Korrekte CE-Kennzeichnung, soweit erforderlich']},
  it:{title:'Verificare se sono richiesti marcatura CE, valutazione di conformità e dichiarazione UE di conformità',reason:'La marcatura CE deve essere utilizzata solo quando richiesta dalla normativa settoriale applicabile; non è un’approvazione rilasciata dall’UE.',evidence:['Procedura di valutazione della conformità','Dichiarazione UE di conformità','Documentazione tecnica','Marcatura CE corretta quando richiesta']},
  pt:{title:'Verificar se são exigidas marcação CE, avaliação da conformidade e declaração UE de conformidade',reason:'A marcação CE só deve ser utilizada quando a legislação setorial aplicável a exigir; não é uma aprovação emitida pela UE.',evidence:['Procedimento de avaliação da conformidade','Declaração UE de conformidade','Documentação técnica','Marcação CE correta quando exigida']},
};

function replace(template: string, category: string) { return template.replace('{category}', category); }

function localizeObligation(obligation: RegulatoryObligation, language: L): RegulatoryObligation {
  const copy = baseObligationCopy[obligation.id]?.[language] ?? (obligation.id.startsWith('ce-') ? ceCopy[language] : genericSector[language]);
  return { ...obligation, title: copy.title, reason: copy.reason, evidence: copy.evidence };
}

export function localizeEuRegulatoryAssessment(assessment: EuRegulatoryAssessment, language: Language): EuRegulatoryAssessment {
  if (language === 'es') return assessment;
  const category = categoryCopy[assessment.category]?.[language] ?? assessment.category;
  return {
    ...assessment,
    category,
    applicableActs: assessment.applicableActs.map(act => ({
      ...act,
      reason: act.applicability === 'baseline' ? text.baselineReason[language] : replace(text.candidateReason[language], category),
    })),
    obligations: assessment.obligations.map(obligation => localizeObligation(obligation, language)),
    uncertainties: assessment.uncertainties.length ? assessment.uncertainties.map(() => text.uncertainty[language]) : [],
    disclaimer: text.disclaimer[language],
  };
}
