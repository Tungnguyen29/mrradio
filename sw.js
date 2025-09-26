const CACHE_NAME = 'radio-static-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Don't try to cache the streaming URLs: let network handle them.
  const url = new URL(e.request.url);
  if (url.pathname.endsWith('.mp3') || url.pathname.endsWith('.m3u8')) {
    return; // skip caching stream media
  }
  e.respondWith(
    caches.match(e.request).then(resp => resp || fetch(e.request))
  );
});
