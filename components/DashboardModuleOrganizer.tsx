'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/lib/use-language';

type ModuleId = 'market' | 'import' | 'onboarding' | 'overview' | 'selected';
type ModuleState = { id: ModuleId; hidden: boolean; collapsed: boolean };
type LayoutPreset = 'focus' | 'complete' | 'default';

const STORAGE_KEY = 'importverifier:dashboard-layout:v2';
const DEFAULTS: ModuleState[] = [
  { id: 'import', hidden: false, collapsed: false },
  { id: 'overview', hidden: false, collapsed: false },
  { id: 'selected', hidden: false, collapsed: false },
  { id: 'market', hidden: false, collapsed: true },
  { id: 'onboarding', hidden: false, collapsed: true },
];

const PRESETS: Record<LayoutPreset, ModuleState[]> = {
  focus: [
    { id: 'import', hidden: false, collapsed: false },
    { id: 'selected', hidden: false, collapsed: false },
    { id: 'overview', hidden: false, collapsed: true },
    { id: 'market', hidden: true, collapsed: true },
    { id: 'onboarding', hidden: true, collapsed: true },
  ],
  complete: [
    { id: 'import', hidden: false, collapsed: false },
    { id: 'overview', hidden: false, collapsed: false },
    { id: 'selected', hidden: false, collapsed: false },
    { id: 'market', hidden: false, collapsed: false },
    { id: 'onboarding', hidden: false, collapsed: false },
  ],
  default: DEFAULTS,
};

const COPY = {
  es: { toggle: 'Personalizar panel', title: 'Organiza tu espacio', body: 'Ordena, pliega u oculta bloques. La configuración se guarda en este dispositivo.', open: 'Abrir', collapse: 'Plegar', remove: 'Quitar', add: 'Añadir módulos', up: 'Subir', down: 'Bajar', presets: 'Vistas rápidas', focus: 'Enfoque', complete: 'Todo visible', reset: 'Restablecer', labels: { market: 'Mercados', import: 'Nuevo análisis', onboarding: 'Primeros pasos', overview: 'Resumen y KPIs', selected: 'Análisis seleccionado' } },
  en: { toggle: 'Customize dashboard', title: 'Organize your workspace', body: 'Reorder, collapse or hide modules. Your layout is saved on this device.', open: 'Open', collapse: 'Collapse', remove: 'Remove', add: 'Add modules', up: 'Move up', down: 'Move down', presets: 'Quick views', focus: 'Focus', complete: 'Show all', reset: 'Reset', labels: { market: 'Markets', import: 'New analysis', onboarding: 'Getting started', overview: 'Overview and KPIs', selected: 'Selected analysis' } },
  fr: { toggle: 'Personnaliser le tableau', title: 'Organisez votre espace', body: 'Réorganisez, repliez ou masquez des modules. La disposition est enregistrée sur cet appareil.', open: 'Ouvrir', collapse: 'Replier', remove: 'Retirer', add: 'Ajouter des modules', up: 'Monter', down: 'Descendre', presets: 'Vues rapides', focus: 'Focus', complete: 'Tout afficher', reset: 'Réinitialiser', labels: { market: 'Marchés', import: 'Nouvelle analyse', onboarding: 'Premiers pas', overview: 'Vue d’ensemble et KPI', selected: 'Analyse sélectionnée' } },
  de: { toggle: 'Dashboard anpassen', title: 'Arbeitsbereich organisieren', body: 'Module sortieren, einklappen oder ausblenden. Das Layout wird auf diesem Gerät gespeichert.', open: 'Öffnen', collapse: 'Einklappen', remove: 'Entfernen', add: 'Module hinzufügen', up: 'Nach oben', down: 'Nach unten', presets: 'Schnellansichten', focus: 'Fokus', complete: 'Alles anzeigen', reset: 'Zurücksetzen', labels: { market: 'Märkte', import: 'Neue Analyse', onboarding: 'Erste Schritte', overview: 'Übersicht und KPIs', selected: 'Ausgewählte Analyse' } },
  it: { toggle: 'Personalizza dashboard', title: 'Organizza il tuo spazio', body: 'Riordina, comprimi o nascondi i moduli. La disposizione viene salvata su questo dispositivo.', open: 'Apri', collapse: 'Comprimi', remove: 'Rimuovi', add: 'Aggiungi moduli', up: 'Sposta su', down: 'Sposta giù', presets: 'Viste rapide', focus: 'Focus', complete: 'Mostra tutto', reset: 'Ripristina', labels: { market: 'Mercati', import: 'Nuova analisi', onboarding: 'Primi passi', overview: 'Panoramica e KPI', selected: 'Analisi selezionata' } },
  pt: { toggle: 'Personalizar painel', title: 'Organize o seu espaço', body: 'Reordene, recolha ou oculte módulos. A disposição fica guardada neste dispositivo.', open: 'Abrir', collapse: 'Recolher', remove: 'Remover', add: 'Adicionar módulos', up: 'Subir', down: 'Descer', presets: 'Vistas rápidas', focus: 'Foco', complete: 'Mostrar tudo', reset: 'Repor', labels: { market: 'Mercados', import: 'Nova análise', onboarding: 'Primeiros passos', overview: 'Resumo e KPIs', selected: 'Análise selecionada' } },
} as const;

const SELECTORS: Record<ModuleId, string[]> = {
  market: ['.workspace > .market-rail', '.workspace > .trust-notice'],
  import: ['.workspace > .premium-import', '.workspace > .brand-logos'],
  onboarding: ['.workspace > .onboarding-card'],
  overview: ['.workspace > .section-heading', '.workspace > .premium-kpis'],
  selected: ['.workspace > .selected-analysis', '.workspace > .empty-state'],
};

function clonePreset(preset: LayoutPreset): ModuleState[] {
  return PRESETS[preset].map(item => ({ ...item }));
}

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
  const { language } = useLanguage();
  const t = COPY[language];
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

  function applyPreset(preset: LayoutPreset) {
    setModules(clonePreset(preset));
  }

  const visible = modules.filter(item => !item.hidden);

  return <>
    <style>{`
      .workspace{display:flex;flex-direction:column;min-width:0}
      .workspace>.workspace-heading{order:-100}.workspace>.workspace-subtitle{order:-99}
      .workspace>.file-input{order:-98}.workspace>.message{order:-97}
      .workspace>[data-dashboard-module]{transition:max-height .2s ease,opacity .2s ease;min-width:0}
      .workspace>.iv-module-collapsed{max-height:76px!important;overflow:hidden!important;opacity:.82;mask-image:linear-gradient(to bottom,#000 62%,transparent);-webkit-mask-image:linear-gradient(to bottom,#000 62%,transparent)}
      .iv-organizer{position:sticky;top:8px;z-index:40;margin:0 auto 12px;width:min(1180px,calc(100% - 24px));display:flex;justify-content:flex-end;pointer-events:none}
      .iv-organizer button,.iv-organizer-panel{pointer-events:auto}
      .iv-organizer-toggle{border:1px solid rgba(15,23,42,.14);background:rgba(255,255,255,.96);border-radius:999px;padding:9px 14px;font-weight:750;box-shadow:0 8px 24px rgba(15,23,42,.08);backdrop-filter:blur(12px)}
      .iv-organizer-panel{position:absolute;right:0;top:46px;width:min(430px,calc(100vw - 28px));background:#fff;border:1px solid rgba(15,23,42,.12);border-radius:18px;padding:14px;box-shadow:0 24px 64px rgba(15,23,42,.18)}
      .iv-organizer-panel h2{font-size:16px;margin:0 0 4px}.iv-organizer-panel p{font-size:12px;margin:0 0 12px;color:#64748b;line-height:1.45}
      .iv-presets{display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:0 0 10px}.iv-presets>span{font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:.04em;margin-right:2px}
      .iv-preset{border:1px solid #dbe3ec;background:#f8fafc;border-radius:999px;padding:6px 9px;font-size:12px;font-weight:700}.iv-preset:hover{background:#eef2f7}
      .iv-module-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;padding:9px 0;border-top:1px solid #eef2f7}
      .iv-module-row strong{font-size:13px}.iv-module-actions{display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end}
      .iv-module-actions button,.iv-add{border:1px solid #dbe3ec;background:#fff;border-radius:9px;padding:6px 8px;font-size:12px}
      .iv-module-actions button:hover,.iv-add:hover{background:#f8fafc}.iv-module-actions button:disabled{opacity:.38}
      .iv-add-list{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.iv-add{background:#f8fafc}
      @media(max-width:720px){.iv-organizer{top:4px;width:calc(100% - 16px)}.iv-organizer-toggle{padding:8px 11px}.iv-organizer-panel{right:0}.iv-module-row{grid-template-columns:1fr}.iv-module-actions{justify-content:flex-start}.iv-presets>span{width:100%}}
    `}</style>
    <div className="iv-organizer" aria-label={t.title}>
      <button className="iv-organizer-toggle" type="button" aria-expanded={open} onClick={() => setOpen(value => !value)}>{t.toggle}</button>
      {open && <div className="iv-organizer-panel">
        <h2>{t.title}</h2>
        <p>{t.body}</p>
        <div className="iv-presets" aria-label={t.presets}>
          <span>{t.presets}</span>
          <button className="iv-preset" type="button" onClick={() => applyPreset('focus')}>{t.focus}</button>
          <button className="iv-preset" type="button" onClick={() => applyPreset('complete')}>{t.complete}</button>
          <button className="iv-preset" type="button" onClick={() => applyPreset('default')}>{t.reset}</button>
        </div>
        {visible.map((module, index) => <div className="iv-module-row" key={module.id}>
          <strong>{t.labels[module.id]}</strong>
          <div className="iv-module-actions">
            <button type="button" disabled={index === 0} onClick={() => move(module.id, -1)} aria-label={`${t.up}: ${t.labels[module.id]}`}>↑</button>
            <button type="button" disabled={index === visible.length - 1} onClick={() => move(module.id, 1)} aria-label={`${t.down}: ${t.labels[module.id]}`}>↓</button>
            <button type="button" onClick={() => patch(module.id, { collapsed: !module.collapsed })}>{module.collapsed ? t.open : t.collapse}</button>
            <button type="button" onClick={() => patch(module.id, { hidden: true })}>{t.remove}</button>
          </div>
        </div>)}
        {hidden.length > 0 && <div className="iv-add-list" aria-label={t.add}>{hidden.map(module => <button className="iv-add" type="button" key={module.id} onClick={() => patch(module.id, { hidden: false, collapsed: false })}>+ {t.labels[module.id]}</button>)}</div>}
      </div>}
    </div>
  </>;
}
