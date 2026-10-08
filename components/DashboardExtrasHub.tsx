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
    kicker: 'Más herramientas',
    title: 'Herramientas',
    body: '',
    personalized: 'Plan y personalización',
    personalizedDesc: 'Opciones comerciales, personalización técnica y servicios adicionales.',
    intelligence: 'Asistente de IA',
    intelligenceDesc: 'Consulta y análisis asistido disponibles para todas las cuentas.',
    assessment: 'Evaluación regulatoria',
    assessmentDesc: 'Revisión avanzada y estado normativo del análisis seleccionado.',
  },
  en: {
    kicker: 'More tools', title: 'Tools', body: '',
    personalized: 'Plan and customization', personalizedDesc: 'Commercial options, technical customization and additional services.',
    intelligence: 'AI assistant', intelligenceDesc: 'Assisted consultation and analysis available to every account.',
    assessment: 'Regulatory assessment', assessmentDesc: 'Advanced review and regulatory status for the selected analysis.',
  },
  fr: {
    kicker: 'Autres outils', title: 'Outils', body: '',
    personalized: 'Offre et personnalisation', personalizedDesc: 'Options commerciales, personnalisation technique et services supplémentaires.',
    intelligence: 'Assistant IA', intelligenceDesc: 'Consultation et analyse assistées disponibles pour tous les comptes.',
    assessment: 'Évaluation réglementaire', assessmentDesc: 'Révision avancée et statut réglementaire de l’analyse sélectionnée.',
  },
  de: {
    kicker: 'Weitere Werkzeuge', title: 'Werkzeuge', body: '',
    personalized: 'Tarif und Anpassung', personalizedDesc: 'Kommerzielle Optionen, technische Anpassung und Zusatzleistungen.',
    intelligence: 'KI-Assistent', intelligenceDesc: 'Unterstützte Abfragen und Analysen für alle Konten.',
    assessment: 'Regulatorische Bewertung', assessmentDesc: 'Erweiterte Prüfung und regulatorischer Status der ausgewählten Analyse.',
  },
  it: {
    kicker: 'Altri strumenti', title: 'Strumenti', body: '',
    personalized: 'Piano e personalizzazione', personalizedDesc: 'Opzioni commerciali, personalizzazione tecnica e servizi aggiuntivi.',
    intelligence: 'Assistente IA', intelligenceDesc: 'Consultazione e analisi assistita disponibile per tutti gli account.',
    assessment: 'Valutazione normativa', assessmentDesc: 'Revisione avanzata e stato normativo dell’analisi selezionata.',
  },
  pt: {
    kicker: 'Mais ferramentas', title: 'Ferramentas', body: '',
    personalized: 'Plano e personalização', personalizedDesc: 'Opções comerciais, personalização técnica e serviços adicionais.',
    intelligence: 'Assistente de IA', intelligenceDesc: 'Consulta e análise assistida disponível para todas as contas.',
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
      .iv-tools-hub{width:min(1180px,calc(100% - 32px));margin:14px auto 40px;padding:0;display:grid;gap:8px;color:#211f24}
      .iv-tools-heading{padding:0 2px 2px}.iv-tools-heading span{display:block;color:#c81e2a;font-size:11px;font-weight:850;letter-spacing:.11em;text-transform:uppercase}.iv-tools-heading h2{margin:2px 0;font-size:15px;letter-spacing:-.01em}.iv-tools-heading p{display:none}
      .iv-tool-module{border:1px solid #e5dfd6;border-radius:14px;background:#fffdf9;box-shadow:none;overflow:hidden}
      .iv-tool-module[open]{border-color:#d5cfc6}
      .iv-tool-summary{list-style:none;cursor:pointer;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding:12px 14px;min-height:52px;user-select:none}
      .iv-tool-summary::-webkit-details-marker{display:none}.iv-tool-summary:focus-visible{outline:3px solid rgba(37,99,235,.2);outline-offset:-3px}
      .iv-tool-summary-copy{min-width:0}.iv-tool-summary strong{display:block;font-size:14px;letter-spacing:-.01em}.iv-tool-summary small{display:none}
      .iv-tool-chevron{width:28px;height:28px;border-radius:999px;border:1px solid #e5dfd6;display:grid;place-items:center;color:#6a6670;font-size:17px;transition:transform .18s ease,background .18s ease}
      .iv-tool-module[open] .iv-tool-chevron{transform:rotate(180deg);background:#f5f1eb}
      .iv-tool-content{border-top:1px solid #eee9e1;padding:2px 0 0}.iv-tool-content>*{margin-top:0!important}
      @media(max-width:720px){.iv-tools-hub{width:calc(100% - 16px);margin-top:10px}.iv-tool-summary{padding:11px 12px;min-height:48px}}
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
