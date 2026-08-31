'use client';

import { useEffect, useRef } from 'react';
import type { Product } from '@/lib/analysis';
import type { Language } from '@/lib/landing-i18n';
import { useLanguage } from '@/lib/use-language';
import styles from './ProductReview.module.css';

const copy: Record<Language, {
  eyebrow:string; title:string; intro:string; quota:string; products:string; file:string; notice:string; product:string; remove:string; empty:string; cancel:string; analyzing:string; analyze:string;
  fields: Record<keyof Product, { label:string; placeholder:string }>;
}> = {
  es:{ eyebrow:'REVISIÓN ANTES DEL ANÁLISIS', title:'Confirma los productos detectados', intro:'Corrige cualquier dato dudoso.', quota:'La cuota todavía no se ha consumido. Se descontará únicamente cuando pulses “Analizar y guardar”.', products:'productos', file:'Archivo', notice:'Los campos vacíos significan que ImportVerifier no ha encontrado evidencia suficiente; no los rellenamos inventando información.', product:'Producto', remove:'Eliminar', empty:'Has eliminado todos los productos. Cancela o vuelve a cargar el archivo para continuar.', cancel:'Cancelar', analyzing:'Analizando…', analyze:'Analizar y guardar', fields:{ name:{label:'Producto',placeholder:'Nombre del producto'}, manufacturer:{label:'Fabricante / marca',placeholder:'Fabricante o marca'}, responsible:{label:'Operador UE',placeholder:'Importador / persona responsable'}, description:{label:'Descripción',placeholder:'Qué es el producto y características relevantes'}, materials:{label:'Materiales',placeholder:'Materiales principales'}, intendedUse:{label:'Uso previsto',placeholder:'Para qué está diseñado'}, audience:{label:'Público / edad',placeholder:'Adultos, niños 3+, uso profesional…'}, power:{label:'Alimentación',placeholder:'230 V, batería Li-ion, USB-C…'}, connectivity:{label:'Conectividad',placeholder:'Bluetooth, Wi‑Fi, NFC…'}, composition:{label:'Composición',placeholder:'Ingredientes o composición cuando aplique'}, warning:{label:'Advertencias',placeholder:'Advertencias e instrucciones de seguridad'} } },
  en:{ eyebrow:'REVIEW BEFORE ANALYSIS', title:'Confirm the detected products', intro:'Correct any uncertain data.', quota:'Your quota has not been consumed yet. It is deducted only when you select “Analyze and save”.', products:'products', file:'File', notice:'Empty fields mean ImportVerifier did not find enough evidence; we do not fill them by inventing information.', product:'Product', remove:'Remove', empty:'You removed all products. Cancel or upload the file again to continue.', cancel:'Cancel', analyzing:'Analyzing…', analyze:'Analyze and save', fields:{ name:{label:'Product',placeholder:'Product name'}, manufacturer:{label:'Manufacturer / brand',placeholder:'Manufacturer or brand'}, responsible:{label:'EU operator',placeholder:'Importer / responsible person'}, description:{label:'Description',placeholder:'What the product is and relevant characteristics'}, materials:{label:'Materials',placeholder:'Main materials'}, intendedUse:{label:'Intended use',placeholder:'What it is designed for'}, audience:{label:'Audience / age',placeholder:'Adults, children 3+, professional use…'}, power:{label:'Power',placeholder:'230 V, Li-ion battery, USB-C…'}, connectivity:{label:'Connectivity',placeholder:'Bluetooth, Wi‑Fi, NFC…'}, composition:{label:'Composition',placeholder:'Ingredients or composition where applicable'}, warning:{label:'Warnings',placeholder:'Warnings and safety instructions'} } },
  fr:{ eyebrow:'RÉVISION AVANT ANALYSE', title:'Confirmez les produits détectés', intro:'Corrigez toute donnée incertaine.', quota:'Votre quota n’a pas encore été consommé. Il ne sera déduit qu’après avoir sélectionné « Analyser et enregistrer ».', products:'produits', file:'Fichier', notice:'Les champs vides signifient qu’ImportVerifier n’a pas trouvé suffisamment de preuves ; nous ne les complétons pas en inventant des informations.', product:'Produit', remove:'Supprimer', empty:'Vous avez supprimé tous les produits. Annulez ou rechargez le fichier pour continuer.', cancel:'Annuler', analyzing:'Analyse…', analyze:'Analyser et enregistrer', fields:{ name:{label:'Produit',placeholder:'Nom du produit'}, manufacturer:{label:'Fabricant / marque',placeholder:'Fabricant ou marque'}, responsible:{label:'Opérateur UE',placeholder:'Importateur / personne responsable'}, description:{label:'Description',placeholder:'Nature du produit et caractéristiques pertinentes'}, materials:{label:'Matériaux',placeholder:'Matériaux principaux'}, intendedUse:{label:'Usage prévu',placeholder:'Utilisation prévue'}, audience:{label:'Public / âge',placeholder:'Adultes, enfants 3+, usage professionnel…'}, power:{label:'Alimentation',placeholder:'230 V, batterie Li-ion, USB-C…'}, connectivity:{label:'Connectivité',placeholder:'Bluetooth, Wi‑Fi, NFC…'}, composition:{label:'Composition',placeholder:'Ingrédients ou composition le cas échéant'}, warning:{label:'Avertissements',placeholder:'Avertissements et instructions de sécurité'} } },
  de:{ eyebrow:'PRÜFUNG VOR DER ANALYSE', title:'Erkannte Produkte bestätigen', intro:'Unsichere Angaben korrigieren.', quota:'Ihr Kontingent wurde noch nicht verbraucht. Es wird erst abgezogen, wenn Sie „Analysieren und speichern“ wählen.', products:'Produkte', file:'Datei', notice:'Leere Felder bedeuten, dass ImportVerifier keine ausreichenden Nachweise gefunden hat; wir ergänzen sie nicht mit erfundenen Angaben.', product:'Produkt', remove:'Entfernen', empty:'Sie haben alle Produkte entfernt. Brechen Sie ab oder laden Sie die Datei erneut hoch.', cancel:'Abbrechen', analyzing:'Analyse läuft…', analyze:'Analysieren und speichern', fields:{ name:{label:'Produkt',placeholder:'Produktname'}, manufacturer:{label:'Hersteller / Marke',placeholder:'Hersteller oder Marke'}, responsible:{label:'EU-Wirtschaftsakteur',placeholder:'Importeur / verantwortliche Person'}, description:{label:'Beschreibung',placeholder:'Produktart und relevante Eigenschaften'}, materials:{label:'Materialien',placeholder:'Hauptmaterialien'}, intendedUse:{label:'Verwendungszweck',placeholder:'Wofür das Produkt bestimmt ist'}, audience:{label:'Zielgruppe / Alter',placeholder:'Erwachsene, Kinder 3+, berufliche Nutzung…'}, power:{label:'Stromversorgung',placeholder:'230 V, Li-Ionen-Akku, USB-C…'}, connectivity:{label:'Konnektivität',placeholder:'Bluetooth, Wi‑Fi, NFC…'}, composition:{label:'Zusammensetzung',placeholder:'Inhaltsstoffe oder Zusammensetzung, soweit relevant'}, warning:{label:'Warnhinweise',placeholder:'Warnhinweise und Sicherheitsanweisungen'} } },
  it:{ eyebrow:'REVISIONE PRIMA DELL’ANALISI', title:'Conferma i prodotti rilevati', intro:'Correggi eventuali dati incerti.', quota:'La quota non è ancora stata consumata. Verrà detratta solo quando selezioni “Analizza e salva”.', products:'prodotti', file:'File', notice:'I campi vuoti indicano che ImportVerifier non ha trovato evidenze sufficienti; non li compiliamo inventando informazioni.', product:'Prodotto', remove:'Elimina', empty:'Hai eliminato tutti i prodotti. Annulla o carica nuovamente il file per continuare.', cancel:'Annulla', analyzing:'Analisi…', analyze:'Analizza e salva', fields:{ name:{label:'Prodotto',placeholder:'Nome del prodotto'}, manufacturer:{label:'Fabbricante / marca',placeholder:'Fabbricante o marca'}, responsible:{label:'Operatore UE',placeholder:'Importatore / persona responsabile'}, description:{label:'Descrizione',placeholder:'Cos’è il prodotto e caratteristiche rilevanti'}, materials:{label:'Materiali',placeholder:'Materiali principali'}, intendedUse:{label:'Uso previsto',placeholder:'A cosa è destinato'}, audience:{label:'Pubblico / età',placeholder:'Adulti, bambini 3+, uso professionale…'}, power:{label:'Alimentazione',placeholder:'230 V, batteria Li-ion, USB-C…'}, connectivity:{label:'Connettività',placeholder:'Bluetooth, Wi‑Fi, NFC…'}, composition:{label:'Composizione',placeholder:'Ingredienti o composizione quando applicabile'}, warning:{label:'Avvertenze',placeholder:'Avvertenze e istruzioni di sicurezza'} } },
  pt:{ eyebrow:'REVISÃO ANTES DA ANÁLISE', title:'Confirme os produtos detetados', intro:'Corrija quaisquer dados duvidosos.', quota:'A quota ainda não foi consumida. Só será descontada quando selecionar “Analisar e guardar”.', products:'produtos', file:'Ficheiro', notice:'Os campos vazios significam que o ImportVerifier não encontrou evidência suficiente; não os preenchemos inventando informação.', product:'Produto', remove:'Eliminar', empty:'Eliminou todos os produtos. Cancele ou carregue novamente o ficheiro para continuar.', cancel:'Cancelar', analyzing:'A analisar…', analyze:'Analisar e guardar', fields:{ name:{label:'Produto',placeholder:'Nome do produto'}, manufacturer:{label:'Fabricante / marca',placeholder:'Fabricante ou marca'}, responsible:{label:'Operador UE',placeholder:'Importador / pessoa responsável'}, description:{label:'Descrição',placeholder:'O que é o produto e características relevantes'}, materials:{label:'Materiais',placeholder:'Materiais principais'}, intendedUse:{label:'Utilização prevista',placeholder:'Para que foi concebido'}, audience:{label:'Público / idade',placeholder:'Adultos, crianças 3+, uso profissional…'}, power:{label:'Alimentação',placeholder:'230 V, bateria Li-ion, USB-C…'}, connectivity:{label:'Conectividade',placeholder:'Bluetooth, Wi‑Fi, NFC…'}, composition:{label:'Composição',placeholder:'Ingredientes ou composição quando aplicável'}, warning:{label:'Avisos',placeholder:'Avisos e instruções de segurança'} } },
};

const fieldOrder: { key:keyof Product; multiline?:boolean }[] = [
  {key:'name'}, {key:'manufacturer'}, {key:'responsible'}, {key:'description',multiline:true}, {key:'materials'}, {key:'intendedUse'}, {key:'audience'}, {key:'power'}, {key:'connectivity'}, {key:'composition',multiline:true}, {key:'warning',multiline:true},
];

export type ReviewDraft = { filename:string; marketLabel:string; products:Product[] };

export default function ProductReview({ draft, busy, onChange, onCancel, onConfirm }: { draft:ReviewDraft; busy:boolean; onChange:(products:Product[])=>void; onCancel:()=>void; onConfirm:()=>void }) {
  const { language } = useLanguage();
  const t = copy[language];
  const panelRef = useRef<HTMLDivElement>(null);
  const update = (index:number, key:keyof Product, value:string) => onChange(draft.products.map((product, i) => i === index ? { ...product, [key]:value } : product));
  const remove = (index:number) => onChange(draft.products.filter((_, i) => i !== index));
  const valid = draft.products.length > 0 && draft.products.every(product => product.name.trim());

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>('input, textarea, button')?.focus());
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) {
        event.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [busy, onCancel]);

  return <section className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="review-title" aria-describedby="review-description">
    <div className={styles.panel} ref={panelRef}>
      <header className={styles.header}>
        <div><span className="eyebrow">{t.eyebrow}</span><h2 id="review-title">{t.title}</h2><p id="review-description">{t.intro} <strong>{t.quota}</strong></p></div>
        <span className={styles.count}>{draft.products.length} {t.products} · {draft.marketLabel}</span>
      </header>
      <div className={styles.notice}>{t.file}: <strong>{draft.filename}</strong>. {t.notice}</div>
      <div className={styles.products}>
        {draft.products.map((product, index) => <article className={styles.product} key={index}>
          <div className={styles.productHeading}><strong>{t.product} {index + 1}</strong><button type="button" onClick={() => remove(index)} disabled={busy} className={styles.remove}>{t.remove}</button></div>
          <div className={styles.grid}>{fieldOrder.map(field => { const labels = t.fields[field.key]; return <label key={field.key} className={field.multiline ? styles.wide : ''}><span>{labels.label}</span>{field.multiline ? <textarea rows={2} maxLength={2000} value={String(product[field.key] ?? '')} placeholder={labels.placeholder} onChange={event => update(index, field.key, event.target.value)} /> : <input maxLength={field.key === 'name' || field.key === 'manufacturer' || field.key === 'responsible' || field.key === 'warning' ? 1000 : 2000} value={String(product[field.key] ?? '')} placeholder={labels.placeholder} onChange={event => update(index, field.key, event.target.value)} />}</label>; })}</div>
        </article>)}
      </div>
      {!draft.products.length && <div className={styles.empty}>{t.empty}</div>}
      <footer className={styles.actions}><button type="button" className="btn ghost" onClick={onCancel} disabled={busy}>{t.cancel}</button><button type="button" className="btn primary" onClick={onConfirm} disabled={busy || !valid}>{busy ? t.analyzing : `${t.analyze} ${draft.products.length}`}</button></footer>
    </div>
  </section>;
}
