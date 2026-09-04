'use client';

import type { ReactNode } from 'react';
import { useLanguage } from '@/lib/use-language';

type Props = {
  personalized: ReactNode;
  intelligence: ReactNode;
  assessment: ReactNode;
};

const COPY = {
  es: {
    kicker: 'Herramientas avanzadas',
    title: 'Abre solo lo que necesites',
    body: 'Las funciones secundarias quedan agrupadas para mantener el espacio de trabajo limpio incluso con catálogos grandes.',
    personalized: 'Plan y personalización',
    personalizedDesc: 'Opciones comerciales, personalización técnica y servicios adicionales.',
    intelligence: 'Asistente de IA',
    intelligenceDesc: 'Consulta y análisis asistido para los planes que incluyen IA.',
    assessment: 'Evaluación regulatoria',
    assessmentDesc: 'Revisión avanzada y estado normativo del análisis seleccionado.',
  },
  en: {
    kicker: 'Advanced tools', title: 'Open only what you need', body: 'Secondary tools stay grouped so the workspace remains clean even with large catalogues.',
    personalized: 'Plan and customization', personalizedDesc: 'Commercial options, technical customization and additional services.',
    intelligence: 'AI assistant', intelligenceDesc: 'Assisted consultation and analysis for plans that include AI.',
    assessment: 'Regulatory assessment', assessmentDesc: 'Advanced review and regulatory status for the selected analysis.',
  },
  fr: {
    kicker: 'Outils avancés', title: 'Ouvrez uniquement ce dont vous avez besoin', body: 'Les outils secondaires restent regroupés afin de préserver un espace de travail clair, même avec de grands catalogues.',
    personalized: 'Offre et personnalisation', personalizedDesc: 'Options commerciales, personnalisation technique et services supplémentaires.',
    intelligence: 'Assistant IA', intelligenceDesc: 'Consultation et analyse assistées pour les offres incluant l’IA.',
    assessment: 'Évaluation réglementaire', assessmentDesc: 'Révision avancée et statut réglementaire de l’analyse sélectionnée.',
  },
  de: {
    kicker: 'Erweiterte Werkzeuge', title: 'Öffnen Sie nur, was Sie brauchen', body: 'Sekundäre Werkzeuge bleiben gruppiert, damit der Arbeitsbereich auch bei großen Katalogen übersichtlich bleibt.',
    personalized: 'Tarif und Anpassung', personalizedDesc: 'Kommerzielle Optionen, technische Anpassung und Zusatzleistungen.',
    intelligence: 'KI-Assistent', intelligenceDesc: 'Unterstützte Abfragen und Analysen für Tarife mit KI.',
    assessment: 'Regulatorische Bewertung', assessmentDesc: 'Erweiterte Prüfung und regulatorischer Status der ausgewählten Analyse.',
  },
  it: {
    kicker: 'Strumenti avanzati', title: 'Apri solo ciò che ti serve', body: 'Gli strumenti secondari restano raggruppati per mantenere l’area di lavoro pulita anche con cataloghi grandi.',
    personalized: 'Piano e personalizzazione', personalizedDesc: 'Opzioni commerciali, personalizzazione tecnica e servizi aggiuntivi.',
    intelligence: 'Assistente IA', intelligenceDesc: 'Consultazione e analisi assistita per i piani che includono IA.',
    assessment: 'Valutazione normativa', assessmentDesc: 'Revisione avanzata e stato normativo dell’analisi selezionata.',
  },
  pt: {
    kicker: 'Ferramentas avançadas', title: 'Abra apenas o que precisa', body: 'As ferramentas secundárias ficam agrupadas para manter o espaço de trabalho limpo mesmo com catálogos grandes.',
    personalized: 'Plano e personalização', personalizedDesc: 'Opções comerciais, personalização técnica e serviços adicionais.',
    intelligence: 'Assistente de IA', intelligenceDesc: 'Consulta e análise assistida para os planos que incluem IA.',
    assessment: 'Avaliação regulamentar', assessmentDesc: 'Revisão avançada e estado regulamentar da análise selecionada.',
  },
} as const;

export default function DashboardExtrasHub({ personalized, intelligence, assessment }: Props) {
  const { language } = useLanguage();
  const t = COPY[language];
  const sections = [
    { id: 'customization', title: t.personalized, description: t.personalizedDesc, content: personalized },
    { id: 'intelligence', title: t.intelligence, description: t.intelligenceDesc, content: intelligence },
    { id: 'assessment', title: t.assessment, description: t.assessmentDesc, content: assessment },
  ];

  return <section className="iv-tools-hub" aria-labelledby="iv-tools-title">
    <style>{`
      .iv-tools-hub{width:min(1180px,calc(100% - 32px));margin:22px auto 56px;padding:0;display:grid;gap:12px;color:#0f172a}
      .iv-tools-heading{padding:4px 2px 8px}.iv-tools-heading span{display:block;color:#2563eb;font-size:11px;font-weight:850;letter-spacing:.11em;text-transform:uppercase}.iv-tools-heading h2{margin:4px 0 6px;font-size:clamp(20px,2.2vw,28px);letter-spacing:-.025em}.iv-tools-heading p{margin:0;max-width:760px;color:#64748b;line-height:1.55}
      .iv-tool-module{border:1px solid #e2e8f0;border-radius:18px;background:#fff;box-shadow:0 8px 28px rgba(15,23,42,.045);overflow:hidden}
      .iv-tool-module[open]{box-shadow:0 14px 36px rgba(15,23,42,.075)}
      .iv-tool-summary{list-style:none;cursor:pointer;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px;align-items:center;padding:17px 18px;min-height:74px;user-select:none}
      .iv-tool-summary::-webkit-details-marker{display:none}.iv-tool-summary:focus-visible{outline:3px solid rgba(37,99,235,.2);outline-offset:-3px}
      .iv-tool-summary-copy{min-width:0}.iv-tool-summary strong{display:block;font-size:15px;letter-spacing:-.01em}.iv-tool-summary small{display:block;margin-top:4px;color:#64748b;line-height:1.35}
      .iv-tool-chevron{width:32px;height:32px;border-radius:10px;border:1px solid #dbe4ef;display:grid;place-items:center;color:#475569;font-size:18px;transition:transform .18s ease,background .18s ease}
      .iv-tool-module[open] .iv-tool-chevron{transform:rotate(180deg);background:#f8fafc}
      .iv-tool-content{border-top:1px solid #eef2f7;padding:2px 0 0}.iv-tool-content>*{margin-top:0!important}
      @media(max-width:720px){.iv-tools-hub{width:calc(100% - 16px);margin-top:14px}.iv-tool-summary{padding:14px;min-height:66px}.iv-tool-summary small{font-size:12px}}
    `}</style>
    <div className="iv-tools-heading">
      <span>{t.kicker}</span>
      <h2 id="iv-tools-title">{t.title}</h2>
      <p>{t.body}</p>
    </div>
    {sections.map(section => <details className="iv-tool-module" key={section.id}>
      <summary className="iv-tool-summary">
        <span className="iv-tool-summary-copy"><strong>{section.title}</strong><small>{section.description}</small></span>
        <span className="iv-tool-chevron" aria-hidden="true">⌄</span>
      </summary>
      <div className="iv-tool-content">{section.content}</div>
    </details>)}
  </section>;
}
