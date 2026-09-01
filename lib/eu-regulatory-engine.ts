export const EU_REGULATORY_ENGINE_VERSION = 'eu-regulatory-candidates-v2';

export type RegulatoryConfidence = 'high' | 'medium' | 'low';
export type RegulatoryApplicability = 'baseline' | 'candidate';

export type RegulatorySource = { title: string; reference: string; url: string };
export type RegulatoryAct = RegulatorySource & { applicability: RegulatoryApplicability; reason: string };
export type RegulatoryObligation = { id: string; title: string; reason: string; evidence: string[]; source: RegulatorySource };
export type EuRegulatoryAssessment = {
  engineVersion: typeof EU_REGULATORY_ENGINE_VERSION;
  category: string;
  confidence: RegulatoryConfidence;
  requiresCategoryConfirmation: boolean;
  applicableActs: RegulatoryAct[];
  obligations: RegulatoryObligation[];
  uncertainties: string[];
  disclaimer: string;
};

type ProductLike = { name: string; manufacturer: string; responsible: string; warning: string };
type CategoryRule = {
  category: string;
  confidence: RegulatoryConfidence;
  keywords: string[];
  sources: RegulatorySource[];
  notes: string[];
  ce?: boolean;
  obligations?: RegulatoryObligation[];
};

const SOURCES = {
  gpsr: { title: 'General Product Safety Regulation', reference: 'Regulation (EU) 2023/988', url: 'https://eur-lex.europa.eu/eli/reg/2023/988/oj' },
  ce: { title: 'European Commission — CE marking', reference: 'CE marking guidance', url: 'https://single-market-economy.ec.europa.eu/single-market/goods/ce-marking_en' },
  toys: { title: 'Toy Safety Directive', reference: 'Directive 2009/48/EC', url: 'https://eur-lex.europa.eu/eli/dir/2009/48/oj' },
  toyTransition: { title: 'Toy Safety Regulation', reference: 'Regulation (EU) 2025/2509 — applies generally from 1 August 2030', url: 'https://eur-lex.europa.eu/eli/reg/2025/2509/oj' },
  lvd: { title: 'Low Voltage Directive', reference: 'Directive 2014/35/EU', url: 'https://eur-lex.europa.eu/eli/dir/2014/35/oj' },
  emc: { title: 'Electromagnetic Compatibility Directive', reference: 'Directive 2014/30/EU', url: 'https://eur-lex.europa.eu/eli/dir/2014/30/oj' },
  red: { title: 'Radio Equipment Directive', reference: 'Directive 2014/53/EU', url: 'https://eur-lex.europa.eu/eli/dir/2014/53/oj' },
  ppe: { title: 'Personal Protective Equipment Regulation', reference: 'Regulation (EU) 2016/425', url: 'https://eur-lex.europa.eu/eli/reg/2016/425/oj' },
  cosmetics: { title: 'Cosmetics Regulation', reference: 'Regulation (EC) No 1223/2009', url: 'https://eur-lex.europa.eu/eli/reg/2009/1223/oj' },
  medical: { title: 'Medical Devices Regulation', reference: 'Regulation (EU) 2017/745', url: 'https://eur-lex.europa.eu/eli/reg/2017/745/oj' },
  machinery: { title: 'Machinery Directive', reference: 'Directive 2006/42/EC — before Regulation (EU) 2023/1230 applies generally from 20 January 2027', url: 'https://eur-lex.europa.eu/eli/dir/2006/42/oj' },
  batteries: { title: 'Batteries Regulation', reference: 'Regulation (EU) 2023/1542', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1542' },
  textiles: { title: 'Textile fibre names and labelling', reference: 'Regulation (EU) No 1007/2011', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32011R1007' },
  footwear: { title: 'Footwear materials labelling', reference: 'Directive 94/11/EC', url: 'https://eur-lex.europa.eu/eli/dir/1994/11/oj/eng' },
  foodContact: { title: 'Food contact materials framework', reference: 'Regulation (EC) No 1935/2004', url: 'https://eur-lex.europa.eu/eli/reg/2004/1935/oj/eng' },
  detergents: { title: 'Detergents Regulation', reference: 'Regulation (EC) No 648/2004', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32004R0648' },
  clp: { title: 'Classification, Labelling and Packaging Regulation', reference: 'Regulation (EC) No 1272/2008', url: 'https://eur-lex.europa.eu/eli/reg/2008/1272/oj/eng' },
  packaging: { title: 'Packaging and Packaging Waste Regulation', reference: 'Regulation (EU) 2025/40', url: 'https://eur-lex.europa.eu/eli/reg/2025/40/oj/eng' },
  ecodesign: { title: 'Ecodesign for Sustainable Products Regulation', reference: 'Regulation (EU) 2024/1781', url: 'https://eur-lex.europa.eu/eli/reg/2024/1781/oj/eng' },
} as const;

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const hasAny = (text: string, words: string[]) => words.some(word => text.includes(normalize(word)));

const obligation = (id: string, title: string, reason: string, evidence: string[], source: RegulatorySource): RegulatoryObligation => ({ id, title, reason, evidence, source });

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: 'Juguete', confidence: 'high', keywords: ['juguete','toy','muñeca','peluche','puzzle infantil'], sources: [SOURCES.toys, SOURCES.toyTransition], ce: true,
    notes: ['Confirmar edad prevista, función de juego y exclusiones antes de cerrar la clasificación.'],
    obligations: [obligation('toy-safety-assessment','Preparar evaluación de seguridad específica del juguete','Los juguetes requieren evaluación de peligros y procedimiento de evaluación de conformidad.',['Evaluación de peligros','Ensayos/normas armonizadas aplicadas','Declaración UE de conformidad','Marcado CE'],SOURCES.toys)],
  },
  {
    category: 'Equipo radioeléctrico', confidence: 'medium', keywords: ['wifi','bluetooth','radio','wireless','inalambr','auricular','router','smartwatch','smart watch'], sources: [SOURCES.red, SOURCES.emc], ce: true,
    notes: ['Confirmar que transmite o recibe intencionadamente ondas radioeléctricas y revisar requisitos específicos de ciberseguridad cuando procedan.'],
  },
  {
    category: 'Equipo eléctrico', confidence: 'medium', keywords: ['lampara','cargador','adaptador','enchufe','electrico','power supply','secador','tostadora','hervidor'], sources: [SOURCES.lvd, SOURCES.emc], ce: true,
    notes: ['Confirmar tensiones nominales y uso previsto; la Directiva de Baja Tensión solo aplica dentro de sus rangos y tiene exclusiones.'],
  },
  {
    category: 'Batería o producto con batería', confidence: 'medium', keywords: ['bateria','battery','power bank','pila','acumulador','lithium','litio'], sources: [SOURCES.batteries],
    notes: ['Confirmar tipo de batería, si se comercializa sola o incorporada, capacidad, química y obligaciones escalonadas aplicables por fecha.'],
    obligations: [obligation('battery-information','Revisar requisitos de información, marcado y gestión de batería','Las obligaciones dependen del tipo de batería y de las fechas de aplicación del Reglamento.',['Tipo y categoría de batería','Marcados/etiquetado aplicables','Información de capacidad/durabilidad cuando corresponda','Responsabilidad ampliada del productor cuando proceda'],SOURCES.batteries)],
  },
  {
    category: 'Equipo de protección individual', confidence: 'medium', keywords: ['casco','helmet','guante proteccion','gafas proteccion','respirador','arnes','proteccion individual'], sources: [SOURCES.ppe], ce: true,
    notes: ['Confirmar que la finalidad principal es proteger al usuario frente a uno o más riesgos.'],
  },
  {
    category: 'Producto cosmético', confidence: 'medium', keywords: ['crema','serum','champu','maquillaje','cosmetico','perfume','locion','desodorante'], sources: [SOURCES.cosmetics],
    notes: ['Confirmar composición, zona de aplicación, finalidad principal y ausencia de alegaciones medicinales.'],
    obligations: [obligation('cosmetics-file','Verificar expediente, evaluación de seguridad y responsable del cosmético','Los cosméticos tienen un régimen sectorial propio.',['Persona responsable','Informe de seguridad','Expediente de información del producto','Etiquetado e ingredientes'],SOURCES.cosmetics)],
  },
  {
    category: 'Posible producto sanitario', confidence: 'medium', keywords: ['marcapasos','cateter','protesis','medical device','dispositivo medico','termometro clinico','pulsioximetro'], sources: [SOURCES.medical], ce: true,
    notes: ['La condición de producto sanitario depende de la finalidad prevista por el fabricante; el nombre comercial por sí solo no basta.'],
  },
  {
    category: 'Posible maquinaria', confidence: 'medium', keywords: ['maquina','prensa','torno','elevador industrial','sierra electrica','trituradora','mezcladora industrial'], sources: [SOURCES.machinery], ce: true,
    notes: ['Confirmar definición legal, componentes móviles, accionamiento y fecha prevista de puesta en el mercado por la transición normativa de 2027.'],
  },
  {
    category: 'Producto textil', confidence: 'medium', keywords: ['camiseta','camisa','pantalon','vestido','jersey','chaqueta','abrigo','toalla','sabana','manta','textil','ropa'], sources: [SOURCES.textiles, SOURCES.ecodesign],
    notes: ['Confirmar composición por fibras, excepciones de etiquetado y requisitos adicionales del producto concreto. El ESPR es un marco y sus requisitos específicos dependen de actos delegados aplicables.'],
    obligations: [obligation('textile-labelling','Verificar composición y etiquetado de fibras','Los productos textiles cubiertos deben informar su composición con denominaciones admitidas y reglas específicas de presentación.',['Composición porcentual por fibra','Denominaciones de fibras admitidas','Etiqueta o marcado visible/durable','Idioma aplicable en el Estado miembro'],SOURCES.textiles)],
  },
  {
    category: 'Calzado', confidence: 'medium', keywords: ['zapato','zapatilla','bota','sandalia','calzado','shoe','sneaker'], sources: [SOURCES.footwear],
    notes: ['Confirmar que es calzado para consumidor y revisar exclusiones como calzado de protección o calzado de juguete.'],
    obligations: [obligation('footwear-materials','Verificar etiquetado de materiales de los componentes principales','La Directiva exige información sobre materiales del empeine, forro/plantilla y suela exterior para el calzado cubierto.',['Material principal del empeine','Material principal de forro y plantilla','Material principal de suela exterior','Pictogramas o texto conforme al mercado'],SOURCES.footwear)],
  },
  {
    category: 'Artículo en contacto con alimentos', confidence: 'medium', keywords: ['taza','vaso','plato','cubierto','botella reutilizable','tupper','fiambrera','sarten','cacerola','recipiente alimentos','food contact'], sources: [SOURCES.foodContact],
    notes: ['Confirmar que el artículo está destinado a entrar en contacto directo o indirecto con alimentos y revisar medidas específicas según material.'],
    obligations: [obligation('food-contact-compliance','Reunir evidencia de aptitud para contacto alimentario','Los materiales y artículos deben cumplir el marco general y, cuando proceda, medidas específicas por material.',['Declaración de conformidad cuando proceda','Ensayos de migración pertinentes','Trazabilidad','Condiciones de uso y restricciones'],SOURCES.foodContact)],
  },
  {
    category: 'Detergente o producto de limpieza', confidence: 'medium', keywords: ['detergente','lavavajillas','limpiador','limpieza','desengrasante','suavizante','laundry','dishwasher'], sources: [SOURCES.detergents, SOURCES.clp],
    notes: ['Confirmar composición y si la mezcla está clasificada como peligrosa; CLP puede añadir pictogramas, palabras de advertencia y frases H/P.'],
    obligations: [obligation('detergent-label','Verificar composición, etiquetado y datos obligatorios del detergente','Los detergentes están sujetos a requisitos específicos además de CLP cuando la mezcla resulte peligrosa.',['Composición/ingredientes exigibles','Información de uso/dosificación cuando proceda','Datos del responsable','Clasificación y etiqueta CLP si aplica'],SOURCES.detergents)],
  },
  {
    category: 'Sustancia o mezcla química', confidence: 'medium', keywords: ['adhesivo','pegamento','disolvente','pintura','barniz','aerosol','quimico','resina','tinta','lubricante'], sources: [SOURCES.clp],
    notes: ['Confirmar composición y clasificación de peligros. El nombre del producto no permite determinar si la mezcla es peligrosa.'],
    obligations: [obligation('clp-classification','Determinar clasificación y etiqueta CLP cuando corresponda','Las sustancias y mezclas peligrosas requieren clasificación, etiquetado y envasado conforme a CLP.',['Clasificación de peligros','Pictogramas','Palabra de advertencia','Indicaciones de peligro y consejos de prudencia','Identificación del proveedor'],SOURCES.clp)],
  },
  {
    category: 'Mueble o artículo de mobiliario', confidence: 'medium', keywords: ['silla','mesa','sofa','sillon','armario','estanteria','mueble','cuna','colchon'], sources: [SOURCES.gpsr, SOURCES.ecodesign],
    notes: ['Confirmar uso previsto, usuario objetivo, estabilidad, materiales, inflamabilidad y si existe normativa específica adicional. El ESPR es un marco cuya aplicación concreta depende de actos específicos.'],
    obligations: [obligation('furniture-safety','Documentar seguridad mecánica y riesgos previsibles','Los muebles de consumo deben ser seguros bajo el GPSR y pueden requerir evidencia técnica específica según diseño y uso.',['Evaluación de estabilidad/vuelco','Resistencia y durabilidad','Riesgos de atrapamiento/corte','Advertencias e instrucciones de montaje'],SOURCES.gpsr)],
  },
  {
    category: 'Producto infantil no clasificado aún como juguete', confidence: 'medium', keywords: ['trona','cambiador','carrito bebe','cochecito bebe','mochila portabebe','barrera cama','babero','chupetero'], sources: [SOURCES.gpsr],
    notes: ['Confirmar edad, función, normas técnicas específicas y si el producto entra en otra legislación sectorial. No asumir que todo producto infantil es un juguete.'],
    obligations: [obligation('child-product-risk','Reforzar evaluación de riesgos para población infantil','Los niños son consumidores vulnerables y los riesgos previsibles deben evaluarse con especial atención.',['Edad y peso previstos','Riesgos de estrangulamiento/atrapamiento/asfixia','Estabilidad y resistencia','Advertencias e instrucciones'],SOURCES.gpsr)],
  },
  {
    category: 'Envase o producto de embalaje', confidence: 'medium', keywords: ['caja packaging','envase','embalaje','packaging','bolsa embalaje','botella envase'], sources: [SOURCES.packaging],
    notes: ['Confirmar función de envase, material, formato y fechas de aplicación de obligaciones específicas del Reglamento 2025/40.'],
    obligations: [obligation('packaging-requirements','Revisar requisitos del envase y gestión de residuo','El PPWR introduce requisitos armonizados sobre envases y residuos de envases con aplicación progresiva.',['Material y composición','Reciclabilidad/reutilización cuando proceda','Marcado e información exigible','Obligaciones del productor/importador cuando proceda'],SOURCES.packaging)],
  },
];

function detectCategory(name: string): { category: string; confidence: RegulatoryConfidence; sources: RegulatorySource[]; notes: string[]; ce: boolean; obligations: RegulatoryObligation[] } {
  const text = normalize(name);
  const rule = CATEGORY_RULES.find(item => hasAny(text, item.keywords));
  if (rule) return { category: rule.category, confidence: rule.confidence, sources: rule.sources, notes: rule.notes, ce: Boolean(rule.ce), obligations: rule.obligations ?? [] };
  return {
    category: 'Producto de consumo — categoría por confirmar', confidence: 'low', sources: [], ce: false, obligations: [],
    notes: ['No se puede determinar con fiabilidad la legislación sectorial solo a partir del nombre. Solicitar descripción, uso previsto, materiales, alimentación eléctrica, conectividad, público objetivo y fotografías/etiquetado.'],
  };
}

function baseObligations(product: ProductLike): RegulatoryObligation[] {
  const obligations: RegulatoryObligation[] = [
    obligation('identify-applicable-rules','Identificar toda la normativa aplicable antes de comercializar','Un mismo producto puede quedar sujeto a legislación horizontal y sectorial simultáneamente.',['Descripción y uso previsto','Clasificación/categoría','Lista de actos y normas aplicables'],SOURCES.ce),
    obligation('traceability','Comprobar identificación y trazabilidad del producto y operadores económicos','La comercialización en la UE exige información que permita identificar el producto y a los operadores responsables según la normativa aplicable.',['Identificador de producto/lote/serie','Nombre y dirección del fabricante','Operador económico establecido en la UE cuando proceda'],SOURCES.gpsr),
    obligation('safety-information','Comprobar instrucciones e información de seguridad','Las advertencias e instrucciones deben ser adecuadas al producto, sus riesgos y el mercado de destino.',['Manual/instrucciones','Advertencias','Idiomas exigidos por los Estados miembros de destino'],SOURCES.gpsr),
    obligation('technical-evidence','Reunir evidencia técnica de seguridad y conformidad','La documentación debe permitir demostrar el cumplimiento de las obligaciones aplicables y responder a vigilancia de mercado.',['Evaluación de riesgos','Ensayos/certificados pertinentes','Expediente o documentación técnica cuando la legislación sectorial lo exija'],SOURCES.ce),
  ];
  if (!product.manufacturer.trim()) obligations.push(obligation('missing-manufacturer','Completar fabricante','El catálogo no aporta un fabricante identificable.',['Nombre legal','Dirección postal/contacto'],SOURCES.gpsr));
  if (!product.responsible.trim()) obligations.push(obligation('missing-eu-operator','Determinar el operador económico responsable en la UE cuando proceda','El catálogo no aporta el operador responsable/importador/persona responsable aplicable.',['Nombre legal','Dirección en la UE','Rol exacto'],SOURCES.gpsr));
  if (!product.warning.trim()) obligations.push(obligation('missing-warnings','Revisar advertencias e instrucciones de seguridad','El catálogo no aporta advertencias de seguridad.',['Advertencias','Instrucciones de uso seguro','Idioma del mercado de destino'],SOURCES.gpsr));
  return obligations;
}

function ceObligation(source: RegulatorySource): RegulatoryObligation {
  return obligation(`ce-${source.reference}`,'Verificar si procede marcado CE, evaluación de conformidad y declaración UE de conformidad','El marcado CE solo debe utilizarse cuando la legislación sectorial aplicable lo exige; no es una aprobación emitida por la UE.',['Procedimiento de evaluación de conformidad','Declaración UE de conformidad','Documentación técnica','Marcado CE correcto cuando proceda'],source);
}

export function assessEuRegulatory(product: ProductLike): EuRegulatoryAssessment {
  const detected = detectCategory(product.name);
  const applicableActs: RegulatoryAct[] = [
    { ...SOURCES.gpsr, applicability: 'baseline', reason: 'Marco horizontal de seguridad de productos de consumo, sin perjuicio de reglas sectoriales más específicas y de su alcance concreto.' },
    ...detected.sources.filter(source => source.reference !== SOURCES.gpsr.reference).map(source => ({ ...source, applicability: 'candidate' as const, reason: `Candidato por la clasificación preliminar «${detected.category}»; debe confirmarse con características y uso previsto.` })),
  ];
  const obligations = [...baseObligations(product), ...detected.obligations];
  if (detected.ce && detected.sources[0]) obligations.push(ceObligation(detected.sources[0]));
  return {
    engineVersion: EU_REGULATORY_ENGINE_VERSION,
    category: detected.category,
    confidence: detected.confidence,
    requiresCategoryConfirmation: detected.confidence !== 'high',
    applicableActs,
    obligations,
    uncertainties: detected.notes,
    disclaimer: 'Evaluación automatizada de asistencia regulatoria. No constituye certificación, aprobación de una autoridad de la UE ni asesoramiento jurídico. La aplicabilidad final depende de las características, finalidad prevista, composición, riesgos, fechas de aplicación y mercado concreto del producto.',
  };
}
