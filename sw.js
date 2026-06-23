const CACHE_NAME = 'menorah-cache-v7';
const ASSETS = [
  './',
  './index.html',
  './assets/logo.png',
  './assets/icon-maskable.png',
  './assets/favicon.png',
  './assets/qr_code_menorah.png',
  './images/about-community.webp',
  './images/hero-bg-1.webp',
  './images/hero-bg-2.webp',
  './images/hero-bg-3.webp',
  './images/gallery-shabbat.webp',
  './images/gallery-pesach.webp',
  './images/gallery-worship.webp',
  './images/gallery-shabbat-school.webp',
  './images/gallery-seminar.webp',
  './images/gallery-festival.webp'
];

// Встановлення сервіс-воркера та кешування основних ресурсів
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Активація та видалення застарілих кешів
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Обробка запитів (Стратегія Cache First, Network Fallback)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((networkResponse) => {
        // Не кешуємо зовнішні запити (наприклад, карти або unsplash фотографії)
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });
        
        return networkResponse;
      });
    }).catch(() => {
      // Offline fallback для html сторінок
      if (e.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
