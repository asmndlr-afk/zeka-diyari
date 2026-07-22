const CACHE_NAME = "zeka-diyari-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./css/base.css",
  "./css/components.css",
  "./css/animations.css",
  "./js/gamesData.js",
  "./js/achievements.js",
  "./js/app.js",
  "./js/pwa.js",
  "./manifest.json",
  "./assets/images/icon-192.png",
  "./assets/images/icon-512.png",
  "./assets/images/balon_patlatmaca.jpg",
  "./assets/images/hafiza_kartlari.jpg",
  "./assets/images/kelimeleri_avla.jpg",
  "./assets/images/kids_avatar.jpg",
  "./assets/images/matematik_dehasi.jpg",
  "./assets/images/hizli_parmaklar.jpg",
  "./assets/images/avatars/panda.png",
  "./assets/images/avatars/cat.png",
  "./assets/images/avatars/dog.png",
  "./assets/images/avatars/rabbit.png"
];

// Install Event: Pre-cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Pre-caching static assets");
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Cache first, fallback to network
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  // Skip caching external browser extensions or analytical tools if any
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin && !url.host.includes("unpkg.com")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached asset, fetch new version in background to update cache asynchronously
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch(() => {}); // ignore errors when offline
        return cachedResponse;
      }

      // If not in cache, fetch from network and cache
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        return networkResponse;
      }).catch((err) => {
        console.warn("[Service Worker] Fetch failed:", err);
      });
    })
  );
});
