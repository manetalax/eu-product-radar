import { Product } from './analysis';
import { MarketCode, MARKETS } from './markets';

export const GUIDE_VERSION = 'market-guide-v2 / 2026-08-29';
export const GUIDE_SCOPE = 'Guía orientativa: un campo vacío no demuestra incumplimiento. No se han recibido ni validado documentos. Los requisitos exactos dependen de la categoría, características, mercado de venta y papel del operador.';

export const SOURCES = {
  euGpsr: 'https://eur-lex.europa.eu/eli/reg/2023/988/oj?locale=es',
  euCe: 'https://single-market-economy.ec.europa.eu/single-market/goods/ce-marking/manufacturers_en',
  euAssessment: 'https://europa.eu/youreurope/business/product-rules-compliance/general-product-compliance/conformity-assessment/index_es.htm',
  usTesting: 'https://www.cpsc.gov/Business--Manufacturing/Testing-Certification',
  usGcc: 'https://www.cpsc.gov/Business--Manufacturing/Testing-Certification/General-Certificate-of-Conformity',
  cnCcc: 'https://www.customs.gov.cn/customs/2023-04/28/article_2025121223300582639.html',
  gbSafety: 'https://www.gov.uk/guidance/product-safety-law-compliance-advice-for-manufacturers-and-importers',
  gbMarking: 'https://www.gov.uk/guidance/placing-ukca-or-ce-marked-products-on-the-market-in-great-britain',
  jpSafety: 'https://www.meti.go.jp/english/policy/economy/consumer/product_safety/pslpg_procedure/index.html',
  jpPse: 'https://www.meti.go.jp/english/policy/economy/consumer/pse/index.html',
};

export type DocumentAction = { title: string; status: string; condition: string; obtain: string; check: string; source: string };

type MarketGuidance = {
  operatorCondition: string;
  operatorObtain: string;
  warningCondition: string;
  classificationObtain: string;
  evidenceCondition: string;
  certificationTitle: string;
  certificationCondition: string;
  certificationObtain: string;
  certificationCheck: string;
  primarySource: string;
  certificationSource: string;
};

const guidance: Record<MarketCode, MarketGuidance> = {
  EU: {
    operatorCondition: 'Identificar qué operador establecido en la UE desempeña la función exigida. GPSR, artículos 16 y 19; no implica contratar siempre un representante.',
    operatorObtain: 'Pedir al fabricante o importador identidad, contactos y función del operador. Si actúa un representante autorizado, solicitar el mandato pertinente.',
    warningCondition: 'Según riesgos y uso del producto, en los idiomas exigidos por cada Estado miembro. GPSR, artículos 9 y 19.',
    classificationObtain: 'Recopilar modelo/SKU, categoría, materiales, uso, edad, alimentación eléctrica o radio, países de venta y papel económico.',
    evidenceCondition: 'Para productos sujetos al GPSR y, cuando exista, a legislación sectorial aplicable.',
    certificationTitle: 'Declaración UE de conformidad y marcado CE',
    certificationCondition: 'Solo cuando la legislación armonizada aplicable lo exige; no todos los productos llevan marcado CE.',
    certificationObtain: 'Si procede, pedir al fabricante la declaración firmada del modelo y la evidencia que la sustenta.',
    certificationCheck: 'Revisar modelo, fabricante, legislación citada, fecha y firma. Un certificado genérico no sustituye la declaración.',
    primarySource: SOURCES.euGpsr, certificationSource: SOURCES.euCe,
  },
  US: {
    operatorCondition: 'Para productos de consumo regulados, determinar el importador y quién debe emitir el certificado exigible por la CPSC.',
    operatorObtain: 'Pedir razón social, dirección y contactos del importador de registro y confirmar quién conserva los certificados y resultados de ensayo.',
    warningCondition: 'Según el riesgo, la norma federal o estatal aplicable y el canal de venta; revisar idioma, ubicación, permanencia y legibilidad.',
    classificationObtain: 'Recopilar modelo/SKU, categoría, materiales, edad prevista, uso, alimentación, componentes radio y estados de venta.',
    evidenceCondition: 'La evidencia y el tipo de ensayo dependen de si el producto está sujeto a una regla, prohibición, estándar o regulación de la CPSC.',
    certificationTitle: 'GCC o Children’s Product Certificate',
    certificationCondition: 'Solo para productos sujetos a requisitos de certificación. Los productos infantiles tienen reglas de ensayo y certificado específicas.',
    certificationObtain: 'Confirmar la clasificación y pedir al fabricante o importador el certificado correspondiente y los informes que lo respaldan.',
    certificationCheck: 'Contrastar producto, normas citadas, fabricante/importador, lugar y fecha de fabricación y ensayo, y laboratorio cuando corresponda.',
    primarySource: SOURCES.usTesting, certificationSource: SOURCES.usGcc,
  },
  CN: {
    operatorCondition: 'Identificar al importador en China y sus datos de contacto para la declaración aduanera, etiquetado y responsabilidades posventa aplicables.',
    operatorObtain: 'Solicitar al socio comercial chino su identidad legal, dirección, contactos y alcance exacto respecto del modelo importado.',
    warningCondition: 'Revisar si la categoría exige etiqueta, instrucciones y advertencias en chino, además de origen e información del importador.',
    classificationObtain: 'Recopilar código arancelario, modelo/SKU, categoría, materiales, uso, edad, alimentación y puerto o canal de entrada previsto.',
    evidenceCondition: 'La inspección, normas GB y documentación técnica dependen de la clasificación y del catálogo regulatorio aplicable.',
    certificationTitle: 'Certificación obligatoria CCC',
    certificationCondition: 'Solo para productos incluidos en el catálogo CCC vigente; no debe asumirse por el mero nombre del producto.',
    certificationObtain: 'Clasificar el producto y, si está incluido, pedir al fabricante el certificado CCC válido del modelo antes del envío.',
    certificationCheck: 'Comprobar titular, fabricante, fábrica, modelo, alcance, estado y correspondencia de la marca CCC con el producto.',
    primarySource: SOURCES.cnCcc, certificationSource: SOURCES.cnCcc,
  },
  GB: {
    operatorCondition: 'Determinar el importador establecido en Gran Bretaña y, en categorías concretas, si se requiere una persona responsable.',
    operatorObtain: 'Pedir razón social, dirección y contactos del importador, junto con su función y modelos cubiertos.',
    warningCondition: 'Según riesgo y legislación aplicable, con instrucciones comprensibles para el consumidor de Gran Bretaña.',
    classificationObtain: 'Recopilar modelo/SKU, categoría, materiales, uso, edad, alimentación, radio y si se venderá en Gran Bretaña o Irlanda del Norte.',
    evidenceCondition: 'La documentación depende de la normativa general y sectorial; Gran Bretaña e Irlanda del Norte no siempre siguen el mismo régimen.',
    certificationTitle: 'Marcado UKCA o CE y declaración aplicable',
    certificationCondition: 'Depende del producto, la legislación y el territorio. La aceptación del marcado CE en Gran Bretaña varía por regulación.',
    certificationObtain: 'Identificar primero la regulación aplicable y pedir al fabricante la declaración y evaluación correspondientes.',
    certificationCheck: 'Contrastar modelo, normas, organismo cuando proceda, territorio y reglas de marcado vigentes en la fecha de puesta en mercado.',
    primarySource: SOURCES.gbSafety, certificationSource: SOURCES.gbMarking,
  },
  JP: {
    operatorCondition: 'Determinar el importador o empresa notificante en Japón y las obligaciones que asume según la ley de seguridad aplicable.',
    operatorObtain: 'Pedir identidad legal, dirección, contactos, papel regulatorio y confirmación del modelo y categoría que cubre.',
    warningCondition: 'Revisar instrucciones y advertencias en japonés exigibles por la categoría, el uso y las normas técnicas aplicables.',
    classificationObtain: 'Recopilar modelo/SKU, categoría, materiales, uso, edad, alimentación, batería, radio y canal de importación.',
    evidenceCondition: 'La notificación, inspección y conservación de registros dependen de cuál de las leyes de seguridad de producto resulte aplicable.',
    certificationTitle: 'Marca PSE y evaluación de conformidad',
    certificationCondition: 'Solo para aparatos y materiales eléctricos cubiertos por la ley DENAN; el procedimiento depende de la categoría.',
    certificationObtain: 'Clasificar el producto y pedir al fabricante/importador los informes, certificados y registros exigibles antes de usar la marca PSE.',
    certificationCheck: 'Comprobar categoría, modelo, normas técnicas, organismo registrado cuando proceda, notificación del importador y marcado correcto.',
    primarySource: SOURCES.jpSafety, certificationSource: SOURCES.jpPse,
  },
};

export function documentationFor(p: Product, marketCode: MarketCode = 'EU'): DocumentAction[] {
  const state = (value: string) => value.trim() ? 'Dato aportado; sin verificar' : 'Dato no aportado';
  const market = MARKETS[marketCode];
  const g = guidance[marketCode];
  return [
    { title: 'Identificación del fabricante', status: state(p.manufacturer), condition: `Revisar para ${market.name} la identificación y trazabilidad exigibles al fabricante del modelo concreto.`, obtain: 'Solicitar al fabricante o proveedor razón social, dirección, contactos y fotografías de la etiqueta y embalaje.', check: 'Contrastar los datos con producto, embalaje y oferta online. Un nombre comercial aislado puede ser insuficiente.', source: g.primarySource },
    { title: market.operatorLongLabel, status: state(p.responsible), condition: g.operatorCondition, obtain: g.operatorObtain, check: 'Comprobar identidad legal, establecimiento, función, modelo cubierto y datos que deben aparecer en producto, embalaje u oferta. No inventar contactos.', source: g.primarySource },
    { title: 'Instrucciones, etiquetado y advertencias', status: state(p.warning), condition: g.warningCondition, obtain: 'Solicitar al fabricante el manual, las etiquetas y las advertencias del modelo en los idiomas y formatos del mercado.', check: 'Revisar correspondencia con el modelo, uso previsto, riesgos, legibilidad y ubicación. No sustituir por advertencias genéricas.', source: g.primarySource },
    { title: 'Ficha de clasificación del producto', status: 'Información adicional necesaria', condition: 'Necesaria antes de determinar obligaciones concretas.', obtain: g.classificationObtain, check: 'No deducir requisitos únicamente del nombre. Confirmar categoría, características, territorio y papel de cada operador.', source: g.primarySource },
    { title: 'Expediente técnico y evaluación de riesgos', status: 'Existencia no comprobada', condition: g.evidenceCondition, obtain: 'Solicitar al fabricante el índice del expediente, evaluación de riesgos, especificaciones y evidencias del modelo. Puede requerir apoyo técnico especializado.', check: 'Comprobar identificación del modelo, descripción, riesgos, medidas y vigencia. El acceso al expediente completo depende del papel del operador.', source: g.primarySource },
    { title: g.certificationTitle, status: 'Aplicabilidad pendiente', condition: g.certificationCondition, obtain: g.certificationObtain, check: g.certificationCheck, source: g.certificationSource },
    { title: 'Ensayos y evidencias específicas', status: 'Aplicabilidad pendiente', condition: 'Dependen de la categoría, normas aplicables y procedimiento de evaluación; no siempre exigen un laboratorio externo.', obtain: 'Pedir las evidencias del modelo. Si faltan, definir con un especialista qué ensayos y qué laboratorio u organismo son necesarios.', check: 'Contrastar modelo, alcance, métodos, resultados, fechas y entidad emisora. No comprar un certificado universal de cumplimiento.', source: g.certificationSource },
  ];
}
