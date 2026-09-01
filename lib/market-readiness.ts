import type { Product, Result } from './analysis';

export type ReadinessState = 'READY_TO_CONTINUE' | 'REVIEW_REQUIRED' | 'NOT_READY_TO_MARKET';
export type MarketReadinessDecision = {
  state: ReadinessState;
  label: string;
  reasons: string[];
  blockers: string[];
  nextActions: string[];
};

export function marketReadiness(product: Product, result: Result): MarketReadinessDecision {
  const reasons: string[] = [];
  const blockers: string[] = [];
  const nextActions: string[] = [];
  const regulatory = result.regulatory;

  if (!product.manufacturer.trim()) blockers.push('Falta identificar al fabricante.');
  if (!product.responsible.trim()) blockers.push('Falta determinar el operador económico responsable en la UE cuando proceda.');
  if (!product.warning.trim()) reasons.push('No se han aportado advertencias o instrucciones de seguridad.');
  if (regulatory?.requiresCategoryConfirmation) reasons.push('La categoría regulatoria necesita confirmación con más características o uso previsto.');
  if (regulatory?.uncertainties.length) reasons.push(...regulatory.uncertainties.slice(0, 3));

  if (blockers.length) {
    nextActions.push('Completar los datos de trazabilidad obligatorios antes de comercializar.');
    if (regulatory) nextActions.push(...regulatory.obligations.slice(0, 3).map(item => item.title));
    return { state: 'NOT_READY_TO_MARKET', label: 'No listo para comercializar', reasons, blockers, nextActions: [...new Set(nextActions)] };
  }

  if (reasons.length || result.missing.length || regulatory?.requiresCategoryConfirmation) {
    nextActions.push('Confirmar categoría, uso previsto y legislación sectorial aplicable.');
    if (regulatory) nextActions.push(...regulatory.obligations.slice(0, 3).map(item => item.title));
    return { state: 'REVIEW_REQUIRED', label: 'Revisión necesaria', reasons, blockers, nextActions: [...new Set(nextActions)] };
  }

  reasons.push('No faltan los campos básicos de trazabilidad y no se ha detectado una incertidumbre crítica con los datos disponibles.');
  nextActions.push('Continuar con la verificación documental y técnica específica antes de comercializar.');
  return { state: 'READY_TO_CONTINUE', label: 'Apto para continuar la revisión', reasons, blockers, nextActions };
}
