const CACHE_NAME = 'attendance-app-v20-92-display-switch-geometry';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './html2pdf.bundle.min.js',
  './html2canvas.min.js',
  './jspdf.umd.min.js',
  './xlsx.full.min.js',
  './sw2.js',
  './fonts/IBMPlexSansArabic-400.woff2',
  './fonts/IBMPlexSansArabic-600.woff2',
  './fonts/IBMPlexSansArabic-700.woff2'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(cacheNames => Promise.all(
    cacheNames.map(cacheName => cacheName !== CACHE_NAME ? caches.delete(cacheName) : undefined)
  )));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const isHtmlRequest = event.request.mode === 'navigate' || event.request.url.endsWith('/') || event.request.url.endsWith('index.html');
  if (isHtmlRequest) {
    event.respondWith(
      fetch(event.request, {cache: 'no-store'}).then(networkResponse => {
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse.clone()));
        return networkResponse;
      }).catch(() => caches.match(event.request).then(response => response || caches.match('./index.html')))
    );
  } else {
    event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
  }
});
