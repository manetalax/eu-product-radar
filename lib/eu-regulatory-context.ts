import type { Product } from './analysis';
import { assessEuRegulatory, type EuRegulatoryAssessment } from './eu-regulatory-engine';

const SIGNAL_FIELDS: (keyof Product)[] = ['name','description','materials','intendedUse','audience','power','connectivity','composition','warning'];

export function regulatoryContextText(product: Product): string {
  return SIGNAL_FIELDS
    .map(key => typeof product[key] === 'string' ? product[key]!.trim() : '')
    .filter(Boolean)
    .join(' · ');
}

export function assessEuRegulatoryWithContext(product: Product): EuRegulatoryAssessment {
  const contextualName = regulatoryContextText(product) || product.name;
  const base = assessEuRegulatory({
    name: contextualName,
    manufacturer: product.manufacturer,
    responsible: product.responsible,
    warning: product.warning,
  });

  const suppliedSignals = SIGNAL_FIELDS.filter(key => typeof product[key] === 'string' && product[key]!.trim()).length;
  const contextNote = suppliedSignals > 1
    ? `Clasificación apoyada en ${suppliedSignals} señales del producto (nombre y metadatos disponibles).`
    : 'Clasificación apoyada principalmente en el nombre del producto; añade descripción, materiales, uso previsto, público, alimentación, conectividad o composición para aumentar precisión.';

  return {
    ...base,
    uncertainties: [contextNote, ...base.uncertainties],
  };
}
