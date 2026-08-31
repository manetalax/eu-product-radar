const CACHE = 'importverifier-shell-v6';
const LANDING_LANGUAGES = new Set(['es', 'en', 'fr', 'de', 'it', 'pt']);
const SHELL = ['/es', '/en', '/fr', '/de', '/it', '/pt', '/icon.svg'];
const PRIVATE_PREFIXES = ['/api/', '/auth/', '/dashboard', '/reset-password'];
const CACHEABLE_NAVIGATIONS = new Set(['/es', '/en', '/fr', '/de', '/it', '/pt']);
const CACHEABLE_ASSET_DESTINATIONS = new Set(['style', 'script', 'image', 'font']);

function responseAllowsCaching(response) {
  if (!response.ok || response.type !== 'basic') return false;
  const cacheControl = (response.headers.get('cache-control') || '').toLowerCase();
  const vary = (response.headers.get('vary') || '').toLowerCase();
  return !cacheControl.includes('private')
    && !cacheControl.includes('no-store')
    && !cacheControl.includes('no-cache')
    && !vary.split(',').map(value => value.trim()).includes('cookie')
    && !vary.split(',').map(value => value.trim()).includes('authorization');
}

function publicShellRequest(path) {
  return new Request(path, { credentials: 'omit', cache: 'reload' });
}

function requestedLandingLanguage(url) {
  const value = url.searchParams.get('lang')?.slice(0, 2).toLowerCase();
  return value && LANDING_LANGUAGES.has(value) ? value : null;
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(SHELL.map(publicShellRequest)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('importverifier-shell-') && key !== CACHE).map(key => caches.delete(key))))
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

  if (request.mode === 'navigate' && url.pathname === '/') {
    const language = requestedLandingLanguage(url);
    event.respondWith(
      fetch(request)
        .then(response => {
          if (language && responseAllowsCaching(response)) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(`/${language}`, copy));
          }
          return response;
        })
        .catch(async () => {
          if (language) {
            const localized = await caches.match(`/${language}`);
            if (localized) return localized;
          }
          return (await caches.match('/es')) || Response.error();
        })
    );
    return;
  }

  if (request.mode === 'navigate') {
    if (!CACHEABLE_NAVIGATIONS.has(url.pathname) || url.search) return;
    event.respondWith(
      fetch(request)
        .then(response => {
          if (responseAllowsCaching(response)) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(url.pathname, copy));
          }
          return response;
        })
        .catch(async () => (await caches.match(url.pathname)) || (await caches.match('/es')) || Response.error())
    );
    return;
  }

  if (!CACHEABLE_ASSET_DESTINATIONS.has(request.destination)) return;
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (responseAllowsCaching(response)) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(request, copy));
      }
      return response;
    }))
  );
});
