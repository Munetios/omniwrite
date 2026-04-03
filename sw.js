const CACHE_NAME = 'omniwrite-cache-v3';

const urlsToCache = [
    '/',
    '/index.html',
    '/favicon.ico',
    '/site.webmanifest',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
    '/apple-touch-icon.png',
    '/favicon-16x16.png',
    '/favicon-32x32.png',
    'https://api.munetios.com/beautiful-css/beautiful.css',
    'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded',
    'https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght,ROND@6..144,1..1000,90&display=swap'
];

// 🟢 Install
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

// 🟢 Activate
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            )
        )
    );
    self.clients.claim();
});

// 🟢 Fetch (Cache First + Network Update)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {

            const fetchPromise = fetch(event.request)
                .then(networkResponse => {
                    // Update cache in background
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                    });
                    return networkResponse;
                })
                .catch(() => cachedResponse); // fallback if offline

            // Return cache immediately if available
            return cachedResponse || fetchPromise;
        })
    );
});
