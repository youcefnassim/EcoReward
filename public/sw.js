self.addEventListener('install', (e) => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      self.clients.claim(); // Claim control immediately
      
      // Unregister itself
      self.registration.unregister().then(() => {
        console.log('Service Worker unregistered successfully.');
      });
    })
  );
});

self.addEventListener('fetch', (e) => {
  // Pass through all requests directly to the network
  e.respondWith(fetch(e.request));
});
