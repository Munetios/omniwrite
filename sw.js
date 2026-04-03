const CACHE_NAME = 'omniwrite-cache-v4';

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

// Install
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

// Activate
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(names =>
            Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
        )
    );
    self.clients.claim();
});

// Fetch
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // ✅ Always update cache with latest version
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });

                return response; // always fresh when online
            })
            .catch(() => {
                // 🔴 Offline fallback
                return caches.match(event.request)
                    .then(res => res || caches.match('/index.html'));
            })
    );
});
