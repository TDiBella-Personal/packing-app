const CACHE_NAME = 'morning-rundown-v2';
const SHELL_ASSETS = [
    './newsletter.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    // NOTE: preferences.md is intentionally excluded — always fetch fresh from network
];

// Install: cache the app shell
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_ASSETS))
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch: network-first for API calls, cache-first for shell
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // API calls (Reddit, HN, weather) — always try network first
    if (url.hostname !== location.hostname) {
        event.respondWith(
            fetch(event.request)
                .then(response => response)
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Never cache .md files — always fetch fresh so the parser never
    // receives a stale or corrupted (e.g. HTML) response.
    if (url.pathname.endsWith('.md')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // App shell — cache first, then network
    event.respondWith(
        caches.match(event.request).then(cached => {
            const fetchPromise = fetch(event.request).then(response => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return response;
            });
            return cached || fetchPromise;
        })
    );
});
