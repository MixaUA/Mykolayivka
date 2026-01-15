const CACHE_NAME = 'mykolaivka-app-cache-v21'; // Renamed for clarity and version bump
const API_CACHE_NAME = 'mykolaivka-api-cache-v1'; // Separate cache for API data
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './database.json', // Додано новий файл для кешування
  './ico/android-chrome-192x192.png',
  './ico/android-chrome-512x512.png',
  './ico/apple-touch-icon.png',
  './ico/favicon-16x16.png',
  './ico/favicon-32x32.png',
  './ico/favicon.ico',
  './site.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened app cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle API requests (Stale-while-revalidate)
  if (url.hostname === 'raw.githubusercontent.com') {
    event.respondWith(
      caches.open(API_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          // Return cached response immediately if available, otherwise wait for network
          return cachedResponse || fetchPromise;
        });
      })
    );
    return; // Important: exit here
  }
  
  // Handle other requests (App Shell - Cache First)
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  // Add both cache names to the whitelist
  const cacheWhitelist = [CACHE_NAME, API_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
