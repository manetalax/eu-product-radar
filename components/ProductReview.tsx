'use client';

import type { Product } from '@/lib/analysis';
import styles from './ProductReview.module.css';

const fields: { key: keyof Product; label: string; placeholder: string; multiline?: boolean }[] = [
  { key: 'name', label: 'Producto', placeholder: 'Nombre del producto' },
  { key: 'manufacturer', label: 'Fabricante / marca', placeholder: 'Fabricante o marca' },
  { key: 'responsible', label: 'Operador UE', placeholder: 'Importador / persona responsable' },
  { key: 'description', label: 'Descripción', placeholder: 'Qué es el producto y características relevantes', multiline: true },
  { key: 'materials', label: 'Materiales', placeholder: 'Materiales principales' },
  { key: 'intendedUse', label: 'Uso previsto', placeholder: 'Para qué está diseñado' },
  { key: 'audience', label: 'Público / edad', placeholder: 'Adultos, niños 3+, uso profesional…' },
  { key: 'power', label: 'Alimentación', placeholder: '230 V, batería Li-ion, USB-C…' },
  { key: 'connectivity', label: 'Conectividad', placeholder: 'Bluetooth, Wi‑Fi, NFC…' },
  { key: 'composition', label: 'Composición', placeholder: 'Ingredientes o composición cuando aplique', multiline: true },
  { key: 'warning', label: 'Advertencias', placeholder: 'Advertencias e instrucciones de seguridad', multiline: true },
];

export type ReviewDraft = {
  filename: string;
  marketLabel: string;
  products: Product[];
};

export default function ProductReview({ draft, busy, onChange, onCancel, onConfirm }: {
  draft: ReviewDraft;
  busy: boolean;
  onChange: (products: Product[]) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const update = (index: number, key: keyof Product, value: string) => {
    onChange(draft.products.map((product, i) => i === index ? { ...product, [key]: value } : product));
  };
  const remove = (index: number) => onChange(draft.products.filter((_, i) => i !== index));
  const valid = draft.products.length > 0 && draft.products.every(product => product.name.trim());

  return <section className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="review-title">
    <div className={styles.panel}>
      <header className={styles.header}>
        <div>
          <span className="eyebrow">REVISIÓN ANTES DEL ANÁLISIS</span>
          <h2 id="review-title">Confirma los productos detectados</h2>
          <p>Corrige cualquier dato dudoso. <strong>La cuota todavía no se ha consumido.</strong> Se descontará únicamente cuando pulses “Analizar y guardar”.</p>
        </div>
        <span className={styles.count}>{draft.products.length} productos · {draft.marketLabel}</span>
      </header>

      <div className={styles.notice}>Archivo: <strong>{draft.filename}</strong>. Los campos vacíos significan que ImportVerifier no ha encontrado evidencia suficiente; no los rellenamos inventando información.</div>

      <div className={styles.products}>
        {draft.products.map((product, index) => <article className={styles.product} key={index}>
          <div className={styles.productHeading}>
            <strong>Producto {index + 1}</strong>
            <button type="button" onClick={() => remove(index)} disabled={busy} className={styles.remove}>Eliminar</button>
          </div>
          <div className={styles.grid}>
            {fields.map(field => <label key={field.key} className={field.multiline ? styles.wide : ''}>
              <span>{field.label}</span>
              {field.multiline
                ? <textarea rows={2} maxLength={2000} value={String(product[field.key] ?? '')} placeholder={field.placeholder} onChange={event => update(index, field.key, event.target.value)} />
                : <input maxLength={field.key === 'name' || field.key === 'manufacturer' || field.key === 'responsible' || field.key === 'warning' ? 1000 : 2000} value={String(product[field.key] ?? '')} placeholder={field.placeholder} onChange={event => update(index, field.key, event.target.value)} />}
            </label>)}
          </div>
        </article>)}
      </div>

      {!draft.products.length && <div className={styles.empty}>Has eliminado todos los productos. Cancela o vuelve a cargar el archivo para continuar.</div>}

      <footer className={styles.actions}>
        <button type="button" className="btn ghost" onClick={onCancel} disabled={busy}>Cancelar</button>
        <button type="button" className="btn primary" onClick={onConfirm} disabled={busy || !valid}>{busy ? 'Analizando…' : `Analizar y guardar ${draft.products.length} producto${draft.products.length === 1 ? '' : 's'}`}</button>
      </footer>
    </div>
  </section>;
}
