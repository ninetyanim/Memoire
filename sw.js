const CACHE_NAME = 'memoire-v1';
const ASSETS = [
  '/Memoire/',
  '/Memoire/index.html',
  '/Memoire/manifest.json',
  'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css',
  'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // GAS 請求不走 cache，永遠走網路
  if (e.request.url.includes('script.google.com')) return;
  if (e.request.url.includes('open-meteo.com')) return;
  if (e.request.url.includes('nominatim.openstreetmap.org')) return;

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
