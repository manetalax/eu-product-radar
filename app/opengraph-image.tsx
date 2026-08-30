import { ImageResponse } from 'next/og';

export const alt = 'Import Rules Verifier · Inteligencia regulatoria europea independiente';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, color: '#101828', background: 'linear-gradient(135deg,#ffffff 0%,#f4f3ff 55%,#eef2ff 100%)', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <svg width="78" height="78" viewBox="0 0 144 144">
          <path d="M20 48.5 72 20l52 28.5v57L72 134l-52-28.5v-57Z" fill="none" stroke="#101828" strokeWidth="10" strokeLinejoin="round" />
          <path d="m20 48.5 52 28.5 52-28.5M72 77v57" fill="none" stroke="#101828" strokeWidth="10" strokeLinejoin="round" />
          <path d="m72 77 38-38" fill="none" stroke="#4f46e5" strokeWidth="10" strokeLinecap="round" />
          <path d="M80 23a50 50 0 0 1 45 45" fill="none" stroke="#4f46e5" strokeWidth="10" strokeLinecap="round" />
          <circle cx="72" cy="77" r="9" fill="#4f46e5" />
        </svg>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, fontSize: 42, fontWeight: 800, letterSpacing: -2 }}><span>Import</span><span style={{ color: '#4f46e5', fontSize: 30, letterSpacing: 2, textTransform: 'uppercase' }}>Rules</span><span>Verifier</span></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 62, height: 44, borderRadius: 12, color: '#ffd54a', background: '#12358b', fontSize: 20, fontWeight: 900, letterSpacing: 1 }}>EU</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 940 }}>
        <div style={{ display: 'flex', marginBottom: 22, color: '#4f46e5', fontSize: 22, fontWeight: 800, letterSpacing: 2 }}>EU IMPORT RULES · ANÁLISIS INDEPENDIENTE</div>
        <div style={{ display: 'flex', fontSize: 62, lineHeight: 1.03, fontWeight: 800, letterSpacing: -3 }}>Conoce la normativa que necesita cada producto antes de importarlo y venderlo en la Unión Europea.</div>
      </div>
      <div style={{ display: 'flex', gap: 16, color: '#475467', fontSize: 22 }}><span>CSV y Excel</span><span>·</span><span>Fuentes oficiales</span><span>·</span><span>Informes trazables</span></div>
    </div>,
    size,
  );
}
