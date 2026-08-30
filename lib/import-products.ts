import * as XLSX from 'xlsx';
import { MAX_FILE_BYTES, MAX_PRODUCTS, Product, validateProducts } from './analysis';

const aliases: Record<keyof Product, string[]> = {
  name: ['name', 'title', 'nombre', 'producto', 'productname', 'producttitle', 'itemname', 'itemtitle'],
  manufacturer: ['manufacturer', 'fabricante', 'vendor', 'brand', 'brands', 'marca', 'productbrand'],
  responsible: ['responsible', 'responsable', 'responsableue', 'responsibleeu', 'responsibleperson', 'euresponsibleperson', 'euoperator', 'economicoperator', 'operadormercado', 'operadoreconomico', 'importador', 'importer', 'importername', 'euimporter', 'localoperator', 'marketoperator'],
  warning: ['warning', 'warnings', 'advertencia', 'advertencias', 'seguridad', 'safety', 'safetywarning', 'safetywarnings', 'productwarning', 'caution', 'advertenciasseguridad'],
  description: ['description', 'descripcion', 'descripción', 'productdescription', 'bodyhtml', 'details', 'detalle'],
  materials: ['materials', 'material', 'materiales', 'fabric', 'tejido', 'componentmaterials'],
  intendedUse: ['intendeduse', 'uso', 'usoprevisto', 'finalidad', 'purpose', 'intendedpurpose'],
  audience: ['audience', 'publico', 'público', 'edad', 'age', 'agegroup', 'targetaudience', 'usuario'],
  power: ['power', 'alimentacion', 'alimentación', 'voltage', 'voltaje', 'battery', 'bateria', 'batería', 'powersupply'],
  connectivity: ['connectivity', 'conectividad', 'wireless', 'radio', 'bluetooth', 'wifi', 'network'],
  composition: ['composition', 'composicion', 'composición', 'ingredients', 'ingredientes', 'formula', 'formulacion', 'formulación'],
};
const normalize = (value: unknown) => String(value ?? '').replace(/^\uFEFF/, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[\s_-]/g, '');

export function parseProducts(bytes: ArrayBuffer, filename: string): Product[] {
  if (!/\.(csv|xls|xlsx)$/i.test(filename)) throw new Error('Selecciona un archivo CSV, XLS o XLSX.');
  if (bytes.byteLength === 0) throw new Error('El archivo está vacío.');
  if (bytes.byteLength > MAX_FILE_BYTES) throw new Error('El archivo supera el límite de 5 MB.');
  let matrix: unknown[][];
  try {
    const csv = /\.csv$/i.test(filename);
    const workbook = XLSX.read(csv ? new TextDecoder('utf-8', { fatal: true }).decode(bytes) : bytes, {
      type: csv ? 'string' : 'array', sheetRows: MAX_PRODUCTS + 2, sheets: 0, cellFormula: false,
    });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) throw new Error('No worksheet');
    if (sheet['!ref'] && XLSX.utils.decode_range(sheet['!ref']).e.c >= 100) throw new Error('Too many columns');
    matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '', blankrows: false, raw: false });
  } catch {
    throw new Error('No se puede leer el archivo. Para CSV, guárdalo como UTF-8; para Excel, usa un libro sin contraseña.');
  }
  const headers = matrix.shift() ?? [];
  if (headers.length > 100) throw new Error('El archivo tiene demasiadas columnas (máximo 100).');
  const indexes = {} as Record<keyof Product, number>;
  for (const key of Object.keys(aliases) as (keyof Product)[]) {
    const matches = headers.map((header, index) => aliases[key].includes(normalize(header)) ? index : -1).filter(index => index >= 0);
    if (matches.length > 1 || (key === 'name' && matches.length !== 1)) throw new Error('Incluye una sola columna para el nombre del producto y evita encabezados duplicados. Recomendados: nombre, fabricante, operador_mercado, advertencias_seguridad y, cuando existan, descripción, materiales, uso_previsto, público, alimentación, conectividad y composición.');
    indexes[key] = matches[0] ?? -1;
  }
  return validateProducts(matrix.map(row => Object.fromEntries(Object.entries(indexes).map(([key, index]) => [key, index >= 0 ? String(row[index] ?? '') : '']))));
}
