'use client';

import { useEffect, useMemo, useState } from 'react';

type ModuleId = 'market' | 'import' | 'onboarding' | 'overview' | 'selected';
type ModuleState = { id: ModuleId; hidden: boolean; collapsed: boolean };

const STORAGE_KEY = 'importverifier:dashboard-layout:v1';
const DEFAULTS: ModuleState[] = [
  { id: 'market', hidden: false, collapsed: false },
  { id: 'import', hidden: false, collapsed: false },
  { id: 'onboarding', hidden: false, collapsed: false },
  { id: 'overview', hidden: false, collapsed: false },
  { id: 'selected', hidden: false, collapsed: false },
];

const LABELS: Record<ModuleId, string> = {
  market: 'Mercados',
  import: 'Nuevo análisis',
  onboarding: 'Primeros pasos',
  overview: 'Resumen y KPIs',
  selected: 'Análisis seleccionado',
};

const SELECTORS: Record<ModuleId, string[]> = {
  market: ['.workspace > .market-rail', '.workspace > .trust-notice'],
  import: ['.workspace > .premium-import'],
  onboarding: ['.workspace > .onboarding-card'],
  overview: ['.workspace > .section-heading', '.workspace > .premium-kpis'],
  selected: ['.workspace > .selected-analysis', '.workspace > .empty-state'],
};

function loadInitial(): ModuleState[] {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (!Array.isArray(parsed)) return DEFAULTS;
    const known = new Map(parsed.filter(Boolean).map((item: ModuleState) => [item.id, item]));
    return DEFAULTS.map(item => ({ ...item, ...(known.get(item.id) ?? {}) })).sort((a, b) => {
      const ai = parsed.findIndex((item: ModuleState) => item?.id === a.id);
      const bi = parsed.findIndex((item: ModuleState) => item?.id === b.id);
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
    });
  } catch {
    return DEFAULTS;
  }
}

export default function DashboardModuleOrganizer() {
  const [open, setOpen] = useState(false);
  const [modules, setModules] = useState<ModuleState[]>(loadInitial);
  const hidden = useMemo(() => modules.filter(item => item.hidden), [modules]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(modules));

    const apply = () => {
      modules.forEach((module, index) => {
        SELECTORS[module.id].forEach(selector => {
          document.querySelectorAll<HTMLElement>(selector).forEach(element => {
            element.dataset.dashboardModule = module.id;
            element.style.order = String(20 + index);
            element.style.display = module.hidden ? 'none' : '';
            element.classList.toggle('iv-module-collapsed', module.collapsed && !module.hidden);
          });
        });
      });
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [modules]);

  function patch(id: ModuleId, changes: Partial<ModuleState>) {
    setModules(items => items.map(item => item.id === id ? { ...item, ...changes } : item));
  }

  function move(id: ModuleId, direction: -1 | 1) {
    setModules(items => {
      const index = items.findIndex(item => item.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= items.length) return items;
      const next = [...items];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return <>
    <style>{`
      .workspace{display:flex;flex-direction:column;min-width:0}
      .workspace>.workspace-heading{order:-100}.workspace>.workspace-subtitle{order:-99}
      .workspace>.file-input{order:-98}.workspace>.message{order:-97}
      .workspace>[data-dashboard-module]{transition:max-height .2s ease,opacity .2s ease;min-width:0}
      .workspace>.iv-module-collapsed{max-height:76px!important;overflow:hidden!important;opacity:.88}
      .iv-organizer{position:sticky;top:8px;z-index:40;margin:0 auto 12px;width:min(1180px,calc(100% - 24px));display:flex;justify-content:flex-end;pointer-events:none}
      .iv-organizer button,.iv-organizer-panel{pointer-events:auto}
      .iv-organizer-toggle{border:1px solid rgba(15,23,42,.14);background:rgba(255,255,255,.96);border-radius:999px;padding:9px 14px;font-weight:750;box-shadow:0 8px 24px rgba(15,23,42,.08)}
      .iv-organizer-panel{position:absolute;right:0;top:46px;width:min(390px,calc(100vw - 28px));background:#fff;border:1px solid rgba(15,23,42,.12);border-radius:18px;padding:14px;box-shadow:0 24px 64px rgba(15,23,42,.18)}
      .iv-organizer-panel h2{font-size:16px;margin:0 0 4px}.iv-organizer-panel p{font-size:12px;margin:0 0 12px;color:#64748b}
      .iv-module-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;padding:9px 0;border-top:1px solid #eef2f7}
      .iv-module-row strong{font-size:13px}.iv-module-actions{display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end}
      .iv-module-actions button,.iv-add{border:1px solid #dbe3ec;background:#fff;border-radius:9px;padding:6px 8px;font-size:12px}
      .iv-add-list{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.iv-add{background:#f8fafc}
      @media(max-width:720px){.iv-organizer{top:4px;width:calc(100% - 16px)}.iv-organizer-toggle{padding:8px 11px}.iv-organizer-panel{right:0}.iv-module-row{grid-template-columns:1fr}.iv-module-actions{justify-content:flex-start}}
    `}</style>
    <div className="iv-organizer" aria-label="Organización del dashboard">
      <button className="iv-organizer-toggle" type="button" aria-expanded={open} onClick={() => setOpen(value => !value)}>Personalizar panel</button>
      {open && <div className="iv-organizer-panel">
        <h2>Organiza tu espacio</h2>
        <p>Ordena, pliega u oculta bloques. La configuración se guarda en este dispositivo.</p>
        {modules.filter(item => !item.hidden).map((module, index) => <div className="iv-module-row" key={module.id}>
          <strong>{LABELS[module.id]}</strong>
          <div className="iv-module-actions">
            <button type="button" disabled={index === 0} onClick={() => move(module.id, -1)} aria-label={`Subir ${LABELS[module.id]}`}>↑</button>
            <button type="button" disabled={index === modules.filter(item => !item.hidden).length - 1} onClick={() => move(module.id, 1)} aria-label={`Bajar ${LABELS[module.id]}`}>↓</button>
            <button type="button" onClick={() => patch(module.id, { collapsed: !module.collapsed })}>{module.collapsed ? 'Abrir' : 'Plegar'}</button>
            <button type="button" onClick={() => patch(module.id, { hidden: true })}>Quitar</button>
          </div>
        </div>)}
        {hidden.length > 0 && <div className="iv-add-list" aria-label="Añadir módulos">{hidden.map(module => <button className="iv-add" type="button" key={module.id} onClick={() => patch(module.id, { hidden: false, collapsed: false })}>+ {LABELS[module.id]}</button>)}</div>}
      </div>}
    </div>
  </>;
}
