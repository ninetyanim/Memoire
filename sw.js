const CACHE_NAME = 'memoire-v38'; // 每次升級主程式版本時務必同步改這裡，否則瀏覽器不會抓新版
const ASSETS = [
  '/Memoire/',
  '/Memoire/index.html',
  '/Memoire/manifest.json',
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
  // 這些 API 永遠走網路，不 cache
  if (e.request.url.includes('script.google.com')) return;
  if (e.request.url.includes('open-meteo.com')) return;
  if (e.request.url.includes('nominatim.openstreetmap.org')) return;

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
