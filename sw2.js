const CACHE_NAME = 'attendance-app-v6';
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
  const isHtmlRequest =
    event.request.mode === 'navigate' ||
    event.request.url.endsWith('/') ||
    event.request.url.endsWith('index.html');

  if (isHtmlRequest) {
    // Network First: يجبر طلب شبكة حقيقي في كل مرة (cache: 'no-store' يتجاوز
    // كاش المتصفح HTTP Cache نفسه، وليس فقط كاش الـ Service Worker)، ويحدّث
    // الكاش تلقائيًا بأحدث نسخة، وإذا ما فيه اتصال يرجع لآخر نسخة محفوظة.
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(networkResponse => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache First: للملفات الثابتة (المكتبات والخطوط) التي نادرًا ما تتغيّر.
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});
