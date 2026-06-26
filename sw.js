// GelJemi Store - Minimal Service Worker
// Required to satisfy PWA installability criteria for Bubblewrap/TWA packaging.
// Caches the app shell so the site can launch even on a flaky connection.

const CACHE_NAME = "geljemi-cache-v1";
const APP_SHELL = [
  "/",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Network-first, falling back to cache (keeps your live pricing/data fresh,
  // but still lets the app open if the network briefly drops).
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // Only cache successful, same-origin GET requests
          if (event.request.method === "GET" && response.status === 200) {
            cache.put(event.request, copy);
          }
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
