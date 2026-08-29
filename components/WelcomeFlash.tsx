'use client';

import { useEffect, useState } from 'react';

export default function WelcomeFlash({ show }: { show: boolean }) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (!show) return;
    const timer = window.setTimeout(() => setVisible(false), 5000);
    const url = new URL(window.location.href);
    url.searchParams.delete('welcome');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    return () => window.clearTimeout(timer);
  }, [show]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        width: 'min(92vw, 560px)',
        background: '#ffffff',
        border: '1px solid #d1fadf',
        borderRadius: 16,
        boxShadow: '0 18px 50px rgba(16, 24, 40, 0.16)',
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 30,
          height: 30,
          borderRadius: 999,
          background: '#dcfae6',
          color: '#067647',
          display: 'grid',
          placeItems: 'center',
          fontWeight: 900,
          flex: '0 0 auto',
        }}
      >
        ✓
      </div>
      <div style={{ flex: 1 }}>
        <strong style={{ display: 'block', marginBottom: 3 }}>Cuenta creada correctamente</strong>
        <span style={{ color: '#475467', lineHeight: 1.45 }}>
          Tu correo ha sido confirmado. Ya puedes utilizar Product Radar.
        </span>
      </div>
      <button
        type="button"
        aria-label="Cerrar mensaje"
        onClick={() => setVisible(false)}
        style={{
          border: 0,
          background: 'transparent',
          color: '#667085',
          cursor: 'pointer',
          fontSize: 22,
          lineHeight: 1,
          padding: 2,
        }}
      >
        ×
      </button>
    </div>
  );
}
