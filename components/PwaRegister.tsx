'use client';

import { useEffect } from 'react';

export default function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    let registration: ServiceWorkerRegistration | null = null;
    let cancelled = false;

    const updateRegistration = async () => {
      if (cancelled || !registration) return;
      try {
        await registration.update();
      } catch {
        // Offline/Safari update failures are non-fatal and must not create unhandled rejections.
      }
    };

    const register = async () => {
      try {
        const nextRegistration = await navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' });
        if (cancelled) return;
        registration = nextRegistration;
        await updateRegistration();
      } catch {
        registration = null;
      }
    };
    const refresh = () => { if (!document.hidden) void updateRegistration(); };

    if (document.readyState === 'complete') void register();
    else window.addEventListener('load', register, { once: true });
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('online', refresh);

    return () => {
      cancelled = true;
      window.removeEventListener('load', register);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('online', refresh);
    };
  }, []);
  return null;
}
