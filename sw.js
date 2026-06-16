const CACHE_NAME = "omniwrite-cache-v5";

const urlsToCache = [
  "/",
  "/index.html",

  "/favicon.ico",
  "/site.webmanifest",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
  "/apple-touch-icon.png",
  "/favicon-16x16.png",
  "/favicon-32x32.png",


  "https://api.munetios.com/beautiful-css/beautiful.css",

  "https://api.munetios.com/fonts/google-sans-flex/googlesansflex.ttf",
  "https://api.munetios.com/fonts/material-symbols/MaterialSymbolsRounded-VariableFont_FILL,GRAD,opsz,wght.ttf",
  "https://api.munetios.com/fonts/inter/inter.ttf",
  "https://api.munetios.com/fonts/open-sans/opensans.ttf",
  "https://api.munetios.com/fonts/roboto/roboto.ttf",
  "https://api.munetios.com/fonts/google-sans/googlesans.ttf",
  "https://api.munetios.com/fonts/lexend/lexend.ttf",
  "https://api.munetios.com/fonts/poppins/Poppins-Regular.ttf",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        await cache.addAll(urlsToCache);
      } catch (error) {
        console.error("Failed to cache some assets:", error);
      }
    }),
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        );
      }),
      self.clients.claim(),
    ]),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type !== "opaque"
        ) {
          const responseClone = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }

        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);

        if (cachedResponse) {
          return cachedResponse;
        }

        if (
          event.request.mode === "navigate" ||
          event.request.destination === "document"
        ) {
          return caches.match("/") || caches.match("/index.html");
        }

        return new Response("Offline", {
          status: 503,
          statusText: "Service Unavailable",
        });
      }),
  );
});
