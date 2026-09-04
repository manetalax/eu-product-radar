'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Product, Result } from '@/lib/analysis';
import { documentationFor } from '@/lib/documentation';
import type { Language } from '@/lib/landing-i18n';
import type { MarketCode } from '@/lib/markets';

const PAGE_SIZES = [50, 100, 250] as const;
type PageSize = (typeof PAGE_SIZES)[number];

const COPY = {
  es: { search: 'Buscar', placeholder: 'Producto, prioridad o campo…', rows: 'Filas', previous: 'Anterior', next: 'Siguiente', page: 'página', noMatches: 'No hay productos que coincidan con la búsqueda.' },
  en: { search: 'Search', placeholder: 'Product, priority or field…', rows: 'Rows', previous: 'Previous', next: 'Next', page: 'page', noMatches: 'No products match your search.' },
  fr: { search: 'Rechercher', placeholder: 'Produit, priorité ou champ…', rows: 'Lignes', previous: 'Précédent', next: 'Suivant', page: 'page', noMatches: 'Aucun produit ne correspond à la recherche.' },
  de: { search: 'Suchen', placeholder: 'Produkt, Priorität oder Feld…', rows: 'Zeilen', previous: 'Zurück', next: 'Weiter', page: 'Seite', noMatches: 'Keine Produkte entsprechen der Suche.' },
  it: { search: 'Cerca', placeholder: 'Prodotto, priorità o campo…', rows: 'Righe', previous: 'Precedente', next: 'Successivo', page: 'pagina', noMatches: 'Nessun prodotto corrisponde alla ricerca.' },
  pt: { search: 'Pesquisar', placeholder: 'Produto, prioridade ou campo…', rows: 'Linhas', previous: 'Anterior', next: 'Seguinte', page: 'página', noMatches: 'Nenhum produto corresponde à pesquisa.' },
} as const;

type PaginationState<T> = {
  query: string;
  setQuery: (value: string) => void;
  pageSize: PageSize;
  setPageSize: (value: PageSize) => void;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  filtered: T[];
  visible: T[];
  pages: number;
  t: (typeof COPY)[Language];
};

function usePagination<T>(items: T[], queryText: (item: T) => string, language: Language): PaginationState<T> {
  const [query, setQuery] = useState('');
  const [pageSize, setPageSize] = useState<PageSize>(50);
  const [page, setPage] = useState(0);
  const normalized = query.trim().toLocaleLowerCase();
  const filtered = useMemo(() => items.filter(item => !normalized || queryText(item).toLocaleLowerCase().includes(normalized)), [items, normalized, queryText]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages - 1);
  const visible = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);
  useEffect(() => { setPage(0); }, [normalized, pageSize, items]);
  return { query, setQuery, pageSize, setPageSize, page: safePage, setPage, filtered, visible, pages, t: COPY[language] };
}

function Toolbar<T>({ state, id }: { state: PaginationState<T>; id: string }) {
  const { query, setQuery, pageSize, setPageSize, page, setPage, filtered, pages, t } = state;
  return <>
    <style>{`
      .catalog-scale-toolbar{display:grid;grid-template-columns:auto minmax(180px,1fr) auto auto auto auto;gap:8px;align-items:center;margin:16px 0;padding:12px;border:1px solid #e2e8f0;border-radius:14px;background:#f8fafc}.catalog-scale-toolbar label{font-size:12px;font-weight:800;color:#475569}.catalog-scale-toolbar input,.catalog-scale-toolbar select{min-width:0;border:1px solid #cbd5e1;border-radius:10px;background:#fff;padding:9px 10px}.catalog-scale-toolbar .btn{padding:8px 10px}.catalog-scale-count{grid-column:1/-1;font-size:12px;color:#64748b}.catalog-no-matches{padding:18px 0}@media(max-width:760px){.catalog-scale-toolbar{grid-template-columns:1fr 1fr}.catalog-scale-toolbar label[for$="-search"],.catalog-scale-toolbar input{grid-column:1/-1}.catalog-scale-toolbar input{width:100%}.catalog-scale-count{grid-column:1/-1}}
    `}</style>
    <div className="catalog-scale-toolbar" role="region" aria-label={t.search}>
      <label htmlFor={`${id}-search`}>{t.search}</label>
      <input id={`${id}-search`} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={t.placeholder} />
      <label htmlFor={`${id}-page-size`}>{t.rows}</label>
      <select id={`${id}-page-size`} value={pageSize} onChange={event => setPageSize(Number(event.target.value) as PageSize)}>{PAGE_SIZES.map(size => <option key={size} value={size}>{size}</option>)}</select>
      <button className="btn ghost" type="button" disabled={page === 0} onClick={() => setPage(value => Math.max(0, value - 1))}>{t.previous}</button>
      <button className="btn ghost" type="button" disabled={page + 1 >= pages} onClick={() => setPage(value => Math.min(pages - 1, value + 1))}>{t.next}</button>
      <span className="catalog-scale-count">{filtered.length.toLocaleString()} · {t.page} {page + 1}/{pages}</span>
    </div>
  </>;
}

export function ScalableProductResults({ results, language, caption, productLabel, indicatorLabel, priorityColumnLabel, fieldsLabel, priorityLabel, missingLabel, noBasicMissing }: { results: Result[]; language: Language; caption: string; productLabel: string; indicatorLabel: string; priorityColumnLabel: string; fieldsLabel: string; priorityLabel: (priority: Result['priority']) => string; missingLabel: (value: string) => string; noBasicMissing: string }) {
  const queryText = useMemo(() => (result: Result) => `${result.name} ${priorityLabel(result.priority)} ${result.missing.map(missingLabel).join(' ')}`, [priorityLabel, missingLabel]);
  const state = usePagination(results, queryText, language);
  return <><Toolbar state={state} id="catalog-results" />{state.filtered.length ? <div className="results"><table><caption>{caption}</caption><thead><tr><th>{productLabel}</th><th>{indicatorLabel}</th><th>{priorityColumnLabel}</th><th>{fieldsLabel}</th></tr></thead><tbody>{state.visible.map((result, index) => <tr key={`${state.page}-${index}-${result.name}`}><td><strong>{result.name}</strong></td><td>{result.score}/100</td><td><span className={`pill ${result.priority === 'ALTA' ? 'high' : result.priority === 'MEDIA' ? 'medium' : 'low'}`}>{priorityLabel(result.priority)}</span></td><td>{result.missing.map(missingLabel).join(', ') || noBasicMissing}</td></tr>)}</tbody></table></div> : <p className="muted catalog-no-matches" role="status">{state.t.noMatches}</p>}</>;
}

export function ScalableDocumentationList({ products, marketCode, language, whereGet, whatCheck, officialSource }: { products: Product[]; marketCode: MarketCode; language: Language; whereGet: string; whatCheck: string; officialSource: string }) {
  const queryText = useMemo(() => (product: Product) => `${product.name} ${product.manufacturer} ${product.responsible} ${product.description ?? ''}`, []);
  const state = usePagination(products, queryText, language);
  return <><Toolbar state={state} id="documentation-products" />{state.filtered.length ? state.visible.map((product, index) => <details key={`${state.page}-${index}-${product.name}`}><summary>{product.name}</summary><div className="documentation-body">{documentationFor(product, marketCode, language).map(action => <section key={action.title}><h3>{action.title}</h3><p><strong>{action.status}</strong> · {action.condition}</p><p><strong>{whereGet}</strong> {action.obtain}</p><p><strong>{whatCheck}</strong> {action.check}</p><a href={action.source} target="_blank" rel="noopener noreferrer">{officialSource}</a></section>)}</div></details>) : <p className="muted catalog-no-matches" role="status">{state.t.noMatches}</p>}</>;
}
