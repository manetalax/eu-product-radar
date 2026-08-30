export const EU_REGULATORY_ENGINE_VERSION = 'eu-regulatory-candidates-v1';

export type RegulatoryConfidence = 'high' | 'medium' | 'low';
export type RegulatoryApplicability = 'baseline' | 'candidate';

export type RegulatorySource = {
  title: string;
  reference: string;
  url: string;
};

export type RegulatoryAct = RegulatorySource & {
  applicability: RegulatoryApplicability;
  reason: string;
};

export type RegulatoryObligation = {
  id: string;
  title: string;
  reason: string;
  evidence: string[];
  source: RegulatorySource;
};

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

type ProductLike = {
  name: string;
  manufacturer: string;
  responsible: string;
  warning: string;
};

const SOURCES = {
  gpsr: {
    title: 'General Product Safety Regulation',
    reference: 'Regulation (EU) 2023/988',
    url: 'https://eur-lex.europa.eu/eli/reg/2023/988/oj',
  },
  ce: {
    title: 'European Commission — CE marking',
    reference: 'CE marking guidance',
    url: 'https://single-market-economy.ec.europa.eu/single-market/goods/ce-marking_en',
  },
  toys: {
    title: 'Toy Safety Directive',
    reference: 'Directive 2009/48/EC',
    url: 'https://eur-lex.europa.eu/eli/dir/2009/48/oj',
  },
  toyTransition: {
    title: 'Toy Safety Regulation',
    reference: 'Regulation (EU) 2025/2509 — applies generally from 1 August 2030',
    url: 'https://eur-lex.europa.eu/eli/reg/2025/2509/oj',
  },
  lvd: {
    title: 'Low Voltage Directive',
    reference: 'Directive 2014/35/EU',
    url: 'https://eur-lex.europa.eu/eli/dir/2014/35/oj',
  },
  emc: {
    title: 'Electromagnetic Compatibility Directive',
    reference: 'Directive 2014/30/EU',
    url: 'https://eur-lex.europa.eu/eli/dir/2014/30/oj',
  },
  red: {
    title: 'Radio Equipment Directive',
    reference: 'Directive 2014/53/EU',
    url: 'https://eur-lex.europa.eu/eli/dir/2014/53/oj',
  },
  ppe: {
    title: 'Personal Protective Equipment Regulation',
    reference: 'Regulation (EU) 2016/425',
    url: 'https://eur-lex.europa.eu/eli/reg/2016/425/oj',
  },
  cosmetics: {
    title: 'Cosmetics Regulation',
    reference: 'Regulation (EC) No 1223/2009',
    url: 'https://eur-lex.europa.eu/eli/reg/2009/1223/oj',
  },
  medical: {
    title: 'Medical Devices Regulation',
    reference: 'Regulation (EU) 2017/745',
    url: 'https://eur-lex.europa.eu/eli/reg/2017/745/oj',
  },
  machinery: {
    title: 'Machinery Directive',
    reference: 'Directive 2006/42/EC — current framework before Regulation (EU) 2023/1230 applies generally from 20 January 2027',
    url: 'https://eur-lex.europa.eu/eli/dir/2006/42/oj',
  },
} as const;

const normalize = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const hasAny = (text: string, words: string[]) => words.some(word => text.includes(word));

function detectCategory(name: string): { category: string; confidence: RegulatoryConfidence; sources: RegulatorySource[]; notes: string[] } {
  const text = normalize(name);

  if (hasAny(text, ['juguete', 'toy', 'muñeca', 'muneca', 'peluche', 'puzzle infantil'])) {
    return {
      category: 'Juguete', confidence: 'high', sources: [SOURCES.toys, SOURCES.toyTransition],
      notes: ['Confirmar edad prevista, función de juego y exclusiones antes de cerrar la clasificación.'],
    };
  }
  if (hasAny(text, ['wifi', 'bluetooth', 'radio', 'wireless', 'inalambr', 'auricular', 'router', 'smartwatch'])) {
    return {
      category: 'Equipo radioeléctrico', confidence: 'medium', sources: [SOURCES.red, SOURCES.emc],
      notes: ['Confirmar que el producto transmite o recibe intencionadamente ondas radioeléctricas y revisar requisitos específicos de ciberseguridad cuando procedan.'],
    };
  }
  if (hasAny(text, ['lampara', 'lámpara', 'cargador', 'adaptador', 'enchufe', 'electrico', 'eléctrico', 'power supply', 'secador'])) {
    return {
      category: 'Equipo eléctrico', confidence: 'medium', sources: [SOURCES.lvd, SOURCES.emc],
      notes: ['Confirmar tensiones nominales y uso previsto: la Directiva de Baja Tensión solo aplica dentro de sus rangos de tensión y existen exclusiones.'],
    };
  }
  if (hasAny(text, ['casco', 'helmet', 'guante proteccion', 'guante de proteccion', 'gafas proteccion', 'respirador', 'arnes', 'arnés'])) {
    return {
      category: 'Equipo de protección individual', confidence: 'medium', sources: [SOURCES.ppe],
      notes: ['Confirmar que la finalidad principal es proteger al usuario frente a uno o más riesgos.'],
    };
  }
  if (hasAny(text, ['crema', 'serum', 'sérum', 'champu', 'champú', 'maquillaje', 'cosmetico', 'cosmético', 'perfume', 'locion', 'loción'])) {
    return {
      category: 'Producto cosmético', confidence: 'medium', sources: [SOURCES.cosmetics],
      notes: ['Confirmar composición, zona de aplicación, finalidad principal y que no existan alegaciones medicinales.'],
    };
  }
  if (hasAny(text, ['marcapasos', 'cateter', 'catéter', 'protesis', 'prótesis', 'medical device', 'dispositivo medico', 'dispositivo médico'])) {
    return {
      category: 'Posible producto sanitario', confidence: 'medium', sources: [SOURCES.medical],
      notes: ['La condición de producto sanitario depende de la finalidad prevista por el fabricante; el nombre comercial por sí solo no basta.'],
    };
  }
  if (hasAny(text, ['maquina', 'máquina', 'prensa', 'torno', 'elevador industrial', 'sierra electrica', 'sierra eléctrica'])) {
    return {
      category: 'Posible maquinaria', confidence: 'medium', sources: [SOURCES.machinery],
      notes: ['Confirmar definición legal, componentes móviles, accionamiento y fecha prevista de puesta en el mercado por la transición normativa de 2027.'],
    };
  }

  return {
    category: 'Producto de consumo — categoría por confirmar', confidence: 'low', sources: [],
    notes: ['No se puede determinar con fiabilidad la legislación sectorial solo a partir del nombre. Solicitar descripción, uso previsto, materiales, alimentación eléctrica, conectividad, público objetivo y fotografías/etiquetado.'],
  };
}

function baseObligations(product: ProductLike): RegulatoryObligation[] {
  const obligations: RegulatoryObligation[] = [
    {
      id: 'identify-applicable-rules',
      title: 'Identificar toda la normativa aplicable antes de comercializar',
      reason: 'Un mismo producto puede quedar sujeto a legislación horizontal y sectorial simultáneamente.',
      evidence: ['Descripción y uso previsto', 'Clasificación/categoría', 'Lista de actos y normas aplicables'],
      source: SOURCES.ce,
    },
    {
      id: 'traceability',
      title: 'Comprobar identificación y trazabilidad del producto y operadores económicos',
      reason: 'La comercialización en la UE exige información que permita identificar el producto y a los operadores responsables según la normativa aplicable.',
      evidence: ['Identificador de producto/lote/serie', 'Nombre y dirección del fabricante', 'Operador económico establecido en la UE cuando proceda'],
      source: SOURCES.gpsr,
    },
    {
      id: 'safety-information',
      title: 'Comprobar instrucciones e información de seguridad',
      reason: 'Las advertencias e instrucciones deben ser adecuadas al producto, sus riesgos y el mercado de destino.',
      evidence: ['Manual/instrucciones', 'Advertencias', 'Idiomas exigidos por los Estados miembros de destino'],
      source: SOURCES.gpsr,
    },
    {
      id: 'technical-evidence',
      title: 'Reunir evidencia técnica de seguridad y conformidad',
      reason: 'La documentación debe permitir demostrar el cumplimiento de las obligaciones aplicables y responder a las autoridades de vigilancia de mercado.',
      evidence: ['Evaluación de riesgos', 'Ensayos/certificados pertinentes', 'Expediente o documentación técnica cuando la legislación sectorial lo exija'],
      source: SOURCES.ce,
    },
  ];

  if (!product.manufacturer.trim()) obligations.push({
    id: 'missing-manufacturer', title: 'Completar fabricante',
    reason: 'El catálogo no aporta un fabricante identificable.', evidence: ['Nombre legal', 'Dirección postal/contacto'], source: SOURCES.gpsr,
  });
  if (!product.responsible.trim()) obligations.push({
    id: 'missing-eu-operator', title: 'Determinar el operador económico responsable en la UE cuando proceda',
    reason: 'El catálogo no aporta el operador responsable/importador/persona responsable aplicable.', evidence: ['Nombre legal', 'Dirección en la UE', 'Rol exacto'], source: SOURCES.gpsr,
  });
  if (!product.warning.trim()) obligations.push({
    id: 'missing-warnings', title: 'Revisar advertencias e instrucciones de seguridad',
    reason: 'El catálogo no aporta advertencias de seguridad.', evidence: ['Advertencias', 'Instrucciones de uso seguro', 'Idioma del mercado de destino'], source: SOURCES.gpsr,
  });

  return obligations;
}

function ceObligation(source: RegulatorySource): RegulatoryObligation {
  return {
    id: `ce-${source.reference}`,
    title: 'Verificar si procede marcado CE, evaluación de conformidad y declaración UE de conformidad',
    reason: 'El marcado CE solo debe utilizarse cuando la legislación sectorial aplicable lo exige; no es una aprobación emitida por la UE.',
    evidence: ['Procedimiento de evaluación de conformidad', 'Declaración UE de conformidad', 'Documentación técnica', 'Marcado CE correcto cuando proceda'],
    source,
  };
}

export function assessEuRegulatory(product: ProductLike): EuRegulatoryAssessment {
  const detected = detectCategory(product.name);
  const applicableActs: RegulatoryAct[] = [
    {
      ...SOURCES.gpsr,
      applicability: 'baseline',
      reason: 'Marco horizontal de seguridad de productos de consumo, sin perjuicio de reglas sectoriales más específicas y de su alcance concreto.',
    },
    ...detected.sources.map(source => ({
      ...source,
      applicability: 'candidate' as const,
      reason: `Candidato por la clasificación preliminar «${detected.category}»; debe confirmarse con características y uso previsto.`,
    })),
  ];

  const obligations = baseObligations(product);
  if (detected.sources.some(source => [SOURCES.toys.reference, SOURCES.lvd.reference, SOURCES.red.reference, SOURCES.ppe.reference, SOURCES.medical.reference, SOURCES.machinery.reference].includes(source.reference as never))) {
    obligations.push(ceObligation(detected.sources[0]));
  }

  if (detected.category === 'Juguete') obligations.push({
    id: 'toy-safety-assessment',
    title: 'Preparar evaluación de seguridad específica del juguete',
    reason: 'Los juguetes requieren evaluación de peligros y un procedimiento de evaluación de conformidad antes de su comercialización.',
    evidence: ['Evaluación de peligros', 'Ensayos/normas armonizadas aplicadas', 'Declaración UE de conformidad', 'Marcado CE'],
    source: SOURCES.toys,
  });

  if (detected.category === 'Producto cosmético') obligations.push({
    id: 'cosmetics-file',
    title: 'Verificar expediente, evaluación de seguridad y responsable del cosmético',
    reason: 'Los cosméticos tienen un régimen sectorial propio y no deben tratarse como simples productos GPSR/CE.',
    evidence: ['Persona responsable', 'Informe de seguridad', 'Expediente de información del producto', 'Etiquetado e ingredientes'],
    source: SOURCES.cosmetics,
  });

  return {
    engineVersion: EU_REGULATORY_ENGINE_VERSION,
    category: detected.category,
    confidence: detected.confidence,
    requiresCategoryConfirmation: detected.confidence !== 'high',
    applicableActs,
    obligations,
    uncertainties: detected.notes,
    disclaimer: 'Evaluación automatizada de asistencia regulatoria. No constituye certificación, aprobación de una autoridad de la UE ni asesoramiento jurídico. La aplicabilidad final depende de las características, finalidad prevista, composición, riesgos y mercado concreto del producto.',
  };
}
