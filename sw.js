// Keeps the app's own files on the phone so it opens without internet.
// Bump the version number below whenever you change the app files.
const CACHE = 'eye-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Open instantly from the saved copy, and refresh the copy in the background.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const hit = await cache.match(e.request);
      const net = fetch(e.request)
        .then(r => { if (r.ok) cache.put(e.request, r.clone()); return r; })
        .catch(() => null);
      return hit || (await net) || Response.error();
    })
  );
});
