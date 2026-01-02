const CACHE_NAME = 'omniwrite-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/favicon.ico',
    '/site.webmanifest',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
    '/apple-touch-icon.png',
    '/favicon-16x16.png',
    '/favicon-32x32.png'
];

// Install event: cache files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

// Activate event: cleanup old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            )
        )
    );
    self.clients.claim();
});

// Fetch event: serve cached content when offline
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                // If online, clear the cache and return network response
                caches.open(CACHE_NAME).then(cache => cache.keys().then(keys => {
                    keys.forEach(request => cache.delete(request));
                }));
                return networkResponse;
            })
            .catch(() => 
                // If offline, return cached response
                caches.match(event.request)
            )
    );
});