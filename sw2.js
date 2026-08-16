const CACHE_NAME = 'attendance-app-v5';   // غيّر الرقم لفرض التحديث
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './html2pdf.bundle.min.js',
  './html2canvas.min.js',   // <-- أضيف
  './jspdf.umd.min.js',     // <-- أضيف
  './xlsx.full.min.js',     // <-- أضيف
  './sw2.js'                // <-- أضيف (لتخزين نفسه)
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
