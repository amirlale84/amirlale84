/* Offline cache for the design checklist. Bump CACHE when files change. */
const CACHE = 'design-checklist-v1';
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png", "./fonts/lalezar-arabic-400-normal.woff2", "./fonts/lalezar-latin-400-normal.woff2", "./fonts/vazirmatn-arabic-400-normal.woff2", "./fonts/vazirmatn-arabic-500-normal.woff2", "./fonts/vazirmatn-arabic-700-normal.woff2", "./fonts/vazirmatn-arabic-800-normal.woff2", "./fonts/vazirmatn-latin-400-normal.woff2", "./fonts/vazirmatn-latin-700-normal.woff2"];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    /* page: try the network first so updates arrive, fall back to the cached copy offline */
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put('./index.html', copy));
        return res;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy));
      return res;
    }))
  );
});
