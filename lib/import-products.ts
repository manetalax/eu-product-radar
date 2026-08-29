import * as XLSX from 'xlsx';
import { MAX_FILE_BYTES, MAX_PRODUCTS, Product, validateProducts } from './analysis';

const aliases: Record<keyof Product, string[]> = {
  name: ['name', 'title', 'nombre', 'producto'],
  manufacturer: ['manufacturer', 'fabricante'],
  responsible: ['responsible', 'responsable', 'responsableue', 'responsibleeu', 'operadormercado', 'operadoreconomico', 'importador', 'importer', 'localoperator', 'marketoperator'],
  warning: ['warning', 'warnings', 'advertencia', 'advertencias', 'seguridad', 'safety', 'advertenciasseguridad'],
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
    if (matches.length !== 1) throw new Error('Incluye una sola columna para cada campo. Encabezados recomendados: nombre, fabricante, operador_mercado, advertencias_seguridad. También aceptamos responsable_ue para archivos anteriores.');
    indexes[key] = matches[0];
  }
  return validateProducts(matrix.map(row => Object.fromEntries(Object.entries(indexes).map(([key, index]) => [key, String(row[index] ?? '')]))));
}
