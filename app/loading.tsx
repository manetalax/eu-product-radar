export default function Loading() {
  return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f6f7fb' }}>
    <div role="status" aria-label="ImportVerifier" style={{ width: 'min(100%, 560px)', background: '#fff', border: '1px solid #e4e7ec', borderRadius: 24, padding: 'clamp(24px, 5vw, 40px)', boxShadow: '0 24px 70px rgba(16, 24, 40, 0.08)' }}>
      <div aria-hidden="true" style={{ width: 128, height: 12, borderRadius: 999, background: '#e4e7ec', marginBottom: 22 }} />
      <div aria-hidden="true" style={{ width: '82%', height: 38, borderRadius: 12, background: '#eaecf0', marginBottom: 14 }} />
      <div aria-hidden="true" style={{ width: '100%', height: 16, borderRadius: 999, background: '#f2f4f7', marginBottom: 9 }} />
      <div aria-hidden="true" style={{ width: '68%', height: 16, borderRadius: 999, background: '#f2f4f7', marginBottom: 28 }} />
      <div aria-hidden="true" style={{ width: '100%', height: 48, borderRadius: 12, background: '#111827' }} />
    </div>
  </main>;
}
