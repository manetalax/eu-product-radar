import type { MarketCode } from './markets';
import type { PlanId } from './plans';

export const LANGUAGES = ['es', 'en', 'fr', 'de', 'it', 'pt'] as const;
export type Language = typeof LANGUAGES[number];

export const LANGUAGE_OPTIONS: readonly { code: Language; label: string; shortLabel: string; locale: string }[] = [
  { code: 'es', label: 'Español', shortLabel: 'ES', locale: 'es-ES' },
  { code: 'en', label: 'English', shortLabel: 'EN', locale: 'en-GB' },
  { code: 'fr', label: 'Français', shortLabel: 'FR', locale: 'fr-FR' },
  { code: 'de', label: 'Deutsch', shortLabel: 'DE', locale: 'de-DE' },
  { code: 'it', label: 'Italiano', shortLabel: 'IT', locale: 'it-IT' },
  { code: 'pt', label: 'Português', shortLabel: 'PT', locale: 'pt-PT' },
] as const;

const LOCALE_BY_LANGUAGE = Object.fromEntries(LANGUAGE_OPTIONS.map(option => [option.code, option.locale])) as Record<Language, string>;

export type LandingCopy = {
  nav: { how: string; markets: string; pricing: string; login: string; language: string };
  hero: { eyebrow: string; independent: string; title: string; lead: string; primary: string; secondary: string; trust: string[]; legal: string };
  preview: { kicker: string; file: string; count: string; incomplete: string; priority: string; summary: string; products: string[]; priorities: string[]; next: string[]; fictional: string; reports: string };
  values: { title: string; body: string }[];
  flow: { eyebrow: string; title: string; lead: string; items: { title: string; body: string }[] };
  markets: {
    eyebrow: string; title: string; body: string; active: string; preparing: string; viewSource: string; nextModule: string; source: string;
    cards: Record<MarketCode, { name: string; promise: string; volume: string }>;
  };
  method: { eyebrow: string; title: string; lead: string; gpsr: string; ce: string; items: { title: string; body: string }[] };
  pricing: {
    eyebrow: string; title: string; lead: string; availability: string; recommended: string; perMonth: string; upTo: string; products: string;
    descriptions: Record<PlanId, string>; reserve: string; freeTitle: string; freeBody: string; freeCta: string; honesty: string;
  };
  compatibility: { commerceLabel: string; commerceNote: string; paymentLabel: string; paymentNote: string; infrastructureLabel: string; infrastructureNote: string };
  trust: { title: string; detail: string; https: string; explanation: string };
  faq: { eyebrow: string; title: string; items: [string, string][] };
  final: { eyebrow: string; title: string; body: string; cta: string };
  footer: { sources: string; privacy: string; guidance: string };
};

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}

export function localeFor(language: Language): string {
  return LOCALE_BY_LANGUAGE[language];
}

export function formatPrice(language: Language, price: number): string {
  return new Intl.NumberFormat(localeFor(language), { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
}

export function formatProductCount(language: Language, count: number): string {
  return `${new Intl.NumberFormat(localeFor(language), { useGrouping: true }).format(count)} ${landingCopy[language].pricing.products}`;
}

export const landingCopy: Record<Language, LandingCopy> = {
  es: {
    nav: { how: 'Cómo funciona', markets: 'Mercados', pricing: 'Precios', login: 'Entrar', language: 'Idioma' },
    hero: {
      eyebrow: 'EU REGULATORY INTELLIGENCE', independent: 'Análisis independiente · Sin vinculación institucional con la UE',
      title: 'Conoce la normativa que necesita cada producto para venderse en la Unión Europea.',
      lead: 'Detecta requisitos, documentación pendiente y posibles riesgos regulatorios antes de comercializar tus productos en el mercado europeo.',
      primary: 'Analizar 5 productos gratis', secondary: 'Ver cómo funciona',
      trust: ['Sin tarjeta', 'Fotos y documentos', 'Excel y PDF', 'Historial privado'],
      legal: 'Herramienta orientativa. No certifica conformidad ni sustituye asesoramiento profesional.',
    },
    preview: {
      kicker: 'IMPORT RULES VERIFIER · EUROPA', file: 'catalogo-ejemplo.xlsx', count: '12 productos', incomplete: 'Campos incompletos',
      priority: '3 requieren atención prioritaria', summary: 'Fabricante, operador responsable y advertencias concentran los principales huecos.',
      products: ['Auriculares inalámbricos', 'Lámpara LED portátil', 'Botella térmica'], priorities: ['ALTA', 'MEDIA', 'BAJA'],
      next: ['Qué pedir', 'Dónde conseguirlo', 'Fuente oficial'], fictional: 'Ejemplo ilustrativo · datos ficticios', reports: 'Informe Excel + PDF',
    },
    values: [
      { title: 'Importa', body: 'Foto, PDF, Word, texto o Excel' }, { title: 'Prioriza', body: 'Detecta campos incompletos' },
      { title: 'Documenta', body: 'Guía y fuentes oficiales' }, { title: 'Exporta', body: 'Informes trazables' },
    ],
    flow: {
      eyebrow: 'UN FLUJO, TRES PASOS', title: 'De catálogo incierto a un plan de trabajo.',
      lead: 'Menos tiempo adivinando qué falta. Más claridad sobre qué revisar, qué pedir al proveedor y cómo dejar constancia.',
      items: [
        { title: 'Empieza con una estructura correcta', body: 'Descarga la plantilla o importa tu archivo. Validamos formatos, tamaño y campos antes de guardar nada.' },
        { title: 'Ve primero lo importante', body: 'Cada producto recibe un indicador explicable y una prioridad basada en los campos que faltan.' },
        { title: 'Convierte el aviso en evidencia', body: 'Consulta qué documentación puede aplicar, su fuente oficial y exporta una instantánea con trazabilidad.' },
      ],
    },
    markets: {
      eyebrow: 'ARQUITECTURA INTERNACIONAL', title: 'Europa hoy. El mundo, mercado a mercado.',
      body: 'Una sola marca y una sola cuenta. Cada destino tendrá su propio módulo de reglas, documentación, fuentes y versiones, sin duplicar la web ni fragmentar tus catálogos.',
      active: 'ACTIVO', preparing: 'EN PREPARACIÓN', viewSource: 'Ver fuente regulatoria ↗', nextModule: 'Próximo módulo',
      source: 'Orden por importaciones de mercancías en 2024, considerando la UE como un único mercado: Global Trade Outlook 2025, OMC ↗',
      cards: {
        US: { name: 'Estados Unidos', promise: 'Certificación CPSC cuando aplica, trazabilidad e información del importador.', volume: '3,36 billones USD en importaciones' },
        EU: { name: 'Unión Europea', promise: 'GPSR, operador responsable, advertencias y marcado CE cuando aplica.', volume: '2,63 billones USD en importaciones extra-UE' },
        CN: { name: 'China', promise: 'Etiquetado local, información del importador y CCC cuando el producto está en catálogo.', volume: '2,59 billones USD en importaciones' },
        GB: { name: 'Reino Unido', promise: 'Seguridad general, datos del importador y marcado UKCA o CE según el producto.', volume: '816.000 M USD en importaciones' },
        JP: { name: 'Japón', promise: 'Clasificación del producto, obligaciones del importador y marca PSE cuando aplica.', volume: '743.000 M USD en importaciones' },
      },
    },
    method: {
      eyebrow: 'CONFIANZA SIN HUMO', title: 'Explicable por diseño.',
      lead: 'Sabes qué se ha comprobado, con qué versión y qué queda fuera del alcance. Cada informe conserva el archivo, la fecha, el mercado y las reglas utilizadas.',
      gpsr: 'Reglamento GPSR · EUR-Lex ↗', ce: 'Marcado CE · Comisión Europea ↗',
      items: [
        { title: 'Regla visible', body: '8 puntos de base y 28 por cada campo básico vacío. La prioridad no equivale a riesgo legal.' },
        { title: 'Datos sin adornos', body: 'Un dato presente queda “aportado; sin verificar”. Nunca lo convertimos en una certificación ficticia.' },
        { title: 'Historial reproducible', body: 'Los análisis anteriores conservan su versión y siguen abriéndose aunque el producto evolucione.' },
      ],
    },
    pricing: {
      eyebrow: 'PRECIOS CLAROS', title: 'Elige el volumen que realmente necesitas.',
      lead: 'Prueba el flujo con 5 productos gratis. Los planes comerciales se abrirán de forma gradual y siempre con aviso previo.',
      availability: 'Pago seguro y cancelación flexible', recommended: 'RECOMENDADO', perMonth: 'al mes', upTo: 'Hasta', products: 'productos',
      descriptions: {
        starter: 'Para empezar con un catálogo pequeño y revisiones periódicas.', growth: 'Para vendedores que amplían referencias y frecuencia.',
        pro: 'Para operaciones consolidadas con informes frecuentes.', business: 'Para catálogos de mayor volumen y ritmo operativo.',
      },
      reserve: 'Elegir', freeTitle: 'Prueba gratuita', freeBody: 'Analiza hasta 5 productos sin tarjeta y comprueba el flujo completo.', freeCta: 'Empezar gratis',
      honesty: 'Los planes son suscripciones mensuales gestionadas por Stripe. Se renuevan automáticamente hasta que las canceles desde tu cuenta.',
    },
    compatibility: {
      commerceLabel: 'Compatible con exportaciones de', commerceNote: 'Sube fotos, PDF, Word, texto, CSV o Excel. La IA identifica los productos y deja vacíos los datos que no puede verificar.',
      paymentLabel: 'Pago seguro gestionado por Stripe', paymentNote: 'Los métodos concretos disponibles dependen del país, la moneda y la configuración de Stripe.',
      infrastructureLabel: 'Tecnología utilizada', infrastructureNote: 'Infraestructura técnica de la aplicación; no implica patrocinio, certificación ni asociación comercial.',
    },
    trust: { title: 'IRV Trust Mark', detail: 'Comprobaciones internas de transparencia', https: 'Conexión HTTPS segura', explanation: 'Sello interno de Import Rules Verifier. No es una certificación externa ni acredita la conformidad de un producto.' },
    faq: {
      eyebrow: 'PREGUNTAS FRECUENTES', title: 'Antes de subir tu catálogo.',
      items: [
        ['¿Import Rules Verifier certifica que un producto cumple?', 'No. Detecta información básica incompleta, organiza prioridades y señala fuentes oficiales. La conformidad exacta depende del producto y puede exigir una evaluación técnica o jurídica.'],
        ['¿Qué necesito para empezar?', 'Una foto, un documento, texto, CSV o Excel donde aparezcan los productos. La IA intentará identificarlos y dejará señalados los datos que falten.'],
        ['¿Qué ocurre con mis catálogos?', 'Cada análisis queda asociado a tu cuenta y separado de otras cuentas. Recomendamos no subir datos personales ni secretos comerciales innecesarios.'],
        ['¿Por qué Europa es el único mercado activo?', 'Porque preferimos una cobertura europea útil y verificable antes de activar otros países. La plataforma ya separa reglas, fuentes e informes por mercado.'],
        ['¿Cuándo estarán disponibles los planes de pago?', 'La apertura será gradual. Puedes registrar tu interés sin activar cobros; te avisaremos antes de cualquier contratación.'],
      ],
    },
    final: { eyebrow: 'EMPIEZA CON CINCO PRODUCTOS', title: 'La mejor prueba es tu propio catálogo.', body: 'Sin tarjeta. Con plantilla, historial e informes desde el primer análisis.', cta: 'Crear cuenta gratis' },
    footer: { sources: 'Fuentes oficiales', privacy: 'Privacidad por cuenta', guidance: 'Información orientativa · 2026' },
  },

  en: {
    nav: { how: 'How it works', markets: 'Markets', pricing: 'Pricing', login: 'Sign in', language: 'Language' },
    hero: {
      eyebrow: 'EU REGULATORY INTELLIGENCE', independent: 'Independent analysis · No institutional affiliation with the EU',
      title: 'Know the regulations each product needs to be sold in the European Union.',
      lead: 'Detect requirements, missing documentation and potential regulatory risks before placing your products on the European market.',
      primary: 'Analyse 5 products free', secondary: 'See how it works',
      trust: ['No card required', 'Photos and documents', 'Excel and PDF', 'Private history'],
      legal: 'Guidance tool only. It does not certify compliance or replace professional advice.',
    },
    preview: {
      kicker: 'IMPORT RULES VERIFIER · EUROPE', file: 'sample-catalogue.xlsx', count: '12 products', incomplete: 'Missing fields',
      priority: '3 need priority attention', summary: 'Manufacturer, responsible operator and warnings account for the main gaps.',
      products: ['Wireless headphones', 'Portable LED lamp', 'Thermal bottle'], priorities: ['HIGH', 'MEDIUM', 'LOW'],
      next: ['What to request', 'Where to obtain it', 'Official source'], fictional: 'Illustrative example · fictional data', reports: 'Excel + PDF report',
    },
    values: [
      { title: 'Import', body: 'Photo, PDF, Word, text or Excel' }, { title: 'Prioritise', body: 'Find missing fields' },
      { title: 'Document', body: 'Guidance and official sources' }, { title: 'Export', body: 'Traceable reports' },
    ],
    flow: {
      eyebrow: 'ONE WORKFLOW, THREE STEPS', title: 'From an uncertain catalogue to a clear work plan.',
      lead: 'Spend less time guessing what is missing. Know what to review, what to request from the supplier and how to keep a record.',
      items: [
        { title: 'Start with the right structure', body: 'Download the template or import your file. We validate formats, size and fields before anything is saved.' },
        { title: 'See what matters first', body: 'Each product receives an explainable indicator and a priority based on the missing fields.' },
        { title: 'Turn the alert into evidence', body: 'Review the documents that may apply, open the official source and export a traceable snapshot.' },
      ],
    },
    markets: {
      eyebrow: 'INTERNATIONAL ARCHITECTURE', title: 'Europe today. The world, one market at a time.',
      body: 'One brand and one account. Every destination will have its own module for rules, documents, sources and versions, without duplicating the site or fragmenting your catalogues.',
      active: 'LIVE', preparing: 'IN PREPARATION', viewSource: 'View regulatory source ↗', nextModule: 'Next module',
      source: 'Ranking by merchandise imports in 2024, treating the EU as a single market: WTO Global Trade Outlook 2025 ↗',
      cards: {
        US: { name: 'United States', promise: 'CPSC certification where applicable, traceability and importer information.', volume: '$3.36tn in imports' },
        EU: { name: 'European Union', promise: 'GPSR, responsible operator, warnings and CE marking where applicable.', volume: '$2.63tn in extra-EU imports' },
        CN: { name: 'China', promise: 'Local labelling, importer information and CCC for products within scope.', volume: '$2.59tn in imports' },
        GB: { name: 'United Kingdom', promise: 'General safety, importer details and UKCA or CE marking depending on the product.', volume: '$816bn in imports' },
        JP: { name: 'Japan', promise: 'Product classification, importer obligations and PSE marking where applicable.', volume: '$743bn in imports' },
      },
    },
    method: {
      eyebrow: 'TRUST WITHOUT THE HYPE', title: 'Explainable by design.',
      lead: 'Know what was checked, which version was used and what remains outside scope. Every report retains the file, date, market and rule set.',
      gpsr: 'GPSR · EUR-Lex ↗', ce: 'CE marking · European Commission ↗',
      items: [
        { title: 'Visible rule', body: 'A base score of 8 plus 28 for each empty core field. Priority is not the same as legal risk.' },
        { title: 'Unembellished data', body: 'A populated field is recorded as “provided; not verified”. We never turn it into a fictional certification.' },
        { title: 'Reproducible history', body: 'Earlier analyses retain their version and remain accessible as the product evolves.' },
      ],
    },
    pricing: {
      eyebrow: 'CLEAR PRICING', title: 'Choose the volume you genuinely need.',
      lead: 'Try the complete workflow with 5 products free. Commercial plans will open gradually and always with prior notice.',
      availability: 'Secure payment and flexible cancellation', recommended: 'RECOMMENDED', perMonth: 'per month', upTo: 'Up to', products: 'products',
      descriptions: {
        starter: 'For getting started with a small catalogue and regular reviews.', growth: 'For sellers expanding their range and review frequency.',
        pro: 'For established operations producing reports regularly.', business: 'For larger catalogues and a higher operating pace.',
      },
      reserve: 'Choose', freeTitle: 'Free trial', freeBody: 'Analyse up to 5 products without a card and experience the complete workflow.', freeCta: 'Start free',
      honesty: 'Plans are monthly subscriptions managed by Stripe. They renew automatically until you cancel them from your account.',
    },
    compatibility: {
      commerceLabel: 'Compatible with exports from', commerceNote: 'Upload photos, PDF, Word, text, CSV or Excel. AI identifies products and leaves unverifiable fields empty.',
      paymentLabel: 'Secure payment managed by Stripe', paymentNote: 'Available payment methods depend on country, currency and your Stripe configuration.',
      infrastructureLabel: 'Technology in use', infrastructureNote: 'Application infrastructure only; this does not imply sponsorship, certification or a commercial partnership.',
    },
    trust: { title: 'IRV Trust Mark', detail: 'Internal transparency checks', https: 'Secure HTTPS connection', explanation: 'An internal Import Rules Verifier mark. It is not an external certification and does not certify product compliance.' },
    faq: {
      eyebrow: 'FREQUENTLY ASKED QUESTIONS', title: 'Before uploading your catalogue.',
      items: [
        ['Does Import Rules Verifier certify that a product complies?', 'No. It detects missing core information, organises priorities and points to official sources. Exact compliance depends on the product and may require technical or legal assessment.'],
        ['What do I need to get started?', 'A photo, document, text, CSV or Excel file showing the products. AI will identify them and flag any missing information.'],
        ['What happens to my catalogues?', 'Each analysis is linked to your account and isolated from other accounts. We recommend avoiding unnecessary personal data or trade secrets.'],
        ['Why is Europe the only live market?', 'We prefer useful, verifiable European coverage before enabling other countries. The platform already separates rules, sources and reports by market.'],
        ['When will paid plans be available?', 'Access will open gradually. You can register interest without enabling billing, and we will notify you before any purchase.'],
      ],
    },
    final: { eyebrow: 'START WITH FIVE PRODUCTS', title: 'Your own catalogue is the best test.', body: 'No card required. Template, history and reports from your first analysis.', cta: 'Create a free account' },
    footer: { sources: 'Official sources', privacy: 'Account-level privacy', guidance: 'Guidance information · 2026' },
  },

  fr: {
    nav: { how: 'Fonctionnement', markets: 'Marchés', pricing: 'Tarifs', login: 'Connexion', language: 'Langue' },
    hero: {
      eyebrow: 'VEILLE RÉGLEMENTAIRE UE', independent: 'Analyse indépendante · Sans lien institutionnel avec l’UE',
      title: 'Identifiez la réglementation nécessaire à chaque produit pour être vendu dans l’Union européenne.',
      lead: 'Repérez les exigences, les documents manquants et les risques réglementaires potentiels avant de commercialiser vos produits sur le marché européen.',
      primary: 'Analyser 5 produits gratuitement', secondary: 'Voir le fonctionnement',
      trust: ['Sans carte', 'Photos et documents', 'Excel et PDF', 'Historique privé'],
      legal: 'Outil indicatif. Il ne certifie pas la conformité et ne remplace pas un conseil professionnel.',
    },
    preview: {
      kicker: 'IMPORT RULES VERIFIER · EUROPE', file: 'catalogue-exemple.xlsx', count: '12 produits', incomplete: 'Champs incomplets',
      priority: '3 nécessitent une attention prioritaire', summary: 'Le fabricant, l’opérateur responsable et les avertissements concentrent les principales lacunes.',
      products: ['Écouteurs sans fil', 'Lampe LED portable', 'Bouteille isotherme'], priorities: ['HAUTE', 'MOYENNE', 'BASSE'],
      next: ['Quoi demander', 'Où l’obtenir', 'Source officielle'], fictional: 'Exemple illustratif · données fictives', reports: 'Rapport Excel + PDF',
    },
    values: [
      { title: 'Importez', body: 'Photo, PDF, Word, texte ou Excel' }, { title: 'Priorisez', body: 'Repérez les champs incomplets' },
      { title: 'Documentez', body: 'Guide et sources officielles' }, { title: 'Exportez', body: 'Rapports traçables' },
    ],
    flow: {
      eyebrow: 'UN FLUX, TROIS ÉTAPES', title: 'D’un catalogue incertain à un plan de travail clair.',
      lead: 'Moins de temps à deviner ce qui manque. Plus de clarté sur les vérifications, les demandes au fournisseur et la traçabilité.',
      items: [
        { title: 'Commencez avec la bonne structure', body: 'Téléchargez le modèle ou importez votre fichier. Nous validons le format, la taille et les champs avant tout enregistrement.' },
        { title: 'Voyez d’abord l’essentiel', body: 'Chaque produit reçoit un indicateur explicable et une priorité fondée sur les champs manquants.' },
        { title: 'Transformez l’alerte en preuve', body: 'Consultez les documents potentiellement applicables, leur source officielle et exportez un instantané traçable.' },
      ],
    },
    markets: {
      eyebrow: 'ARCHITECTURE INTERNATIONALE', title: 'L’Europe aujourd’hui. Le monde, marché par marché.',
      body: 'Une marque et un compte uniques. Chaque destination aura son module de règles, de documents, de sources et de versions, sans dupliquer le site ni fragmenter les catalogues.',
      active: 'ACTIF', preparing: 'EN PRÉPARATION', viewSource: 'Voir la source réglementaire ↗', nextModule: 'Prochain module',
      source: 'Classement selon les importations de marchandises en 2024, l’UE étant considérée comme un marché unique : Global Trade Outlook 2025, OMC ↗',
      cards: {
        US: { name: 'États-Unis', promise: 'Certification CPSC le cas échéant, traçabilité et informations sur l’importateur.', volume: '3,36 billions USD d’importations' },
        EU: { name: 'Union européenne', promise: 'RSGP, opérateur responsable, avertissements et marquage CE le cas échéant.', volume: '2,63 billions USD d’importations extra-UE' },
        CN: { name: 'Chine', promise: 'Étiquetage local, informations sur l’importateur et CCC pour les produits concernés.', volume: '2,59 billions USD d’importations' },
        GB: { name: 'Royaume-Uni', promise: 'Sécurité générale, informations sur l’importateur et marquage UKCA ou CE selon le produit.', volume: '816 milliards USD d’importations' },
        JP: { name: 'Japon', promise: 'Classification, obligations de l’importateur et marquage PSE le cas échéant.', volume: '743 milliards USD d’importations' },
      },
    },
    method: {
      eyebrow: 'LA CONFIANCE SANS ARTIFICE', title: 'Explicable par conception.',
      lead: 'Vous savez ce qui a été contrôlé, avec quelle version et ce qui reste hors périmètre. Chaque rapport conserve le fichier, la date, le marché et les règles utilisées.',
      gpsr: 'RSGP · EUR-Lex ↗', ce: 'Marquage CE · Commission européenne ↗',
      items: [
        { title: 'Règle visible', body: '8 points de base et 28 par champ essentiel vide. La priorité n’équivaut pas à un risque juridique.' },
        { title: 'Données sans embellissement', body: 'Une donnée présente est indiquée « fournie ; non vérifiée ». Elle ne devient jamais une certification fictive.' },
        { title: 'Historique reproductible', body: 'Les analyses antérieures conservent leur version et restent accessibles lorsque le produit évolue.' },
      ],
    },
    pricing: {
      eyebrow: 'TARIFS CLAIRS', title: 'Choisissez le volume dont vous avez vraiment besoin.',
      lead: 'Testez le flux complet avec 5 produits gratuits. Les offres commerciales seront ouvertes progressivement et toujours avec un préavis.',
      availability: 'Paiement sécurisé et résiliation flexible', recommended: 'RECOMMANDÉ', perMonth: 'par mois', upTo: 'Jusqu’à', products: 'produits',
      descriptions: {
        starter: 'Pour démarrer avec un petit catalogue et des contrôles réguliers.', growth: 'Pour les vendeurs qui élargissent leur gamme et leurs contrôles.',
        pro: 'Pour les opérations établies qui produisent souvent des rapports.', business: 'Pour les catalogues plus volumineux et un rythme soutenu.',
      },
      reserve: 'Choisir', freeTitle: 'Essai gratuit', freeBody: 'Analysez jusqu’à 5 produits sans carte et testez le flux complet.', freeCta: 'Commencer gratuitement',
      honesty: 'Les offres sont des abonnements mensuels gérés par Stripe. Ils sont renouvelés automatiquement jusqu’à leur résiliation depuis votre compte.',
    },
    compatibility: {
      commerceLabel: 'Compatible avec les exports de', commerceNote: 'Importez des photos, PDF, Word, texte, CSV ou Excel. L’IA identifie les produits et laisse vides les données non vérifiables.',
      paymentLabel: 'Paiement sécurisé géré par Stripe', paymentNote: 'Les moyens disponibles dépendent du pays, de la devise et de la configuration Stripe.',
      infrastructureLabel: 'Technologies utilisées', infrastructureNote: 'Infrastructure technique de l’application uniquement ; cela n’implique ni parrainage, ni certification, ni partenariat commercial.',
    },
    trust: { title: 'IRV Trust Mark', detail: 'Contrôles internes de transparence', https: 'Connexion HTTPS sécurisée', explanation: 'Marque interne de Import Rules Verifier. Ce n’est pas une certification externe et elle ne certifie pas la conformité d’un produit.' },
    faq: {
      eyebrow: 'QUESTIONS FRÉQUENTES', title: 'Avant d’importer votre catalogue.',
      items: [
        ['Import Rules Verifier certifie-t-il la conformité d’un produit ?', 'Non. Il détecte les informations essentielles manquantes, organise les priorités et renvoie vers des sources officielles. La conformité exacte dépend du produit et peut nécessiter une évaluation technique ou juridique.'],
        ['De quoi ai-je besoin pour commencer ?', 'D’une photo, d’un document, d’un texte, d’un CSV ou d’un fichier Excel montrant les produits. L’IA les identifiera et signalera les informations manquantes.'],
        ['Que deviennent mes catalogues ?', 'Chaque analyse est liée à votre compte et isolée des autres comptes. Évitez les données personnelles ou secrets commerciaux qui ne sont pas nécessaires.'],
        ['Pourquoi l’Europe est-elle le seul marché actif ?', 'Nous préférons une couverture européenne utile et vérifiable avant d’activer d’autres pays. La plateforme sépare déjà les règles, sources et rapports par marché.'],
        ['Quand les offres payantes seront-elles disponibles ?', 'L’ouverture sera progressive. Vous pouvez manifester votre intérêt sans activer de paiement ; nous vous préviendrons avant tout achat.'],
      ],
    },
    final: { eyebrow: 'COMMENCEZ AVEC CINQ PRODUITS', title: 'Votre propre catalogue est le meilleur test.', body: 'Sans carte. Modèle, historique et rapports dès la première analyse.', cta: 'Créer un compte gratuit' },
    footer: { sources: 'Sources officielles', privacy: 'Confidentialité par compte', guidance: 'Informations indicatives · 2026' },
  },

  de: {
    nav: { how: 'So funktioniert es', markets: 'Märkte', pricing: 'Preise', login: 'Anmelden', language: 'Sprache' },
    hero: {
      eyebrow: 'EU REGULATORY INTELLIGENCE', independent: 'Unabhängige Analyse · Keine institutionelle Verbindung zur EU',
      title: 'Erfahre, welche Vorschriften jedes Produkt für den Verkauf in der Europäischen Union erfüllen muss.',
      lead: 'Erkenne Anforderungen, fehlende Unterlagen und mögliche regulatorische Risiken, bevor du deine Produkte auf dem europäischen Markt anbietest.',
      primary: '5 Produkte kostenlos analysieren', secondary: 'So funktioniert es',
      trust: ['Keine Karte nötig', 'Fotos und Dokumente', 'Excel und PDF', 'Privater Verlauf'],
      legal: 'Orientierungshilfe. Sie zertifiziert keine Konformität und ersetzt keine professionelle Beratung.',
    },
    preview: {
      kicker: 'IMPORT RULES VERIFIER · EUROPA', file: 'beispiel-katalog.xlsx', count: '12 Produkte', incomplete: 'Unvollständige Felder',
      priority: '3 benötigen vorrangige Aufmerksamkeit', summary: 'Hersteller, verantwortlicher Wirtschaftsakteur und Warnhinweise bilden die größten Lücken.',
      products: ['Kabellose Kopfhörer', 'Tragbare LED-Leuchte', 'Thermoflasche'], priorities: ['HOCH', 'MITTEL', 'NIEDRIG'],
      next: ['Was anfordern', 'Woher beziehen', 'Offizielle Quelle'], fictional: 'Beispielansicht · fiktive Daten', reports: 'Excel- + PDF-Bericht',
    },
    values: [
      { title: 'Importieren', body: 'Foto, PDF, Word, Text oder Excel' }, { title: 'Priorisieren', body: 'Fehlende Felder erkennen' },
      { title: 'Dokumentieren', body: 'Leitfaden und offizielle Quellen' }, { title: 'Exportieren', body: 'Nachvollziehbare Berichte' },
    ],
    flow: {
      eyebrow: 'EIN ABLAUF, DREI SCHRITTE', title: 'Vom unsicheren Katalog zum klaren Arbeitsplan.',
      lead: 'Weniger Zeit für Vermutungen. Mehr Klarheit darüber, was zu prüfen, beim Lieferanten anzufordern und zu dokumentieren ist.',
      items: [
        { title: 'Mit der richtigen Struktur starten', body: 'Lade die Vorlage herunter oder importiere deine Datei. Format, Größe und Felder werden vor dem Speichern geprüft.' },
        { title: 'Das Wichtigste zuerst sehen', body: 'Jedes Produkt erhält einen erklärbaren Indikator und eine Priorität anhand der fehlenden Felder.' },
        { title: 'Hinweise in Nachweise verwandeln', body: 'Prüfe mögliche Dokumente und offizielle Quellen und exportiere einen nachvollziehbaren Stand.' },
      ],
    },
    markets: {
      eyebrow: 'INTERNATIONALE ARCHITEKTUR', title: 'Europa heute. Die Welt, Markt für Markt.',
      body: 'Eine Marke und ein Konto. Jedes Ziel erhält ein eigenes Modul für Regeln, Dokumente, Quellen und Versionen, ohne die Website zu duplizieren oder Kataloge aufzuteilen.',
      active: 'AKTIV', preparing: 'IN VORBEREITUNG', viewSource: 'Regulatorische Quelle öffnen ↗', nextModule: 'Nächstes Modul',
      source: 'Rangfolge nach Warenimporten 2024, wobei die EU als ein Markt zählt: WTO Global Trade Outlook 2025 ↗',
      cards: {
        US: { name: 'Vereinigte Staaten', promise: 'CPSC-Zertifizierung, sofern anwendbar, Rückverfolgbarkeit und Importeurangaben.', volume: '3,36 Bio. USD Importe' },
        EU: { name: 'Europäische Union', promise: 'GPSR, verantwortlicher Wirtschaftsakteur, Warnhinweise und CE-Kennzeichnung, sofern anwendbar.', volume: '2,63 Bio. USD Extra-EU-Importe' },
        CN: { name: 'China', promise: 'Lokale Kennzeichnung, Importeurangaben und CCC für erfasste Produkte.', volume: '2,59 Bio. USD Importe' },
        GB: { name: 'Vereinigtes Königreich', promise: 'Allgemeine Sicherheit, Importeurangaben und je nach Produkt UKCA- oder CE-Kennzeichnung.', volume: '816 Mrd. USD Importe' },
        JP: { name: 'Japan', promise: 'Produktklassifizierung, Pflichten des Importeurs und PSE-Kennzeichnung, sofern anwendbar.', volume: '743 Mrd. USD Importe' },
      },
    },
    method: {
      eyebrow: 'VERTRAUEN OHNE SHOW', title: 'Erklärbar konzipiert.',
      lead: 'Du weißt, was geprüft wurde, welche Version galt und was außerhalb des Umfangs liegt. Jeder Bericht bewahrt Datei, Datum, Markt und Regeln.',
      gpsr: 'GPSR · EUR-Lex ↗', ce: 'CE-Kennzeichnung · Europäische Kommission ↗',
      items: [
        { title: 'Sichtbare Regel', body: '8 Basispunkte plus 28 für jedes leere Kernfeld. Priorität ist nicht gleichbedeutend mit Rechtsrisiko.' },
        { title: 'Unverfälschte Daten', body: 'Ein vorhandener Wert gilt als „angegeben; nicht geprüft“. Daraus wird niemals eine erfundene Zertifizierung.' },
        { title: 'Reproduzierbarer Verlauf', body: 'Frühere Analysen behalten ihre Version und bleiben auch bei Weiterentwicklung des Produkts zugänglich.' },
      ],
    },
    pricing: {
      eyebrow: 'KLARE PREISE', title: 'Wähle das Volumen, das du wirklich brauchst.',
      lead: 'Teste den vollständigen Ablauf kostenlos mit 5 Produkten. Die kommerziellen Tarife werden schrittweise und immer mit Vorankündigung geöffnet.',
      availability: 'Sichere Zahlung und flexible Kündigung', recommended: 'EMPFOHLEN', perMonth: 'pro Monat', upTo: 'Bis zu', products: 'Produkte',
      descriptions: {
        starter: 'Für den Einstieg mit einem kleinen Katalog und regelmäßigen Prüfungen.', growth: 'Für Verkäufer mit wachsendem Sortiment und häufigeren Prüfungen.',
        pro: 'Für etablierte Abläufe mit regelmäßigen Berichten.', business: 'Für größere Kataloge und ein höheres Arbeitstempo.',
      },
      reserve: 'Auswählen', freeTitle: 'Kostenlos testen', freeBody: 'Analysiere bis zu 5 Produkte ohne Karte und teste den vollständigen Ablauf.', freeCta: 'Kostenlos starten',
      honesty: 'Die Tarife sind monatliche, von Stripe verwaltete Abonnements. Sie verlängern sich automatisch, bis du sie in deinem Konto kündigst.',
    },
    compatibility: {
      commerceLabel: 'Kompatibel mit Exporten von', commerceNote: 'Laden Sie Fotos, PDF, Word, Text, CSV oder Excel hoch. Die KI erkennt Produkte und lässt nicht verifizierbare Daten leer.',
      paymentLabel: 'Sichere Zahlung über Stripe', paymentNote: 'Die verfügbaren Zahlungsarten hängen von Land, Währung und Stripe-Konfiguration ab.',
      infrastructureLabel: 'Eingesetzte Technologie', infrastructureNote: 'Nur technische Anwendungsinfrastruktur; dies bedeutet kein Sponsoring, keine Zertifizierung und keine Geschäftspartnerschaft.',
    },
    trust: { title: 'IRV Trust Mark', detail: 'Interne Transparenzprüfungen', https: 'Sichere HTTPS-Verbindung', explanation: 'Ein internes Zeichen von Import Rules Verifier. Es ist keine externe Zertifizierung und bestätigt keine Produktkonformität.' },
    faq: {
      eyebrow: 'HÄUFIGE FRAGEN', title: 'Vor dem Hochladen deines Katalogs.',
      items: [
        ['Zertifiziert Import Rules Verifier die Konformität eines Produkts?', 'Nein. Es erkennt fehlende Kernangaben, ordnet Prioritäten und verweist auf offizielle Quellen. Die genaue Konformität hängt vom Produkt ab und kann eine technische oder rechtliche Prüfung erfordern.'],
        ['Was brauche ich für den Start?', 'Ein Foto, Dokument, Text, eine CSV- oder Excel-Datei mit den Produkten. Die KI erkennt sie und markiert fehlende Angaben.'],
        ['Was geschieht mit meinen Katalogen?', 'Jede Analyse ist deinem Konto zugeordnet und von anderen Konten getrennt. Lade keine unnötigen personenbezogenen Daten oder Geschäftsgeheimnisse hoch.'],
        ['Warum ist Europa der einzige aktive Markt?', 'Wir wollen zuerst eine nützliche, überprüfbare Europa-Abdeckung bieten. Regeln, Quellen und Berichte sind bereits nach Märkten getrennt.'],
        ['Wann sind die Bezahltarife verfügbar?', 'Die Öffnung erfolgt schrittweise. Du kannst dein Interesse ohne Zahlungsaktivierung hinterlegen; vor einem Abschluss wirst du informiert.'],
      ],
    },
    final: { eyebrow: 'STARTE MIT FÜNF PRODUKTEN', title: 'Der beste Test ist dein eigener Katalog.', body: 'Keine Karte nötig. Vorlage, Verlauf und Berichte ab der ersten Analyse.', cta: 'Kostenloses Konto erstellen' },
    footer: { sources: 'Offizielle Quellen', privacy: 'Datenschutz je Konto', guidance: 'Orientierende Informationen · 2026' },
  },

  it: {
    nav: { how: 'Come funziona', markets: 'Mercati', pricing: 'Prezzi', login: 'Accedi', language: 'Lingua' },
    hero: {
      eyebrow: 'INTELLIGENCE NORMATIVA UE', independent: 'Analisi indipendente · Nessun legame istituzionale con l’UE',
      title: 'Scopri la normativa necessaria per vendere ogni prodotto nell’Unione europea.',
      lead: 'Individua requisiti, documentazione mancante e potenziali rischi normativi prima di commercializzare i tuoi prodotti sul mercato europeo.',
      primary: 'Analizza 5 prodotti gratis', secondary: 'Scopri come funziona',
      trust: ['Nessuna carta', 'Foto e documenti', 'Excel e PDF', 'Cronologia privata'],
      legal: 'Strumento orientativo. Non certifica la conformità e non sostituisce una consulenza professionale.',
    },
    preview: {
      kicker: 'IMPORT RULES VERIFIER · EUROPA', file: 'catalogo-esempio.xlsx', count: '12 prodotti', incomplete: 'Campi incompleti',
      priority: '3 richiedono attenzione prioritaria', summary: 'Produttore, operatore responsabile e avvertenze concentrano le principali lacune.',
      products: ['Auricolari wireless', 'Lampada LED portatile', 'Borraccia termica'], priorities: ['ALTA', 'MEDIA', 'BASSA'],
      next: ['Cosa richiedere', 'Dove ottenerlo', 'Fonte ufficiale'], fictional: 'Esempio illustrativo · dati fittizi', reports: 'Report Excel + PDF',
    },
    values: [
      { title: 'Importa', body: 'CSV, XLS o XLSX' }, { title: 'Dai priorità', body: 'Trova i campi incompleti' },
      { title: 'Documenta', body: 'Guida e fonti ufficiali' }, { title: 'Esporta', body: 'Report tracciabili' },
    ],
    flow: {
      eyebrow: 'UN FLUSSO, TRE PASSAGGI', title: 'Da un catalogo incerto a un piano di lavoro chiaro.',
      lead: 'Meno tempo a indovinare cosa manca. Più chiarezza su cosa verificare, richiedere al fornitore e documentare.',
      items: [
        { title: 'Parti dalla struttura corretta', body: 'Scarica il modello o importa il file. Verifichiamo formato, dimensione e campi prima di salvare qualsiasi dato.' },
        { title: 'Guarda prima ciò che conta', body: 'Ogni prodotto riceve un indicatore spiegabile e una priorità basata sui campi mancanti.' },
        { title: 'Trasforma l’avviso in una prova', body: 'Consulta i documenti potenzialmente applicabili, la fonte ufficiale ed esporta un’istantanea tracciabile.' },
      ],
    },
    markets: {
      eyebrow: 'ARCHITETTURA INTERNAZIONALE', title: 'L’Europa oggi. Il mondo, mercato per mercato.',
      body: 'Un solo marchio e un solo account. Ogni destinazione avrà il proprio modulo di regole, documenti, fonti e versioni, senza duplicare il sito o frammentare i cataloghi.',
      active: 'ATTIVO', preparing: 'IN PREPARAZIONE', viewSource: 'Apri la fonte normativa ↗', nextModule: 'Prossimo modulo',
      source: 'Ordine per importazioni di merci nel 2024, considerando l’UE un unico mercato: Global Trade Outlook 2025, OMC ↗',
      cards: {
        US: { name: 'Stati Uniti', promise: 'Certificazione CPSC ove applicabile, tracciabilità e informazioni sull’importatore.', volume: '3,36 mila miliardi USD di importazioni' },
        EU: { name: 'Unione europea', promise: 'GPSR, operatore responsabile, avvertenze e marcatura CE ove applicabile.', volume: '2,63 mila miliardi USD di importazioni extra-UE' },
        CN: { name: 'Cina', promise: 'Etichettatura locale, informazioni sull’importatore e CCC per i prodotti interessati.', volume: '2,59 mila miliardi USD di importazioni' },
        GB: { name: 'Regno Unito', promise: 'Sicurezza generale, dati dell’importatore e marcatura UKCA o CE in base al prodotto.', volume: '816 miliardi USD di importazioni' },
        JP: { name: 'Giappone', promise: 'Classificazione, obblighi dell’importatore e marcatura PSE ove applicabile.', volume: '743 miliardi USD di importazioni' },
      },
    },
    method: {
      eyebrow: 'FIDUCIA SENZA FUMO', title: 'Spiegabile fin dalla progettazione.',
      lead: 'Sai cosa è stato controllato, con quale versione e cosa resta fuori ambito. Ogni report conserva file, data, mercato e regole utilizzate.',
      gpsr: 'GPSR · EUR-Lex ↗', ce: 'Marcatura CE · Commissione europea ↗',
      items: [
        { title: 'Regola visibile', body: '8 punti base e 28 per ogni campo essenziale vuoto. La priorità non equivale a rischio legale.' },
        { title: 'Dati senza abbellimenti', body: 'Un dato presente risulta “fornito; non verificato”. Non diventa mai una certificazione fittizia.' },
        { title: 'Cronologia riproducibile', body: 'Le analisi precedenti mantengono la loro versione e restano accessibili quando il prodotto evolve.' },
      ],
    },
    pricing: {
      eyebrow: 'PREZZI CHIARI', title: 'Scegli il volume di cui hai davvero bisogno.',
      lead: 'Prova il flusso completo con 5 prodotti gratis. I piani commerciali apriranno gradualmente e sempre con preavviso.',
      availability: 'Pagamento sicuro e cancellazione flessibile', recommended: 'CONSIGLIATO', perMonth: 'al mese', upTo: 'Fino a', products: 'prodotti',
      descriptions: {
        starter: 'Per iniziare con un piccolo catalogo e controlli periodici.', growth: 'Per venditori che ampliano assortimento e frequenza dei controlli.',
        pro: 'Per attività consolidate che producono report frequenti.', business: 'Per cataloghi più ampi e un ritmo operativo maggiore.',
      },
      reserve: 'Scegli', freeTitle: 'Prova gratuita', freeBody: 'Analizza fino a 5 prodotti senza carta e prova il flusso completo.', freeCta: 'Inizia gratis',
      honesty: 'I piani sono abbonamenti mensili gestiti da Stripe. Si rinnovano automaticamente finché non li annulli dal tuo account.',
    },
    compatibility: {
      commerceLabel: 'Compatibile con le esportazioni di', commerceNote: 'Carica foto, PDF, Word, testo, CSV o Excel. L’IA identifica i prodotti e lascia vuoti i dati non verificabili.',
      paymentLabel: 'Pagamento sicuro gestito da Stripe', paymentNote: 'I metodi disponibili dipendono dal paese, dalla valuta e dalla configurazione Stripe.',
      infrastructureLabel: 'Tecnologie utilizzate', infrastructureNote: 'Solo infrastruttura tecnica dell’applicazione; non implica sponsorizzazione, certificazione o partnership commerciale.',
    },
    trust: { title: 'IRV Trust Mark', detail: 'Controlli interni di trasparenza', https: 'Connessione HTTPS sicura', explanation: 'Marchio interno di Import Rules Verifier. Non è una certificazione esterna e non certifica la conformità di un prodotto.' },
    faq: {
      eyebrow: 'DOMANDE FREQUENTI', title: 'Prima di caricare il catalogo.',
      items: [
        ['Import Rules Verifier certifica la conformità di un prodotto?', 'No. Individua informazioni essenziali mancanti, organizza le priorità e rimanda a fonti ufficiali. La conformità esatta dipende dal prodotto e può richiedere una valutazione tecnica o legale.'],
        ['Cosa serve per iniziare?', 'Una foto, un documento, un testo, un CSV o un file Excel con i prodotti. L’IA li identifica e segnala i dati mancanti.'],
        ['Cosa succede ai miei cataloghi?', 'Ogni analisi è collegata al tuo account e separata dagli altri account. Evita dati personali o segreti commerciali non necessari.'],
        ['Perché l’Europa è l’unico mercato attivo?', 'Preferiamo una copertura europea utile e verificabile prima di attivare altri paesi. La piattaforma separa già regole, fonti e report per mercato.'],
        ['Quando saranno disponibili i piani a pagamento?', 'L’apertura sarà graduale. Puoi registrare l’interesse senza attivare pagamenti; ti avviseremo prima di qualsiasi acquisto.'],
      ],
    },
    final: { eyebrow: 'INIZIA CON CINQUE PRODOTTI', title: 'Il test migliore è il tuo catalogo.', body: 'Nessuna carta. Modello, cronologia e report fin dalla prima analisi.', cta: 'Crea un account gratuito' },
    footer: { sources: 'Fonti ufficiali', privacy: 'Privacy per account', guidance: 'Informazioni orientative · 2026' },
  },

  pt: {
    nav: { how: 'Como funciona', markets: 'Mercados', pricing: 'Preços', login: 'Entrar', language: 'Idioma' },
    hero: {
      eyebrow: 'INTELIGÊNCIA REGULAMENTAR DA UE', independent: 'Análise independente · Sem ligação institucional à UE',
      title: 'Conheça a regulamentação necessária para vender cada produto na União Europeia.',
      lead: 'Detete requisitos, documentação em falta e possíveis riscos regulamentares antes de comercializar os seus produtos no mercado europeu.',
      primary: 'Analisar 5 produtos grátis', secondary: 'Ver como funciona',
      trust: ['Sem cartão', 'Fotos e documentos', 'Excel e PDF', 'Histórico privado'],
      legal: 'Ferramenta orientativa. Não certifica a conformidade nem substitui aconselhamento profissional.',
    },
    preview: {
      kicker: 'IMPORT RULES VERIFIER · EUROPA', file: 'catalogo-exemplo.xlsx', count: '12 produtos', incomplete: 'Campos incompletos',
      priority: '3 requerem atenção prioritária', summary: 'Fabricante, operador responsável e avisos concentram as principais lacunas.',
      products: ['Auscultadores sem fios', 'Candeeiro LED portátil', 'Garrafa térmica'], priorities: ['ALTA', 'MÉDIA', 'BAIXA'],
      next: ['O que pedir', 'Onde obter', 'Fonte oficial'], fictional: 'Exemplo ilustrativo · dados fictícios', reports: 'Relatório Excel + PDF',
    },
    values: [
      { title: 'Importe', body: 'Foto, PDF, Word, texto ou Excel' }, { title: 'Dê prioridade', body: 'Detete campos incompletos' },
      { title: 'Documente', body: 'Guia e fontes oficiais' }, { title: 'Exporte', body: 'Relatórios rastreáveis' },
    ],
    flow: {
      eyebrow: 'UM FLUXO, TRÊS PASSOS', title: 'De um catálogo incerto a um plano de trabalho claro.',
      lead: 'Menos tempo a adivinhar o que falta. Mais clareza sobre o que rever, pedir ao fornecedor e registar.',
      items: [
        { title: 'Comece com a estrutura correta', body: 'Descarregue o modelo ou importe o ficheiro. Validamos formato, tamanho e campos antes de guardar qualquer dado.' },
        { title: 'Veja primeiro o que importa', body: 'Cada produto recebe um indicador explicável e uma prioridade baseada nos campos em falta.' },
        { title: 'Transforme o alerta em evidência', body: 'Consulte os documentos potencialmente aplicáveis, a fonte oficial e exporte um registo rastreável.' },
      ],
    },
    markets: {
      eyebrow: 'ARQUITETURA INTERNACIONAL', title: 'Europa hoje. O mundo, mercado a mercado.',
      body: 'Uma só marca e uma só conta. Cada destino terá o seu módulo de regras, documentos, fontes e versões, sem duplicar o site nem fragmentar os catálogos.',
      active: 'ATIVO', preparing: 'EM PREPARAÇÃO', viewSource: 'Ver fonte regulamentar ↗', nextModule: 'Próximo módulo',
      source: 'Ordem por importações de mercadorias em 2024, considerando a UE como um único mercado: Global Trade Outlook 2025, OMC ↗',
      cards: {
        US: { name: 'Estados Unidos', promise: 'Certificação CPSC quando aplicável, rastreabilidade e informação do importador.', volume: '3,36 biliões USD em importações' },
        EU: { name: 'União Europeia', promise: 'RSGP, operador responsável, avisos e marcação CE quando aplicável.', volume: '2,63 biliões USD em importações extra-UE' },
        CN: { name: 'China', promise: 'Rotulagem local, informação do importador e CCC para produtos abrangidos.', volume: '2,59 biliões USD em importações' },
        GB: { name: 'Reino Unido', promise: 'Segurança geral, dados do importador e marcação UKCA ou CE conforme o produto.', volume: '816 mil milhões USD em importações' },
        JP: { name: 'Japão', promise: 'Classificação, obrigações do importador e marcação PSE quando aplicável.', volume: '743 mil milhões USD em importações' },
      },
    },
    method: {
      eyebrow: 'CONFIANÇA SEM ARTIFÍCIOS', title: 'Explicável desde a conceção.',
      lead: 'Sabe o que foi verificado, com que versão e o que fica fora do âmbito. Cada relatório conserva o ficheiro, a data, o mercado e as regras utilizadas.',
      gpsr: 'RSGP · EUR-Lex ↗', ce: 'Marcação CE · Comissão Europeia ↗',
      items: [
        { title: 'Regra visível', body: '8 pontos de base e 28 por cada campo essencial vazio. A prioridade não equivale a risco jurídico.' },
        { title: 'Dados sem adornos', body: 'Um dado presente fica como “fornecido; não verificado”. Nunca o transformamos numa certificação fictícia.' },
        { title: 'Histórico reproduzível', body: 'As análises anteriores conservam a versão e permanecem acessíveis quando o produto evolui.' },
      ],
    },
    pricing: {
      eyebrow: 'PREÇOS CLAROS', title: 'Escolha o volume de que realmente precisa.',
      lead: 'Experimente o fluxo completo com 5 produtos grátis. Os planos comerciais serão abertos gradualmente e sempre com aviso prévio.',
      availability: 'Pagamento seguro e cancelamento flexível', recommended: 'RECOMENDADO', perMonth: 'por mês', upTo: 'Até', products: 'produtos',
      descriptions: {
        starter: 'Para começar com um catálogo pequeno e revisões periódicas.', growth: 'Para vendedores que ampliam referências e frequência de revisão.',
        pro: 'Para operações consolidadas com relatórios frequentes.', business: 'Para catálogos maiores e um ritmo operacional elevado.',
      },
      reserve: 'Escolher', freeTitle: 'Teste gratuito', freeBody: 'Analise até 5 produtos sem cartão e experimente o fluxo completo.', freeCta: 'Começar grátis',
      honesty: 'Os planos são subscrições mensais geridas pela Stripe. Renovam-se automaticamente até serem cancelados na sua conta.',
    },
    compatibility: {
      commerceLabel: 'Compatível com exportações de', commerceNote: 'Carregue fotos, PDF, Word, texto, CSV ou Excel. A IA identifica os produtos e deixa vazios os dados que não consegue verificar.',
      paymentLabel: 'Pagamento seguro gerido pela Stripe', paymentNote: 'Os métodos disponíveis dependem do país, da moeda e da configuração da Stripe.',
      infrastructureLabel: 'Tecnologia utilizada', infrastructureNote: 'Apenas infraestrutura técnica da aplicação; não implica patrocínio, certificação ou parceria comercial.',
    },
    trust: { title: 'IRV Trust Mark', detail: 'Verificações internas de transparência', https: 'Ligação HTTPS segura', explanation: 'Marca interna da Import Rules Verifier. Não é uma certificação externa e não certifica a conformidade de um produto.' },
    faq: {
      eyebrow: 'PERGUNTAS FREQUENTES', title: 'Antes de carregar o catálogo.',
      items: [
        ['A Import Rules Verifier certifica a conformidade de um produto?', 'Não. Deteta informações essenciais em falta, organiza prioridades e indica fontes oficiais. A conformidade exata depende do produto e pode exigir uma avaliação técnica ou jurídica.'],
        ['De que preciso para começar?', 'Uma foto, documento, texto, CSV ou Excel com os produtos. A IA identifica-os e assinala os dados em falta.'],
        ['O que acontece aos meus catálogos?', 'Cada análise fica associada à sua conta e separada das outras contas. Evite dados pessoais ou segredos comerciais desnecessários.'],
        ['Porque é que a Europa é o único mercado ativo?', 'Preferimos uma cobertura europeia útil e verificável antes de ativar outros países. A plataforma já separa regras, fontes e relatórios por mercado.'],
        ['Quando estarão disponíveis os planos pagos?', 'A abertura será gradual. Pode registar o interesse sem ativar pagamentos; será avisado antes de qualquer contratação.'],
      ],
    },
    final: { eyebrow: 'COMECE COM CINCO PRODUTOS', title: 'O melhor teste é o seu próprio catálogo.', body: 'Sem cartão. Modelo, histórico e relatórios desde a primeira análise.', cta: 'Criar conta grátis' },
    footer: { sources: 'Fontes oficiais', privacy: 'Privacidade por conta', guidance: 'Informação orientativa · 2026' },
  },
};
