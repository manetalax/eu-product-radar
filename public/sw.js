const CACHE = 'importverifier-shell-v3';
const SHELL = ['/', '/login', '/privacy', '/terms', '/icon.svg'];
const PRIVATE_PREFIXES = ['/api/', '/auth/', '/dashboard', '/reset-password'];
const CACHEABLE_NAVIGATIONS = new Set(['/', '/login', '/privacy', '/terms']);

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (PRIVATE_PREFIXES.some(prefix => url.pathname.startsWith(prefix))) return;
  if (url.pathname === '/manifest.webmanifest') return;

  if (request.mode === 'navigate') {
    if (!CACHEABLE_NAVIGATIONS.has(url.pathname)) return;
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(url.pathname, copy));
          }
          return response;
        })
        .catch(async () => (await caches.match(url.pathname)) || (await caches.match('/')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok && response.type === 'basic') {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(request, copy));
      }
      return response;
    }))
  );
});
