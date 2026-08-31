'use client';

import { useEffect } from 'react';

export default function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    let registration: ServiceWorkerRegistration | null = null;

    const register = async () => {
      try {
        registration = await navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' });
        await registration.update();
      } catch {
        registration = null;
      }
    };
    const refresh = () => { if (!document.hidden) void registration?.update(); };

    if (document.readyState === 'complete') void register();
    else window.addEventListener('load', register, { once: true });
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('online', refresh);

    return () => {
      window.removeEventListener('load', register);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('online', refresh);
    };
  }, []);
  return null;
}
