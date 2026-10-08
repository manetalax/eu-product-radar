import { analyze, MAX_FILE_BYTES } from '../lib/analysis';
import type { Product, Result } from '../lib/analysis';
import { parseProducts } from '../lib/import-products';

type Row = { product: Product; result: Result };
const PAGE_SIZE = 50;
const byId = <T extends HTMLElement>(id: string) => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Falta el elemento #${id}`);
  return element as T;
};

const fileInput = byId<HTMLInputElement>('catalog-file');
const dropzone = byId<HTMLElement>('dropzone');
const message = byId<HTMLParagraphElement>('message');
const resultsSection = byId<HTMLElement>('results');
const rowsElement = byId<HTMLTableSectionElement>('result-rows');
const searchInput = byId<HTMLInputElement>('search');
const rowsPerPage = PAGE_SIZE;
let rows: Row[] = [];
let currentPage = 0;
let currentFilename = '';

function setMessage(text: string, kind: 'error' | 'success' | '' = '') {
  message.textContent = text;
  message.dataset.kind = kind;
}

function safeCell(value: string) {
  const safe = /^[\s]*[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

function addCell(tr: HTMLTableRowElement, text: string, className = '') {
  const cell = document.createElement('td');
  cell.textContent = text;
  if (className) cell.className = className;
  tr.append(cell);
}

function render() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const filtered = rows.filter(({ product, result }) => `${product.name} ${result.priority} ${result.missing.join(' ')} ${result.regulatory?.category ?? ''}`.toLocaleLowerCase().includes(query));
  const pageCount = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  currentPage = Math.min(currentPage, pageCount - 1);
  const visible = filtered.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);
  rowsElement.replaceChildren();
  for (const { result } of visible) {
    const tr = document.createElement('tr');
    addCell(tr, result.name);
    addCell(tr, `${result.score}/100`);
    addCell(tr, result.priority, `priority ${result.priority.toLocaleLowerCase()}`);
    addCell(tr, result.missing.length ? result.missing.join(', ') : 'Sin campos básicos pendientes');
    addCell(tr, result.regulatory?.category ?? 'Pendiente de clasificar');
    rowsElement.append(tr);
  }
  byId<HTMLSpanElement>('result-count').textContent = `${filtered.length.toLocaleString('es-ES')} productos`;
  byId<HTMLSpanElement>('page-label').textContent = `Página ${currentPage + 1} de ${pageCount}`;
  byId<HTMLButtonElement>('previous').disabled = currentPage === 0;
  byId<HTMLButtonElement>('next').disabled = currentPage + 1 >= pageCount;
}

async function loadFile(file?: File) {
  if (!file) return;
  setMessage('');
  if (file.size > MAX_FILE_BYTES) {
    setMessage('El archivo supera el límite de 5 MB.', 'error');
    return;
  }
  try {
    const products = parseProducts(await file.arrayBuffer(), file.name);
    const assessments = analyze(products, 'EU');
    rows = products.map((product, index) => ({ product, result: assessments[index] }));
    currentFilename = file.name;
    currentPage = 0;
    searchInput.value = '';
    byId<HTMLParagraphElement>('filename').textContent = `${file.name} · ${products.length.toLocaleString('es-ES')} productos`;
    byId<HTMLElement>('metric-products').textContent = products.length.toLocaleString('es-ES');
    byId<HTMLElement>('metric-average').textContent = `${Math.round(assessments.reduce((sum, item) => sum + item.score, 0) / assessments.length)}/100`;
    byId<HTMLElement>('metric-high').textContent = assessments.filter(item => item.priority === 'ALTA').length.toLocaleString('es-ES');
    resultsSection.hidden = false;
    setMessage('Revisión terminada. El catálogo se ha procesado en este dispositivo.', 'success');
    render();
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    setMessage(error instanceof Error ? error.message : 'No se pudo leer el archivo.', 'error');
  } finally {
    fileInput.value = '';
  }
}

fileInput.addEventListener('change', () => void loadFile(fileInput.files?.[0]));
searchInput.addEventListener('input', () => { currentPage = 0; render(); });
byId<HTMLButtonElement>('previous').addEventListener('click', () => { currentPage = Math.max(0, currentPage - 1); render(); });
byId<HTMLButtonElement>('next').addEventListener('click', () => { currentPage += 1; render(); });
byId<HTMLButtonElement>('export').addEventListener('click', () => {
  const header = ['Producto', 'Indicador', 'Prioridad', 'Datos básicos pendientes', 'Posible categoría regulatoria'];
  const content = [header, ...rows.map(({ result }) => [result.name, `${result.score}/100`, result.priority, result.missing.join('; '), result.regulatory?.category ?? 'Pendiente de clasificar'])]
    .map(line => line.map(value => safeCell(String(value))).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF', content], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${currentFilename.replace(/\.[^.]+$/, '') || 'importverifier'}-revision.csv`;
  link.click();
  URL.revokeObjectURL(url);
});

for (const eventName of ['dragenter', 'dragover'] as const) dropzone.addEventListener(eventName, event => {
  event.preventDefault();
  dropzone.dataset.dragging = 'true';
});
for (const eventName of ['dragleave', 'drop'] as const) dropzone.addEventListener(eventName, event => {
  event.preventDefault();
  delete dropzone.dataset.dragging;
});
dropzone.addEventListener('drop', event => void loadFile((event as DragEvent).dataTransfer?.files[0]));
dropzone.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    fileInput.click();
  }
});
