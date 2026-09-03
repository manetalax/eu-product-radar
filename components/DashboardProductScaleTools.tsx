'use client';

import { useEffect, useMemo, useState } from 'react';

const PAGE_SIZES = [50, 100, 250] as const;

export default function DashboardProductScaleTools() {
  const [query, setQuery] = useState('');
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(50);
  const [page, setPage] = useState(0);
  const [rowCount, setRowCount] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const normalizedQuery = useMemo(() => query.trim().toLocaleLowerCase(), [query]);

  useEffect(() => { setPage(0); }, [normalizedQuery, pageSize]);

  useEffect(() => {
    const apply = () => {
      const tbody = document.querySelector<HTMLTableSectionElement>('.workspace .results table tbody');
      if (!tbody) {
        setRowCount(0);
        setMatchCount(0);
        return;
      }
      const rows = Array.from(tbody.querySelectorAll<HTMLTableRowElement>('tr'));
      const matching = rows.filter(row => !normalizedQuery || (row.textContent ?? '').toLocaleLowerCase().includes(normalizedQuery));
      const maxPage = Math.max(0, Math.ceil(matching.length / pageSize) - 1);
      const safePage = Math.min(page, maxPage);
      if (safePage !== page) setPage(safePage);
      const start = safePage * pageSize;
      const visible = new Set(matching.slice(start, start + pageSize));
      rows.forEach(row => { row.style.display = visible.has(row) ? '' : 'none'; });
      setRowCount(rows.length);
      setMatchCount(matching.length);
      const table = tbody.closest('table');
      if (table) table.setAttribute('data-scaled-products', String(rows.length));
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [normalizedQuery, page, pageSize]);

  if (!rowCount) return null;
  const pages = Math.max(1, Math.ceil(matchCount / pageSize));
  const currentPage = Math.min(page + 1, pages);

  return <div className="iv-product-scale" role="region" aria-label="Herramientas para catálogos grandes">
    <style>{`
      .iv-product-scale{position:sticky;bottom:10px;z-index:35;width:min(1180px,calc(100% - 24px));margin:12px auto;padding:10px 12px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;border:1px solid rgba(15,23,42,.12);border-radius:16px;background:rgba(255,255,255,.96);box-shadow:0 14px 38px rgba(15,23,42,.12);backdrop-filter:blur(12px)}
      .iv-product-scale label{font-size:12px;font-weight:800;color:#475569}.iv-product-scale input{min-width:220px;flex:1;border:1px solid #dbe3ec;border-radius:10px;padding:9px 10px}.iv-product-scale select,.iv-product-scale button{border:1px solid #dbe3ec;background:#fff;border-radius:10px;padding:8px 10px}.iv-product-scale .iv-count{font-size:12px;color:#64748b;margin-left:auto}.iv-product-scale button:disabled{opacity:.45}
      @media(max-width:680px){.iv-product-scale{bottom:6px;width:calc(100% - 16px);gap:7px}.iv-product-scale input{min-width:100%;order:1}.iv-product-scale .iv-count{margin-left:0;width:100%;order:4}}
    `}</style>
    <label htmlFor="iv-product-search">Buscar</label>
    <input id="iv-product-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Producto, prioridad o campo…" />
    <label htmlFor="iv-product-page-size">Filas</label>
    <select id="iv-product-page-size" value={pageSize} onChange={event => setPageSize(Number(event.target.value) as (typeof PAGE_SIZES)[number])}>{PAGE_SIZES.map(size => <option key={size} value={size}>{size}</option>)}</select>
    <button type="button" disabled={page <= 0} onClick={() => setPage(value => Math.max(0, value - 1))}>←</button>
    <button type="button" disabled={page + 1 >= pages} onClick={() => setPage(value => Math.min(pages - 1, value + 1))}>→</button>
    <span className="iv-count">{matchCount.toLocaleString()} de {rowCount.toLocaleString()} · página {currentPage}/{pages}</span>
  </div>;
}
