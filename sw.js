// v45 起主頁面改為 network-first：每次都先向網路要最新版，離線時才用快取
// → 以後升級主程式版本「不必」再改 CACHE_NAME（只有 sw.js 本身邏輯改變時才需要改）
const CACHE_NAME = 'memoire-v45';
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

// 主頁面：開啟 App、重新整理、或直接請求 index.html
function isAppPage(req) {
  if (req.mode === 'navigate') return true;
  const path = new URL(req.url).pathname;
  return path === '/Memoire/' || path === '/Memoire/index.html';
}

self.addEventListener('fetch', e => {
  // 這些 API 永遠走網路，不 cache
  if (e.request.url.includes('script.google.com')) return;
  if (e.request.url.includes('open-meteo.com')) return;
  if (e.request.url.includes('nominatim.openstreetmap.org')) return;
  if (e.request.method !== 'GET') return;

  if (isAppPage(e.request)) {
    // network-first：cache:'no-cache' 讓瀏覽器向 GitHub Pages 確認最新版（略過 10 分鐘的 HTTP 快取）
    e.respondWith(
      fetch(e.request, { cache: 'no-cache' })
        .then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(c => c.put('/Memoire/index.html', copy));
          }
          return res;
        })
        .catch(() => caches.match('/Memoire/index.html').then(c => c || caches.match(e.request)))
    );
    return;
  }

  // 其他檔案（manifest、圖示）：cache-first
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
